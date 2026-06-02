import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePackageStore } from '../store/usePackageStore';
import Header from '../../../../shared/components/Header';
import { ClassPackage } from '../../../../shared/types';
import { useTheme } from '../../../../shared/theme/useTheme';
import { borderRadius } from '../../../../shared/theme';

const PackagesScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { packages, isLoading, fetchPackages, addToCart, cart } = usePackageStore();
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
              <Ionicons name="cart" size={22} color={colors.primary} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40 },
  cartBadge: { position: 'relative', padding: 4 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.danger,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  loadingText: { color: colors.textSecondary, textAlign: 'center', marginTop: 40 },
  pkgCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  pkgCardPopular: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginBottom: 12,
  },
  popularText: { color: colors.black, fontSize: 11, fontWeight: '700' },
  pkgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pkgName: { fontSize: 18, fontWeight: '700', color: colors.text },
  pkgPrice: { fontSize: 22, fontWeight: '700', color: colors.primary },
  pkgDetails: { marginTop: 8, flexDirection: 'row', gap: 16 },
  pkgCredits: { fontSize: 14, color: colors.textSecondary },
  pkgPerCredit: { fontSize: 14, color: colors.success },
  pkgFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pkgValidity: { fontSize: 13, color: colors.textSecondary },
});

export default PackagesScreen;
