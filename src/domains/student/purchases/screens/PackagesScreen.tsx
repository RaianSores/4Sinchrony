import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePackageStore } from '../store/usePackageStore';
import Header from '../../../../shared/components/Header';
import { ClassPackage } from '../../../../shared/types';
import { useTheme } from '../../../../shared/theme/useTheme';
import { mkStyles } from './PackagesScreen.styles';

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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

export default PackagesScreen;
