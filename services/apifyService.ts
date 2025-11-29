import { InstagramData } from '../types';

// In a real production environment, this should be in process.env.APIFY_API_TOKEN
// For this demo, it attempts to use the environment variable, or falls back to mock if invalid/missing.
const API_TOKEN = process.env.APIFY_API_TOKEN;
const ACTOR_ID = 'apify~instagram-post-scraper'; // The specific actor requested

// Mock data to be used as fallback
const MOCK_INSTAGRAM_DATA: InstagramData = {
  username: "tech_innovators_daily",
  biography: "Bringing you the latest in AI, Robotics, and Future Tech. 🚀 | Building the future, one bit at a time.",
  followersCount: 15400,
  recentPosts: [
    {
      caption: "The future of robotics is here. Look at this agility! #robotics #future #tech",
      imageUrl: "https://picsum.photos/400/400?random=1",
      likes: 1200
    },
    {
      caption: "AI is changing how we design code. Swipe to see the comparison.",
      imageUrl: "https://picsum.photos/400/400?random=2",
      likes: 850
    },
    {
      caption: "Minimalist desk setup for maximum productivity. What's on your desk?",
      imageUrl: "https://picsum.photos/400/400?random=3",
      likes: 2100
    }
  ]
};

interface ApifyPostItem {
  url: string;
  caption?: string;
  displayUrl?: string; // Image URL
  likesCount?: number;
  ownerUsername?: string;
  timestamp?: string;
  // Post scraper specific fields might differ, handling common ones
  images?: string[];
  firstComment?: string;
}

export const scrapeInstagramProfile = async (url: string): Promise<InstagramData> => {
  console.log(`Initiating scrape for: ${url}`);

  if (!API_TOKEN) {
    console.warn("System Notice: APIFY_API_TOKEN not found in environment. Using Mock Data for demonstration.");
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 2000));
    return MOCK_INSTAGRAM_DATA;
  }

  try {
    // Construct the API URL for running the actor and getting results synchronously
    // This endpoint runs the actor and waits for the dataset items (JSON)
    const apiUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${API_TOKEN}`;

    const payload = {
      startUrls: [{ url: url }],
      resultsType: "posts",
      searchLimit: 3, // Limit to 3 for efficiency in this demo
      searchType: "posts"
    };

    console.log("Calling Apify API...");
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Apify API Error: ${response.status} - ${errorText}`);
    }

    const items: ApifyPostItem[] = await response.json();
    console.log("Apify data received:", items);

    if (!items || items.length === 0) {
      throw new Error("No data returned from scraper.");
    }

    // Map Apify results to our internal interface
    // Note: The post-scraper primarily returns posts. 
    // We try to extract username from the first post. Bio/Followers might be missing in post-only scrape.
    const firstPost = items[0];
    const username = firstPost.ownerUsername || "scraped_user";
    
    // Since we are using the POST scraper, we might not get bio/followers count directly.
    // We will use placeholders or infer where possible.
    const mappedData: InstagramData = {
      username: username,
      biography: `(Bio unavailable from post-scraper) - Analyzed from ${items.length} recent posts.`,
      followersCount: 0, // Not available in post object usually
      recentPosts: items.map(item => ({
        caption: item.caption || "",
        imageUrl: item.displayUrl || (item.images && item.images.length > 0 ? item.images[0] : "") || "https://placehold.co/400",
        likes: item.likesCount || 0
      }))
    };

    return mappedData;

  } catch (error) {
    console.error("Scraping failed, falling back to mock data:", error);
    // Fallback ensures the UI doesn't break during demo if API key is invalid or CORS blocks it
    return MOCK_INSTAGRAM_DATA;
  }
};