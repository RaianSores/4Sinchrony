import React, { useState, useMemo, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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
import { formatCPF, validateCPF, cleanCPF } from '../../../../shared/utils/validateCPF';
import { buildProfilePayload } from '../../../../shared/utils/buildProfilePayload';
import { fetchAddressByCep, formatCep, cleanCep } from '../../../../shared/utils/viaCep';

interface EditProfileErrors {
  name?: string;
  phone?: string;
  cpf?: string;
}

const PHONE_REGEX = /^\d{10,11}$/;

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
  const [errors, setErrors] = useState<EditProfileErrors>({});
  const scrollViewRef = useRef<ScrollView>(null);

  const [cep, setCep] = useState(user?.cep || '');
  const [logradouro, setLogradouro] = useState(user?.logradouro || '');
  const [numero, setNumero] = useState(user?.numero || '');
  const [complemento, setComplemento] = useState(user?.complemento || '');
  const [bairro, setBairro] = useState(user?.bairro || '');
  const [cidade, setCidade] = useState(user?.cidade || '');
  const [estado, setEstado] = useState(user?.estado || '');
  const [cepLoading, setCepLoading] = useState(false);

  const handleCepChange = async (raw: string) => {
    const digits = cleanCep(raw);
    setCep(digits);
    if (digits.length === 8) {
      setCepLoading(true);
      const addr = await fetchAddressByCep(digits);
      setCepLoading(false);
      if (addr) {
        setLogradouro(addr.logradouro);
        setBairro(addr.bairro);
        setCidade(addr.cidade);
        setEstado(addr.estado);
        if (addr.complemento) setComplemento(addr.complemento);
      } else {
        showAlert({ title: 'CEP não encontrado', message: 'Preencha o endereço manualmente.' });
      }
    }
  };

  const clearError = (field: keyof EditProfileErrors) => {
    setErrors(prev => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  // Phone and CPF sit at the bottom of the form, right above the keyboard once it opens —
  // scroll them into view on focus instead of relying on adjustResize alone (Android) /
  // KeyboardAvoidingView padding alone (iOS), both of which left these fields hidden.
  const scrollToEnd = () => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleAvatarPress = async () => {
    setUploadingAvatar(true);
    try {
      const url = await pickAndUploadAvatar(showAlert);
      if (!url) return;
      await api.put('/profile', buildProfilePayload(user, { avatar: url }));
      updateUser({ avatar: url });
    } catch (err) {
      captureError(err);
      showAlert({ title: 'Erro', message: err instanceof Error ? err.message : 'Falha no upload' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    const newErrors: EditProfileErrors = {};
    if (!name.trim()) newErrors.name = 'Nome não pode ficar vazio';
    const cpfClean = cleanCPF(cpf);
    if (cpfClean && !validateCPF(cpfClean)) newErrors.cpf = 'CPF inválido';
    if (phone.trim() && !PHONE_REGEX.test(phone.replace(/\D/g, ''))) newErrors.phone = 'Telefone inválido. Informe DDD + número';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const addressPatch = {
      cep: cleanCep(cep) || undefined,
      logradouro: logradouro.trim() || undefined,
      numero: numero.trim() || undefined,
      complemento: complemento.trim() || undefined,
      bairro: bairro.trim() || undefined,
      cidade: cidade.trim() || undefined,
      estado: estado.trim() || undefined,
    };

    try {
      await api.put('/profile', buildProfilePayload(user, { name: name.trim(), cpf: cpfClean || undefined, phone: phone.trim(), ...addressPatch }));
      updateUser({ name: name.trim(), cpf: cpfClean || undefined, phone: phone.trim(), ...addressPatch });
      showAlert({ title: 'Pronto!', message: 'Dados atualizados com sucesso', buttons: [{ text: 'OK', onPress: () => navigation.goBack() }] });
    } catch (error) {
      captureError(error);
      showAlert({ title: 'Erro', message: 'Não foi possível salvar. Tente novamente.' });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Editar Perfil" showBack onBackPress={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: tabPadding, paddingTop: 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={text => { setName(text); clearError('name'); }}
              placeholder="Seu nome"
              placeholderTextColor={colors.textSecondary}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <Text style={styles.label}>Email</Text>
            <TextInput style={[styles.input, { color: colors.textSecondary }]} value={user?.email} editable={false} />

            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={phone}
              onChangeText={text => { setPhone(text); clearError('phone'); }}
              placeholder="(63) 99999-9999"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              onFocus={scrollToEnd}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={[styles.input, errors.cpf && styles.inputError]}
              value={cpf}
              onChangeText={(t) => { setCpf(formatCPF(t)); clearError('cpf'); }}
              placeholder="000.000.000-00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              onFocus={scrollToEnd}
            />
            {errors.cpf && <Text style={styles.errorText}>{errors.cpf}</Text>}

            <Text style={[styles.label, { marginTop: 8 }]}>CEP</Text>
            <TextInput
              style={styles.input}
              value={formatCep(cep)}
              onChangeText={handleCepChange}
              placeholder="00000-000"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
              maxLength={9}
              onFocus={scrollToEnd}
            />
            {cepLoading && <Text style={[styles.label, { color: colors.textSecondary }]}>Buscando endereço…</Text>}

            <Text style={styles.label}>Endereço</Text>
            <TextInput style={styles.input} value={logradouro} onChangeText={setLogradouro} placeholder="Rua / Avenida" placeholderTextColor={colors.textSecondary} onFocus={scrollToEnd} />

            <Text style={styles.label}>Número</Text>
            <TextInput style={styles.input} value={numero} onChangeText={setNumero} placeholder="123" placeholderTextColor={colors.textSecondary} keyboardType="number-pad" onFocus={scrollToEnd} />

            <Text style={styles.label}>Complemento</Text>
            <TextInput style={styles.input} value={complemento} onChangeText={setComplemento} placeholder="Apto, bloco…" placeholderTextColor={colors.textSecondary} onFocus={scrollToEnd} />

            <Text style={styles.label}>Bairro</Text>
            <TextInput style={styles.input} value={bairro} onChangeText={setBairro} placeholderTextColor={colors.textSecondary} onFocus={scrollToEnd} />

            <Text style={styles.label}>Cidade</Text>
            <TextInput style={styles.input} value={cidade} onChangeText={setCidade} placeholderTextColor={colors.textSecondary} onFocus={scrollToEnd} />

            <Text style={styles.label}>Estado (UF)</Text>
            <TextInput style={styles.input} value={estado} onChangeText={(t) => setEstado(t.toUpperCase().slice(0, 2))} placeholder="TO" placeholderTextColor={colors.textSecondary} autoCapitalize="characters" maxLength={2} onFocus={scrollToEnd} />

            <Button title="Salvar Alterações" onPress={handleSave} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

