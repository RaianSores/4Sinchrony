import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePackageStore } from '../../purchases/store/usePackageStore';
import Header from '../../../../shared/components/Header';
import { useTheme } from '../../../../shared/theme/useTheme';
import { borderRadius } from '../../../../shared/theme';

const MyPurchasesScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { purchases, fetchPurchases } = usePackageStore();

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Minhas Compras" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40, paddingTop: 8 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { color: colors.text, fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptySubtitle: { color: colors.textSecondary, fontSize: 15, marginTop: 8, textAlign: 'center' },
  purchaseCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  purchaseHeader: { flexDirection: 'row', alignItems: 'center' },
  purchaseName: { fontSize: 17, fontWeight: '600', color: colors.text },
  purchaseDate: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  statusBadge: { borderRadius: borderRadius.sm, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  purchaseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  purchasePayment: { color: colors.textSecondary, fontSize: 14 },
  purchaseAmount: { color: colors.primary, fontSize: 16, fontWeight: '700' },
});

export default MyPurchasesScreen;
