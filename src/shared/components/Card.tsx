import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { borderRadius, spacing } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'alt' | 'dark';
}

const Card: React.FC<CardProps> = ({ children, style, variant = 'default' }) => {
  const { colors, isDark } = useTheme();

  const bgColor = variant === 'dark'
    ? colors.navy
    : variant === 'alt'
    ? colors.cardAlt
    : colors.card;

  return (
    <View
      style={[
        {
          backgroundColor: bgColor,
          borderRadius: borderRadius.xl,
          padding: spacing.md,
          marginHorizontal: spacing.md,
          marginVertical: spacing.xs,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: isDark ? '#000' : '#0A0519',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 8,
          elevation: 3,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default Card;
