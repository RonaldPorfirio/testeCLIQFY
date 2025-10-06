import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

import {
  PRIORITY_META,
  STATUS_META,
  TIMELINE_META,
  TimelineEventType,
  WorkorderPriority,
  WorkorderStatus,
  palette,
  radii,
  shadows,
  spacing,
  typography,
} from '../../constants/design';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export type OrderDetail = {
  id: string;
  title: string;
  description: string;
  status: WorkorderStatus;
  priority: WorkorderPriority;
  clientName: string;
  clientEmail: string;
  assignedTo?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type TimelineEvent = {
  id: number;
  type: TimelineEventType;
  description: string;
  userName: string | null;
  timestamp: string;
  metadata?: Record<string, any> | null;
};

export type CheckinResponse = {
  id: number;
  workorderId: number;
  userId: number | null;
  note: string;
  createdAt: string;
  latitude?: number | null;
  longitude?: number | null;
  photo?: string | null;
};

function normalizeOrder(raw: any): OrderDetail {
  return {
    id: String(raw.id),
    title: raw.title ?? 'Ordem de serviço',
    description: raw.description ?? '',
    status: raw.status ?? 'pending',
    priority: raw.priority ?? 'medium',
    clientName: raw.clientName ?? 'Cliente',
    clientEmail: raw.clientEmail ?? '',
    assignedTo: raw.assignedTo ?? null,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
    completedAt: raw.completedAt ?? null,
  };
}

function normalizeTimeline(raw: any): TimelineEvent {
  return {
    id: Number(raw.id ?? 0),
    type: (raw.type ?? 'comment') as TimelineEventType,
    description: raw.description ?? '',
    userName: raw.userName ?? null,
    timestamp: raw.timestamp ?? new Date().toISOString(),
    metadata: raw.metadata ?? null,
  };
}

async function fetchOrder(orderId: string): Promise<OrderDetail> {
  const res = await api.get(`/orders/${orderId}`);
  if (!res.ok) {
    throw new Error('Erro ao carregar ordem');
  }
  const payload = await res.json();
  return normalizeOrder(payload);
}

async function fetchTimeline(orderId: string): Promise<TimelineEvent[]> {
  const res = await api.get(`/timeline/${orderId}`);
  if (!res.ok) {
    throw new Error('Erro ao carregar timeline');
  }
  const payload = await res.json();
  return Array.isArray(payload) ? payload.map(normalizeTimeline) : [];
}

function formatDate(value: string | null | undefined, withTime = false) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return withTime
    ? date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : date.toLocaleDateString('pt-BR');
}

export default function OrderDetailScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [lastCoordinates, setLastCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, router, user]);

  const {
    data: order,
    isLoading: loadingOrder,
    error: orderError,
  } = useQuery<OrderDetail>({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id!),
    enabled: !!id,
  });

  const {
    data: timeline,
    isLoading: loadingTimeline,
    error: timelineError,
  } = useQuery<TimelineEvent[]>({
    queryKey: ['timeline', id],
    queryFn: () => fetchTimeline(id!),
    enabled: !!id,
  });

  const checkinMutation = useMutation<CheckinResponse, Error>({
    mutationFn: async () => {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
      if (locationStatus !== Location.PermissionStatus.GRANTED) {
        throw new Error('Permissão de localização negada.');
      }

      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (!cameraPermission.granted) {
        throw new Error('Permissão de câmera negada.');
      }

      const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!mediaPermission.granted) {
        throw new Error('Permissão da galeria negada.');
      }

      const currentPosition = await Location.getCurrentPositionAsync({});

      const cameraResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.6,
      });

      if (cameraResult.canceled) {
        throw new Error('Captura de foto cancelada.');
      }

      const asset = cameraResult.assets[0];
      const payload = {
        note: 'Check-in realizado via aplicativo móvel',
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
        photo: asset.base64,
      };

      const response = await api.post(`/checkins/${id}`, payload);
      if (!response.ok) {
        throw new Error('Não foi possível registrar o check-in.');
      }

      const data = await response.json();
      setPhotoPreview(asset.uri ?? null);
      setLastCoordinates({
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      });
      return data as CheckinResponse;
    },
    onSuccess: () => {
      Alert.alert('Check-in registrado', 'O check-in foi adicionado à timeline desta OS.');
      queryClient.invalidateQueries({ queryKey: ['timeline', id] });
    },
    onError: (err) => {
      Alert.alert('Erro ao registrar check-in', err.message);
    },
  });


  const isLoadingData = loadingOrder || loadingTimeline;

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={palette.primary} />
      </SafeAreaView>
    );
  }

  if (orderError || timelineError) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Erro ao carregar dados</Text>
          <Text style={styles.errorMessage}>
            Verifique sua conexão e tente novamente. Caso o problema persista, contate o suporte.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              queryClient.invalidateQueries({ queryKey: ['order', id] });
              queryClient.invalidateQueries({ queryKey: ['timeline', id] });
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.retryLabel}>Recarregar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return null;
  }

  const statusMeta = STATUS_META[order.status] ?? STATUS_META.pending;
  const priorityMeta = PRIORITY_META[order.priority] ?? PRIORITY_META.medium;
  const hasPhotoPreview = !!photoPreview;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backLink}
          activeOpacity={0.7}
        >
          <Text style={styles.backLinkText}>‹ Voltar</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>{order.title}</Text>
            <View style={styles.badgeGroup}>
              <View
                style={[styles.badge, {
                  backgroundColor: statusMeta.background,
                  borderColor: statusMeta.border,
                }]}
              >
                <Text style={[styles.badgeText, { color: statusMeta.text }]}>{statusMeta.label}</Text>
              </View>
              <View
                style={[styles.badge, {
                  backgroundColor: priorityMeta.background,
                  borderColor: priorityMeta.border,
                }]}
              >
                <Text style={[styles.badgeText, { color: priorityMeta.text }]}>{priorityMeta.label}</Text>
              </View>
            </View>
          </View>

          {order.description ? (
            <Text style={styles.description}>{order.description}</Text>
          ) : null}

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Cliente</Text>
              <Text style={styles.infoValue}>{order.clientName}</Text>
              {order.clientEmail ? (
                <Text style={styles.infoMuted}>{order.clientEmail}</Text>
              ) : null}
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Responsável</Text>
              <Text style={styles.infoValue}>{order.assignedTo ?? '—'}</Text>
              <Text style={styles.infoMuted}>Criada em {formatDate(order.createdAt)}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Atualização</Text>
              <Text style={styles.infoValue}>{formatDate(order.updatedAt, true)}</Text>
              <Text style={styles.infoMuted}>
                {order.completedAt ? `Concluída em ${formatDate(order.completedAt, true)}` : 'Ainda em andamento'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Check-in no local</Text>
              <Text style={styles.sectionSubtitle}>
                Capture sua localização e uma evidência visual para comprovar o atendimento.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.checkinButton, checkinMutation.isPending && styles.buttonDisabled]}
              onPress={() => checkinMutation.mutate()}
              disabled={checkinMutation.isPending}
              activeOpacity={0.85}
            >
              {checkinMutation.isPending ? (
                <ActivityIndicator color={palette.surface} />
              ) : (
                <Text style={styles.checkinLabel}>Registrar check-in</Text>
              )}
            </TouchableOpacity>
          </View>

          {lastCoordinates ? (
            <View style={styles.inlineCard}>
              <Text style={styles.inlineLabel}>Último check-in</Text>
              <Text style={styles.inlineValue}>
                Lat {lastCoordinates.latitude.toFixed(5)} · Long {lastCoordinates.longitude.toFixed(5)}
              </Text>
            </View>
          ) : null}

          {hasPhotoPreview ? (
            <Image source={{ uri: photoPreview! }} style={styles.photoPreview} />
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          {timeline && timeline.length > 0 ? (
            <View style={styles.timelineList}>
              {timeline.map((event, index) => {
                const meta = TIMELINE_META[event.type] ?? TIMELINE_META.comment;
                const isLast = index === timeline.length - 1;

                return (
                  <View key={event.id} style={styles.timelineRow}>
                    <View style={styles.timelineIconWrapper}>
                      {!isLast ? <View style={styles.timelineConnector} /> : null}
                      <View
                        style={[styles.timelineIcon, { borderColor: meta.color, backgroundColor: meta.background }]}
                      >
                        <Text style={[styles.timelineIconLabel, { color: meta.color }]}>{meta.label[0]}</Text>
                      </View>
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={styles.timelineTitle}>{event.description}</Text>
                      <Text style={styles.timelineMeta}>
                        {event.userName ?? 'Sistema'} · {formatDate(event.timestamp, true)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyTimeline}>Nenhum evento registrado ainda.</Text>
          )}
        </View>
      </ScrollView>

      {isLoadingData ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={palette.primary} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  backLink: {
    alignSelf: 'flex-start',
  },
  backLinkText: {
    fontSize: typography.body,
    color: palette.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.heading,
    fontWeight: '700',
    color: palette.primary,
    lineHeight: 30,
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  description: {
    fontSize: typography.body,
    color: palette.muted,
    lineHeight: 22,
  },
  infoGrid: {
    gap: spacing.md,
  },
  infoCard: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  infoLabel: {
    fontSize: typography.caption,
    color: palette.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: typography.subtitle,
    color: palette.text,
    fontWeight: '600',
  },
  infoMuted: {
    fontSize: typography.caption,
    color: palette.muted,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sectionHeaderText: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.title,
    fontWeight: '600',
    color: palette.primary,
  },
  sectionSubtitle: {
    fontSize: typography.body,
    color: palette.muted,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  checkinButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: palette.primary,
    minHeight: 48,
    minWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  checkinLabel: {
    color: palette.surface,
    fontSize: typography.body,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  inlineCard: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  inlineLabel: {
    fontSize: typography.caption,
    color: palette.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inlineValue: {
    fontSize: typography.body,
    color: palette.text,
    fontWeight: '600',
  },
  photoPreview: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  timelineList: {
    gap: spacing.md,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timelineIconWrapper: {
    width: 40,
    alignItems: 'center',
  },
  timelineConnector: {
    position: 'absolute',
    top: spacing.lg,
    width: 1,
    height: '100%',
    backgroundColor: palette.border,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  timelineIconLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
  },
  timelineContent: {
    flex: 1,
    gap: spacing.xs,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  timelineTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.text,
  },
  timelineMeta: {
    fontSize: typography.caption,
    color: palette.muted,
  },
  emptyTimeline: {
    fontSize: typography.body,
    color: palette.muted,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 244, 246, 0.65)',
  },
  errorCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.24)',
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  errorTitle: {
    fontSize: typography.title,
    fontWeight: '700',
    color: palette.danger,
  },
  errorMessage: {
    fontSize: typography.body,
    color: palette.muted,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: spacing.sm,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryLabel: {
    color: palette.surface,
    fontSize: typography.subtitle,
    fontWeight: '600',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});


