import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { borderRadius, spacing } from '../theme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xs,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {icon && <View style={{ marginBottom: spacing.xs }}>{icon}</View>}

      <Text style={{ fontSize: 24, fontWeight: '800', color: colors.primary, marginBottom: 4 }}>
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center', letterSpacing: 0.3 }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: 11, color: colors.text, marginTop: 6, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export default StatCard;
