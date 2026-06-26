import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../../../core/auth/store/useAuthStore';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import { useTheme } from '../../../../shared/theme/useTheme';
import { mkStyles } from './SettingsScreen.styles';
import { APP_LINKS } from '../../../../core/config/appLinks';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';

const SettingsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);

  const tabPadding = useTabBarBottomPadding();
  const { logout } = useAuthStore();
  const { showAlert } = useAppAlert();

  const handleLogout = () => {
    showAlert({
      title: 'Sair da Conta',
      message: 'Tem certeza que deseja sair?',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ],
    });
  };

  const openLink = (url: string, label: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        showAlert({ title: 'Erro', message: `Não foi possível abrir ${label}.` });
      }
    });
  };

  const sections = [
    {
      title: 'Geral',
      items: [
        { icon: 'notifications-outline', label: 'Notificações', screen: 'Notifications' },
      ],
    },
    {
      title: 'Segurança',
      items: [
        { icon: 'lock-closed-outline', label: 'Alterar Senha', screen: 'ChangePassword' },
      ],
    },
    {
      title: 'Suporte',
      items: [
        { icon: 'help-circle-outline',        label: 'Ajuda',         url: APP_LINKS.help    },
        { icon: 'chatbubble-ellipses-outline', label: 'Fale Conosco', url: APP_LINKS.contact },
        { icon: 'document-text-outline',       label: 'Termos de Uso',url: APP_LINKS.terms   },
        { icon: 'shield-checkmark-outline',    label: 'Privacidade',  url: APP_LINKS.privacy },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Configurações" showBack onBackPress={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scrollContent, { paddingBottom: tabPadding }]} showsVerticalScrollIndicator={false}>
        {sections.map((section, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item: any, i) => (
              <TouchableOpacity
                key={i}
                style={styles.menuItem}
                onPress={() => {
                  if (item.screen) {
                    navigation.navigate(item.screen);
                  } else if (item.url) {
                    openLink(item.url, item.label);
                  }
                }}
              >
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

export default SettingsScreen;

