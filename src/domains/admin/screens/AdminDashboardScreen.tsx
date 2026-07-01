import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import type { Activity } from '../services/adminService';
import { useAuthStore } from '../../../core/auth/store/useAuthStore';
import { useTheme } from '../../../shared/theme/useTheme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Avatar } from '../../../shared/components/Avatar';
import { useTabBarBottomPadding } from '../../../shared/hooks/useTabBarBottomPadding';
import { mkStyles } from './AdminDashboardScreen.styles';




const ACTIVITY_COLORS: Record<Activity['type'], string> = {
  booking: '#3B82F6', subscription: '#8B5CF6', class: '#10B981', payment: '#10B981',
};
const getActivityColor = (type: Activity['type']) => ACTIVITY_COLORS[type] ?? '#3B82F6';

const AdminDashboardScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { user } = useAuthStore();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminService.getDashboard(),
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Dashboard</Text>
          </View>
          <Avatar uri={user?.avatar} name={user?.name || 'A'} size="md" />
        </View>
        <View style={styles.loading}><Text style={styles.loadingText}>Carregando...</Text></View>
      </SafeAreaView>
    );
  }

  const stats = [
    { title: 'Estúdios', value: data?.totalStudios ?? 0, icon: 'business', color: '#3B82F6' },
    { title: 'Professores', value: data?.totalTeachers ?? 0, icon: 'school', color: '#8B5CF6' },
    { title: 'Alunos', value: data?.totalStudents ?? 0, icon: 'people', color: '#10B981' },
    { title: 'Aulas/Mês', value: data?.totalClassesThisMonth ?? 0, icon: 'calendar', color: '#F59E0B' },
    { title: 'Receita', value: `R$ ${(data?.revenueThisMonth ?? 0).toLocaleString('pt-BR')}`, icon: 'cash', color: '#059669' },
    { title: 'Assinaturas', value: data?.activeSubscriptions ?? 0, icon: 'card', color: '#6366F1' },
    { title: 'Ocupação', value: `${data?.occupancyRate ?? 0}%`, icon: 'analytics', color: '#EC4899' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Visão geral do estúdio</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('AdminProfileTab', { screen: 'AdminProfile' })}
          activeOpacity={0.8}
        >
          <Avatar uri={user?.avatar} name={user?.name || 'A'} size="md" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: tabPadding, paddingTop: 10 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={[styles.statCard, { borderLeftColor: stat.color }]}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                <Ionicons name={stat.icon} size={20} color={stat.color} />
              </View>
              <View>
                <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString('pt-BR') : stat.value}
                </Text>
                <Text style={styles.statTitle} numberOfLines={2}>{stat.title}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividades Recentes</Text>
          {data?.recentActivities.map(act => (
            <View key={act.id} style={styles.activity}>
              <View style={[styles.activityDot, { backgroundColor: getActivityColor(act.type) }]} />
              <Text style={styles.activityText}>{act.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receita Mensal</Text>
          <View style={styles.chart}>
            {data?.monthlyRevenue.map(item => (
              <View key={item.month} style={styles.barContainer}>
                <View style={[styles.bar, { height: (item.value / 50000) * 120 }]} />
                <Text style={styles.barLabel}>{item.month}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;

