import React from 'react';
import { AgentStatus } from '../types';
import { Bot, Search, FileText, Palette, CheckCircle, BrainCircuit, Loader2 } from 'lucide-react';

interface AgentStatusDisplayProps {
  status: AgentStatus;
  error?: string;
}

const AgentStatusDisplay: React.FC<AgentStatusDisplayProps> = ({ status, error }) => {
  const steps = [
    { id: AgentStatus.SCRAPING, label: "Scraping Data", icon: Search },
    { id: AgentStatus.ANALYZING, label: "Analyzing Brand", icon: BrainCircuit },
    { id: AgentStatus.COPYWRITING, label: "Drafting Copy", icon: FileText },
    { id: AgentStatus.DESIGNING, label: "Generating Visuals", icon: Palette },
    { id: AgentStatus.REVIEWING, label: "Expert Critique", icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === status);
  const isComplete = status === AgentStatus.COMPLETED;
  const isError = status === AgentStatus.ERROR;

  if (status === AgentStatus.IDLE) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      {isError ? (
         <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
           <p className="text-red-400 font-semibold text-lg">Process Failed</p>
           <p className="text-red-300 mt-2">{error}</p>
         </div>
      ) : (
        <div className="bg-slate-900/50 backdrop-blur border border-slate-700 rounded-2xl p-8">
           <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -z-10 hidden md:block"></div>
              <div 
                className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 transition-all duration-500 hidden md:block"
                style={{ width: isComplete ? '100%' : `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
              ></div>

              {steps.map((step, index) => {
                const isActive = index === currentStepIndex;
                const isPassed = index < currentStepIndex || isComplete;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex flex-col items-center z-10">
                    <div 
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isActive 
                          ? 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.5)]' 
                          : isPassed 
                            ? 'bg-slate-800 border-green-500 text-green-500' 
                            : 'bg-slate-800 border-slate-600 text-slate-600'
                      }`}
                    >
                      {isActive ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <p className={`mt-3 font-medium text-sm ${isActive ? 'text-blue-400' : isPassed ? 'text-green-400' : 'text-slate-600'}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
           </div>
           
           {!isComplete && (
             <div className="mt-8 text-center animate-pulse">
               <span className="inline-flex items-center gap-2 text-slate-300 bg-slate-800 px-4 py-2 rounded-full text-sm">
                 <Bot className="w-4 h-4 text-blue-400" />
                 AI Agent is currently: <span className="text-white font-semibold">{steps[currentStepIndex]?.label}...</span>
               </span>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default AgentStatusDisplay;