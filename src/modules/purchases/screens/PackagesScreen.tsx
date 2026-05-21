import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePackageStore } from '../store/usePackageStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import Header from '../../../shared/components/Header';
import { ClassPackage } from '../../../shared/types';
import { theme } from '../../../shared/theme';

const PackagesScreen = ({ navigation }: any) => {
  const { packages, isLoading, fetchPackages, addToCart, cart } = usePackageStore();
  const { user } = useAuthStore();
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleBuy = (pkg: ClassPackage) => {
    addToCart(pkg);
    navigation.navigate('Cart');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Planos"
        showBack
        onBackPress={() => navigation.goBack()}
        rightComponent={
          cartCount > 0 ? (
            <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartBadge}>
              <Ionicons name="cart" size={22} color={theme.colors.primary} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.creditsBanner}>
          <Ionicons name="wallet-outline" size={28} color={theme.colors.primary} />
          <Text style={styles.creditsText}>
            {user?.credits || 0} créditos disponíveis
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Escolha seu plano</Text>

        {isLoading ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : (
          packages.map(pkg => (
            <TouchableOpacity
              key={pkg.id}
              style={[styles.pkgCard, pkg.popular && styles.pkgCardPopular]}
              onPress={() => handleBuy(pkg)}
              activeOpacity={0.9}
            >
              {pkg.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MAIS VENDIDO</Text>
                </View>
              )}
              <View style={styles.pkgHeader}>
                <Text style={styles.pkgName}>{pkg.name}</Text>
                <Text style={styles.pkgPrice}>R$ {pkg.price.toFixed(2)}</Text>
              </View>
              <View style={styles.pkgDetails}>
                <Text style={styles.pkgCredits}>{pkg.credits} aulas</Text>
                <Text style={styles.pkgPerCredit}>
                  R$ {pkg.pricePerCredit.toFixed(2)} por aula
                </Text>
              </View>
              <View style={styles.pkgFooter}>
                <Text style={styles.pkgValidity}>
                  Válido por {pkg.validityDays} dias
                </Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingBottom: 40 },
  creditsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    margin: 16,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  creditsText: { color: theme.colors.text, fontSize: 16, fontWeight: '600' },
  cartBadge: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.danger,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: theme.colors.white, fontSize: 10, fontWeight: '700' },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  loadingText: { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 40 },
  pkgCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  pkgCardPopular: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 12,
  },
  popularText: { color: theme.colors.black, fontSize: 11, fontWeight: '700' },
  pkgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pkgName: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  pkgPrice: { fontSize: 22, fontWeight: '700', color: theme.colors.primary },
  pkgDetails: { marginTop: 8, flexDirection: 'row', gap: 16 },
  pkgCredits: { fontSize: 14, color: theme.colors.textSecondary },
  pkgPerCredit: { fontSize: 14, color: theme.colors.success },
  pkgFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  pkgValidity: { fontSize: 13, color: theme.colors.textSecondary },
});

export default PackagesScreen;
