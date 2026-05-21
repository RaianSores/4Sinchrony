import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePackageStore } from '../../purchases/store/usePackageStore';
import Header from '../../../shared/components/Header';
import { theme } from '../../../shared/theme';

const MyPurchasesScreen = ({ navigation }: any) => {
  const { purchases } = usePackageStore();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Minhas Compras" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {purchases.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color={theme.colors.border} />
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
                  color={p.status === 'confirmed' ? theme.colors.success : theme.colors.primary}
                />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.purchaseName}>{p.package.name}</Text>
                  <Text style={styles.purchaseDate}>
                    {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: p.status === 'confirmed' ? (theme.colors.success + '20') : (theme.colors.primary + '20') }]}>
                  <Text style={[styles.statusText, { color: p.status === 'confirmed' ? theme.colors.success : theme.colors.primary }]}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingBottom: 40, paddingTop: 8 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { color: theme.colors.text, fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptySubtitle: { color: theme.colors.textSecondary, fontSize: 15, marginTop: 8, textAlign: 'center' },
  purchaseCard: {
    backgroundColor: theme.colors.card,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  purchaseHeader: { flexDirection: 'row', alignItems: 'center' },
  purchaseName: { fontSize: 17, fontWeight: '600', color: theme.colors.text },
  purchaseDate: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  statusBadge: { borderRadius: theme.borderRadius.sm, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  purchaseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  purchasePayment: { color: theme.colors.textSecondary, fontSize: 14 },
  purchaseAmount: { color: theme.colors.primary, fontSize: 16, fontWeight: '700' },
});

export default MyPurchasesScreen;
