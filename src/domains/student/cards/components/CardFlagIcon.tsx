import React from 'react';
import { View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CardBrand } from '../../../../shared/types';
import { useTheme } from '../../../../shared/theme/useTheme';
import { borderRadius } from '../../../../shared/theme';

interface CardFlagIconProps {
  brand: CardBrand;
  size?: number;
}

const brandColors: Partial<Record<CardBrand, string>> = {
  Visa: '#1A1F71',
  Mastercard: '#EB001B',
  Amex: '#2E77BC',
  Elo: '#FF6A00',
  Hipercard: '#B3131B',
};

const CardFlagIcon: React.FC<CardFlagIconProps> = ({ brand, size = 28 }) => {
  const { colors } = useTheme();
  const color = brandColors[brand] ?? colors.textSecondary;
  const icon = brand === 'Unknown' ? 'credit-card-outline' : 'card';

  return (
    <View style={{
      width: 50,
      height: 50,
      borderRadius: borderRadius.md,
      backgroundColor: color + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    }}>
      <Ionicons name={icon} size={size} color={color} />
    </View>
  );
};

export default CardFlagIcon;
