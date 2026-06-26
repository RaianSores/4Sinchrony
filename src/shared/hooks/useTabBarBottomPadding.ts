import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_BAR_HEIGHT = 62;
const TAB_BAR_MARGIN_BOTTOM = 12;
const CONTENT_CLEARANCE = 16;

export function useTabBarBottomPadding(): number {
  const { bottom } = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + Math.max(bottom, TAB_BAR_MARGIN_BOTTOM) + CONTENT_CLEARANCE;
}
