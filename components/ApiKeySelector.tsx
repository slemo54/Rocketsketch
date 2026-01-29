
import React from 'react';

interface ApiKeySelectorProps {
  onSuccess: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onSuccess }) => {
  const handleSelectKey = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Assume success as per guidelines to avoid race condition
      onSuccess();
    } catch (error) {
      console.error("Failed to open key selector", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-3xl shadow-xl border border-slate-100">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Connect Your Creator Account</h2>
      <p className="text-slate-600 max-w-md mb-8">
        To use premium Sketchnote generation (Gemini 3 Pro Image), you need to select an API key from a paid GCP project.
      </p>
      
      <button
        onClick={handleSelectKey}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-blue-200"
      >
        Select API Key
      </button>
      
      <p className="mt-6 text-sm text-slate-400">
        Requires billing setup at <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-blue-500 hover:underline">ai.google.dev/gemini-api/docs/billing</a>
      </p>
    </div>
  );
};

export default ApiKeySelector;
