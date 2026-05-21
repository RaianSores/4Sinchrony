import React from 'react';
import { View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CardBrand } from '../../../shared/types';
import { theme } from '../../../shared/theme';

interface CardFlagIconProps {
  brand: CardBrand;
  size?: number;
}

const brandConfig: Record<CardBrand, { icon: string; color: string }> = {
  Visa: { icon: 'card', color: '#1A1F71' },
  Mastercard: { icon: 'card', color: '#EB001B' },
  Amex: { icon: 'card', color: '#2E77BC' },
  Elo: { icon: 'card', color: '#FF6A00' },
  Hipercard: { icon: 'card', color: '#B3131B' },
  Unknown: { icon: 'credit-card-outline', color: theme.colors.textSecondary },
};

const CardFlagIcon: React.FC<CardFlagIconProps> = ({ brand, size = 28 }) => {
  const config = brandConfig[brand];

  return (
    <View style={[styles.iconWrap, { backgroundColor: config.color + '15' }]}>
      <Ionicons name={config.icon} size={size} color={config.color} />
    </View>
  );
};

const styles = StyleSheet.create({
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
});

export default CardFlagIcon;
