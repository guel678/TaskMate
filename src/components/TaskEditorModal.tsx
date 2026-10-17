import { useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  normalizeTaskInput,
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
} from '../domain/tasks';
import { DueDateField } from './DueDateField';
import { DueTimeField } from './DueTimeField';
import { PrioritySelector } from './PrioritySelector';
import { useModalTransition } from '../motion/useModalTransition';
import { useAppTheme, useThemedStyles } from '../theme/ThemeProvider';
import { AppColors, effects, spacing, typography } from '../theme/tokens';
import { Task, TaskInput, TaskPriority } from '../types/task';
import { shouldStackDialogActions, shouldStackEditorHeader } from '../utils/layout';

type TaskEditorModalProps = {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (input: TaskInput) => Promise<string | null>;
};

export function TaskEditorModal({ visible, task, onClose, onSave }: TaskEditorModalProps) {
  const { mounted, progress, reduceMotion } = useModalTransition(visible);
  if (!mounted) return null;

  return (
    <TaskEditorForm
      progress={progress}
      reduceMotion={reduceMotion}
      task={task}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

type TaskEditorFormProps = Omit<TaskEditorModalProps, 'visible'> & {
  progress: Animated.Value;
  reduceMotion: boolean;
};

function TaskEditorForm({ task, progress, reduceMotion, onClose, onSave }: TaskEditorFormProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { fontScale, width } = useWindowDimensions();
  const initialTitle = task?.title ?? '';
  const initialDescription = task?.description ?? '';
  const initialDueDate = task?.dueDate ?? null;
  const initialDueTime = task?.dueTime ?? null;
  const initialPriority = task?.priority ?? 'none';
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [dueDate, setDueDate] = useState<string | null>(initialDueDate);
  const [dueTime, setDueTime] = useState<string | null>(initialDueTime);
  const [priority, setPriority] = useState<TaskPriority>(initialPriority);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [discardPromptVisible, setDiscardPromptVisible] = useState(false);
  const hasUnsavedChanges =
    title !== initialTitle ||
    description !== initialDescription ||
    dueDate !== initialDueDate ||
    dueTime !== initialDueTime ||
    priority !== initialPriority;
  const stackDiscardActions = shouldStackDialogActions(fontScale);
  const stackHeader = shouldStackEditorHeader(width, fontScale);
  const discardTaskName = title.trim();

  const requestClose = () => {
    if (saving) return;
    if (datePickerVisible) {
      setDatePickerVisible(false);
      return;
    }
    if (timePickerVisible) {
      setTimePickerVisible(false);
      return;
    }
    if (discardPromptVisible) {
      setDiscardPromptVisible(false);
      return;
    }
    if (hasUnsavedChanges) {
      setDiscardPromptVisible(true);
      return;
    }
    onClose();
  };

  const submit = async () => {
    let input: TaskInput;
    try {
      input = normalizeTaskInput({ title, description, dueDate, dueTime, priority });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Check the task details.';
      if (message.toLowerCase().includes('title')) setTitleError(message);
      else setSaveError(message);
      return;
    }

    setSaving(true);
    setSaveError('');
    const error = await onSave(input);
    if (error) {
      setSaveError(error);
      setSaving(false);
    }
  };

  const keepEditingButton = (
    <Pressable
      key="keep-editing"
      accessibilityRole="button"
      accessibilityLabel="Keep editing task"
      onPress={() => setDiscardPromptVisible(false)}
      style={({ pressed }) => [
        styles.discardButton,
        styles.keepEditingButton,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.keepEditingText}>Keep editing</Text>
    </Pressable>
  );

  const discardButton = (
    <Pressable
      key="discard"
      accessibilityRole="button"
      accessibilityLabel="Discard unsaved changes"
      onPress={onClose}
      style={({ pressed }) => [
        styles.discardButton,
        styles.discardButtonDanger,
        pressed && styles.discardButtonDangerPressed,
      ]}
    >
      <Text style={styles.discardButtonText}>Discard</Text>
    </Pressable>
  );

  const cancelHeaderButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Cancel editing task"
      accessibilityState={{ disabled: saving }}
      disabled={saving}
      onPress={requestClose}
      style={({ pressed }) => [
        styles.headerButton,
        stackHeader && styles.headerButtonStacked,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.cancelText}>Cancel</Text>
    </Pressable>
  );

  const editorTitle = (
    <Text
      accessibilityRole="header"
      style={[styles.headerTitle, stackHeader && styles.headerTitleStacked]}
    >
      {task ? 'Edit task' : 'New task'}
    </Text>
  );

  const saveHeaderButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={task ? 'Save task changes' : 'Create task'}
      accessibilityState={{ disabled: saving }}
      disabled={saving}
      onPress={() => void submit()}
      style={({ pressed }) => [
        styles.headerButton,
        stackHeader && styles.headerButtonStacked,
        pressed && styles.pressed,
      ]}
    >
      {saving ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <Text style={styles.saveText}>Save</Text>
      )}
    </Pressable>
  );

  return (
    <Modal
      animationType="none"
      onRequestClose={requestClose}
      statusBarTranslucent
      transparent
      visible
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Animated.View
          pointerEvents="none"
          style={[styles.scrim, { opacity: progress }]}
        />
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.panel,
            Platform.OS === 'web' && styles.panelWeb,
            { opacity: progress },
            !reduceMotion
              ? {
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [28, 0],
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
          <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <View style={[styles.header, stackHeader && styles.headerStacked]}>
              {stackHeader ? (
                <>
                  {editorTitle}
                  <View style={styles.headerActions}>
                    {cancelHeaderButton}
                    {saveHeaderButton}
                  </View>
                </>
              ) : (
                <>
                  {cancelHeaderButton}
                  {editorTitle}
                  {saveHeaderButton}
                </>
              )}
            </View>

            <ScrollView
              contentContainerStyle={styles.content}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.intro}>
                <Text style={styles.title}>
                  {task ? 'Make it clearer' : 'What needs to be done?'}
                </Text>
                <Text style={styles.subtitle}>Keep it short, specific, and easy to act on.</Text>
              </View>

              {saveError ? (
                <View accessibilityLiveRegion="assertive" style={styles.saveError}>
                  <Text style={styles.saveErrorTitle}>Your task was not saved</Text>
                  <Text style={styles.saveErrorText}>{saveError}</Text>
                </View>
              ) : null}

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Task title</Text>
                <TextInput
                  accessibilityLabel="Task title"
                  accessibilityHint="Required, up to 100 characters"
                  autoFocus
                  editable={!saving}
                  maxLength={TASK_TITLE_MAX_LENGTH}
                  onChangeText={(value) => {
                    setTitle(value);
                    if (titleError) setTitleError('');
                    if (saveError) setSaveError('');
                  }}
                  placeholder="e.g. Finish the activity outline"
                  placeholderTextColor={colors.placeholder}
                  returnKeyType="next"
                  style={[styles.input, titleError && styles.inputError]}
                  value={title}
                />
                {titleError ? (
                  <Text accessibilityLiveRegion="assertive" style={styles.errorText}>
                    {titleError}
                  </Text>
                ) : (
                  <Text style={styles.helperText}>
                    Required - {title.length}/{TASK_TITLE_MAX_LENGTH}
                  </Text>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  accessibilityLabel="Task description"
                  accessibilityHint="Optional, up to 240 characters"
                  editable={!saving}
                  maxLength={TASK_DESCRIPTION_MAX_LENGTH}
                  multiline
                  onChangeText={(value) => {
                    setDescription(value);
                    if (saveError) setSaveError('');
                  }}
                  placeholder="Add helpful details (optional)"
                  placeholderTextColor={colors.placeholder}
                  style={[styles.input, styles.textArea]}
                  textAlignVertical="top"
                  value={description}
                />
                <Text style={styles.helperText}>
                  Optional - {description.length}/{TASK_DESCRIPTION_MAX_LENGTH}
                </Text>
              </View>

              <DueDateField
                disabled={saving}
                pickerVisible={datePickerVisible}
                value={dueDate}
                onChange={(value) => {
                  setDueDate(value);
                  if (!value) setDueTime(null);
                  if (saveError) setSaveError('');
                }}
                onPickerVisibleChange={setDatePickerVisible}
              />

              <DueTimeField
                disabled={saving}
                hasDueDate={dueDate !== null}
                pickerVisible={timePickerVisible}
                value={dueTime}
                onChange={(value) => {
                  setDueTime(value);
                  if (saveError) setSaveError('');
                }}
                onPickerVisibleChange={setTimePickerVisible}
              />

              <PrioritySelector
                disabled={saving}
                value={priority}
                onChange={(value) => {
                  setPriority(value);
                  if (saveError) setSaveError('');
                }}
              />
            </ScrollView>

          </SafeAreaView>

          {discardPromptVisible ? (
            <View style={styles.discardOverlay}>
              <View accessibilityViewIsModal style={styles.discardDialog}>
                <ScrollView
                  bounces={false}
                  contentContainerStyle={styles.discardDialogContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Text accessibilityRole="header" style={styles.discardTitle}>
                    Discard changes?
                  </Text>
                  <Text style={styles.discardDescription}>
                    {discardTaskName ? (
                      <>
                        Changes to &ldquo;{discardTaskName}&rdquo; will not be saved.
                      </>
                    ) : (
                      'Your changes will not be saved.'
                    )}
                  </Text>

                  <View
                    style={[
                      styles.discardActions,
                      stackDiscardActions && styles.discardActionsStacked,
                    ]}
                  >
                    {stackDiscardActions
                      ? [discardButton, keepEditingButton]
                      : [keepEditingButton, discardButton]}
                  </View>
                </ScrollView>
              </View>
            </View>
          ) : null}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.overlay,
  },
  panel: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: colors.floating,
    borderColor: colors.highlight,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    overflow: 'hidden',
  },
  panelWeb: {
    width: '92%',
    maxWidth: 640,
    maxHeight: 720,
    alignSelf: 'center',
    borderRadius: 30,
    marginBottom: spacing.lg,
  },
  safeArea: {
    flexShrink: 1,
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.floating,
    paddingHorizontal: spacing.sm,
  },
  headerStacked: {
    minHeight: 0,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    minWidth: 68,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  headerButtonStacked: {
    minWidth: 0,
    flex: 1,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  cancelText: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: '600',
  },
  saveText: {
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '700',
  },
  headerTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
  headerTitleStacked: {
    lineHeight: 24,
    paddingVertical: spacing.xs,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  intro: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 29,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  saveError: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerBorder,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  saveErrorTitle: {
    color: colors.danger,
    fontSize: typography.bodySmall,
    fontWeight: '700',
  },
  saveErrorText: {
    color: colors.danger,
    fontSize: typography.bodySmall,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.text,
    fontSize: typography.bodySmall,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    minHeight: 50,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.body,
    paddingHorizontal: spacing.md,
  },
  inputError: {
    borderColor: colors.danger,
  },
  textArea: {
    minHeight: 96,
    paddingTop: 12,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: 6,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.caption,
    fontWeight: '600',
    marginTop: 6,
  },
  discardOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
    padding: spacing.lg,
  },
  discardDialog: {
    width: '100%',
    maxWidth: 340,
    maxHeight: '88%',
    backgroundColor: colors.surface,
    borderRadius: 16,
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
  discardDialogContent: {
    padding: spacing.lg,
  },
  discardTitle: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '700',
    lineHeight: 25,
  },
  discardDescription: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  discardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    justifyContent: 'flex-end',
  },
  discardActionsStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  discardButton: {
    minWidth: 112,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: spacing.md,
  },
  keepEditingButton: {},
  keepEditingText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
    textAlign: 'center',
  },
  discardButtonDanger: {
    backgroundColor: 'transparent',
  },
  discardButtonDangerPressed: {
    backgroundColor: colors.dangerSoft,
  },
  discardButtonText: {
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: '700',
  },
});
