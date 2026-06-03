import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import type { Activity } from '../services/adminService';
import { useTheme } from '../../../shared/theme/useTheme';
import { borderRadius } from '../../../shared/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ACTIVITY_COLORS: Record<Activity['type'], string> = {
  booking: '#3B82F6', subscription: '#8B5CF6', class: '#10B981', payment: '#10B981',
};
const getActivityColor = (type: Activity['type']) => ACTIVITY_COLORS[type] ?? '#3B82F6';

const AdminDashboardScreen = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminService.getDashboard(),
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}><Text style={styles.title}>Dashboard</Text></View>
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Visão geral do estúdio</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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

const mkStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginTop: 4 },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: 16, borderLeftWidth: 3, borderWidth: 1, borderColor: colors.border, minHeight: 100 },
  statIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.text },
  statTitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 },
  activity: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 12, borderRadius: borderRadius.md, marginBottom: 8, borderWidth: 1, borderColor: colors.border, gap: 10 },
  activityDot: { width: 8, height: 8, borderRadius: 4 },
  activityText: { fontSize: 14, color: colors.text, flex: 1 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 160, backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: 16, borderWidth: 1, borderColor: colors.border },
  barContainer: { alignItems: 'center', flex: 1 },
  bar: { width: 24, backgroundColor: colors.primary, borderRadius: 4, marginBottom: 4 },
  barLabel: { fontSize: 12, color: colors.textSecondary },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: colors.textSecondary },
});

export default AdminDashboardScreen;
