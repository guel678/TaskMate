export const ACCESSIBILITY_FONT_SCALE_THRESHOLD = 1.3;

const MIN_FILTER_TAB_ROW_WIDTH = 320;
const MIN_EDITOR_HEADER_ROW_WIDTH = 360;

export function shouldStackProgressHeader(fontScale: number): boolean {
  return Number.isFinite(fontScale) && fontScale >= ACCESSIBILITY_FONT_SCALE_THRESHOLD;
}

export function shouldStackDialogActions(fontScale: number): boolean {
  return Number.isFinite(fontScale) && fontScale >= ACCESSIBILITY_FONT_SCALE_THRESHOLD;
}

export function shouldStackFilterTabs(width: number, fontScale: number): boolean {
  const widthIsConstrained = Number.isFinite(width) && width < MIN_FILTER_TAB_ROW_WIDTH;
  return widthIsConstrained || shouldStackDialogActions(fontScale);
}

export function shouldStackEditorHeader(width: number, fontScale: number): boolean {
  const widthIsConstrained = Number.isFinite(width) && width < MIN_EDITOR_HEADER_ROW_WIDTH;
  return widthIsConstrained || shouldStackDialogActions(fontScale);
}

export function getContentHorizontalPadding(width: number): number {
  return Number.isFinite(width) && width < 390 ? 16 : 24;
}

export function shouldUseCompactLayout(width: number): boolean {
  return Number.isFinite(width) && width < 390;
}
