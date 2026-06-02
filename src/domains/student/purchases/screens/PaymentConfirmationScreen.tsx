import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../../../../shared/components/Button';
import { useTheme } from '../../../../shared/theme/useTheme';
import { borderRadius } from '../../../../shared/theme';

const PaymentConfirmationScreen = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { result, purchase, method, amount } = route.params;
  const success = result?.success;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {success ? (
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
      </View>
    </SafeAreaView>
  );
};

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  iconCircle: { alignItems: 'center', marginBottom: 16 },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  pixSection: { alignItems: 'center', marginBottom: 24 },
  qrCode: { width: 200, height: 200, marginBottom: 16 },
  pixCodeBox: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pixCodeLabel: { color: colors.textSecondary, fontSize: 12, marginBottom: 4 },
  pixCode: { color: colors.text, fontSize: 12, fontFamily: 'monospace' },
  detailsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: { color: colors.textSecondary, fontSize: 14 },
  detailValue: { color: colors.text, fontSize: 14, fontWeight: '600' },
  buttons: { gap: 8 },
});

export default PaymentConfirmationScreen;
