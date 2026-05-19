'use client';

import React, { useEffect, useState } from 'react';
import { useThemeStore } from '@/lib/theme/themeStore';

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const { primaryColor, borderRadius, borderWidth, fontFamily, fontWeight } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by waiting for mount
  if (!mounted) {
    return <>{children}</>;
  }

  // Define dynamic CSS variables based on store
  const customStyles = `
    :root {
      --theme-primary-color: ${primaryColor};
      --theme-border-radius: ${borderRadius};
      --theme-border-width: ${borderWidth};
      --theme-font-family: ${fontFamily};
      --theme-font-weight: ${fontWeight};
    }

    body {
       font-family: var(--theme-font-family) !important;
       font-weight: var(--theme-font-weight) !important;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      {children}
    </>
  );
}