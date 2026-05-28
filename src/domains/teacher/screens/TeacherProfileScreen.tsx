import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../../../core/auth/store/useAuthStore';
import { theme } from '../../../core/theme';

const TeacherProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuthStore();

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

      <ScrollView>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={60} color={theme.colors.primary} />
          </View>
          <Text style={styles.name}>{user?.name || 'Professor'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="school" size={14} color={theme.colors.primaryDark} />
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
              <Ionicons name={item.icon} size={24} color={theme.colors.primary} />
              <Text style={styles.menuText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.border} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.danger} />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: theme.colors.card,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  name: { fontSize: 24, fontWeight: '700', color: theme.colors.text },
  email: { fontSize: 15, color: theme.colors.textSecondary, marginTop: 4 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryDark + '15',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    marginTop: 12,
    gap: 6,
  },
  roleText: { fontSize: 13, fontWeight: '600', color: theme.colors.primaryDark },
  menu: { paddingHorizontal: 16 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuText: { flex: 1, marginLeft: 14, fontSize: 16, color: theme.colors.text, fontWeight: '500' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 40,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    gap: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: theme.colors.danger },
});

export default TeacherProfileScreen;
