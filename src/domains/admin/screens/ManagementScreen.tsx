import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../shared/hooks/useTabBarBottomPadding';
import { borderRadius } from '../../../shared/theme';
import { adminService } from '../services/adminService';
import { mkStyles } from './ManagementScreen.styles';

const managementItems = [
  { title: 'Alunos', icon: 'people', screen: 'Students', color: '#10B981', desc: 'Gerenciar alunos cadastrados' },
  { title: 'Professores', icon: 'school', screen: 'Teachers', color: '#8B5CF6', desc: 'Gerenciar professores e especialidades' },
  { title: 'Estúdios', icon: 'business', screen: 'Studios', color: '#3B82F6', desc: 'Gerenciar unidades e horários' },
];

const Badge = ({ active }: { active: boolean }) => (
  <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: borderRadius.full, backgroundColor: active ? '#10B98115' : '#EF444415' }}>
    <Text style={{ fontSize: 12, fontWeight: '600', color: active ? '#10B981' : '#EF4444' }}>
      {active ? 'Ativo' : 'Inativo'}
    </Text>
  </View>
);

export const ManagementScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestão</Text>
        <Text style={styles.subtitle}>Administre sua plataforma</Text>
      </View>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: tabPadding }]} showsVerticalScrollIndicator={false}>
        {managementItems.map((item, i) => (
          <TouchableOpacity key={i} style={styles.card} onPress={() => navigation.navigate(item.screen)}>
            <View style={[styles.iconWrap, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon} size={28} color={item.color} />
            </View>
            <View style={styles.info}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.gray} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export const StudentsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const [students, setStudents] = useState<{ id: string; name: string; email: string; active: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStudents().then(data => { setStudents(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Alunos</Text>
      </View>
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: tabPadding }]} showsVerticalScrollIndicator={false}>
          {students.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={colors.border} />
              <Text style={styles.emptyText}>Nenhum aluno encontrado</Text>
            </View>
          ) : students.map(student => (
            <View key={student.id} style={styles.row}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={styles.rowText}>{student.name}</Text>
                <Text style={styles.rowSub}>{student.email}</Text>
              </View>
              <Badge active={student.active} />
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export const TeachersScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const [teachers, setTeachers] = useState<{ id: string; name: string; email: string; specialty: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getTeachers().then(data => { setTeachers(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Professores</Text>
      </View>
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: tabPadding }]} showsVerticalScrollIndicator={false}>
          {teachers.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="school-outline" size={48} color={colors.border} />
              <Text style={styles.emptyText}>Nenhum professor encontrado</Text>
            </View>
          ) : teachers.map(teacher => (
            <View key={teacher.id} style={styles.row}>
              <View style={styles.avatar}>
                <Ionicons name="school" size={20} color={colors.primary} />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={styles.rowText}>{teacher.name}</Text>
                <Text style={styles.rowSub}>{teacher.specialty || teacher.email}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export const StudiosScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const [studios, setStudios] = useState<{ id: string; name: string; city: string; active: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStudios().then(data => { setStudios(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Estúdios</Text>
      </View>
      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: tabPadding }]} showsVerticalScrollIndicator={false}>
          {studios.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="business-outline" size={48} color={colors.border} />
              <Text style={styles.emptyText}>Nenhum estúdio encontrado</Text>
            </View>
          ) : studios.map(studio => (
            <View key={studio.id} style={styles.row}>
              <View style={styles.avatar}>
                <Ionicons name="business" size={20} color={colors.primary} />
              </View>
              <View style={styles.rowTextContainer}>
                <Text style={styles.rowText}>{studio.name}</Text>
                <Text style={styles.rowSub}>{studio.city}</Text>
              </View>
              <Badge active={studio.active} />
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};
