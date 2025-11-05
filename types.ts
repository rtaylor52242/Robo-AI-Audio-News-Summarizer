
export type Status = 'idle' | 'summarizing' | 'generating' | 'ready' | 'error';

export interface HistoryItem {
  id: string;
  title: string;
  summary: string;
  base64Audio: string;
}
