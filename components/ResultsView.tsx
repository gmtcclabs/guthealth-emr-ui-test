import React, { useState } from 'react';
import { useStore } from '../storeContext';
import { generateHealthInsights } from '../services/geminiService';
import {  PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, ArrowRight, Loader2, AlertCircle, CreditCard, Calendar } from 'lucide-react';
import { ConsultationStatus } from '../types';

interface ResultsViewProps {
  onScheduleClick: () => void;
  onUpgrade: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ onScheduleClick, onUpgrade }) => {
  const { user } = useStore();
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  if (!user.labResults) return <div>No results available.</div>;

  const { diversityScore, goodBacteria, badBacteria, sensitivity } = user.labResults;
  const hasConsultation = user.consultationStatus !== ConsultationStatus.NONE;

  const bacteriaData = [
    { name: 'Beneficial', value: goodBacteria, color: '#2A9D8F' },
    { name: 'Neutral', value: 100 - goodBacteria - badBacteria, color: '#E9C46A' },
    { name: 'Pathogenic', value: badBacteria, color: '#E76F51' },
  ];

  const handleGenerateInsights = async () => {
    if (!user.labResults) return;
    setLoadingAi(true);
    const insights = await generateHealthInsights(user.labResults);
    setAiInsights(insights);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Key Metrics Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-secondary mb-4">Microbiome Composition</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bacteriaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {bacteriaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-gray-700">
                  {diversityScore}/100
                </text>
                <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="text-xs fill-gray-500">
                  Diversity Score
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-xs mt-2">
            {bacteriaData.map(item => (
              <div key={item.name} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                {item.name}
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
           <div>
             <h3 className="text-lg font-bold text-secondary mb-4">Detailed Markers</h3>
             <div className="space-y-4">
                <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Beneficial Load</span>
                      <span className="font-semibold text-primary">{goodBacteria}%</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${goodBacteria}%` }}></div>
                   </div>
                   <p className="text-xs text-gray-400 mt-1">Target: &gt; 80%</p>
                </div>

                <div>
                   <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Pathogenic Load</span>
                      <span className="font-semibold text-alert">{badBacteria}%</span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-alert h-2 rounded-full" style={{ width: `${badBacteria}%` }}></div>
                   </div>
                   <p className="text-xs text-gray-400 mt-1">Target: &lt; 10%</p>
                </div>

                <div className="bg-red-50 border border-red-100 p-3 rounded-lg mt-4">
                   <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-red-500 mt-0.5" />
                      <div>
                         <div className="text-sm font-semibold text-red-700">Sensitivity Detected</div>
                         <div className="text-sm text-red-600">Marker: {sensitivity}</div>
                      </div>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-r from-secondary to-[#2C5364] rounded-xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="text-accent" /> AI Interpretation
            </h3>
            {!aiInsights && !loadingAi && (
               <button 
                onClick={handleGenerateInsights}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm"
              >
                Generate Insights
              </button>
            )}
          </div>
          
          {loadingAi && (
            <div className="flex items-center gap-2 text-gray-300 py-4">
              <Loader2 className="animate-spin" /> Analyzing your metrics with Gemini 2.5...
            </div>
          )}

          {aiInsights && (
             <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10 animate-fade-in text-gray-100 leading-relaxed">
               {aiInsights}
             </div>
          )}

          {!aiInsights && !loadingAi && (
            <p className="text-gray-300 text-sm">
              Tap "Generate Insights" to get a personalized summary of what these numbers mean for your wellness journey.
            </p>
          )}
        </div>
      </div>

      {/* Upgrade Banner for Option B users */}
      {!hasConsultation && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
           <div>
             <h4 className="font-bold text-amber-900">Expert Guidance Recommended</h4>
             <p className="text-sm text-amber-800">Your results indicate some sensitivities. A specialist can help build a recovery plan.</p>
           </div>
           <button 
            onClick={onUpgrade}
            className="bg-amber-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-amber-700 flex items-center gap-2 shadow-md whitespace-nowrap"
          >
            <CreditCard size={18} /> Add Consultation (HKD 1,200)
          </button>
        </div>
      )}

      {hasConsultation && (
         <div className="bg-light p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between border border-accent/20 gap-4">
          <div>
            <h4 className="font-bold text-gray-900">Next Steps</h4>
            <p className="text-sm text-gray-600">
               Your results are ready. Schedule your deep-dive with a specialist.
            </p>
          </div>
          <button 
            onClick={onScheduleClick}
            className="bg-secondary text-white px-5 py-3 rounded-lg font-medium hover:bg-secondary/90 flex items-center gap-2 shadow-md whitespace-nowrap"
          >
            <Calendar size={18} /> Book Consultation
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsView;