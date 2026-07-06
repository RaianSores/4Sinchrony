import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { borderRadius, spacing } from '../theme';
import Skeleton from './Skeleton';

const ClassCardSkeleton: React.FC = () => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        marginHorizontal: spacing.md,
        marginVertical: spacing.xs,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: isDark ? '#000' : '#0A0519',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.06,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Skeleton width={48} height={48} borderRadius={24} style={{ marginRight: 12 }} />
          <View style={{ gap: 6 }}>
            <Skeleton width={110} height={14} />
            <Skeleton width={90} height={13} />
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Skeleton width={48} height={16} />
          <Skeleton width={40} height={12} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: spacing.md }}>
        <Skeleton width={70} height={13} />
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <Skeleton width={60} height={14} />
          <Skeleton width={80} height={4} borderRadius={2} />
        </View>
      </View>
    </View>
  );
};

export default ClassCardSkeleton;
