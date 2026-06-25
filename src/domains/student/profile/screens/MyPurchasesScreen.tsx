import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePackageStore } from '../../purchases/store/usePackageStore';
import Header from '../../../../shared/components/Header';
import { useTheme } from '../../../../shared/theme/useTheme';
import { mkStyles } from './MyPurchasesScreen.styles';

const MyPurchasesScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { purchases, fetchPurchases } = usePackageStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPurchases();
    setRefreshing(false);
  }, [fetchPurchases]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Minhas Compras" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            {...({ backgroundColor: colors.background } as any)}
          />
        }
      >
        {purchases.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>Nenhuma compra ainda</Text>
            <Text style={styles.emptySubtitle}>Seus pacotes adquiridos aparecerão aqui</Text>
          </View>
        ) : (
          purchases.map(p => (
            <View key={p.id} style={styles.purchaseCard}>
              <View style={styles.purchaseHeader}>
                <Ionicons
                  name={p.status === 'confirmed' ? 'checkmark-circle' : 'alert-circle'}
                  size={24}
                  color={p.status === 'confirmed' ? colors.success : colors.primary}
                />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.purchaseName}>{p.package.name}</Text>
                  <Text style={styles.purchaseDate}>
                    {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: p.status === 'confirmed' ? (colors.success + '20') : (colors.primary + '20') }]}>
                  <Text style={[styles.statusText, { color: p.status === 'confirmed' ? colors.success : colors.primary }]}>
                    {p.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                  </Text>
                </View>
              </View>
              <View style={styles.purchaseFooter}>
                <Text style={styles.purchasePayment}>
                  {p.paymentMethod === 'pix' ? 'PIX' : 'Cartão'}
                </Text>
                <Text style={styles.purchaseAmount}>R$ {p.amount.toFixed(2)}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};



export default MyPurchasesScreen;
