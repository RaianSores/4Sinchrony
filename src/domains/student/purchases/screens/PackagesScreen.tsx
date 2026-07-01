import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePackageStore } from '../store/usePackageStore';
import Header from '../../../../shared/components/Header';
import { ClassPackage } from '../../../../shared/types';
import { useTheme } from '../../../../shared/theme/useTheme';
import { mkStyles } from './PackagesScreen.styles';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import type { PackagesScreenProps } from '../../../../core/navigation/types/screenProps';




const PackagesScreen = ({ navigation }: PackagesScreenProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { packages, isLoading, fetchPackages, addToCart, cart } = usePackageStore();
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPackages();
    console.log('packages:', JSON.stringify(packages, undefined, 2));
  }, [fetchPackages]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPackages();
    setRefreshing(false);
  }, [fetchPackages]);

  const handleBuy = (pkg: ClassPackage) => {
    addToCart(pkg);
    navigation.navigate('Cart');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
            {...({ backgroundColor: colors.background } as any)}
          />
        }
      >
        <Text style={styles.sectionTitle}>Escolha seu plano</Text>

        {isLoading && packages.length === 0 ? (
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

