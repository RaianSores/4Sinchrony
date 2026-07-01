import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useAuthStore } from '../../../../core/auth/store/useAuthStore';
import { api } from '../../../../core/http/api';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import Header from '../../../../shared/components/Header';
import Button from '../../../../shared/components/Button';
import { AvatarUpload } from '../../../../shared/components/Avatar';
import { pickAndUploadAvatar } from '../../../../shared/services/avatarService';
import { useTheme } from '../../../../shared/theme/useTheme';
import { mkStyles } from './EditProfileScreen.styles';
import type { EditProfileScreenProps } from '../../../../core/navigation/types/screenProps';
import { captureError } from '../../../../lib/sentry';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';




const EditProfileScreen = ({ navigation }: EditProfileScreenProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();

  const { user, updateUser } = useAuthStore();
  const { showAlert } = useAppAlert();
  const [name, setName] = useState(user?.name || '');
  const [cpf, setCpf] = useState(user?.cpf || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarPress = async () => {
    setUploadingAvatar(true);
    try {
      const url = await pickAndUploadAvatar();
      if (!url) return;
      await api.put('/profile', { avatar: url });
      updateUser({ avatar: url });
    } catch (err) {
      captureError(err);
      showAlert({ title: 'Erro', message: err instanceof Error ? err.message : 'Falha no upload' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { showAlert({ title: 'Erro', message: 'Nome não pode ficar vazio' }); return; }
    const cpfClean = cpf.replace(/\D/g, '');
    if (cpfClean && cpfClean.length !== 11) { showAlert({ title: 'Erro', message: 'CPF inválido. Deve conter 11 dígitos' }); return; }
    try {
      await api.put('/profile', { name: name.trim(), cpf: cpfClean || undefined, phone: phone.trim() });
      updateUser({ name: name.trim(), cpf: cpfClean || undefined, phone: phone.trim() });
      showAlert({ title: 'Pronto!', message: 'Dados atualizados com sucesso', buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] });
    } catch (error) {
      captureError(error);
      showAlert({ title: 'Erro', message: 'Não foi possível salvar. Tente novamente.' });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Editar Perfil" showBack onBackPress={() => navigation.goBack()} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.scrollContent, { paddingBottom: tabPadding, paddingTop: 20 }]} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <AvatarUpload
            uri={user?.avatar}
            name={user?.name || 'U'}
            size="xl"
            onPress={handleAvatarPress}
            uploading={uploadingAvatar}
          />
        </View>
        <View style={styles.form}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor={colors.textSecondary} />
          <Text style={styles.label}>Email</Text>
          <TextInput style={[styles.input, { color: colors.textSecondary }]} value={user?.email} editable={false} />
          <Text style={styles.label}>Telefone</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="(63) 99999-9999" placeholderTextColor={colors.textSecondary} keyboardType="phone-pad" />
          <Text style={styles.label}>CPF</Text>
          <TextInput style={styles.input} value={cpf} onChangeText={(t) => { const d = t.replace(/\D/g, '').slice(0, 11); setCpf(d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2')); }} placeholder="000.000.000-00" placeholderTextColor={colors.textSecondary} keyboardType="number-pad" />
          <Button title="Salvar Alterações" onPress={handleSave} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

