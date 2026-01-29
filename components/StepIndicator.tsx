
import React from 'react';
import { AppStep } from '../types';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const steps = [
  { id: AppStep.IMPORT, label: 'Import' },
  { id: AppStep.ANALYZE, label: 'Analyze' },
  { id: AppStep.BEAUTIFY, label: 'Beautify' },
  { id: AppStep.RESULT, label: 'Finish' }
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const getIndex = (step: AppStep) => steps.findIndex(s => s.id === step);
  const currentIndex = getIndex(currentStep);

  if (currentStep === AppStep.SETUP) return null;

  return (
    <div className="flex items-center justify-between w-full max-w-xl mx-auto mb-12">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              idx <= currentIndex ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400'
            }`}>
              {idx < currentIndex ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <span className="font-semibold">{idx + 1}</span>
              )}
            </div>
            <span className={`absolute -bottom-7 text-xs font-medium whitespace-nowrap ${idx <= currentIndex ? 'text-slate-900' : 'text-slate-400'}`}>
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${idx < currentIndex ? 'bg-blue-600' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;
