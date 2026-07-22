import React, { useState, useMemo, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { paymentService } from '../services/paymentService';
import { usePackageStore } from '../store/usePackageStore';
import { useCardStore } from '../../cards/store/useCardStore';
import type { PaymentScreenProps } from '../../../../core/navigation/types/screenProps';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import Button from '../../../../shared/components/Button';
import { useTheme } from '../../../../shared/theme/useTheme';
import { mkStyles } from './PaymentScreen.styles';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { captureError } from '../../../../lib/sentry';
import { getApiErrorMessage } from '../../../../shared/utils/getApiErrorMessage';




const PaymentScreen = ({ navigation, route }: PaymentScreenProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { amount } = route.params;
  const { cart, clearCart, addPurchase } = usePackageStore();
  const { cards: rawCards, fetchCards } = useCardStore();
  const { showAlert } = useAppAlert();
  const [method, setMethod] = useState<'pix' | 'card'>('pix');
  const [processing, setProcessing] = useState(false);

  const cards = rawCards.filter(Boolean);
  // Cartão pra cobrança: o marcado como padrão, ou o primeiro salvo.
  const selectedCard = cards.find(c => c.isDefault) ?? cards[0];

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const handleSelectCard = () => {
    if (cards.length === 0) {
      showAlert({
        title: 'Nenhum cartão salvo',
        message: 'Adicione um cartão de crédito no seu perfil para pagar por cartão.',
        buttons: [
          { text: 'Cancelar' },
          { text: 'Adicionar cartão', onPress: () => navigation.navigate('ProfileTab', { screen: 'AddCard' }) },
        ],
      });
      return;
    }
    setMethod('card');
  };

  const handlePayment = async () => {
    if (method === 'card' && !selectedCard) {
      showAlert({ title: 'Nenhum cartão', message: 'Adicione um cartão antes de pagar por cartão.' });
      return;
    }
    setProcessing(true);
    try {
      const packageIds = cart.map(item => item.id);
      const result = method === 'card'
        ? await paymentService.processCardPayment(amount, selectedCard!.token, packageIds)
        : await paymentService.processPixPayment(amount, packageIds);

      const purchase = {
        id: 'pur_' + Date.now(),
        package: cart[0],
        amount,
        paymentMethod: method,
        status: 'confirmed' as const,
        createdAt: new Date().toISOString(),
      };
      addPurchase(purchase);

      clearCart();

      navigation.replace('PaymentConfirmation', { result, purchase, method, amount });
    } catch (error) {
      captureError(error);
      showAlert({
        title: 'Pagamento não processado',
        message: getApiErrorMessage(error, 'Não foi possível concluir o pagamento. Tente novamente.'),
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Pagamento" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scrollContent, { paddingBottom: tabPadding }]} showsVerticalScrollIndicator={false}>
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
            <Ionicons name={method === 'pix' ? 'radio-button-on' : 'radio-button-off'} size={24} color={method === 'pix' ? colors.primary : colors.border} />
            <Ionicons name="qr-code-outline" size={32} color={colors.text} style={{ marginLeft: 12 }} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.methodName}>PIX</Text>
              <Text style={styles.methodDesc}>Pagamento instantâneo</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodCard, method === 'card' && styles.methodCardActive]}
          onPress={handleSelectCard}
        >
          <View style={styles.methodLeft}>
            <Ionicons name={method === 'card' ? 'radio-button-on' : 'radio-button-off'} size={24} color={method === 'card' ? colors.primary : colors.border} />
            <Ionicons name="card-outline" size={32} color={colors.text} style={{ marginLeft: 12 }} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.methodName}>Cartão de Crédito</Text>
              <Text style={styles.methodDesc}>
                {selectedCard
                  ? `${selectedCard.brand} final ${selectedCard.lastDigits}`
                  : 'Adicione um cartão no perfil'}
              </Text>
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
          {/* FEATURE: coupon (paid add-on)
          {coupon && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.success }]}>Cupom {coupon.code}</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                -{coupon.discountType === 'percentage' ? `${coupon.discount}%` : `R$ ${coupon.discount.toFixed(2)}`}
              </Text>
            </View>
          )}
          */}
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>R$ {amount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Button
            title={processing ? 'Processando...' : `Pagar R$ ${amount.toFixed(2)} ${method === 'card' ? 'no Cartão' : 'via PIX'}`}
            onPress={handlePayment}
            disabled={processing}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentScreen;

