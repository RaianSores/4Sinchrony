import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../../core/auth/store/useAuthStore';
import { useAppAlert } from '../../../shared/components/AlertModal';
import { useTheme } from '../../../shared/theme/useTheme';
import { borderRadius } from '../../../shared/theme';

const TeacherProfileScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { user, logout } = useAuthStore();
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

  const menuItems = [
    { title: 'Editar Perfil', icon: 'person-outline', screen: 'EditProfile' },
    { title: 'Minhas Especialidades', icon: 'ribbon-outline', screen: 'Specialties' },
    { title: 'Disponibilidade', icon: 'time-outline', screen: 'Availability' },
    { title: 'Configurações', icon: 'settings-outline', screen: 'Settings' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={60} color={colors.primary} />
          </View>
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

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.card,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  name: { fontSize: 24, fontWeight: '700', color: colors.text },
  email: { fontSize: 15, color: colors.textSecondary, marginTop: 4 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark + '15',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    marginTop: 12,
    gap: 6,
  },
  roleText: { fontSize: 13, fontWeight: '600', color: colors.primaryDark },
  menu: { paddingHorizontal: 16 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: borderRadius.lg,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuText: { flex: 1, marginLeft: 14, fontSize: 16, color: colors.text, fontWeight: '500' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    marginTop: 16,
    marginBottom: 40,
    gap: 8,
  },
  logoutText: { color: colors.danger, fontSize: 17, fontWeight: '600' },
});

export default TeacherProfileScreen;
