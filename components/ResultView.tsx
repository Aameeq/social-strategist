import React from 'react';
import { WorkflowState, AgentStatus } from '../types';
import { Download, Copy, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';

interface ResultViewProps {
  state: WorkflowState;
  onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ state, onReset }) => {
  if (state.status !== AgentStatus.COMPLETED || !state.brandKit || !state.generatedPost || !state.critique) return null;

  const { brandKit, generatedPost, critique } = state;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center mb-10">
         <h2 className="text-4xl font-bold text-white mb-2">Campaign Ready</h2>
         <p className="text-slate-400">Your custom social media assets have been generated and approved.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: The Post Preview */}
        <div className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-md mx-auto w-full">
            {/* Header */}
            <div className="flex items-center p-4 border-b border-gray-100">
               <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-pink-600 rounded-full mr-3"></div>
               <div>
                 <p className="text-sm font-semibold text-gray-900">{state.scrapedData?.username || 'brand_account'}</p>
                 <p className="text-xs text-gray-500">Sponsored</p>
               </div>
               <div className="ml-auto text-gray-400">•••</div>
            </div>
            {/* Image */}
            <div className="aspect-square bg-gray-100 relative group">
               {generatedPost.imageUrl ? (
                 <img src={generatedPost.imageUrl} alt="Generated Content" className="w-full h-full object-cover" />
               ) : (
                 <div className="flex items-center justify-center h-full text-gray-400">No Image Generated</div>
               )}
            </div>
            {/* Actions */}
            <div className="p-4">
              <div className="flex justify-between mb-3 text-gray-700">
                 <div className="flex gap-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                 </div>
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
              </div>
              <p className="text-gray-800 text-sm mb-2">
                <span className="font-semibold mr-2">{state.scrapedData?.username || 'brand_account'}</span>
                {generatedPost.copy}
              </p>
              <p className="text-blue-600 text-sm">
                {generatedPost.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ')}
              </p>
            </div>
        </div>

        {/* Right Col: Insights & Tools */}
        <div className="space-y-6">
           {/* Expert Critique Card */}
           <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <CheckCircle className="w-32 h-32 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">AGENT 4</span>
                Expert Critique
              </h3>
              
              <div className="flex items-center gap-4 mb-6">
                <div className={`text-4xl font-black ${critique.score > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {critique.score}/100
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-sm uppercase tracking-wider">Quality Score</span>
                  <span className={`font-semibold ${critique.approved ? 'text-green-400' : 'text-red-400'}`}>
                    {critique.approved ? 'APPROVED FOR PUBLISH' : 'NEEDS REVISION'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                 {critique.feedback.map((point, idx) => (
                   <div key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                     <div className="mt-1 min-w-[16px]">
                       <CheckCircle className="w-4 h-4 text-blue-500" />
                     </div>
                     <p>{point}</p>
                   </div>
                 ))}
              </div>
           </div>

           {/* Brand Kit Summary */}
           <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Brand Kit Extracted</h3>
              <div className="space-y-4">
                <div>
                   <p className="text-xs text-slate-500 uppercase">Color Palette</p>
                   <div className="flex gap-2 mt-2">
                     {brandKit.colorPalette.map((color, idx) => (
                       <div key={idx} className="group relative">
                          <div 
                            className="w-8 h-8 rounded-full border border-slate-600 shadow-sm"
                            style={{ backgroundColor: color.includes('#') || CSS.supports('color', color) ? color : '#333' }} 
                            title={color}
                          ></div>
                          <span className="text-[10px] text-slate-400 mt-1 block truncate w-12 text-center">{color}</span>
                       </div>
                     ))}
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <p className="text-xs text-slate-500 uppercase">Tone</p>
                      <p className="text-sm text-slate-200 mt-1">{brandKit.toneOfVoice.slice(0, 3).join(', ')}</p>
                   </div>
                   <div>
                      <p className="text-xs text-slate-500 uppercase">Visual Style</p>
                      <p className="text-sm text-slate-200 mt-1 truncate">{brandKit.visualStyle}</p>
                   </div>
                </div>
              </div>
           </div>
           
           {/* Actions */}
           <div className="flex gap-4">
              <button 
                onClick={onReset} 
                className="flex-1 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition font-medium"
              >
                Create New Post
              </button>
              <button className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition font-medium flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Export Assets
              </button>
           </div>

        </div>
      </div>
    </div>
  );
};

export default ResultView;