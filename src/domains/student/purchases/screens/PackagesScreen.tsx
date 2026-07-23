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
import Skeleton from '../../../../shared/components/Skeleton';

const PackageCardSkeleton = ({ styles }: { styles: ReturnType<typeof mkStyles> }) => (
  <View style={styles.pkgCard}>
    <View style={styles.pkgHeader}>
      <Skeleton width={120} height={18} />
      <Skeleton width={70} height={22} />
    </View>
    <View style={[styles.pkgDetails, { alignItems: 'center' }]}>
      <Skeleton width={60} height={14} />
      <Skeleton width={100} height={14} />
    </View>
    <View style={styles.pkgFooter}>
      <Skeleton width={110} height={13} />
    </View>
  </View>
);




const PackagesScreen = ({ navigation }: PackagesScreenProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { packages, isLoading, fetchPackages, addToCart, cart } = usePackageStore();
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPackages();
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
          <>
            <PackageCardSkeleton styles={styles} />
            <PackageCardSkeleton styles={styles} />
            <PackageCardSkeleton styles={styles} />
          </>
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
                <Text style={styles.pkgName} numberOfLines={2}>{pkg.name}</Text>
                <Text style={styles.pkgPrice} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>R$ {(pkg.price ?? 0).toFixed(2)}</Text>
              </View>
              <View style={styles.pkgDetails}>
                <Text style={styles.pkgCredits}>{pkg.credits} aulas</Text>
                <Text style={styles.pkgPerCredit}>
                  R$ {(pkg.pricePerCredit ?? 0).toFixed(2)} por aula
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

