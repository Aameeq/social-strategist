import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BrandKit, GeneratedPost, ExpertCritique, InstagramData } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found in environment variables");
  return new GoogleGenAI({ apiKey });
};

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * AGENT 1: Brand Analyst
 * Analyzes scraped data to build a Brand Kit.
 */
export const generateBrandKit = async (scrapedData: InstagramData, userTheme: string): Promise<BrandKit> => {
  const ai = getAiClient();
  
  const prompt = `
    Analyze the following Instagram profile data and the user's desired theme.
    
    User Theme/Goal: ${userTheme}
    
    Instagram Data:
    Username: ${scrapedData.username}
    Bio: ${scrapedData.biography}
    Recent Captions: ${scrapedData.recentPosts.map(p => p.caption).join(' | ')}
    
    Construct a comprehensive Brand Kit.
    Include:
    1. Tone of Voice (adjectives)
    2. Color Palette (hex codes or names)
    3. Visual Style description
    4. Key Themes
    5. Target Audience description
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      toneOfVoice: { type: Type.ARRAY, items: { type: Type.STRING } },
      colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
      visualStyle: { type: Type.STRING },
      keyThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
      targetAudience: { type: Type.STRING },
    },
    required: ["toneOfVoice", "colorPalette", "visualStyle", "keyThemes", "targetAudience"],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Strong reasoning for analysis
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }
  });

  return JSON.parse(response.text || "{}") as BrandKit;
};

/**
 * AGENT 2: Copywriter
 * Creates content based on the Brand Kit.
 */
export const generatePostCopy = async (brandKit: BrandKit, userTheme: string): Promise<GeneratedPost> => {
  const ai = getAiClient();

  const prompt = `
    Act as an expert social media copywriter.
    Create a new Instagram post based on this Brand Kit and Theme.
    
    Theme: ${userTheme}
    Brand Voice: ${brandKit.toneOfVoice.join(', ')}
    Target Audience: ${brandKit.targetAudience}
    
    Output a JSON object with 'copy' (the caption) and 'hashtags' (list of strings).
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      copy: { type: Type.STRING },
      hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["copy", "hashtags"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // Fast and creative for text
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }
  });

  return JSON.parse(response.text || "{}") as GeneratedPost;
};

/**
 * AGENT 3: Designer
 * Edits/Generates the image.
 */
export const generatePostImage = async (
  brandKit: BrandKit, 
  postCopy: GeneratedPost, 
  userImage: File | null
): Promise<string> => {
  const ai = getAiClient();
  
  let parts: any[] = [];
  let promptText = "";

  if (userImage) {
    // Edit/Transform existing image
    const imagePart = await fileToGenerativePart(userImage);
    parts.push(imagePart);
    promptText = `
      Transform this reference image into a polished social media post.
      Style: ${brandKit.visualStyle}.
      Color Palette: ${brandKit.colorPalette.join(', ')}.
      Context: The post is about: "${postCopy.copy.substring(0, 100)}...".
      Ensure it looks professional, high-resolution, and aesthetically pleasing.
    `;
  } else {
    // Generate fresh image
    promptText = `
      Create a high-quality, professional Instagram image.
      Style: ${brandKit.visualStyle}.
      Color Palette: ${brandKit.colorPalette.join(', ')}.
      Subject: Visual representation of: "${postCopy.copy.substring(0, 150)}...".
      Mood: ${brandKit.toneOfVoice.join(', ')}.
      Aspect Ratio: 1:1.
    `;
  }
  
  parts.push({ text: promptText });

  // Using gemini-3-pro-image-preview for high quality generation
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts },
    config: {
      // Note: responseMimeType is not supported for image models usually, they return artifacts or base64
    }
  });

  // Extract image from response
  // The SDK might return it in inlineData or we might need to look for base64
  const candidates = response.candidates;
  if (candidates && candidates.length > 0) {
     const parts = candidates[0].content.parts;
     for (const part of parts) {
       if (part.inlineData && part.inlineData.data) {
         return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
       }
     }
  }

  // Fallback if no image found (should not happen if successful)
  throw new Error("No image generated.");
};

/**
 * AGENT 4: Expert Critic
 * Evaluates the final output.
 */
export const critiquePost = async (brandKit: BrandKit, post: GeneratedPost, imageUrl: string): Promise<ExpertCritique> => {
  const ai = getAiClient();

  // We send the generated image back to the vision model for critique
  // Since imageUrl is data:image/..., we need to strip the prefix
  const base64Data = imageUrl.split(',')[1];
  const mimeType = imageUrl.substring(imageUrl.indexOf(':') + 1, imageUrl.indexOf(';'));

  const prompt = `
    Act as a Senior Brand Manager. Evaluate this generated social media post against the Brand Kit.
    
    Brand Voice Required: ${brandKit.toneOfVoice.join(', ')}
    Visual Style Required: ${brandKit.visualStyle}
    
    Generated Copy: "${post.copy}"
    
    Review the attached image and the copy.
    Provide:
    1. A score from 0-100.
    2. A list of 3 specific feedback points (critiques or praises).
    3. A boolean 'approved' (true if score > 75).
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.INTEGER },
      feedback: { type: Type.ARRAY, items: { type: Type.STRING } },
      approved: { type: Type.BOOLEAN }
    },
    required: ["score", "feedback", "approved"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Strong reasoning
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType: mimeType } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }
  });

  return JSON.parse(response.text || "{}") as ExpertCritique;
};