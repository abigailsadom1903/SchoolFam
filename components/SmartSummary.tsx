import React, { useState } from 'react';
import { Sparkles, Play, RotateCcw, Brain } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Child, Activity } from '../types';
import { generateDailySummary } from '../services/geminiService';

interface SmartSummaryProps {
  child: Child;
  activities: Activity[];
}

const SmartSummary: React.FC<SmartSummaryProps> = ({ child, activities }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateDailySummary(child, activities);
    setSummary(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl mb-8 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
            <h2 className="text-2xl font-bold">Smart Daily Summary</h2>
          </div>
          {!summary && !loading && (
            <button 
              onClick={handleGenerate}
              className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-full font-bold text-sm hover:bg-indigo-50 transition-all shadow-lg"
            >
              <Play size={16} fill="currentColor" />
              Generate Magic Summary
            </button>
          )}
        </div>

        {!summary && !loading && (
          <div className="text-indigo-100 text-sm md:text-base">
            <p className="mb-2">Get a personalized AI-generated overview of {child.name}'s day, including learned skills, mood analysis, and conversation starters.</p>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2 text-xs bg-white/10 px-3 py-1.5 rounded-full">
                <Brain size={14} /> Skills Analysis
              </div>
              <div className="flex items-center gap-2 text-xs bg-white/10 px-3 py-1.5 rounded-full">
                😊 Mood Tracking
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="py-8 flex flex-col items-center justify-center text-center animate-pulse">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="font-medium">Analyizing today's activities...</p>
            <p className="text-xs text-indigo-200 mt-2">Reviewing photos, notes, and learning moments</p>
          </div>
        )}

        {summary && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 text-sm md:text-base leading-relaxed shadow-inner border border-white/10 prose prose-invert max-w-none">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleGenerate}
                className="flex items-center gap-2 text-xs text-indigo-200 hover:text-white transition-colors"
              >
                <RotateCcw size={14} /> Regenerate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartSummary;
