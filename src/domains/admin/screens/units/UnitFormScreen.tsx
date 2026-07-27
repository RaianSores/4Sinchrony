import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { unitAdminService, AdminUnit } from '../../services/unitAdminService';
import FormInput from '../../../../shared/components/FormInput';
import FormSelect from '../../../../shared/components/FormSelect';
import FormToggle from '../../../../shared/components/FormToggle';
import Button from '../../../../shared/components/Button';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import { getApiErrorMessage } from '../../../../shared/utils/getApiErrorMessage';
import { formatPhone, cleanPhone } from '../../../../shared/utils/formatPhone';
import { fetchAddressByCep, formatCep, cleanCep, UF_OPTIONS } from '../../../../shared/utils/viaCep';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './UnitFormScreen.styles';

const UF_SELECT_OPTIONS = [{ label: '—', value: '' }, ...UF_OPTIONS.map(uf => ({ label: uf, value: uf }))];

interface FormErrors {
  name?: string;
  email?: string;
}

// A unidade é o prédio/filial. O endereço estruturado é a fonte para os studios (salas)
// herdarem o endereço. Compomos também a string legada `address` que o backend ainda usa.
function composeAddress(a: { logradouro: string; numero: string; bairro: string; cidade: string; estado: string }): string {
  const linha1 = [a.logradouro, a.numero].filter(Boolean).join(', ');
  const rest = [a.bairro, [a.cidade, a.estado].filter(Boolean).join('/')].filter(Boolean).join(' - ');
  return [linha1, rest].filter(Boolean).join(' - ');
}

const UnitFormScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { unitId } = route.params || {};
  const isEdit = !!unitId;
  const { showAlert } = useAppAlert();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [active, setActive] = useState(true);

  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cepLoading, setCepLoading] = useState(false);

  const handleCepChange = async (raw: string) => {
    const digits = cleanCep(raw);
    setCep(digits);
    if (digits.length === 8) {
      setCepLoading(true);
      const addr = await fetchAddressByCep(digits);
      setCepLoading(false);
      if (addr) {
        setLogradouro(addr.logradouro); setBairro(addr.bairro); setCidade(addr.cidade); setEstado(addr.estado);
        if (addr.complemento) setComplemento(addr.complemento);
      }
    }
  };

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    unitAdminService.getById(unitId).then((unit?: AdminUnit) => {
      if (cancelled || !unit) return;
      setName(unit.name);
      setEmail(unit.email || '');
      setPhone(cleanPhone(unit.phone || ''));
      setActive(unit.active);
      setCep(unit.cep || '');
      setLogradouro(unit.logradouro || '');
      setNumero(unit.numero || '');
      setComplemento(unit.complemento || '');
      setBairro(unit.bairro || '');
      setCidade(unit.cidade || '');
      setEstado(unit.estado || '');
    }).catch(error => captureError(error)).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isEdit, unitId]);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = 'Nome é obrigatório';
    if (email.trim() && !/\S+@\S+\.\S+/.test(email)) errs.email = 'Email inválido';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const addressParts = { logradouro, numero, bairro, cidade, estado };
      const payload = {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone ? phone : undefined,
        active,
        cep: cleanCep(cep) || undefined,
        logradouro: logradouro.trim() || undefined,
        numero: numero.trim() || undefined,
        complemento: complemento.trim() || undefined,
        bairro: bairro.trim() || undefined,
        cidade: cidade.trim() || undefined,
        estado: estado || undefined,
        address: composeAddress(addressParts) || undefined,
      };
      if (isEdit) {
        await unitAdminService.update(unitId, payload);
      } else {
        await unitAdminService.create(payload);
      }
      navigation.goBack();
    } catch (error) {
      captureError(error);
      showAlert({
        title: 'Erro',
        message: getApiErrorMessage(error, isEdit ? 'Não foi possível salvar as alterações.' : 'Não foi possível cadastrar a unidade.'),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 6, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(18,135,175,0.22)' }}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>{isEdit ? 'Editar Unidade' : 'Nova Unidade'}</Text>
            <Text style={styles.subtitle}>{isEdit ? name : 'Cadastrar filial no sistema'}</Text>
          </View>
        </View>
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <FormInput label="Nome da unidade" required value={name} onChangeText={setName} error={errors.name} placeholder="Ex: 4Sinchrony Experience Centro" />
        <FormInput label="Email" value={email} onChangeText={setEmail} error={errors.email} placeholder="unidade@studio.com" keyboardType="email-address" autoCapitalize="none" />
        <FormInput
          label="Telefone"
          value={formatPhone(phone)}
          onChangeText={(v) => setPhone(cleanPhone(v))}
          placeholder="(11) 99999-0000"
          keyboardType="phone-pad"
          maxLength={15}
        />

        <Text style={styles.sectionLabel}>Endereço</Text>
        <Text style={styles.hint}>As salas (studios) herdam este endereço. Digite o CEP para preencher automaticamente.</Text>
        <FormInput label="CEP" value={formatCep(cep)} onChangeText={handleCepChange} placeholder="00000-000" keyboardType="numeric" maxLength={9} />
        {cepLoading && <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 8 }}>Buscando endereço…</Text>}
        <FormInput label="Endereço" value={logradouro} onChangeText={setLogradouro} placeholder="Rua / Avenida" />
        <FormInput label="Número" value={numero} onChangeText={setNumero} placeholder="123" keyboardType="numeric" />
        <FormInput label="Complemento" value={complemento} onChangeText={setComplemento} placeholder="Apto, bloco…" />
        <FormInput label="Bairro" value={bairro} onChangeText={setBairro} />
        <FormInput label="Cidade" value={cidade} onChangeText={setCidade} />
        <FormSelect label="Estado" value={estado} options={UF_SELECT_OPTIONS} onSelect={setEstado} />

        <FormToggle
          label={active ? 'Unidade ativa' : 'Unidade inativa'}
          description="Unidades inativas não aparecem para vincular alunos, professores e studios"
          value={active}
          onValueChange={setActive}
        />

        <Button title={isEdit ? 'Salvar Alterações' : 'Cadastrar Unidade'} onPress={handleSubmit} loading={saving} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default UnitFormScreen;
