import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_BAR_HEIGHT = 68;
const TAB_BAR_EXTRA_BOTTOM = 16; // margem extra acima do safe area
const CONTENT_CLEARANCE = 12;

export function useTabBarBottomPadding(): number {
  const { bottom } = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + Math.max(bottom + TAB_BAR_EXTRA_BOTTOM, 28) + CONTENT_CLEARANCE;
}
