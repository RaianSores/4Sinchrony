import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import { ReferralInfo } from '../../../../shared/types';
import { useTheme } from '../../../../shared/theme/useTheme';
import { borderRadius } from '../../../../shared/theme';

const mockReferral: ReferralInfo = {
  code: 'STUDIO10',
  url: 'https://4sinchronyexperience.app/ref/STUDIO10',
  totalReferrals: 3,
  totalCreditsEarned: 6,
};

const BringAFriendScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { showAlert } = useAppAlert();
  const [referral] = useState<ReferralInfo>(mockReferral);

  const handleShare = async () => {
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
    try {
      await Share.share({ message: referral.code });
    } catch {
      showAlert({ title: 'Erro', message: 'Não foi possível copiar o código' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Bring a Friend" showBack onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <Ionicons name="people" size={64} color={colors.primary} />
          <Text style={styles.heroTitle}>Traga um Amigo</Text>
          <Text style={styles.heroSubtitle}>
            Indique seus amigos e ganhe créditos gratuitos para suas aulas!
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{referral.totalReferrals}</Text>
            <Text style={styles.statLabel}>Amigos indicados</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{referral.totalCreditsEarned}</Text>
            <Text style={styles.statLabel}>Créditos ganhos</Text>
          </View>
        </View>

        <View style={styles.codeSection}>
          <Text style={styles.codeLabel}>Seu código de indicação</Text>
          <TouchableOpacity style={styles.codeBox} onPress={handleCopy}>
            <Text style={styles.codeText}>{referral.code}</Text>
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

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40 },
  heroSection: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
  heroTitle: { fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 16 },
  heroSubtitle: { fontSize: 16, color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: borderRadius.lg,
    padding: 20,
    justifyContent: 'space-around',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statBox: { alignItems: 'center', flex: 1 },
  statDivider: { width: 1, backgroundColor: colors.border },
  statValue: { fontSize: 32, fontWeight: '700', color: colors.primary },
  statLabel: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  codeSection: { paddingHorizontal: 16, marginBottom: 20 },
  codeLabel: { color: colors.textSecondary, fontSize: 14, marginBottom: 8 },
  codeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  codeText: { color: colors.primary, fontSize: 22, fontWeight: '700', letterSpacing: 2 },
  howItWorks: { paddingHorizontal: 16, marginBottom: 24 },
  howTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 16 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 8,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: { color: colors.text, fontSize: 15, fontWeight: '600' },
  stepDesc: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  shareButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    borderRadius: borderRadius.lg,
    padding: 18,
    gap: 8,
  },
  shareText: { color: colors.black, fontSize: 18, fontWeight: '700' },
});

export default BringAFriendScreen;
