import React from 'react';
import { Instagram, Upload, Palette, Link as LinkIcon } from 'lucide-react';

interface InputFormProps {
  onStart: (url: string, theme: string, image: File | null) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onStart, isLoading }) => {
  const [url, setUrl] = React.useState('https://instagram.com/tech_innovators_daily');
  const [theme, setTheme] = React.useState('Futuristic, sleek, high-tech, minimalist. Focus on blue and neon accents.');
  const [file, setFile] = React.useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(url, theme, file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 shadow-xl">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
          Start New Campaign
        </h2>
        <p className="text-slate-400">Configure your automated social media agent workflow.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Instagram className="w-4 h-4" /> Instagram Profile/Post URL
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              placeholder="https://instagram.com/username"
            />
            <LinkIcon className="absolute right-3 top-3.5 text-slate-500 w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            The system uses the configured Apify integration to scrape this source.
          </p>
        </div>

        {/* Theme/Instruction */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Palette className="w-4 h-4" /> Campaign Theme & Instructions
          </label>
          <textarea
            required
            rows={4}
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
            placeholder="Describe the vibe, topic, or specific announcement for this post..."
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
            <Upload className="w-4 h-4" /> Reference Image <span className="text-slate-500 text-xs">(Optional)</span>
          </label>
          <div className="relative border-2 border-dashed border-slate-700 rounded-lg p-6 hover:bg-slate-800/50 transition-colors text-center cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-sm text-slate-300">
                {file ? file.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
            isLoading
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
          }`}
        >
          {isLoading ? 'Agents Working...' : 'Launch Agents'}
        </button>
      </form>
    </div>
  );
};

export default InputForm;