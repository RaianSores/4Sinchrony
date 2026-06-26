import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { mkStyles } from './MyCardsScreen.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import Button from '../../../../shared/components/Button';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useCardStore } from '../store/useCardStore';
import CardItem from '../components/CardItem';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';

const MyCardsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { cards, isLoading, fetchCards, removeCard, confirmRemoveCard, setDefaultCard } = useCardStore();
  const { showAlert } = useAppAlert();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCards();
    setRefreshing(false);
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Meus Cartões" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
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

export default MyCardsScreen;

