import { useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { useModalTransition } from '../motion/useModalTransition';
import { useAppTheme, useThemedStyles } from '../theme/ThemeProvider';
import { AppColors, effects, spacing, typography } from '../theme/tokens';
import { Task } from '../types/task';
import { shouldStackDialogActions } from '../utils/layout';

type DeleteTaskModalProps = {
  task: Task | null;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteTaskModal({
  task,
  deleting,
  onCancel,
  onConfirm,
}: DeleteTaskModalProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { mounted, progress, reduceMotion } = useModalTransition(task !== null);
  const { fontScale } = useWindowDimensions();
  const [renderedTask, setRenderedTask] = useState(task);

  if (task && task !== renderedTask) setRenderedTask(task);

  const currentTask = task ?? renderedTask;
  if (!mounted || !currentTask) return null;

  const stackActions = shouldStackDialogActions(fontScale);

  const cancelButton = (
    <Pressable
      key="cancel"
      accessibilityRole="button"
      accessibilityLabel="Cancel deleting task"
      accessibilityState={{ disabled: deleting }}
      disabled={deleting}
      onPress={onCancel}
      style={({ pressed }) => [
        styles.button,
        styles.cancelButton,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.cancelText}>Cancel</Text>
    </Pressable>
  );

  const deleteButton = (
    <Pressable
      key="delete"
      accessibilityRole="button"
      accessibilityLabel={`Permanently delete ${currentTask.title}`}
      accessibilityState={{ busy: deleting, disabled: deleting }}
      disabled={deleting}
      onPress={onConfirm}
      style={({ pressed }) => [
        styles.button,
        styles.deleteButton,
        pressed && styles.deletePressed,
      ]}
    >
      {deleting ? (
        <View style={styles.buttonContent}>
          <ActivityIndicator color={colors.danger} size="small" />
          <Text style={styles.deleteText}>Deleting...</Text>
        </View>
      ) : (
        <Text style={styles.deleteText}>Delete</Text>
      )}
    </Pressable>
  );

  return (
    <Modal
      animationType="none"
      onRequestClose={deleting ? undefined : onCancel}
      statusBarTranslucent
      transparent
      visible
    >
      <View style={styles.overlay}>
        <Animated.View
          pointerEvents="none"
          style={[styles.scrim, { opacity: progress }]}
        />
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.dialog,
            { opacity: progress },
            !reduceMotion
              ? {
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 0],
                    extrapolate: 'clamp',
                  }),
                },
                {
                  scale: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.985, 1],
                    extrapolate: 'clamp',
                  }),
                },
              ],
                }
              : null,
          ]}
        >
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.dialogContent}
            showsVerticalScrollIndicator={false}
          >
            <Text accessibilityRole="header" style={styles.title}>
              Delete task?
            </Text>
            <Text style={styles.description}>
              &ldquo;{currentTask.title}&rdquo; will be permanently deleted. This can&apos;t be
              undone.
            </Text>

            <View style={[styles.actions, stackActions && styles.actionsStacked]}>
              {stackActions ? [deleteButton, cancelButton] : [cancelButton, deleteButton]}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    maxHeight: '88%',
    backgroundColor: colors.floating,
    borderColor: colors.highlight,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: effects.dialogShadowWeb },
      default: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        elevation: 10,
      },
    }),
  },
  dialogContent: {
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '700',
    lineHeight: 25,
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    justifyContent: 'flex-end',
  },
  actionsStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  button: {
    minWidth: 96,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: spacing.md,
  },
  cancelButton: {},
  deleteButton: {},
  cancelText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  deleteText: {
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: '700',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  deletePressed: {
    backgroundColor: colors.dangerSoft,
  },
});
