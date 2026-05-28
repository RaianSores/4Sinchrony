import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../../shared/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

const managementItems = [
  { title: 'Alunos', icon: 'people', screen: 'Students', color: '#10B981', desc: 'Gerenciar alunos cadastrados' },
  { title: 'Professores', icon: 'school', screen: 'Teachers', color: '#8B5CF6', desc: 'Gerenciar professores e especialidades' },
  { title: 'Estúdios', icon: 'business', screen: 'Studios', color: '#3B82F6', desc: 'Gerenciar unidades e horários' },
];

const Badge = ({ active }: { active: boolean }) => (
  <View style={[styles.badge, { backgroundColor: active ? '#10B98115' : '#EF444415' }]}>
    <Text style={[styles.badgeText, { color: active ? '#10B981' : '#EF4444' }]}>
      {active ? 'Ativo' : 'Inativo'}
    </Text>
  </View>
);

const ManagementScreen = ({ navigation }: any) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.title}>Gestão</Text>
      <Text style={styles.subtitle}>Administre sua plataforma</Text>
    </View>
    <ScrollView contentContainerStyle={styles.scroll}>
      {managementItems.map((item, i) => (
        <TouchableOpacity
          key={i}
          style={styles.card}
          onPress={() => navigation.navigate(item.screen)}
        >
          <View style={[styles.iconWrap, { backgroundColor: item.color + '15' }]}>
            <Ionicons name={item.icon} size={28} color={item.color} />
          </View>
          <View style={styles.info}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.gray} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  </SafeAreaView>
);

const StudentsScreen = ({ navigation }: any) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>Alunos</Text>
    </View>
    <ScrollView contentContainerStyle={styles.scroll}>
      {[
        { name: 'Carlos Silva', active: true },
        { name: 'Ana Beatriz', active: true },
        { name: 'Marcos Oliveira', active: false },
        { name: 'Juliana Costa', active: true },
      ].map((student, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color={theme.colors.primary} />
          </View>
          <Text style={styles.rowText}>{student.name}</Text>
          <Badge active={student.active} />
        </View>
      ))}
    </ScrollView>
  </SafeAreaView>
);

const TeachersScreen = ({ navigation }: any) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>Professores</Text>
    </View>
    <ScrollView contentContainerStyle={styles.scroll}>
      {[
        { name: 'Ádria', specialty: 'Velo' },
        { name: 'Wal', specialty: 'Velo' },
        { name: 'Carlos', specialty: 'Jiu-Jitsu' },
      ].map((teacher, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.avatar}>
            <Ionicons name="school" size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.rowTextContainer}>
            <Text style={styles.rowText}>{teacher.name}</Text>
            <Text style={styles.rowSub}>{teacher.specialty}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  </SafeAreaView>
);

const StudiosScreen = ({ navigation }: any) => (
  <SafeAreaView style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <Text style={styles.title}>Estúdios</Text>
    </View>
    <ScrollView contentContainerStyle={styles.scroll}>
      {['Palmas', 'Boxe Centro', '4Sinchrony Experience Centro'].map((name, i) => (
        <View key={i} style={styles.row}>
          <View style={styles.avatar}>
            <Ionicons name="business" size={20} color={theme.colors.primary} />
          </View>
          <Text style={styles.rowText}>{name}</Text>
          <Badge active />
        </View>
      ))}
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
  subtitle: { fontSize: 15, color: theme.colors.textSecondary, marginTop: 4, paddingHorizontal: 20 },
  scroll: { padding: 16, gap: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card,
    padding: 16, borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: theme.colors.border, gap: 14,
  },
  iconWrap: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
  cardDesc: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  row: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card,
    padding: 14, borderRadius: theme.borderRadius.md, borderWidth: 1, borderColor: theme.colors.border, gap: 12,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.border + '50', justifyContent: 'center', alignItems: 'center' },
  rowText: { fontSize: 15, fontWeight: '500', color: theme.colors.text, flex: 1 },
  rowTextContainer: { flex: 1 },
  rowSub: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: theme.borderRadius.full },
  badgeText: { fontSize: 12, fontWeight: '600' },
});

export { ManagementScreen, StudentsScreen, TeachersScreen, StudiosScreen };
