import React from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/useTheme';
import { spacing } from '../theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle }) => {
  const { colors } = useTheme();

  return (
    <View style={{ alignItems: 'center', marginTop: 60, gap: 8, paddingHorizontal: spacing.xl }}>
      <Ionicons name={icon} size={48} color={colors.border} />
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'center' }}>{title}</Text>
      {subtitle ? (
        <Text style={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center' }}>{subtitle}</Text>
      ) : null}
    </View>
  );
};

export default EmptyState;
