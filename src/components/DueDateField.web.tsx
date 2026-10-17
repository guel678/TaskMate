import Ionicons from '@expo/vector-icons/Ionicons';
import type { ChangeEvent, CSSProperties, PointerEvent } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '../theme/ThemeProvider';
import { AppColors, spacing, typography } from '../theme/tokens';

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
  onChange,
}: DueDateFieldProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.currentTarget.value || null);
  };

  const handlePointerDown = (event: PointerEvent<HTMLInputElement>) => {
    if (disabled || typeof event.currentTarget.showPicker !== 'function') return;

    // Opening from the pointer event makes the whole field behave like a
    // picker button while preserving native keyboard and screen-reader input.
    event.preventDefault();
    event.currentTarget.showPicker();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Due date</Text>
      <View style={styles.row}>
        <input
          aria-describedby="due-date-helper"
          aria-label="Due date"
          disabled={disabled}
          onChange={handleChange}
          onPointerDown={handlePointerDown}
          style={{
            ...dateInputStyle,
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            color: colors.text,
          }}
          type="date"
          value={value ?? ''}
        />
        {value ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remove due date"
            disabled={disabled}
            onPress={() => onChange(null)}
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
      <Text nativeID="due-date-helper" style={styles.helper}>
        Optional - choose from the calendar
      </Text>
    </View>
  );
}

const dateInputStyle: CSSProperties = {
  minWidth: 0,
  height: 50,
  flex: 1,
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
  helper: {
    color: colors.textMuted,
    fontSize: typography.caption,
    marginTop: spacing.sm,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
});
