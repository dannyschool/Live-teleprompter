import { Script, AppSettings } from '../types';

const STORAGE_KEYS = {
  SCRIPTS: 'sp_scripts',
  SETTINGS: 'sp_settings',
};

const DEFAULT_SETTINGS: AppSettings = {
  scrollSpeed: 30,
  fontSize: 48,
  isMirrored: false,
  isDarkMode: true,
  paddingX: 20,
};

export const getScripts = (): Script[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SCRIPTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const saveScript = (script: Script): void => {
  const scripts = getScripts();
  const index = scripts.findIndex((s) => s.id === script.id);
  
  if (index >= 0) {
    scripts[index] = script;
  } else {
    scripts.unshift(script);
  }
  
  localStorage.setItem(STORAGE_KEYS.SCRIPTS, JSON.stringify(scripts));
};

export const deleteScript = (id: string): void => {
  const scripts = getScripts().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SCRIPTS, JSON.stringify(scripts));
};

export const getScriptById = (id: string): Script | undefined => {
  return getScripts().find((s) => s.id === id);
};

export const getSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};
