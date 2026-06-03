import React, { useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import Button from '../../../../shared/components/Button';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useCardStore } from '../store/useCardStore';
import CardItem from '../components/CardItem';

const MyCardsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { cards, isLoading, fetchCards, removeCard, confirmRemoveCard, setDefaultCard } = useCardStore();
  const { showAlert } = useAppAlert();

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleRemove = useCallback(
    (id: string) => {
      const result = removeCard(id);
      if (!result.canRemove) {
        showAlert({
          title: 'Não é possível remover',
          message: result.message || '',
          buttons: [{ text: 'OK' }],
        });
        return;
      }

      showAlert({
        title: 'Remover cartão',
        message: 'Tem certeza que deseja remover este cartão?',
        buttons: [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Remover', style: 'destructive', onPress: () => confirmRemoveCard(id) },
        ],
      });
    },
    [removeCard, confirmRemoveCard, showAlert],
  );

  const handleSetDefault = useCallback(
    (id: string) => {
      showAlert({
        title: 'Definir como principal',
        message: 'Este cartão será usado como principal para futuras compras.',
        buttons: [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: () => setDefaultCard(id) },
        ],
      });
    },
    [setDefaultCard, showAlert],
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Meus Cartões" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Gerencie seus cartões de forma segura. Apenas as informações essenciais são salvas.
        </Text>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} size="large" style={styles.loading} />
        ) : cards.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={72} color={colors.border} />
            <Text style={styles.emptyTitle}>Nenhum cartão salvo</Text>
            <Text style={styles.emptySubtitle}>
              Adicione um cartão para agilizar suas compras
            </Text>
          </View>
        ) : (
          <View style={styles.cardList}>
            {cards.map(card => (
              <CardItem
                key={card.id}
                card={card}
                onSetDefault={handleSetDefault}
                onRemove={handleRemove}
              />
            ))}
          </View>
        )}

        <Button
          title="Adicionar Cartão"
          variant="outline"
          onPress={() => navigation.navigate('AddCard')}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40, paddingTop: 8 },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 20,
    lineHeight: 20,
  },
  loading: { marginTop: 60 },
  emptyState: { alignItems: 'center', marginTop: 60, marginBottom: 32 },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 20 },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 48,
  },
  cardList: { marginBottom: 8 },
});

export default MyCardsScreen;
