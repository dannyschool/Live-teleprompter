export interface Script {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  scrollSpeed: number; // 1-100
  fontSize: number; // pixel size
  isMirrored: boolean; // for physical teleprompter glass
  isDarkMode: boolean;
  paddingX: number; // Side padding
}

export type ViewState = 'DASHBOARD' | 'EDITOR' | 'PROMPTER';

export interface EditorPayload {
  scriptId?: string; // If editing existing
}

export interface PrompterPayload {
  scriptId: string;
}
