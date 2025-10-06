import { Platform } from 'react-native';

const tintColorLight = '#111827';
const tintColorDark = '#e5e7eb';

export const Colors = {
  light: {
    text: '#111827',
    background: '#f3f4f6',
    surface: '#ffffff',
    surfaceMuted: '#f9fafb',
    tint: tintColorLight,
    icon: '#6b7280',
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorLight,
    border: '#e5e7eb',
    success: '#16a34a',
    danger: '#dc2626',
    warning: '#f59e0b',
  },
  dark: {
    text: '#f9fafb',
    background: '#111827',
    surface: '#1f2937',
    surfaceMuted: '#111827',
    tint: tintColorDark,
    icon: '#9ba1a6',
    tabIconDefault: '#4b5563',
    tabIconSelected: tintColorDark,
    border: '#1f2937',
    success: '#22c55e',
    danger: '#f87171',
    warning: '#fbbf24',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});