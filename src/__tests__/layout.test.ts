import {
  ACCESSIBILITY_FONT_SCALE_THRESHOLD,
  getContentHorizontalPadding,
  shouldStackDialogActions,
  shouldStackEditorHeader,
  shouldStackFilterTabs,
  shouldStackProgressHeader,
  shouldUseCompactLayout,
} from '../utils/layout';

describe('responsive layout helpers', () => {
  test('stacks progress content at large accessibility text sizes', () => {
    expect(shouldStackProgressHeader(1)).toBe(false);
    expect(shouldStackProgressHeader(ACCESSIBILITY_FONT_SCALE_THRESHOLD - 0.01)).toBe(false);
    expect(shouldStackProgressHeader(ACCESSIBILITY_FONT_SCALE_THRESHOLD)).toBe(true);
    expect(shouldStackProgressHeader(2)).toBe(true);
  });

  test('stacks dialog actions at large accessibility text sizes', () => {
    expect(shouldStackDialogActions(1)).toBe(false);
    expect(shouldStackDialogActions(ACCESSIBILITY_FONT_SCALE_THRESHOLD)).toBe(true);
    expect(shouldStackDialogActions(Number.NaN)).toBe(false);
  });

  test('uses compact spacing only on narrow screens', () => {
    expect(getContentHorizontalPadding(320)).toBe(16);
    expect(getContentHorizontalPadding(390)).toBe(24);
    expect(shouldUseCompactLayout(389)).toBe(true);
    expect(shouldUseCompactLayout(720)).toBe(false);
  });

  test('stacks filter tabs only when width or text size cannot support one row', () => {
    expect(shouldStackFilterTabs(320, 1)).toBe(false);
    expect(shouldStackFilterTabs(319, 1)).toBe(true);
    expect(shouldStackFilterTabs(390, ACCESSIBILITY_FONT_SCALE_THRESHOLD)).toBe(true);
    expect(shouldStackFilterTabs(844, 1)).toBe(false);
  });

  test('stacks the editor header on compact widths and large text', () => {
    expect(shouldStackEditorHeader(320, 1)).toBe(true);
    expect(shouldStackEditorHeader(359, 1)).toBe(true);
    expect(shouldStackEditorHeader(360, 1)).toBe(false);
    expect(shouldStackEditorHeader(844, ACCESSIBILITY_FONT_SCALE_THRESHOLD)).toBe(true);
  });
});
