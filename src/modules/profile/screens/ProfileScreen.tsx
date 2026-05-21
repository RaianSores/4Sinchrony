import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../auth/store/useAuthStore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '../../../shared/components/Header';
import { usePackageStore } from '../../purchases/store/usePackageStore';
import { theme } from '../../../shared/theme';

const ProfileScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { purchases } = usePackageStore();

  const menuItems = [
    { title: 'Editar Perfil', icon: 'person-outline', screen: 'EditProfile' },
    { title: 'Minhas Compras', icon: 'cart-outline', screen: 'MyPurchases', badge: purchases.length },
    { title: 'Histórico de Aulas', icon: 'time-outline', screen: 'ClassHistory' },
    { title: 'Meus Cartões', icon: 'card-outline', screen: 'MyCards' },
    { title: 'Planos', icon: 'pricetags-outline', screen: 'Packages' },
    // { title: 'Bring a Friend', icon: 'people-outline', screen: 'BringAFriend' },
    { title: 'Configurações', icon: 'settings-outline', screen: 'Settings' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Perfil" />

      <ScrollView>
        <TouchableOpacity
          style={styles.profileHeader}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.8}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={60} color={theme.colors.primary} />
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>

          {/* <View style={styles.creditsContainer}>
            <Text style={styles.creditsLabel}>Créditos disponíveis</Text>
            <Text style={styles.creditsValue}>{user?.credits || 0}</Text>
          </View> */}
        </TouchableOpacity>

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Ionicons name={item.icon} size={24} color={theme.colors.primary} />
              <Text style={styles.menuText}>{item.title}</Text>
              <View style={styles.menuRight}>
                {item.badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                ) : null}
                <Ionicons name="chevron-forward" size={20} color={theme.colors.border} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: theme.colors.card,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: theme.colors.primary,
  },
  name: { fontSize: 26, fontWeight: '700', color: theme.colors.text },
  email: { fontSize: 16, color: theme.colors.textSecondary, marginTop: 6 },
  creditsContainer: {
    marginTop: 20,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.lg,
  },
  creditsLabel: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 4 },
  creditsValue: { fontSize: 36, fontWeight: '700', color: theme.colors.primary },
  menu: { paddingHorizontal: 16 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    padding: 18,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  menuText: { flex: 1, marginLeft: 16, fontSize: 17, color: theme.colors.text, fontWeight: '500' },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: theme.colors.black, fontSize: 12, fontWeight: '700' },
});

export default ProfileScreen;
