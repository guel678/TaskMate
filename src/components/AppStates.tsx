import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '../theme/ThemeProvider';
import { AppColors, spacing, typography } from '../theme/tokens';

export function LoadingState() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View
      accessibilityLabel="Loading saved tasks"
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      style={styles.centered}
    >
      <ActivityIndicator accessible={false} color={colors.primary} size="large" />
      <Text style={styles.stateTitle}>Loading your tasks</Text>
      <Text style={styles.stateDescription}>Checking your saved list...</Text>
    </View>
  );
}

type LoadErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function LoadErrorState({ message, onRetry }: LoadErrorStateProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.centered}>
      <View style={styles.stateIcon}>
        <Ionicons accessible={false} color={colors.danger} name="cloud-offline-outline" size={30} />
      </View>
      <Text style={styles.stateTitle}>Tasks could not be loaded</Text>
      <Text style={styles.stateDescription}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Try loading tasks again"
        onPress={onRetry}
        style={({ pressed }) => [styles.retryButton, pressed && styles.buttonPressed]}
      >
        <Ionicons color={colors.onPrimary} name="refresh" size={20} />
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
    </View>
  );
}

type ErrorBannerProps = {
  message: string;
  onDismiss: () => void;
};

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.banner}>
      <Ionicons accessible={false} color={colors.danger} name="alert-circle-outline" size={22} />
      <Text style={styles.bannerText}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss error"
        hitSlop={8}
        onPress={onDismiss}
        style={({ pressed }) => [styles.dismissButton, pressed && styles.buttonPressed]}
      >
        <Ionicons color={colors.danger} name="close" size={20} />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  stateIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: 22,
    marginBottom: spacing.md,
  },
  stateTitle: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '700',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  stateDescription: {
    maxWidth: 360,
    color: colors.textMuted,
    fontSize: typography.bodySmall,
    lineHeight: 21,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  retryText: {
    color: colors.onPrimary,
    fontSize: typography.body,
    fontWeight: '700',
  },
  banner: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerBorder,
    borderRadius: 14,
    borderWidth: 1,
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
  },
  bannerText: {
    flex: 1,
    color: colors.danger,
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  dismissButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  buttonPressed: {
    opacity: 0.72,
  },
});
