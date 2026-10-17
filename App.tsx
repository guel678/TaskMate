import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ErrorBanner, LoadErrorState, LoadingState } from './src/components/AppStates';
import { AnimatedProgressBar } from './src/components/AnimatedProgressBar';
import { AnimatedSplash } from './src/components/animated-splash';
import { DeleteTaskModal } from './src/components/DeleteTaskModal';
import { EmptyState } from './src/components/EmptyState';
import { FilterTabs } from './src/components/FilterTabs';
import { TaskCard } from './src/components/TaskCard';
import { TaskEditorModal } from './src/components/TaskEditorModal';
import { filterTasks, getTaskProgress } from './src/domain/tasks';
import { useTasks } from './src/hooks/useTasks';
import { MotionProvider, useReducedMotion } from './src/motion/MotionProvider';
import { initializeTaskNotifications } from './src/notifications/taskNotifications';
import {
  AppThemeProvider,
  useAppTheme,
  useThemedStyles,
} from './src/theme/ThemeProvider';
import { AppColors, motion, spacing, typography } from './src/theme/tokens';
import { Task, TaskFilter, TaskInput } from './src/types/task';
import {
  playDeleteHaptic,
  playSelectionHaptic,
  playSuccessHaptic,
} from './src/utils/haptics';
import {
  getContentHorizontalPadding,
  shouldStackProgressHeader,
  shouldUseCompactLayout,
} from './src/utils/layout';

function TaskMateApp() {
  const { colors, isDark } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const reduceMotion = useReducedMotion();
  const { fontScale, width } = useWindowDimensions();
  const {
    tasks,
    loadState,
    loadError,
    operationError,
    isMutating,
    retry,
    clearOperationError,
    createTask,
    updateTask,
    setTaskCompleted,
    deleteTask,
  } = useTasks();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [exitingTaskId, setExitingTaskId] = useState<string | null>(null);
  const [addButtonScale] = useState(() => new Animated.Value(1));
  const deletionAnimationResolver = useRef<(() => void) | null>(null);

  useEffect(() => {
    void initializeTaskNotifications();
  }, []);

  const filteredTasks = useMemo(() => filterTasks(tasks, filter), [filter, tasks]);
  const progress = useMemo(() => getTaskProgress(tasks), [tasks]);
  const today = new Date();
  const dateLabel = today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const stackProgressHeader = shouldStackProgressHeader(fontScale);
  const horizontalPadding = getContentHorizontalPadding(width);
  const compactLayout = shouldUseCompactLayout(width);

  const openCreateEditor = () => {
    clearOperationError();
    setEditingTask(null);
    setEditorVisible(true);
  };

  const openEditEditor = (task: Task) => {
    clearOperationError();
    setEditingTask(task);
    setEditorVisible(true);
  };

  const closeEditor = () => {
    if (isMutating) return;
    setEditorVisible(false);
  };

  const saveTask = async (input: TaskInput): Promise<string | null> => {
    const result = editingTask
      ? await updateTask(editingTask.id, input)
      : await createTask(input);

    if (!result.ok) return result.error;

    void playSuccessHaptic();
    setEditorVisible(false);
    return null;
  };

  const toggleTask = async (task: Task) => {
    const result = await setTaskCompleted(task.id, !task.completed);
    if (result.ok) void playSelectionHaptic();
  };

  const openDeleteDialog = (task: Task) => {
    clearOperationError();
    setDeletingTask(task);
  };

  const animateTaskRemoval = useCallback(
    (taskId: string) =>
      new Promise<void>((resolve) => {
        deletionAnimationResolver.current = resolve;
        setExitingTaskId(taskId);
      }),
    [],
  );

  const finishTaskRemovalAnimation = useCallback(() => {
    const resolve = deletionAnimationResolver.current;
    deletionAnimationResolver.current = null;
    resolve?.();
  }, []);

  const confirmDelete = async () => {
    if (!deletingTask) return;

    const taskId = deletingTask.id;
    setDeletingTask(null);
    const result = await deleteTask(taskId, () => animateTaskRemoval(taskId));
    setExitingTaskId(null);
    if (result.ok) void playDeleteHaptic();
  };

  const animateAddButton = (toValue: number) => {
    addButtonScale.stopAnimation();
    if (reduceMotion) {
      addButtonScale.setValue(1);
      return;
    }

    if (toValue < 1) {
      Animated.timing(addButtonScale, {
        toValue,
        duration: motion.press,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(addButtonScale, {
      toValue,
      duration: motion.exit,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const renderReadyState = () => (
    <>
      <FlatList
        data={filteredTasks}
        keyExtractor={(task) => task.id}
        renderItem={({ item, index }) => (
          <TaskCard
            disabled={isMutating}
            exiting={exitingTaskId === item.id}
            isFirst={index === 0}
            isLast={index === filteredTasks.length - 1}
            task={item}
            onToggle={() => void toggleTask(item)}
            onEdit={() => openEditEditor(item)}
            onDelete={() => openDeleteDialog(item)}
            onExitComplete={finishTaskRemovalAnimation}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingHorizontal: horizontalPadding },
          filteredTasks.length === 0 && styles.emptyListContent,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text accessibilityRole="header" style={styles.title}>
                TaskMate
              </Text>
            </View>

            <View style={[styles.progressSummary, compactLayout && styles.progressSummaryCompact]}>
              <View
                style={[
                  styles.progressHeader,
                  stackProgressHeader && styles.progressHeaderStacked,
                ]}
              >
                <View style={styles.progressCopy}>
                  <View style={styles.progressDateRow}>
                    <Ionicons
                      color={colors.primary}
                      name="calendar-clear-outline"
                      size={16}
                    />
                    <Text
                      accessibilityLabel={`Today, ${dateLabel}`}
                      style={styles.progressDate}
                    >
                      {dateLabel}
                    </Text>
                  </View>
                  <Text style={styles.progressTitle}>
                    {progress.total === 0
                      ? 'Ready when you are'
                      : progress.completed === progress.total
                        ? 'Everything is done'
                        : 'Keep moving forward'}
                  </Text>
                  <Text style={styles.progressSubtitle}>
                    {progress.total === 0
                      ? 'Add a task to begin your day.'
                      : `${progress.completed} of ${progress.total} tasks completed`}
                  </Text>
                </View>
                <Text
                  accessibilityLabel={`${progress.percentage} percent complete`}
                  style={styles.progressPercent}
                >
                  {progress.percentage}%
                </Text>
              </View>
              <AnimatedProgressBar percentage={progress.percentage} />
            </View>

            <FilterTabs disabled={isMutating} value={filter} onChange={setFilter} />

            {operationError ? (
              <ErrorBanner message={operationError} onDismiss={clearOperationError} />
            ) : null}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {filter === 'all'
                  ? 'All tasks'
                  : `${filter[0].toUpperCase()}${filter.slice(1)}`}
              </Text>
              <Text
                accessibilityLabel={`${filteredTasks.length} ${filteredTasks.length === 1 ? 'task' : 'tasks'}`}
                style={styles.taskCount}
              >
                {filteredTasks.length}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState disabled={isMutating} filter={filter} onAdd={openCreateEditor} />
        }
      />

      <Animated.View
        style={[
          styles.addButtonContainer,
          {
            right: horizontalPadding,
            bottom: horizontalPadding,
            transform: [{ scale: addButtonScale }],
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add a new task"
          accessibilityState={{ disabled: isMutating }}
          disabled={isMutating}
          onPress={openCreateEditor}
          onPressIn={() => animateAddButton(0.96)}
          onPressOut={() => animateAddButton(1)}
          style={({ pressed }) => [
            styles.addButton,
            isMutating && styles.addButtonDisabled,
            pressed && styles.addButtonPressed,
          ]}
        >
          <Ionicons color={colors.onPrimary} name="add" size={22} />
          <Text style={styles.addButtonText}>Add task</Text>
        </Pressable>
      </Animated.View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.appFrame}>
        {loadState === 'loading' ? <LoadingState /> : null}
        {loadState === 'error' ? (
          <LoadErrorState message={loadError} onRetry={() => void retry()} />
        ) : null}
        {loadState === 'ready' ? renderReadyState() : null}
      </View>

      <TaskEditorModal
        visible={editorVisible}
        task={editingTask}
        onClose={closeEditor}
        onSave={saveTask}
      />
      <DeleteTaskModal
        deleting={isMutating}
        task={deletingTask}
        onCancel={() => setDeletingTask(null)}
        onConfirm={() => void confirmDelete()}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AppThemeProvider>
      <SafeAreaProvider>
        <MotionProvider>
          <AnimatedSplash>
            <TaskMateApp />
          </AnimatedSplash>
        </MotionProvider>
      </SafeAreaProvider>
    </AppThemeProvider>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.page,
  },
  appFrame: {
    width: '100%',
    maxWidth: 720,
    flex: 1,
    alignSelf: 'center',
    backgroundColor: colors.background,
  },
  listContent: {
    paddingTop: spacing.xl,
    paddingBottom: 112,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: typography.display,
    fontWeight: '700',
    letterSpacing: -1.2,
    lineHeight: 40,
    flexShrink: 1,
  },
  progressSummary: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingBottom: spacing.lg,
    marginBottom: spacing.lg,
  },
  progressSummaryCompact: {
    paddingBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  progressHeaderStacked: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  progressCopy: {
    flex: 1,
    minWidth: 0,
  },
  progressDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  progressDate: {
    flexShrink: 1,
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  progressTitle: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '700',
    lineHeight: 25,
    marginBottom: spacing.xs,
  },
  progressSubtitle: {
    color: colors.textMuted,
    fontSize: typography.bodySmall,
  },
  progressPercent: {
    flexShrink: 0,
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '700',
  },
  taskCount: {
    color: colors.textMuted,
    fontSize: typography.bodySmall,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  addButtonContainer: {
    position: 'absolute',
    borderRadius: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 7,
  },
  addButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  addButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  addButtonDisabled: {
    opacity: 0.58,
  },
  addButtonText: {
    color: colors.onPrimary,
    fontSize: typography.body,
    fontWeight: '700',
  },
});
