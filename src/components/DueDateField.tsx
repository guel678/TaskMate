import DateTimePicker, {
  DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  dateOnlyToDate,
  dateToDateOnly,
  formatDueDate,
} from '../domain/tasks';
import { useAppTheme, useThemedStyles } from '../theme/ThemeProvider';
import { AppColors, spacing, typography } from '../theme/tokens';
import { openAndroidDatePicker } from '../utils/android-date-picker';

type DueDateFieldProps = {
  value: string | null;
  disabled?: boolean;
  pickerVisible: boolean;
  onPickerVisibleChange: (visible: boolean) => void;
  onChange: (value: string | null) => void;
};

export function DueDateField({
  value,
  disabled = false,
  pickerVisible,
  onPickerVisibleChange,
  onChange,
}: DueDateFieldProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const selectedDate = value ? dateOnlyToDate(value) : new Date();

  const handleValueChange = (_event: DateTimePickerChangeEvent, date: Date) => {
    onChange(dateToDateOnly(date));
    onPickerVisibleChange(false);
  };

  const openPicker = () => {
    if (disabled) return;

    if (Platform.OS === 'android') {
      onPickerVisibleChange(true);
      openAndroidDatePicker({
        value: selectedDate,
        mode: 'date',
        display: 'default',
        onValueChange: handleValueChange,
        onDismiss: () => onPickerVisibleChange(false),
      });
      return;
    }

    onPickerVisibleChange(!pickerVisible);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Due date</Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={value ? `Due ${formatDueDate(value)}` : 'Add a due date'}
          accessibilityHint="Opens the system date picker"
          accessibilityState={{ disabled, expanded: pickerVisible }}
          disabled={disabled}
          onPress={openPicker}
          style={({ pressed }) => [
            styles.dateButton,
            pressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          <Ionicons
            accessible={false}
            color={value ? colors.primary : colors.textMuted}
            name="calendar-clear-outline"
            size={20}
          />
          <Text style={[styles.dateText, value && styles.dateTextSelected]}>
            {value ? formatDueDate(value) : 'No due date'}
          </Text>
        </Pressable>

        {value ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remove due date"
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={() => {
              onChange(null);
              onPickerVisibleChange(false);
            }}
            style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
          >
            <Ionicons
              accessible={false}
              color={colors.textMuted}
              name="close"
              size={20}
            />
          </Pressable>
        ) : null}
      </View>

      {pickerVisible && Platform.OS !== 'android' ? (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            disabled={disabled}
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            mode="date"
            onDismiss={() => onPickerVisibleChange(false)}
            onValueChange={handleValueChange}
            testID="due-date-picker"
            value={selectedDate}
          />
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    color: colors.text,
    fontSize: typography.bodySmall,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateButton: {
    minHeight: 50,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  dateText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: typography.body,
  },
  dateTextSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  clearButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: spacing.sm,
    overflow: 'hidden',
    padding: spacing.sm,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  disabled: {
    opacity: 0.58,
  },
});
