import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import { ReferralInfo } from '../../../../shared/types';
import { referralService } from '../services/referralService';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { mkStyles } from './BringAFriendScreen.styles';

const BringAFriendScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { showAlert } = useAppAlert();
  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    referralService.getReferral().then(setReferral).catch(() => {});
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await referralService.getReferral().then(setReferral).catch(() => {});
    setRefreshing(false);
  }, []);

  const handleShare = async () => {
    if (!referral) return;
    try {
      await Share.share({
        message: `Vem treinar comigo no 4Sinchrony Experience! Use meu código ${referral.code} e ganhe créditos extras. Baixe o app: ${referral.url}`,
        title: '4Sinchrony Experience - Bring a Friend',
      });
    } catch {
      showAlert({ title: 'Erro', message: 'Não foi possível compartilhar' });
    }
  };

  const handleCopy = async () => {
    if (!referral) return;
    try {
      await Share.share({ message: referral.code });
    } catch {
      showAlert({ title: 'Erro', message: 'Não foi possível copiar o código' });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Bring a Friend" showBack onBackPress={() => navigation.goBack()} />

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
          />
        }
      >
        <View style={styles.heroSection}>
          <Ionicons name="people" size={64} color={colors.primary} />
          <Text style={styles.heroTitle}>Traga um Amigo</Text>
          <Text style={styles.heroSubtitle}>
            Indique seus amigos e ganhe créditos gratuitos para suas aulas!
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{referral?.totalReferrals ?? 0}</Text>
            <Text style={styles.statLabel}>Amigos indicados</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{referral?.totalCreditsEarned ?? 0}</Text>
            <Text style={styles.statLabel}>Créditos ganhos</Text>
          </View>
        </View>

        <View style={styles.codeSection}>
          <Text style={styles.codeLabel}>Seu código de indicação</Text>
          <TouchableOpacity style={styles.codeBox} onPress={handleCopy}>
            <Text style={styles.codeText}>{referral?.code ?? '—'}</Text>
            <Ionicons name="copy-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.howItWorks}>
          <Text style={styles.howTitle}>Como funciona</Text>
          {[
            { icon: 'link-outline', step: '1. Compartilhe seu código', desc: 'Envie para seus amigos' },
            { icon: 'person-add-outline', step: '2. Amigo se cadastra', desc: 'Usando seu código de indicação' },
            { icon: 'gift-outline', step: '3. Vocês ganham créditos', desc: '2 créditos extras para cada um!' },
          ].map((item, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepIcon}>
                <Ionicons name={item.icon} size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{item.step}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color={colors.black} />
          <Text style={styles.shareText}>Compartilhar Código</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};



export default BringAFriendScreen;

