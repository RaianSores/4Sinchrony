import React, { useMemo, useState } from 'react';
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

// A API devolve os meses de receita em formatos variados ("Apr/2026", "2026-04"…).
// Extraímos ano + índice do mês (0–11) pra encaixar no eixo fixo jan–dez do ano selecionado.
const EN_MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};
const PT_MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function parseRevenueMonth(raw: string): { year: number; monthIndex: number } | null {
  const s = String(raw ?? '').trim();
  let m = s.match(/^([A-Za-z]{3,})[/\-\s]+(\d{4})$/); // Apr/2026, Jul-2026
  if (m) {
    const mi = EN_MONTHS[m[1].slice(0, 3).toLowerCase()];
    if (mi != null) return { year: Number(m[2]), monthIndex: mi };
  }
  m = s.match(/^(\d{4})[-/](\d{1,2})$/); // 2026-04
  if (m) {
    const mi = Number(m[2]) - 1;
    if (mi >= 0 && mi < 12) return { year: Number(m[1]), monthIndex: mi };
  }
  return null;
}

function formatCompactBRL(v: number): string {
  if (v >= 1000) {
    const k = v / 1000;
    return `R$${Number.isInteger(k) ? k : k.toFixed(1).replace('.', ',')}k`;
  }
  return `R$${Math.round(v)}`;
}

const AdminDashboardScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { user } = useAuthStore();

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminService.getDashboard(),
  });

  // Anos anteriores usam uma consulta separada (mesmo endpoint, com ?year=) pra não
  // refazer o dashboard inteiro; o ano atual reaproveita o dashboard já carregado.
  const { data: yearData } = useQuery({
    queryKey: ['admin', 'dashboard', 'year', year],
    queryFn: () => adminService.getDashboard(year),
    enabled: year !== currentYear,
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

  // Eixo fixo jan–dez do ano selecionado. Encaixamos cada mês que a API devolver na sua
  // posição; meses sem dado ficam zerados.
  const rawMonthly = (year === currentYear ? data?.monthlyRevenue : yearData?.monthlyRevenue) ?? [];
  const revenueData = PT_MONTHS.map(label => ({ label, value: 0 }));
  rawMonthly.forEach(item => {
    const parsed = parseRevenueMonth(item.month);
    if (parsed && parsed.year === year) {
      revenueData[parsed.monthIndex].value = Number(item.value ?? 0);
    }
  });
  const maxRevenue = Math.max(1, ...revenueData.map(d => d.value));
  const hasRevenue = revenueData.some(d => d.value > 0);
  const yearTotal = revenueData.reduce((sum, d) => sum + d.value, 0);

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
          {(data?.recentActivities ?? []).map((act, i) => (
            <View key={act.id ?? `${act.timestamp}-${i}`} style={styles.activity}>
              <View style={[styles.activityDot, { backgroundColor: getActivityColor(act.type) }]} />
              <Text style={styles.activityText}>{act.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Receita Mensal</Text>
              <Text style={styles.sectionMeta}>Total de {formatCompactBRL(yearTotal)} em {year}</Text>
            </View>
            <View style={styles.yearSelector}>
              <TouchableOpacity onPress={() => setYear(y => y - 1)} style={styles.yearBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="chevron-back" size={18} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.yearLabel}>{year}</Text>
              <TouchableOpacity
                onPress={() => setYear(y => Math.min(currentYear, y + 1))}
                disabled={year >= currentYear}
                style={styles.yearBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="chevron-forward" size={18} color={year >= currentYear ? colors.border : colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          {hasRevenue ? (
            <View style={styles.chartCard}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chartRow}
              >
                {revenueData.map((d, i) => (
                  <View key={`${d.label}-${i}`} style={styles.barColumn}>
                    <Text style={styles.barValue} numberOfLines={1}>
                      {d.value > 0 ? formatCompactBRL(d.value) : ''}
                    </Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.bar, { height: Math.max(4, (d.value / maxRevenue) * 120) }]} />
                    </View>
                    <Text style={styles.barLabel} numberOfLines={1}>{d.label}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : (
            <View style={styles.chartEmpty}>
              <Ionicons name="bar-chart-outline" size={30} color={colors.textSecondary} />
              <Text style={styles.chartEmptyText}>Sem receita registrada em {year}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboardScreen;

