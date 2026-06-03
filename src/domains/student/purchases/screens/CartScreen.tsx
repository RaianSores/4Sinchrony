import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { usePackageStore } from '../store/usePackageStore';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import Button from '../../../../shared/components/Button';
import { useTheme } from '../../../../shared/theme/useTheme';
import { borderRadius } from '../../../../shared/theme';

const CartScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { cart, coupon, addToCart, removeFromCart, applyCoupon, removeCoupon, getCartTotal, getDiscountedTotal } = usePackageStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const { showAlert } = useAppAlert();

  const total = getCartTotal();
  const discountedTotal = getDiscountedTotal();
  const hasDiscount = coupon && discountedTotal < total;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    const result = await applyCoupon(couponCode.trim());
    setCouponLoading(false);
    if (result) {
      showAlert({ title: 'Cupom aplicado!', message: `Desconto de ${result.discountType === 'percentage' ? result.discount + '%' : 'R$ ' + result.discount.toFixed(2)}` });
    } else {
      showAlert({ title: 'Cupom inválido', message: 'Código não encontrado' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Sacola" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {cart.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={80} color={colors.border} />
            <Text style={styles.emptyTitle}>Sacola vazia</Text>
            <Text style={styles.emptySubtitle}>Adicione planos para continuar</Text>
            <Button title="Ver Planos" onPress={() => navigation.replace('Packages')} style={{ marginTop: 24, marginHorizontal: 24 }} />
          </View>
        ) : (
          <>
            {cart.map(item => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCredits}>{item.quantity}x {item.credits} aulas</Text>
                  <Text style={styles.itemPrice}>R$ {(item.price * item.quantity).toFixed(2)}</Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => addToCart(item)}>
                    <Ionicons name="add-circle" size={28} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => {
                    if (item.quantity > 1) {
                      removeFromCart(item.id);
                      addToCart({ ...item, id: item.id });
                    } else {
                      removeFromCart(item.id);
                    }
                  }}>
                    <Ionicons name="remove-circle" size={28} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.couponSection}>
              <Text style={styles.couponTitle}>Cupom de desconto</Text>
              <View style={styles.couponRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Digite o código"
                  placeholderTextColor={colors.textSecondary}
                  value={couponCode}
                  onChangeText={setCouponCode}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={styles.couponButton}
                  onPress={handleApplyCoupon}
                  disabled={couponLoading}
                >
                  <Text style={styles.couponButtonText}>
                    {couponLoading ? '...' : 'Aplicar'}
                  </Text>
                </TouchableOpacity>
              </View>
              {coupon && (
                <View style={styles.couponApplied}>
                  <Text style={styles.couponAppliedText}>
                    Cupom {coupon.code} aplicado ({coupon.discountType === 'percentage' ? `${coupon.discount}%` : `R$ ${coupon.discount.toFixed(2)}`} off)
                  </Text>
                  <TouchableOpacity onPress={removeCoupon}>
                    <Ionicons name="close-circle" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
              </View>
              {hasDiscount && (
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.success }]}>Desconto</Text>
                  <Text style={[styles.totalValue, { color: colors.success }]}>
                    -R$ {(total - discountedTotal).toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={[styles.totalRow, styles.totalFinal]}>
                <Text style={styles.totalFinalLabel}>Total</Text>
                <Text style={styles.totalFinalValue}>R$ {discountedTotal.toFixed(2)}</Text>
              </View>
            </View>

            <Button
              title="Continuar para Pagamento"
              onPress={() => navigation.navigate('Payment', { amount: discountedTotal })}
              style={{ marginHorizontal: 16 }}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { color: colors.text, fontSize: 24, fontWeight: '700', marginTop: 20 },
  emptySubtitle: { color: colors.textSecondary, fontSize: 16, marginTop: 8 },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 17, fontWeight: '600', color: colors.text },
  itemCredits: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  itemPrice: { fontSize: 16, fontWeight: '700', color: colors.primary, marginTop: 4 },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  quantity: { fontSize: 18, fontWeight: '700', color: colors.text, minWidth: 24, textAlign: 'center' },
  couponSection: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  couponTitle: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 12 },
  couponRow: { flexDirection: 'row', gap: 8 },
  couponInput: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: borderRadius.md,
    padding: 14,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  couponButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  couponButtonText: { color: colors.black, fontWeight: '700', fontSize: 15 },
  couponApplied: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: colors.success + '15',
    borderRadius: borderRadius.sm,
    padding: 10,
  },
  couponAppliedText: { color: colors.success, fontSize: 13 },
  totalSection: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: { color: colors.textSecondary, fontSize: 15 },
  totalValue: { color: colors.text, fontSize: 15 },
  totalFinal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 4,
  },
  totalFinalLabel: { color: colors.text, fontSize: 18, fontWeight: '700' },
  totalFinalValue: { color: colors.primary, fontSize: 22, fontWeight: '700' },
});

export default CartScreen;
