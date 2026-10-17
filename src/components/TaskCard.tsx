import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import {
  ActionSheetIOS,
  Animated,
  Easing,
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { formatDueDate, formatDueTime, getTaskDueState } from '../domain/tasks';
import { useReducedMotion } from '../motion/MotionProvider';
import { useAppTheme, useThemedStyles } from '../theme/ThemeProvider';
import { AppColors, motion, spacing, typography } from '../theme/tokens';
import { Task } from '../types/task';

type TaskCardProps = {
  task: Task;
  disabled: boolean;
  exiting: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExitComplete: () => void;
};

export function TaskCard({
  task,
  disabled,
  exiting,
  isFirst = true,
  isLast = true,
  onToggle,
  onEdit,
  onDelete,
  onExitComplete,
}: TaskCardProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const reduceMotion = useReducedMotion();
  const [entrance] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));
  const [completion] = useState(() => new Animated.Value(task.completed ? 1 : 0));
  const [departure] = useState(() => new Animated.Value(1));
  const [collapse] = useState(() => new Animated.Value(1));
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
  const [actionsVisible, setActionsVisible] = useState(false);
  const dueState = getTaskDueState(task);
  const priorityLabel =
    task.priority === 'none'
      ? null
      : `${task.priority[0].toUpperCase()}${task.priority.slice(1)}`;

  useEffect(() => {
    entrance.stopAnimation();
    if (reduceMotion) {
      entrance.setValue(1);
      return;
    }

    entrance.setValue(0);
    const animation = Animated.spring(entrance, {
      toValue: 1,
      ...motion.spring,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [entrance, reduceMotion]);

  useEffect(() => {
    completion.stopAnimation();
    if (reduceMotion) {
      completion.setValue(task.completed ? 1 : 0);
      return;
    }

    const animation = Animated.spring(completion, {
      toValue: task.completed ? 1 : 0,
      ...motion.springFast,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [completion, reduceMotion, task.completed]);

  useEffect(() => {
    departure.stopAnimation();
    collapse.stopAnimation();

    if (!exiting) {
      departure.setValue(1);
      collapse.setValue(1);
      return;
    }

    const animation = Animated.parallel([
      Animated.timing(departure, {
        toValue: 0,
        duration: reduceMotion ? 0 : motion.exit - 30,
        easing: Easing.in(Easing.cubic),
        // This value shares an Animated.View style graph with the JS-driven
        // height collapse, so both animations must use the same driver.
        useNativeDriver: false,
      }),
      Animated.timing(collapse, {
        toValue: 0,
        duration: reduceMotion ? 0 : motion.exit,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    ]);
    animation.start(({ finished }) => {
      if (finished) onExitComplete();
    });

    return () => animation.stop();
  }, [collapse, departure, exiting, onExitComplete, reduceMotion]);

  const handleLayout = (event: LayoutChangeEvent) => {
    if (!exiting) setMeasuredHeight(event.nativeEvent.layout.height);
  };

  const runEdit = () => {
    setActionsVisible(false);
    onEdit();
  };

  const runDelete = () => {
    setActionsVisible(false);
    onDelete();
  };

  const openActions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: task.title,
          options: ['Edit', 'Delete', 'Cancel'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) onEdit();
          if (buttonIndex === 1) onDelete();
        },
      );
      return;
    }

    setActionsVisible(true);
  };

  return (
    <Animated.View
      accessibilityElementsHidden={exiting}
      importantForAccessibility={exiting ? 'no-hide-descendants' : 'auto'}
      onLayout={handleLayout}
      pointerEvents={exiting ? 'none' : 'auto'}
      style={[
        styles.shell,
        exiting && measuredHeight !== null
          ? {
              height: collapse.interpolate({
                inputRange: [0, 1],
                outputRange: [0, measuredHeight],
                extrapolate: 'clamp',
              }),
              marginBottom: collapse.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0],
                extrapolate: 'clamp',
              }),
              overflow: 'hidden',
            }
          : null,
        {
          opacity: departure.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          }),
          transform: [
            {
              translateX: departure.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
                extrapolate: 'clamp',
              }),
            },
            {
              scale: departure.interpolate({
                inputRange: [0, 1],
                outputRange: [0.98, 1],
                extrapolate: 'clamp',
              }),
            },
          ],
        },
      ]}
    >
      <Animated.View
      accessibilityState={{ disabled }}
      style={[
        styles.card,
        isFirst && styles.firstCard,
        isLast && styles.lastCard,
        task.completed && styles.completedCard,
        disabled && styles.disabledCard,
        {
          opacity: entrance.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
            extrapolate: 'clamp',
          }),
          transform: [
            {
              translateY: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [10, 0],
                extrapolate: 'clamp',
              }),
            },
            {
              scale: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [0.985, 1],
                extrapolate: 'clamp',
              }),
            },
          ],
        },
      ]}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={`${task.completed ? 'Mark incomplete' : 'Mark complete'}: ${task.title}`}
        accessibilityState={{ checked: task.completed, disabled }}
        disabled={disabled}
        onPress={onToggle}
        style={({ pressed }) => [styles.checkboxTarget, pressed && styles.pressed]}
      >
        <View style={[styles.checkbox, task.completed && styles.checkedCheckbox]}>
          <Animated.View
            style={{
              opacity: completion.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
              transform: [
                {
                  scale: completion.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.55, 1],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            }}
          >
            <Ionicons color={colors.onPrimary} name="checkmark" size={18} />
          </Animated.View>
        </View>
      </Pressable>

      <View style={styles.content}>
        <Text style={[styles.title, task.completed && styles.completedText]}>
          {task.title}
        </Text>
        {task.description ? (
          <Text style={[styles.description, task.completed && styles.completedText]}>
            {task.description}
          </Text>
        ) : null}

        {priorityLabel || task.dueDate ? (
          <View style={styles.metadata}>
            {priorityLabel ? (
              <View
                style={[
                  styles.badge,
                  task.priority === 'medium' && styles.mediumBadge,
                  task.priority === 'high' && styles.highBadge,
                ]}
              >
                <Ionicons
                  accessible={false}
                  color={
                    task.priority === 'high'
                      ? colors.danger
                      : task.priority === 'medium'
                        ? colors.priorityMedium
                        : colors.textMuted
                  }
                  name={task.priority === 'high' ? 'flag' : 'flag-outline'}
                  size={14}
                />
                <Text
                  style={[
                    styles.badgeText,
                    task.priority === 'medium' && styles.mediumBadgeText,
                    task.priority === 'high' && styles.highBadgeText,
                  ]}
                >
                  {priorityLabel}
                </Text>
              </View>
            ) : null}

            {task.dueDate ? (
              <View
                style={[
                  styles.badge,
                  dueState === 'overdue' && styles.highBadge,
                  dueState === 'today' && styles.dueTodayBadge,
                ]}
              >
                <Ionicons
                  accessible={false}
                  color={dueState === 'overdue' ? colors.danger : colors.textMuted}
                  name={dueState === 'overdue' ? 'alert-circle-outline' : 'calendar-outline'}
                  size={14}
                />
                <Text
                  style={[
                    styles.badgeText,
                    dueState === 'overdue' && styles.highBadgeText,
                  ]}
                >
                  {dueState === 'overdue' ? 'Overdue' : dueState === 'today' ? 'Today' : 'Due'}{' '}
                  {formatDueDate(task.dueDate)}
                  {task.dueTime ? ` at ${formatDueTime(task.dueTime)}` : ''}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`More actions for ${task.title}`}
        accessibilityHint="Edit or delete this task"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={openActions}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.textMuted} name="ellipsis-horizontal" size={22} />
      </Pressable>
      </Animated.View>

      {Platform.OS !== 'ios' ? (
        <Modal
          animationType="fade"
          onRequestClose={() => setActionsVisible(false)}
          statusBarTranslucent
          transparent
          visible={actionsVisible}
        >
          <View style={styles.actionOverlay}>
            <Pressable
              accessibilityLabel="Close task actions"
              accessibilityRole="button"
              onPress={() => setActionsVisible(false)}
              style={StyleSheet.absoluteFill}
            />
            <View
              accessibilityLabel={`${task.title} actions`}
              accessibilityViewIsModal
              style={styles.actionMenu}
            >
              <Text numberOfLines={2} style={styles.actionTitle}>
                {task.title}
              </Text>
              <Pressable
                accessibilityLabel={`Edit ${task.title}`}
                accessibilityRole="button"
                onPress={runEdit}
                style={({ pressed }) => [styles.actionRow, pressed && styles.pressed]}
              >
                <Ionicons color={colors.text} name="create-outline" size={20} />
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>
              <Pressable
                accessibilityLabel={`Delete ${task.title}`}
                accessibilityRole="button"
                onPress={runDelete}
                style={({ pressed }) => [styles.actionRow, pressed && styles.deletePressed]}
              >
                <Ionicons color={colors.danger} name="trash-outline" size={20} />
                <Text style={styles.deleteActionText}>Delete</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Cancel task actions"
                accessibilityRole="button"
                onPress={() => setActionsVisible(false)}
                style={({ pressed }) => [styles.cancelAction, pressed && styles.pressed]}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </Animated.View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  shell: {
    marginBottom: 0,
  },
  card: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
  },
  firstCard: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  lastCard: {
    marginBottom: spacing.sm,
  },
  completedCard: {
    opacity: 0.72,
  },
  disabledCard: {
    opacity: 0.58,
  },
  checkboxTarget: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginLeft: -10,
    marginRight: spacing.xs,
    marginTop: -10,
  },
  checkbox: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.controlBorder,
    borderRadius: 9,
    borderWidth: 2,
  },
  checkedCheckbox: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  content: {
    flex: 1,
    paddingTop: 2,
  },
  title: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '600',
    lineHeight: 23,
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  completedText: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing.md,
    rowGap: spacing.xs,
    marginTop: spacing.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  mediumBadge: {
    backgroundColor: 'transparent',
  },
  highBadge: {
    backgroundColor: 'transparent',
  },
  dueTodayBadge: {
    backgroundColor: 'transparent',
  },
  badgeText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
  },
  mediumBadgeText: {
    color: colors.priorityMedium,
  },
  highBadgeText: {
    color: colors.danger,
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginLeft: spacing.xs,
    marginTop: -10,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  deletePressed: {
    backgroundColor: colors.dangerSoft,
  },
  actionOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
    padding: spacing.lg,
  },
  actionMenu: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.floating,
    borderColor: colors.highlight,
    borderRadius: 22,
    borderWidth: 1,
    padding: spacing.sm,
  },
  actionTitle: {
    color: colors.textMuted,
    fontSize: typography.bodySmall,
    fontWeight: '600',
    lineHeight: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  actionRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
  },
  actionText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '600',
  },
  deleteActionText: {
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: '600',
  },
  cancelAction: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    borderRadius: 12,
    marginTop: spacing.xs,
  },
});
