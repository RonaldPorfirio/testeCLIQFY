export const palette = {
  background: '#f3f4f6',
  surface: '#ffffff',
  surfaceMuted: '#f9fafb',
  border: '#e5e7eb',
  muted: '#6b7280',
  text: '#111827',
  primary: '#111827',
  accent: '#312e81',
  accentSoft: '#eef2ff',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
  info: '#2563eb',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const typography = {
  display: 32,
  heading: 26,
  title: 20,
  subtitle: 16,
  body: 14,
  caption: 12,
};

export const shadows = {
  card: {
    shadowColor: 'rgba(15, 23, 42, 0.12)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
};

export type WorkorderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export const STATUS_META: Record<WorkorderStatus, { label: string; background: string; border: string; text: string }> = {
  pending: {
    label: 'Pendente',
    background: 'rgba(234, 179, 8, 0.14)',
    border: 'rgba(234, 179, 8, 0.28)',
    text: '#b45309',
  },
  in_progress: {
    label: 'Em Progresso',
    background: 'rgba(59, 130, 246, 0.14)',
    border: 'rgba(59, 130, 246, 0.28)',
    text: '#1d4ed8',
  },
  completed: {
    label: 'Concluído',
    background: 'rgba(34, 197, 94, 0.14)',
    border: 'rgba(34, 197, 94, 0.24)',
    text: '#15803d',
  },
  cancelled: {
    label: 'Cancelado',
    background: 'rgba(239, 68, 68, 0.14)',
    border: 'rgba(239, 68, 68, 0.24)',
    text: '#b91c1c',
  },
};

export type WorkorderPriority = 'urgent' | 'high' | 'medium' | 'low';

export const PRIORITY_META: Record<WorkorderPriority, { label: string; background: string; border: string; text: string }> = {
  urgent: {
    label: 'Urgente',
    background: 'rgba(244, 63, 94, 0.14)',
    border: 'rgba(244, 63, 94, 0.24)',
    text: '#be123c',
  },
  high: {
    label: 'Alta',
    background: 'rgba(234, 88, 12, 0.14)',
    border: 'rgba(234, 88, 12, 0.24)',
    text: '#c2410c',
  },
  medium: {
    label: 'Média',
    background: 'rgba(250, 204, 21, 0.14)',
    border: 'rgba(250, 204, 21, 0.24)',
    text: '#b45309',
  },
  low: {
    label: 'Baixa',
    background: 'rgba(34, 197, 94, 0.14)',
    border: 'rgba(34, 197, 94, 0.24)',
    text: '#15803d',
  },
};

export type TimelineEventType = 'created' | 'status_change' | 'assigned' | 'comment';

export const TIMELINE_META: Record<TimelineEventType, { label: string; color: string; background: string }> = {
  created: {
    label: 'Criação',
    color: '#2563eb',
    background: 'rgba(59, 130, 246, 0.12)',
  },
  status_change: {
    label: 'Status',
    color: '#f59e0b',
    background: 'rgba(234, 179, 8, 0.12)',
  },
  assigned: {
    label: 'Atribuição',
    color: '#7c3aed',
    background: 'rgba(167, 139, 250, 0.12)',
  },
  comment: {
    label: 'Comentário',
    color: '#4b5563',
    background: 'rgba(75, 85, 99, 0.12)',
  },
};