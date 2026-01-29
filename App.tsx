
import React, { useState, useEffect } from 'react';
import { AppStep, TranscriptionResult, GenerationSettings, AspectRatio, ImageSize } from './types';
import ApiKeySelector from './components/ApiKeySelector';
import StepIndicator from './components/StepIndicator';
import { analyzeNote, generateSketchnote } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SETUP);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<TranscriptionResult | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<GenerationSettings>({
    aspectRatio: "9:16",
    imageSize: "1K"
  });

  useEffect(() => {
    const checkApiKey = async () => {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (hasKey) {
        setStep(AppStep.IMPORT);
      }
    };
    checkApiKey();
  }, []);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      setStep(AppStep.ANALYZE);
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async () => {
    if (!originalImage) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeNote(originalImage);
      setAnalysis(result);
      setStep(AppStep.BEAUTIFY);
    } catch (err) {
      setError("Failed to analyze note. Please try a clearer image.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startGeneration = async () => {
    if (!analysis) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateSketchnote(analysis, settings);
      setGeneratedImage(result);
      setStep(AppStep.RESULT);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        // Handle key race condition or expiration
        setError("API Key issue. Please re-select your key.");
        setStep(AppStep.SETUP);
      } else {
        setError("Failed to generate sketchnote. Please try again.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setAnalysis(null);
    setGeneratedImage(null);
    setStep(AppStep.IMPORT);
  };

  const renderContent = () => {
    switch (step) {
      case AppStep.SETUP:
        return <ApiKeySelector onSuccess={() => setStep(AppStep.IMPORT)} />;
      
      case AppStep.IMPORT:
        return (
          <div className="flex flex-col items-center bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-slate-100 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Import Rocketbook Note</h2>
            <p className="text-slate-500 mb-8 text-center">Upload your scanned page to begin the digital transformation.</p>
            
            <label className="w-full flex flex-col items-center justify-center px-6 py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors group">
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-slate-300 group-hover:text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium text-slate-600">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileImport} />
            </label>
          </div>
        );

      case AppStep.ANALYZE:
        return (
          <div className="flex flex-col items-center max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 w-full">
              <div className="aspect-[3/4] overflow-hidden rounded-xl bg-slate-50 relative group">
                <img src={originalImage!} alt="Original note" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
              </div>
            </div>
            <div className="flex gap-4 w-full justify-center">
              <button onClick={reset} className="px-8 py-3 bg-white text-slate-600 border border-slate-200 font-semibold rounded-full hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button 
                onClick={startAnalysis} 
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Analyzing...
                  </>
                ) : 'Analyze Note with Gemini'}
              </button>
            </div>
          </div>
        );

      case AppStep.BEAUTIFY:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Analysis Result</h2>
              </div>
              
              <div className="space-y-6 flex-1 overflow-y-auto pr-2 no-scrollbar">
                <section>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Title</label>
                  <p className="text-xl font-bold text-slate-900 handwriting">{analysis?.title}</p>
                </section>
                
                <section>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Summary</label>
                  <p className="text-slate-600 leading-relaxed">{analysis?.summary}</p>
                </section>
                
                <section>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Key Points</label>
                  <ul className="space-y-2">
                    {analysis?.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                        <span className="text-slate-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Detected Themes</label>
                  <div className="flex flex-wrap gap-2">
                    {analysis?.visualThemes.map((theme, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">#{theme}</span>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Beautifier Settings</h2>
              </div>

              <div className="space-y-8 flex-1">
                <section>
                  <label className="text-sm font-semibold text-slate-700 block mb-3">Aspect Ratio</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["1:1", "2:3", "3:2", "3:4", "4:3", "9:16", "16:9", "21:9"] as AspectRatio[]).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setSettings({ ...settings, aspectRatio: ratio })}
                        className={`py-2 px-1 text-xs font-medium rounded-lg border transition-all ${
                          settings.aspectRatio === ratio 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <label className="text-sm font-semibold text-slate-700 block mb-3">Output Quality</label>
                  <div className="flex gap-4">
                    {(["1K", "2K", "4K"] as ImageSize[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => setSettings({ ...settings, imageSize: size })}
                        className={`flex-1 py-3 px-4 font-bold rounded-xl border transition-all ${
                          settings.imageSize === size 
                            ? 'bg-slate-900 border-slate-900 text-white' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-center uppercase tracking-widest">Select 4K for professional print quality</p>
                </section>

                <div className="mt-auto pt-8 border-t border-slate-100">
                  <button 
                    onClick={startGeneration}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        Generating Infographic...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Beautify My Notes
                      </>
                    )}
                  </button>
                  <button onClick={() => setStep(AppStep.ANALYZE)} className="w-full mt-4 text-sm font-medium text-slate-400 hover:text-slate-600">
                    ← Back to Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case AppStep.RESULT:
        return (
          <div className="flex flex-col items-center max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border border-slate-100 w-full mb-10">
              <div className="flex justify-between items-center mb-6 px-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 handwriting">{analysis?.title}</h2>
                  <p className="text-sm text-slate-500 uppercase tracking-widest">Generated Sketchnote • {settings.imageSize}</p>
                </div>
                <div className="flex gap-2">
                  <a 
                    href={generatedImage!} 
                    download={`${analysis?.title.replace(/\s+/g, '_')}_beautified.png`}
                    className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" /></svg>
                  </a>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-3xl p-4 md:p-8 flex items-center justify-center min-h-[500px]">
                <img 
                  src={generatedImage!} 
                  alt="Final beautified sketchnote" 
                  className="max-h-[80vh] w-auto shadow-2xl rounded-sm ring-1 ring-slate-200" 
                />
              </div>
            </div>

            <button 
              onClick={reset}
              className="px-10 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-black transition-all shadow-xl hover:shadow-slate-200 flex items-center gap-3"
            >
              Start New Beautification
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">RocketSketch</span>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
            <span className="hidden md:inline">Powered by Gemini 3 Pro</span>
            <div className="h-4 w-px bg-slate-200 hidden md:block" />
            <button onClick={reset} className="hover:text-blue-600 transition-colors">Workspace</button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 pt-12">
        <StepIndicator currentStep={step} />
        
        {error && (
          <div className="max-w-xl mx-auto mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <div className="transition-all duration-500 ease-out">
          {renderContent()}
        </div>
      </main>

      {/* Footer Info */}
      {step === AppStep.IMPORT && (
        <div className="max-w-7xl mx-auto px-6 mt-20 text-center">
          <h3 className="text-slate-900 font-bold text-xl mb-4">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="text-3xl mb-3">📸</div>
              <h4 className="font-bold mb-2">1. Upload Note</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Simply upload a photo of your hand-drawn Rocketbook or paper notes.</p>
            </div>
            <div className="p-6">
              <div className="text-3xl mb-3">🧠</div>
              <h4 className="font-bold mb-2">2. AI Analysis</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Gemini 3 Pro reads your handwriting, summarizes content, and extracts key concepts.</p>
            </div>
            <div className="p-6">
              <div className="text-3xl mb-3">🎨</div>
              <h4 className="font-bold mb-2">3. Digital Magic</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Nano Banana Pro generates a perfectly polished, digital sketchnote infographic from your text.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
