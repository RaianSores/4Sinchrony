import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../../../core/auth/store/useAuthStore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '../../../../shared/components/Header';
import { Avatar } from '../../../../shared/components/Avatar';
import { usePackageStore } from '../../purchases/store/usePackageStore';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { mkStyles } from './ProfileScreen.styles';
import type { ProfileScreenProps } from '../../../../core/navigation/types/screenProps';

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  const { user } = useAuthStore();
  const { purchases } = usePackageStore();

  const menuItems = [
    { title: 'Editar Perfil', icon: 'person-outline', screen: 'EditProfile' },
    { title: 'Minhas Compras', icon: 'cart-outline', screen: 'MyPurchases', badge: purchases.length },
    { title: 'Histórico de Aulas', icon: 'time-outline', screen: 'ClassHistory' },
    { title: 'Meus Cartões', icon: 'card-outline', screen: 'MyCards' },
    { title: 'Planos', icon: 'pricetags-outline', screen: 'Packages' },
    { title: 'Configurações', icon: 'settings-outline', screen: 'Settings' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Perfil" />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabPadding, paddingTop: 20 }}
      >
        <TouchableOpacity style={styles.profileHeader} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.8}>
          <Avatar uri={user?.avatar} name={user?.name || 'U'} size="xl" style={styles.avatar} />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.creditsContainer}>
            <Text style={styles.creditsLabel}>Créditos disponíveis</Text>
            <Text style={styles.creditsValue}>{user?.credits ?? 0}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={() => navigation.navigate(item.screen)}>
              <Ionicons name={item.icon} size={24} color={colors.primary} />
              <Text style={styles.menuText}>{item.title}</Text>
              <View style={styles.menuRight}>
                {item.badge ? <View style={styles.badge}><Text style={styles.badgeText}>{item.badge}</Text></View> : null}
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

