import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CardInfo } from '../../../../shared/types';
import { theme } from '../../../../shared/theme';
import CardFlagIcon from './CardFlagIcon';

interface CardItemProps {
  card: CardInfo;
  onSetDefault: (id: string) => void;
  onRemove: (id: string) => void;
}

const CardItem: React.FC<CardItemProps> = ({ card, onSetDefault, onRemove }) => {
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
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onSetDefault(card.id)}
          >
            <Ionicons name="star-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onRemove(card.id)}
        >
          <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardInfo: { flex: 1 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardBrand: { fontSize: 17, fontWeight: '600', color: theme.colors.text },
  cardDigits: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 1,
  },
  cardDetail: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  cardNickname: {
    fontSize: 12,
    color: theme.colors.primary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  defaultBadge: {
    backgroundColor: theme.colors.success + '20',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  defaultText: {
    color: theme.colors.success,
    fontSize: 11,
    fontWeight: '600',
  },
  cardActions: {
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    padding: 6,
  },
});

export default CardItem;
