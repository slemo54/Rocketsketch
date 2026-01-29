
export type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";
export type ImageSize = "1K" | "2K" | "4K";

export interface TranscriptionResult {
  title: string;
  summary: string;
  keyPoints: string[];
  visualThemes: string[];
  rawText: string;
}

export interface GenerationSettings {
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
}

export enum AppStep {
  SETUP = 'setup',
  IMPORT = 'import',
  ANALYZE = 'analyze',
  BEAUTIFY = 'beautify',
  RESULT = 'result'
}
