import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../../core/auth/store/useAuthStore';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import Button from '../../../../shared/components/Button';
import { useTheme } from '../../../../shared/theme/useTheme';
import { mkStyles } from './EditProfileScreen.styles';

const EditProfileScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);

  const { user, updateUser } = useAuthStore();
  const { showAlert } = useAppAlert();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  const handleSave = () => {
    if (!name.trim()) { showAlert({ title: 'Erro', message: 'Nome não pode ficar vazio' }); return; }
    updateUser({ name: name.trim(), phone: phone.trim() });
    showAlert({ title: 'Pronto!', message: 'Dados atualizados com sucesso', buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Editar Perfil" showBack onBackPress={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor={colors.textSecondary} />
          <Text style={styles.label}>Email</Text>
          <TextInput style={[styles.input, { color: colors.textSecondary }]} value={user?.email} editable={false} />
          <Text style={styles.label}>Telefone</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="(63) 99999-9999" placeholderTextColor={colors.textSecondary} keyboardType="phone-pad" />
          <Button title="Salvar Alterações" onPress={handleSave} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};



export default EditProfileScreen;
