import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../shared/hooks/useTabBarBottomPadding';
import { mkStyles } from './ManagementScreen.styles';

const managementItems = [
  { title: 'Alunos', icon: 'people', screen: 'StudentList', color: '#10B981', desc: 'Gerenciar alunos cadastrados' },
  { title: 'Professores', icon: 'school', screen: 'TeacherList', color: '#8B5CF6', desc: 'Gerenciar professores e especialidades' },
  { title: 'Unidades', icon: 'business', screen: 'UnitList', color: '#0EA5E9', desc: 'Filiais (prédios) com endereço' },
  { title: 'Estúdios', icon: 'grid', screen: 'StudioList', color: '#3B82F6', desc: 'Salas dentro das unidades e bicicletas' },
  { title: 'Tipos de Aula', icon: 'pricetag', screen: 'ClassTypeList', color: '#F59E0B', desc: 'Gerenciar categorias de aula' },
  { title: 'Aulas', icon: 'calendar', screen: 'ClassList', color: '#ED7921', desc: 'Agendar e gerenciar aulas' },
  { title: 'Pacotes', icon: 'albums', screen: 'PackageList', color: '#EC4899', desc: 'Gerenciar pacotes de créditos' },
  { title: 'Tipos de Pacote', icon: 'layers', screen: 'PackageTypeList', color: '#14B8A6', desc: 'Categorias de plano (Básico, Premium, Família)' },
  { title: 'Benefícios', icon: 'gift', screen: 'BenefitList', color: '#F97316', desc: 'Vantagens associáveis aos pacotes' },
  { title: 'Reservas', icon: 'ticket', screen: 'AdminBookingList', color: '#06B6D4', desc: 'Ver e cancelar reservas de alunos' },
  { title: 'Check-in', icon: 'checkmark-circle', screen: 'AdminCheckin', color: '#22C55E', desc: 'Confirmar presença de alunos' },
  { title: 'Relatórios', icon: 'bar-chart', screen: 'AdminReports', color: '#8B5CF6', desc: 'Ocupação, frequência e resumo do período' },
];

export const ManagementScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestão</Text>
        <Text style={styles.subtitle}>Administre sua plataforma</Text>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scroll, { paddingBottom: tabPadding }]} showsVerticalScrollIndicator={false}>
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
