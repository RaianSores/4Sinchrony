import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { paymentService } from '../services/paymentService';
import { usePackageStore } from '../store/usePackageStore';
import { useAuthStore } from '../../../../core/auth/store/useAuthStore';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import Button from '../../../../shared/components/Button';
import { useTheme } from '../../../../shared/theme/useTheme';
import { mkStyles } from './PaymentScreen.styles';

const PaymentScreen = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { amount } = route.params;
  const { cart, coupon, clearCart, addPurchase } = usePackageStore();
  const { user, updateUser } = useAuthStore();
  const { showAlert } = useAppAlert();
  const [method, setMethod] = useState<'pix' | 'card'>('pix');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const packageIds = cart.map(item => item.id);
      const couponCode = coupon?.code;
      let result;
      if (method === 'pix') {
        result = await paymentService.processPixPayment(amount, packageIds, couponCode);
      } else {
        result = await paymentService.processCardPayment(amount, 'tok_test_123', packageIds, couponCode);
      }

      const purchase = {
        id: 'pur_' + Date.now(),
        package: cart[0],
        amount,
        coupon,
        paymentMethod: method,
        status: 'confirmed' as const,
        createdAt: new Date().toISOString(),
      };
      addPurchase(purchase);

      const totalCredits = cart.reduce((sum, item) => sum + item.credits * item.quantity, 0);
      updateUser({ credits: (user?.credits || 0) + totalCredits });

      clearCart();

      navigation.replace('PaymentConfirmation', { result, purchase, method, amount });
    } catch {
      showAlert({ title: 'Erro', message: 'Pagamento não foi processado' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Pagamento" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Valor a pagar</Text>
          <Text style={styles.amountValue}>R$ {amount.toFixed(2)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Forma de Pagamento</Text>

        <TouchableOpacity
          style={[styles.methodCard, method === 'pix' && styles.methodCardActive]}
          onPress={() => setMethod('pix')}
        >
          <View style={styles.methodLeft}>
            <Ionicons
              name={method === 'pix' ? 'radio-button-on' : 'radio-button-off'}
              size={24}
              color={method === 'pix' ? colors.primary : colors.border}
            />
            <Ionicons name="qr-code-outline" size={32} color={colors.text} style={{ marginLeft: 12 }} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.methodName}>PIX</Text>
              <Text style={styles.methodDesc}>Pagamento instantâneo</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodCard, method === 'card' && styles.methodCardActive]}
          onPress={() => setMethod('card')}
        >
          <View style={styles.methodLeft}>
            <Ionicons
              name={method === 'card' ? 'radio-button-on' : 'radio-button-off'}
              size={24}
              color={method === 'card' ? colors.primary : colors.border}
            />
            <Ionicons name="card-outline" size={32} color={colors.text} style={{ marginLeft: 12 }} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.methodName}>Cartão de Crédito</Text>
              <Text style={styles.methodDesc}>Pagamento em até 12x</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumo</Text>
          {cart.map(item => (
            <View key={item.id} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{item.name} x{item.quantity}</Text>
              <Text style={styles.summaryValue}>R$ {(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          {coupon && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.success }]}>Cupom {coupon.code}</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                -{coupon.discountType === 'percentage' ? `${coupon.discount}%` : `R$ ${coupon.discount.toFixed(2)}`}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>R$ {amount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Button
            title={processing ? 'Processando...' : `Pagar R$ ${amount.toFixed(2)}`}
            onPress={handlePayment}
            disabled={processing}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentScreen;
