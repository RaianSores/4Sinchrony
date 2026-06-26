import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../../../../shared/components/Button';
import { useTheme } from '../../../../shared/theme/useTheme';
import { mkStyles } from './PaymentConfirmationScreen.styles';

const PaymentConfirmationScreen = ({ navigation, route }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { result, purchase, method, amount } = route.params;
  const success = result?.success;

  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight }]}
        showsVerticalScrollIndicator={false}
      >
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
      </ScrollView>
    </View>
  );
};

export default PaymentConfirmationScreen;
