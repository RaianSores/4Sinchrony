import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '../../../../shared/components/Header';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useNotificationStore } from '../store/useNotificationStore';
import NotificationToggle from '../components/NotificationToggle';
import { mkStyles } from './NotificationSettingsScreen.styles';

const NotificationSettingsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);

  const { pushEnabled, emailEnabled, preferences, isLoading, fetchPreferences, togglePreference, togglePush, toggleEmail } = useNotificationStore();

  useEffect(() => { fetchPreferences(); }, [fetchPreferences]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Notificações" showBack onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

export default NotificationSettingsScreen;
