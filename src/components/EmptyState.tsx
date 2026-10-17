import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '../theme/ThemeProvider';
import { AppColors, spacing, typography } from '../theme/tokens';
import { TaskFilter } from '../types/task';

type EmptyStateProps = {
  filter: TaskFilter;
  disabled?: boolean;
  onAdd: () => void;
};

const copy: Record<TaskFilter, { title: string; description: string }> = {
  all: {
    title: 'No tasks yet',
    description: 'Add your first task and take one clear step forward.',
  },
  active: {
    title: 'No active tasks',
    description: 'You’re all caught up. Add a task when something comes up.',
  },
  completed: {
    title: 'Nothing completed yet',
    description: 'Completed tasks will appear here.',
  },
};

export function EmptyState({ filter, disabled = false, onAdd }: EmptyStateProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const content = copy[filter];

  return (
    <View style={styles.container}>
      <Ionicons
        accessible={false}
        color={colors.success}
        name="checkmark-done-outline"
        size={30}
        style={styles.icon}
      />
      <Text accessibilityRole="header" style={styles.title}>{content.title}</Text>
      <Text style={styles.description}>{content.description}</Text>
      {filter !== 'completed' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add a new task"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={onAdd}
          style={({ pressed }) => [
            styles.button,
            disabled && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>Add a task</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 72,
  },
  icon: {
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.bodySmall,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  button: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: spacing.lg,
  },
  buttonPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '700',
  },
});
