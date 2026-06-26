import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../../core/auth/store/useAuthStore';
import { api } from '../../../core/http/api';
import { useAppAlert } from '../../../shared/components/AlertModal';
import { AvatarUpload } from '../../../shared/components/Avatar';
import { pickAndUploadAvatar } from '../../../shared/services/avatarService';
import { useTheme } from '../../../shared/theme/useTheme';
import { mkStyles } from './AdminProfileScreen.styles';

const AdminProfileScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
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
      showAlert({ title: 'Erro', message: err instanceof Error ? err.message : 'Falha no upload' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const menuItems = [
    { title: 'Editar Perfil', icon: 'person-outline', screen: 'EditProfile' },
    { title: 'Configurações', icon: 'settings-outline', screen: 'Settings' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <AvatarUpload
            uri={user?.avatar}
            name={user?.name || 'A'}
            size="xl"
            onPress={handleAvatarPress}
            uploading={uploadingAvatar}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.name || 'Administrador'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={14} color={colors.primaryDark} />
            <Text style={styles.roleText}>Administrador</Text>
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

export default AdminProfileScreen;
