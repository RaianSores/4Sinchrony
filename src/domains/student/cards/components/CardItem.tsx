import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { mkStyles } from './CardItem.styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CardInfo } from '../../../../shared/types';
import { useTheme } from '../../../../shared/theme/useTheme';
import CardFlagIcon from './CardFlagIcon';

interface CardItemProps {
  card: CardInfo;
  onSetDefault: (id: string) => void;
  onRemove: (id: string) => void;
}

const CardItem: React.FC<CardItemProps> = ({ card, onSetDefault, onRemove }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);

  return (
    <View style={styles.cardItem}>
      <CardFlagIcon brand={card.brand} />

      <View style={styles.cardInfo}>
        <View style={styles.cardTop}>
          <Text style={styles.cardBrand}>{card.brand}</Text>
          {card.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Principal</Text>
            </View>
          )}
        </View>

        <Text style={styles.cardDigits}>•••• {card.lastDigits}</Text>
        <Text style={styles.cardDetail}>{card.holderName}</Text>
        <Text style={styles.cardDetail}>Validade {card.expiryDate}</Text>

        {card.nickname && (
          <Text style={styles.cardNickname}>{card.nickname}</Text>
        )}
      </View>

      <View style={styles.cardActions}>
        {!card.isDefault && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => onSetDefault(card.id)}>
            <Ionicons name="star-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.actionBtn} onPress={() => onRemove(card.id)}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};


export default CardItem;
