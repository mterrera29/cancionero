'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-xl hover:bg-purple/20 transition-colors"
      title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-purple-pastel" />
      ) : (
        <Moon className="w-4 h-4 text-purple" />
      )}
    </button>
  );
}