import type { ChangeEvent, CSSProperties } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '../theme/ThemeProvider';
import { AppColors, spacing, typography } from '../theme/tokens';

type DueTimeFieldProps = {
  value: string | null;
  hasDueDate: boolean;
  disabled?: boolean;
  pickerVisible: boolean;
  onPickerVisibleChange: (visible: boolean) => void;
  onChange: (value: string | null) => void;
};

export function DueTimeField({
  value,
  hasDueDate,
  disabled = false,
  onChange,
}: DueTimeFieldProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const unavailable = disabled || !hasDueDate;
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.currentTarget.value || null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Reminder time</Text>
      <input
        aria-describedby="due-time-helper"
        aria-label="Reminder time"
        disabled={unavailable}
        onChange={handleChange}
        style={{
          ...timeInputStyle,
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          color: colors.text,
          opacity: unavailable ? 0.58 : 1,
        }}
        type="time"
        value={value ?? ''}
      />
      <Text nativeID="due-time-helper" style={styles.helper}>
        {hasDueDate ? 'Optional - alerts you at this time' : 'Choose a due date first'}
      </Text>
    </View>
  );
}

const timeInputStyle: CSSProperties = {
  width: '100%',
  minWidth: 0,
  height: 50,
  boxSizing: 'border-box',
  appearance: 'auto',
  borderRadius: 12,
  cursor: 'pointer',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontSize: typography.body,
  fontWeight: 600,
  padding: `0 ${spacing.md}px`,
};

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { marginBottom: spacing.lg },
  label: {
    color: colors.text,
    fontSize: typography.bodySmall,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  helper: { color: colors.textMuted, fontSize: typography.caption, marginTop: spacing.sm },
});
