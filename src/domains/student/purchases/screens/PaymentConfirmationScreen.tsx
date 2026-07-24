import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import Clipboard from '@react-native-clipboard/clipboard';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../../../../shared/components/Button';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useAuthStore } from '../../../../core/auth/store/useAuthStore';
import { paymentService } from '../services/paymentService';
import type { PaymentConfirmationScreenProps } from '../../../../core/navigation/types/screenProps';
import { mkStyles } from './PaymentConfirmationScreen.styles';

const PIX_EXPIRY_MINUTES = 15;
const POLL_INTERVAL_MS = 10000;
const MAX_POLL_ATTEMPTS = 12;

const PaymentConfirmationScreen = ({ navigation, route }: PaymentConfirmationScreenProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { result, purchase, method, amount } = route.params;
  const success = result?.success;

  const insets = useSafeAreaInsets();
  // Tab bar do app é flutuante — usar o hook que soma altura + offset + folga, senão o botão
  // "Ver Planos" fica parcialmente atrás da navegação em telas menores.
  const tabBarHeight = useTabBarBottomPadding();

  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(PIX_EXPIRY_MINUTES * 60);
  const [pollAttempts, setPollAttempts] = useState(0);
  const [confirmed, setConfirmed] = useState(success);
  const [pollError, setPollError] = useState(false);
  const { refreshUser } = useAuthStore();

  const handleCopy = useCallback(() => {
    if (result?.pixCode) {
      Clipboard.setString(result.pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result?.pixCode]);

  useEffect(() => {
    if (!result?.pixCode) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [result?.pixCode]);

  useEffect(() => {
    if (confirmed || pollAttempts >= MAX_POLL_ATTEMPTS) return;
    const poll = setTimeout(async () => {
      try {
        const purchases = await paymentService.getPurchases();
        const match = purchases.find(
          (p: any) => p.transactionId === result?.transactionId && p.status === 'confirmed'
        );
        if (match) {
          setConfirmed(true);
          return;
        }
        setPollAttempts(prev => prev + 1);
      } catch {
        setPollError(true);
      }
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(poll);
  }, [pollAttempts, confirmed, result?.transactionId]);

  // Recarrega o usuário (créditos) sempre que a tela mostra pagamento confirmado —
  // cobre tanto confirmação imediata (cartão/PIX instantâneo) quanto via polling.
  useEffect(() => {
    if (confirmed) refreshUser();
  }, [confirmed, refreshUser]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight }]}
        showsVerticalScrollIndicator={false}
      >
        {confirmed ? (
          <>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-circle" size={80} color={colors.success} />
            </View>
            <Text style={styles.title}>Pagamento Confirmado!</Text>
            <Text style={styles.subtitle}>
              {method === 'pix'
                ? 'Pagamento via PIX processado com sucesso.'
                : 'Pagamento no cartão aprovado.'}
            </Text>

            {method === 'pix' && result.pixCode && (
              <View style={styles.pixSection}>
                {result.pixQRCode && (
                  <Image
                    source={{ uri: result.pixQRCode }}
                    style={styles.qrCode}
                    resizeMode="contain"
                  />
                )}
                <View style={styles.pixCodeBox}>
                  <Text style={styles.pixCodeLabel}>Código PIX</Text>
                  <Text style={styles.pixCode} selectable>
                    {result.pixCode}
                  </Text>
                </View>
                <TouchableOpacity style={styles.copyButton} onPress={handleCopy} activeOpacity={0.7}>
                  <Ionicons
                    name={copied ? 'checkmark-circle' : 'copy-outline'}
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.copyText}>
                    {copied ? 'Copiado!' : 'Copiar código PIX'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transação</Text>
                <Text style={styles.detailValue}>#{result.transactionId}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Pacote</Text>
                <Text style={styles.detailValue}>{purchase?.package?.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Valor</Text>
                <Text style={styles.detailValue}>R$ {amount.toFixed(2)}</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.iconCircle}>
              <Ionicons name="close-circle" size={80} color={colors.danger} />
            </View>
            <Text style={styles.title}>Pagamento não confirmado</Text>
            <Text style={styles.subtitle}>
              Houve um problema com seu pagamento. Tente novamente.
            </Text>
          </>
        )}

        {!confirmed && result?.pixCode && (
          <View style={styles.timerSection}>
            <View style={styles.timerRow}>
              <Ionicons name="time-outline" size={20} color={timeLeft === 0 ? colors.danger : colors.warning} />
              <Text style={[styles.timerText, timeLeft === 0 && styles.timerExpired]}>
                {timeLeft > 0
                  ? `Expira em ${formatTime(timeLeft)}`
                  : 'PIX expirado'}
              </Text>
            </View>
            {pollAttempts < MAX_POLL_ATTEMPTS && (
              <Text style={styles.pollingText}>Aguardando confirmação...</Text>
            )}
            {pollError && (
              <Text style={styles.pollingError}>Erro ao verificar status</Text>
            )}
          </View>
        )}

        <View style={styles.buttons}>
          <Button
            title="Voltar ao Início"
            onPress={() => navigation.navigate('HomeTab')}
          />
          <Button
            title="Ver Planos"
            variant="secondary"
            onPress={() => navigation.navigate('ProfileTab', { screen: 'MyPurchases' })}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default PaymentConfirmationScreen;
