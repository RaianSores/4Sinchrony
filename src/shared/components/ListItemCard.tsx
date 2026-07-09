import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/useTheme';
import { borderRadius, spacing } from '../theme';

interface ListItemBadge {
  label: string;
  variant: 'success' | 'danger' | 'warning' | 'info';
}

interface ListItemCardProps {
  icon: string;
  title: string;
  subtitle?: string;
  badge?: ListItemBadge;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

const BADGE_COLORS: Record<ListItemBadge['variant'], string> = {
  success: '#22C55E',
  danger: '#FF453A',
  warning: '#F59E0B',
  info: '#1287AF',
};

const ListItemCard: React.FC<ListItemCardProps> = ({ icon, title, subtitle, badge, onPress, rightElement }) => {
  const { colors } = useTheme();
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.sm,
        marginBottom: 8,
        gap: spacing.sm,
      }}
    >
      <View style={{
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: colors.background,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>
      {badge && (
        <View style={{
          paddingHorizontal: 10, paddingVertical: 3,
          borderRadius: borderRadius.full,
          backgroundColor: BADGE_COLORS[badge.variant] + '20',
        }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: BADGE_COLORS[badge.variant] }}>{badge.label}</Text>
        </View>
      )}
      {rightElement}
      {onPress && !rightElement && (
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      )}
    </Wrapper>
  );
};

export default ListItemCard;
