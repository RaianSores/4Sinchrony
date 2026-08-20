import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../../../core/auth/store/useAuthStore';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import { useTheme } from '../../../../shared/theme/useTheme';
import { mkStyles } from './SettingsScreen.styles';
import { APP_LINKS } from '../../../../core/config/appLinks';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import type { SettingsScreenProps } from '../../../../core/navigation/types/screenProps';




const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
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
      title: 'Segurança',
      items: [
        { icon: 'lock-closed-outline', label: 'Alterar Senha', screen: 'ChangePassword' },
      ],
    },
    {
      title: 'Suporte',
      items: [
        { icon: 'mail-outline', label: 'Fale Conosco', url: APP_LINKS.contact },
        { icon: 'logo-whatsapp', label: 'WhatsApp', url: APP_LINKS.whatsapp },
      ],
    },
    {
      title: 'Legal',
      items: [
        { icon: 'document-text-outline', label: 'Termos de Uso', url: APP_LINKS.terms },
        { icon: 'shield-checkmark-outline', label: 'Política de Privacidade', url: APP_LINKS.privacy },
        // Item próprio, separado de "Termos de Uso" (não é uma seção dentro do
        // mesmo link) — pedido do cliente pra dar ênfase às normas de conduta.
        { icon: 'clipboard-outline', label: 'Regimento Interno', url: APP_LINKS.regimentoInterno },
      ],
    },
    {
      title: 'Conta',
      items: [
        { icon: 'trash-outline', label: 'Excluir Conta', screen: 'DeleteAccount' },
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

