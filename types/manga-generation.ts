// 漫画生成相关的类型定义

export type MangaStyle = 'peach' | 'cat' | 'doraemon';

export interface StyleOption {
  id: MangaStyle;
  name: string;
  description: string;
  previewImage: string;
  referenceImage: string;
}

export interface ComicPanel {
  panelNumber: number;
  sceneDescription: string;
  dialogue: string;
  generatedImage?: string;
  isRegenerating?: boolean;
  generationError?: string;
}

export interface ComicScript {
  concept: string;
  style: MangaStyle;
  totalPanels: number;
  panels: ComicPanel[];
  createdAt: string;
}

export interface GenerationProgress {
  stage: 'input' | 'generating-script' | 'generating-images' | 'review' | 'publishing' | 'completed';
  currentPanel?: number;
  totalPanels?: number;
  message: string;
}

export interface PublishMetadata {
  author: string;
  title: string;
  description: string;
  categories: string[];
  tags: string[];
  coverImage?: string;
}
