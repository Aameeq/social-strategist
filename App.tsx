import React, { useState, useReducer } from 'react';
import { AgentStatus, WorkflowState, InstagramData } from './types';
import InputForm from './components/InputForm';
import AgentStatusDisplay from './components/AgentStatusDisplay';
import ResultView from './components/ResultView';
import { scrapeInstagramProfile } from './services/apifyService';
import { generateBrandKit, generatePostCopy, generatePostImage, critiquePost } from './services/geminiService';
import { Rocket } from 'lucide-react';

const initialState: WorkflowState = {
  status: AgentStatus.IDLE,
  instagramUrl: '',
  userTheme: '',
  userImage: null,
  scrapedData: null,
  brandKit: null,
  generatedPost: null,
  critique: null,
  error: undefined
};

type Action =
  | { type: 'START_WORKFLOW'; payload: { url: string; theme: string; image: File | null } }
  | { type: 'SET_STATUS'; payload: AgentStatus }
  | { type: 'SCRAPE_SUCCESS'; payload: InstagramData }
  | { type: 'BRAND_KIT_SUCCESS'; payload: any }
  | { type: 'COPY_SUCCESS'; payload: any }
  | { type: 'IMAGE_SUCCESS'; payload: string } // imageUrl
  | { type: 'CRITIQUE_SUCCESS'; payload: any }
  | { type: 'ERROR'; payload: string }
  | { type: 'RESET' };

function reducer(state: WorkflowState, action: Action): WorkflowState {
  switch (action.type) {
    case 'START_WORKFLOW':
      return { ...initialState, ...{ 
        instagramUrl: action.payload.url, 
        userTheme: action.payload.theme,
        userImage: action.payload.image
      }, status: AgentStatus.SCRAPING };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SCRAPE_SUCCESS':
      return { ...state, scrapedData: action.payload };
    case 'BRAND_KIT_SUCCESS':
      return { ...state, brandKit: action.payload };
    case 'COPY_SUCCESS':
      return { ...state, generatedPost: action.payload };
    case 'IMAGE_SUCCESS':
      return { ...state, generatedPost: { ...state.generatedPost!, imageUrl: action.payload } };
    case 'CRITIQUE_SUCCESS':
      return { ...state, critique: action.payload, status: AgentStatus.COMPLETED };
    case 'ERROR':
      return { ...state, status: AgentStatus.ERROR, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const runWorkflow = async (url: string, theme: string, image: File | null) => {
    dispatch({ type: 'START_WORKFLOW', payload: { url, theme, image } });

    try {
      // Step 1: Scrape
      // Uses the service which now handles the token internally
      const scrapedData = await scrapeInstagramProfile(url);
      dispatch({ type: 'SCRAPE_SUCCESS', payload: scrapedData });
      dispatch({ type: 'SET_STATUS', payload: AgentStatus.ANALYZING });

      // Step 2: Brand Kit
      const brandKit = await generateBrandKit(scrapedData, theme);
      dispatch({ type: 'BRAND_KIT_SUCCESS', payload: brandKit });
      dispatch({ type: 'SET_STATUS', payload: AgentStatus.COPYWRITING });

      // Step 3: Copywriting
      const generatedPost = await generatePostCopy(brandKit, theme);
      dispatch({ type: 'COPY_SUCCESS', payload: generatedPost });
      dispatch({ type: 'SET_STATUS', payload: AgentStatus.DESIGNING });

      // Step 4: Visuals
      const imageUrl = await generatePostImage(brandKit, generatedPost, image);
      dispatch({ type: 'IMAGE_SUCCESS', payload: imageUrl });
      dispatch({ type: 'SET_STATUS', payload: AgentStatus.REVIEWING });

      // Step 5: Critique
      // Need to pass the FULL generatedPost including the new imageUrl
      const fullPost = { ...generatedPost, imageUrl };
      const critique = await critiquePost(brandKit, fullPost, imageUrl);
      dispatch({ type: 'CRITIQUE_SUCCESS', payload: critique });

    } catch (error: any) {
      console.error(error);
      dispatch({ type: 'ERROR', payload: error.message || 'An unexpected error occurred.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 selection:bg-blue-500 selection:text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">SocialForge <span className="text-blue-500">AI</span></span>
          </div>
          <div className="text-sm text-slate-400">
             Autonomous Agency
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <AgentStatusDisplay status={state.status} error={state.error} />

        {state.status === AgentStatus.IDLE && (
          <InputForm onStart={runWorkflow} isLoading={false} />
        )}
        
        {state.status === AgentStatus.COMPLETED && (
          <ResultView state={state} onReset={() => dispatch({ type: 'RESET' })} />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} SocialForge AI. Powered by Google Gemini 3.0 & Apify.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;