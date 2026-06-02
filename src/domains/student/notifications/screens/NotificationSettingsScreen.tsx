import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '../../../../shared/components/Header';
import { useTheme } from '../../../../shared/theme/useTheme';
import { borderRadius } from '../../../../shared/theme';
import { useNotificationStore } from '../store/useNotificationStore';
import NotificationToggle from '../components/NotificationToggle';

const NotificationSettingsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);

  const { pushEnabled, emailEnabled, preferences, isLoading, fetchPreferences, togglePreference, togglePush, toggleEmail } = useNotificationStore();

  useEffect(() => { fetchPreferences(); }, [fetchPreferences]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Notificações" showBack onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>Canais</Text>

        <View style={styles.channelRow}>
          <View style={styles.channelIcon}><Ionicons name="phone-portrait-outline" size={22} color={colors.primary} /></View>
          <View style={styles.channelText}>
            <Text style={styles.channelTitle}>Push</Text>
            <Text style={styles.channelDesc}>Notificações no dispositivo</Text>
          </View>
          <Switch value={pushEnabled} onValueChange={togglePush}
            trackColor={{ false: colors.grayLight, true: colors.primary }} thumbColor={colors.white} />
        </View>

        <View style={styles.channelRow}>
          <View style={styles.channelIcon}><Ionicons name="mail-outline" size={22} color={colors.primary} /></View>
          <View style={styles.channelText}>
            <Text style={styles.channelTitle}>E-mail</Text>
            <Text style={styles.channelDesc}>Receba por e-mail</Text>
          </View>
          <Switch value={emailEnabled} onValueChange={toggleEmail}
            trackColor={{ false: colors.grayLight, true: colors.primary }} thumbColor={colors.white} />
        </View>

        <Text style={styles.sectionHeader}>Preferências</Text>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} size="large" style={styles.loading} />
        ) : (
          preferences.map(pref => <NotificationToggle key={pref.id} preference={pref} onToggle={togglePreference} />)
        )}

        <Text style={styles.footer}>Suas preferências são salvas automaticamente.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40, paddingTop: 8 },
  sectionHeader: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
  channelRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: 16, marginHorizontal: 16, marginVertical: 4, borderWidth: 1, borderColor: colors.border },
  channelIcon: { width: 40, height: 40, borderRadius: borderRadius.md, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  channelText: { flex: 1, marginRight: 12 },
  channelTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  channelDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  loading: { marginTop: 40 },
  footer: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 24, paddingHorizontal: 32 },
});

export default NotificationSettingsScreen;
