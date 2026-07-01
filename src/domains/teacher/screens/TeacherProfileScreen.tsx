import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../../core/auth/store/useAuthStore';
import { api } from '../../../core/http/api';
import { useAppAlert } from '../../../shared/components/AlertModal';
import { AvatarUpload } from '../../../shared/components/Avatar';
import { pickAndUploadAvatar } from '../../../shared/services/avatarService';
import { useTabBarBottomPadding } from '../../../shared/hooks/useTabBarBottomPadding';
import { mkStyles } from './TeacherProfileScreen.styles';
import { useTheme } from '../../../shared/theme/useTheme';
import { captureError } from '../../../lib/sentry';




const TeacherProfileScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { user, logout, updateUser } = useAuthStore();
  const { showAlert } = useAppAlert();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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

  const handleAvatarPress = async () => {
    setUploadingAvatar(true);
    try {
      const url = await pickAndUploadAvatar();
      if (!url) return;
      await api.put('/profile', { avatar: url });
      updateUser({ avatar: url });
    } catch (err) {
      captureError(err);
      showAlert({ title: 'Erro', message: err instanceof Error ? err.message : 'Falha no upload' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const menuItems = [
    { title: 'Editar Perfil', icon: 'person-outline', screen: 'EditProfile' },
    { title: 'Alterar Senha', icon: 'lock-closed-outline', screen: 'ChangePassword' },
    { title: 'Configurações', icon: 'settings-outline', screen: 'Settings' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabPadding, paddingTop: 20 }}>
        <View style={styles.profileHeader}>
          <AvatarUpload
            uri={user?.avatar}
            name={user?.name || 'P'}
            size="xl"
            onPress={handleAvatarPress}
            uploading={uploadingAvatar}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.name || 'Professor'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="school" size={14} color={colors.primaryDark} />
            <Text style={styles.roleText}>Professor</Text>
          </View>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Ionicons name={item.icon} size={24} color={colors.primary} />
              <Text style={styles.menuText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.border} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TeacherProfileScreen;

