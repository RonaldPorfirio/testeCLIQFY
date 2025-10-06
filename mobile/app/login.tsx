import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useAuth } from '../hooks/useAuth';
import { palette, radii, shadows, spacing, typography } from '../constants/design';

export default function LoginScreen() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = useMemo(() => email.trim().length > 0 && password.length > 0, [email, password]);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/orders');
    }
  }, [loading, router, user]);

  async function handleLogin() {
    if (submitting || !isFormValid) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const success = await login(email.trim(), password);
      if (success) {
        router.replace('/orders');
      } else {
        setError('Credenciais inválidas. Verifique os dados e tente novamente.');
      }
    } catch (err) {
      console.error(err);
      setError('Não foi possível concluir o login. Tente novamente em instantes.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={palette.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Sistema de Ordens de Serviço</Text>
            <Text style={styles.heroSubtitle}>
              Acesse suas ordens, acompanhe timelines e registre check-ins direto pelo aplicativo.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Entre com suas credenciais</Text>
              <Text style={styles.cardDescription}>
                Use o mesmo acesso da plataforma web para sincronizar seus dados.
              </Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                placeholder="seu@email.com"
                placeholderTextColor={palette.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor={palette.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.button, (!isFormValid || submitting) && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={!isFormValid || submitting}
            >
              {submitting ? (
                <ActivityIndicator color={palette.surface} />
              ) : (
                <Text style={styles.buttonLabel}>Entrar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.credentialsBox}>
              <Text style={styles.credentialsTitle}>Credenciais de teste</Text>
              <Text style={styles.credentialsText}>Email: admin@example.com</Text>
              <Text style={styles.credentialsText}>Senha: admin123</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    marginBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: typography.heading,
    fontWeight: '700',
    color: palette.primary,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: typography.body,
    color: palette.muted,
    lineHeight: 20,
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
    gap: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.title,
    fontWeight: '600',
    color: palette.primary,
  },
  cardDescription: {
    fontSize: typography.body,
    color: palette.muted,
    lineHeight: 20,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: palette.muted,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: palette.text,
    backgroundColor: palette.surfaceMuted,
  },
  errorBox: {
    borderRadius: radii.md,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.24)',
    padding: spacing.sm + 2,
  },
  errorText: {
    fontSize: typography.caption,
    color: palette.danger,
    textAlign: 'center',
  },
  button: {
    height: 52,
    borderRadius: radii.md,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLabel: {
    color: palette.surface,
    fontSize: typography.subtitle,
    fontWeight: '600',
  },
  credentialsBox: {
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  credentialsTitle: {
    fontSize: typography.caption,
    textTransform: 'uppercase',
    fontWeight: '700',
    color: palette.muted,
  },
  credentialsText: {
    fontSize: typography.body,
    color: palette.text,
  },
});