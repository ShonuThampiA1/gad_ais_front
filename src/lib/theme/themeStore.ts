import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeState {
  primaryColor: string;
  borderRadius: string;
  borderWidth: string;
  fontFamily: string;
  fontWeight: string;
  setPrimaryColor: (color: string) => void;
  setBorderRadius: (radius: string) => void;
  setBorderWidth: (width: string) => void;
  setFontFamily: (font: string) => void;
  setFontWeight: (weight: string) => void;
  resetTheme: () => void;
}

const defaultState = {
  primaryColor: '#1e40af', // Standard indigo-800 or similar fallback
  borderRadius: '0.5rem', // Tailwind rounded-md
  borderWidth: '1px',
  fontFamily: 'Inter, sans-serif',
  fontWeight: '400',
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ...defaultState,
      setPrimaryColor: (color) => set({ primaryColor: color }),
      setBorderRadius: (radius) => set({ borderRadius: radius }),
      setBorderWidth: (width) => set({ borderWidth: width }),
      setFontFamily: (font) => set({ fontFamily: font }),
      setFontWeight: (weight) => set({ fontWeight: weight }),
      resetTheme: () => set(defaultState),
    }),
    {
      name: 'app-custom-theme',
    }
  )
);
