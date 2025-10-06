import React, { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import {
  PRIORITY_META,
  STATUS_META,
  WorkorderPriority,
  WorkorderStatus,
  palette,
  radii,
  shadows,
  spacing,
  typography,
} from '../../constants/design';

export type OrderSummary = {
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
};

export type OrdersResponse = {
  orders: OrderSummary[];
  total: number;
};

function mapOrder(raw: any): OrderSummary {
  return {
    id: String(raw.id),
    title: raw.title ?? 'Ordem sem título',
    description: raw.description ?? '',
    status: raw.status ?? 'pending',
    priority: raw.priority ?? 'medium',
    clientName: raw.clientName ?? 'Cliente não informado',
    clientEmail: raw.clientEmail ?? '',
    assignedTo: raw.assignedTo ?? null,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

async function fetchOrders(): Promise<OrdersResponse> {
  const res = await api.get('/orders');
  if (!res.ok) {
    throw new Error('Erro ao carregar ordens');
  }

  const payload = await res.json();
  const items = Array.isArray(payload?.orders) ? payload.orders.map(mapOrder) : [];

  return {
    orders: items,
    total: typeof payload?.total === 'number' ? payload.total : items.length,
  };
}

export default function OrdersList() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, router, user]);

  const { data, isLoading, error, refetch, isRefetching } = useQuery<OrdersResponse>({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    enabled: !!user,
  });

  const handleNavigate = useCallback(
    (orderId: string) => {
      router.push(`/orders/${orderId}`);
    },
    [router],
  );

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={palette.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Não foi possível carregar as ordens</Text>
          <Text style={styles.errorMessage}>
            Verifique sua conexão e tente novamente. Se o problema persistir, entre em contato com o suporte.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
            activeOpacity={0.9}
          >
            {isRefetching ? (
              <ActivityIndicator color={palette.surface} />
            ) : (
              <Text style={styles.retryLabel}>Tentar novamente</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={data?.orders ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            tintColor={palette.primary}
            colors={[palette.primary]}
            refreshing={isRefetching}
            onRefresh={refetch}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTextGroup}>
              <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0] ?? 'Operador'}</Text>
              <Text style={styles.subtitle}>Acompanhe suas ordens com a mesma experiência do painel web.</Text>
            </View>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.9}
            >
              <Text style={styles.logoutLabel}>Sair</Text>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nenhuma ordem encontrada</Text>
              <Text style={styles.emptyMessage}>
                Quando novas ordens forem atribuídas a você, elas aparecerão aqui imediatamente.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const statusMeta = STATUS_META[item.status] ?? STATUS_META.pending;
          const priorityMeta = PRIORITY_META[item.priority] ?? PRIORITY_META.medium;

          return (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => handleNavigate(item.id)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
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

              {item.description ? (
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Cliente</Text>
                <Text style={styles.metaValue}>{item.clientName}</Text>
              </View>
              {item.assignedTo ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Responsável</Text>
                  <Text style={styles.metaValue}>{item.assignedTo}</Text>
                </View>
              ) : null}
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Criada em</Text>
                <Text style={styles.metaValue}>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={data?.orders?.length ? (
          <Text style={styles.footerText}>{data.total} ordem(ns) encontradas</Text>
        ) : null}
      />
      {isLoading && !isRefetching ? (
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
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  headerTextGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  greeting: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: palette.primary,
  },
  subtitle: {
    fontSize: typography.body,
    color: palette.muted,
    lineHeight: 20,
  },
  logoutButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
  },
  logoutLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    color: palette.primary,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: typography.title,
    fontWeight: '600',
    color: palette.primary,
  },
  badgeGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: typography.body,
    color: palette.muted,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: typography.caption,
    color: palette.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metaValue: {
    fontSize: typography.body,
    color: palette.text,
    fontWeight: '500',
  },
  footerText: {
    marginTop: spacing.md,
    textAlign: 'center',
    color: palette.muted,
    fontSize: typography.caption,
  },
  emptyState: {
    marginTop: spacing.xl,
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  emptyTitle: {
    fontSize: typography.title,
    fontWeight: '600',
    color: palette.primary,
  },
  emptyMessage: {
    fontSize: typography.body,
    color: palette.muted,
    lineHeight: 20,
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(243, 244, 246, 0.65)',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});