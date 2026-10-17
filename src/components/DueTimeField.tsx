import DateTimePicker, {
  DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { dateToTimeOnly, formatDueTime } from '../domain/tasks';
import { useAppTheme, useThemedStyles } from '../theme/ThemeProvider';
import { AppColors, spacing, typography } from '../theme/tokens';
import { openAndroidDatePicker } from '../utils/android-date-picker';

type DueTimeFieldProps = {
  value: string | null;
  hasDueDate: boolean;
  disabled?: boolean;
  pickerVisible: boolean;
  onPickerVisibleChange: (visible: boolean) => void;
  onChange: (value: string | null) => void;
};

function timeValueToDate(value: string | null) {
  const date = new Date();
  if (!value) return date;

  const [hour, minute] = value.split(':').map(Number);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export function DueTimeField({
  value,
  hasDueDate,
  disabled = false,
  pickerVisible,
  onPickerVisibleChange,
  onChange,
}: DueTimeFieldProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const unavailable = disabled || !hasDueDate;
  const selectedTime = timeValueToDate(value);

  const handleValueChange = (_event: DateTimePickerChangeEvent, date: Date) => {
    onChange(dateToTimeOnly(date));
    onPickerVisibleChange(false);
  };

  const openPicker = () => {
    if (unavailable) return;

    if (Platform.OS === 'android') {
      onPickerVisibleChange(true);
      openAndroidDatePicker({
        value: selectedTime,
        mode: 'time',
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
      <Text style={styles.label}>Reminder time</Text>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={value ? `Reminder at ${formatDueTime(value)}` : 'Add a reminder time'}
          accessibilityHint={hasDueDate ? 'Opens the system time picker' : 'Choose a due date first'}
          accessibilityState={{ disabled: unavailable, expanded: pickerVisible }}
          disabled={unavailable}
          onPress={openPicker}
          style={({ pressed }) => [
            styles.timeButton,
            pressed && styles.pressed,
            unavailable && styles.disabled,
          ]}
        >
          <Ionicons
            accessible={false}
            color={value ? colors.primary : colors.textMuted}
            name="time-outline"
            size={20}
          />
          <Text style={[styles.timeText, value && styles.timeTextSelected]}>
            {!hasDueDate
              ? 'Choose a due date first'
              : value
                ? formatDueTime(value)
                : 'No reminder time'}
          </Text>
        </Pressable>

        {value ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remove reminder time"
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={() => {
              onChange(null);
              onPickerVisibleChange(false);
            }}
            style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
          >
            <Ionicons accessible={false} color={colors.textMuted} name="close" size={20} />
          </Pressable>
        ) : null}
      </View>

      {pickerVisible && Platform.OS !== 'android' ? (
        <View style={styles.pickerContainer}>
          <DateTimePicker
            disabled={disabled}
            display="spinner"
            mode="time"
            onDismiss={() => onPickerVisibleChange(false)}
            onValueChange={handleValueChange}
            testID="due-time-picker"
            value={selectedTime}
          />
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: {
    color: colors.text,
    fontSize: typography.bodySmall,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  timeButton: {
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
  timeText: { flex: 1, color: colors.textMuted, fontSize: typography.body },
  timeTextSelected: { color: colors.text, fontWeight: '600' },
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
  pressed: { backgroundColor: colors.surfaceMuted },
  disabled: { opacity: 0.58 },
});
