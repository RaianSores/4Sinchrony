import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../../../core/auth/store/useAuthStore';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import { useTheme } from '../../../../shared/theme/useTheme';

const SettingsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);

  const { logout } = useAuthStore();
  const { showAlert } = useAppAlert();

  const handleLogout = () => {
    showAlert({ title: 'Sair da Conta', message: 'Tem certeza que deseja sair?',
      buttons: [{ text: 'Cancelar', style: 'cancel' }, { text: 'Sair', style: 'destructive', onPress: logout }] });
  };

  const sections = [
    { title: 'Geral', items: [{ icon: 'notifications-outline', label: 'Notificações', screen: 'Notifications' }] },
    { title: 'Segurança', items: [{ icon: 'lock-closed-outline', label: 'Alterar Senha', screen: 'ChangePassword' }] },
    { title: 'Suporte', items: [
      { icon: 'help-circle-outline', label: 'Ajuda' },
      { icon: 'chatbubble-ellipses-outline', label: 'Fale Conosco' },
      { icon: 'document-text-outline', label: 'Termos de Uso' },
      { icon: 'shield-checkmark-outline', label: 'Privacidade' },
    ]},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Configurações" showBack onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {sections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item: any, i) => (
              <TouchableOpacity key={i} style={styles.menuItem}
                onPress={() => item.screen ? navigation.navigate(item.screen) : showAlert({ title: item.label, message: 'Em breve' })}>
                <Ionicons name={item.icon} size={22} color={colors.textSecondary} />
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.border} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
        <Text style={styles.version}>4Sinchrony Experience v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', paddingHorizontal: 20, marginBottom: 8, marginTop: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 0.5, borderBottomColor: colors.border, gap: 12 },
  menuLabel: { flex: 1, color: colors.text, fontSize: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, marginTop: 16, gap: 8 },
  logoutText: { color: colors.danger, fontSize: 17, fontWeight: '600' },
  version: { color: colors.textSecondary, textAlign: 'center', fontSize: 13, marginTop: 16 },
});

export default SettingsScreen;
