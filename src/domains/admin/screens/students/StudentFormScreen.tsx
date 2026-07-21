import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { studentAdminService, AdminStudent, StudentStatus } from '../../services/studentAdminService';
import FormInput from '../../../../shared/components/FormInput';
import FormSelect from '../../../../shared/components/FormSelect';
import Button from '../../../../shared/components/Button';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import { getApiErrorMessage } from '../../../../shared/utils/getApiErrorMessage';
import { validateCPF, formatCPF, cleanCPF } from '../../../../shared/utils/validateCPF';
import { formatPhone, cleanPhone } from '../../../../shared/utils/formatPhone';
import { fetchAddressByCep, formatCep, cleanCep, UF_OPTIONS } from '../../../../shared/utils/viaCep';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './StudentFormScreen.styles';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
}

const PLAN_OPTIONS = [
  { label: 'Básico', value: 'Básico' },
  { label: 'Premium', value: 'Premium' },
  { label: 'VIP', value: 'VIP' },
];

const STATUS_OPTIONS: { label: string; value: StudentStatus }[] = [
  { label: 'Ativo', value: 'active' },
  { label: 'Inativo', value: 'inactive' },
  { label: 'Bloqueado', value: 'blocked' },
];

const UF_SELECT_OPTIONS = [{ label: '—', value: '' }, ...UF_OPTIONS.map(uf => ({ label: uf, value: uf }))];

const StudentFormScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { studentId } = route.params || {};
  const isEdit = !!studentId;
  const { showAlert } = useAppAlert();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState('Básico');
  const [status, setStatus] = useState<StudentStatus>('active');

  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    studentAdminService.getById(studentId).then((student?: AdminStudent) => {
      if (cancelled || !student) return;
      setName(student.name);
      setEmail(student.email);
      setCpf(student.cpf || '');
      setPhone(cleanPhone(student.phone || ''));
      setPlan(student.plan || 'Básico');
      setStatus(student.status);
      setCep(student.cep || '');
      setLogradouro(student.logradouro || '');
      setNumero(student.numero || '');
      setComplemento(student.complemento || '');
      setBairro(student.bairro || '');
      setCidade(student.cidade || '');
      setEstado(student.estado || '');
    }).catch(error => captureError(error)).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isEdit, studentId]);

  // Ao completar 8 dígitos de CEP, busca no ViaCEP e preenche os demais campos (editáveis).
  // `numero`/`complemento` nunca vêm do ViaCEP — o usuário digita.
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

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!name.trim() || name.trim().length < 3) errs.name = 'Nome deve ter ao menos 3 caracteres';
    if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email inválido';
    if (!validateCPF(cpf)) errs.cpf = 'CPF inválido';
    if (!phone.trim()) errs.phone = 'Telefone é obrigatório';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const payload = {
        name: name.trim(), email: email.trim(), phone, cpf: cleanCPF(cpf), plan, status,
        cep, logradouro: logradouro.trim(), numero: numero.trim(), complemento: complemento.trim(),
        bairro: bairro.trim(), cidade: cidade.trim(), estado,
      };
      if (isEdit) {
        await studentAdminService.update(studentId, payload);
      } else {
        await studentAdminService.create(payload);
      }
      navigation.goBack();
    } catch (error) {
      captureError(error);
      showAlert({
        title: 'Erro',
        message: getApiErrorMessage(
          error,
          isEdit ? 'Não foi possível salvar as alterações.' : 'Não foi possível cadastrar o aluno.'
        ),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    setTogglingStatus(true);
    try {
      if (status === 'active') {
        await studentAdminService.deactivate(studentId);
        setStatus('inactive');
      } else {
        await studentAdminService.reactivate(studentId);
        setStatus('active');
      }
    } catch (error) {
      captureError(error);
      showAlert({ title: 'Erro', message: 'Não foi possível alterar o status do aluno.' });
    } finally {
      setTogglingStatus(false);
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
            <Text style={styles.title}>{isEdit ? 'Editar Aluno' : 'Novo Aluno'}</Text>
            <Text style={styles.subtitle}>{isEdit ? name : 'Cadastrar aluno no sistema'}</Text>
          </View>
        </View>
        {isEdit && (
          <TouchableOpacity style={styles.statusButton} onPress={handleToggleStatus} disabled={togglingStatus}>
            {togglingStatus ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <Text style={styles.statusButtonText}>{status === 'active' ? 'Desativar' : 'Reativar'}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <FormInput label="Nome completo" required value={name} onChangeText={setName} error={errors.name} placeholder="Nome do aluno" />
        <FormInput label="Email" required value={email} onChangeText={setEmail} error={errors.email} placeholder="email@exemplo.com" keyboardType="email-address" autoCapitalize="none" />
        <FormInput
          label="CPF"
          required
          value={formatCPF(cpf)}
          onChangeText={(v) => setCpf(cleanCPF(v).slice(0, 11))}
          error={errors.cpf}
          placeholder="000.000.000-00"
          keyboardType="numeric"
          maxLength={14}
        />
        <FormInput
          label="Telefone"
          required
          value={formatPhone(phone)}
          onChangeText={(v) => setPhone(cleanPhone(v))}
          error={errors.phone}
          placeholder="(11) 99999-0000"
          keyboardType="phone-pad"
          maxLength={15}
        />
        <FormSelect label="Plano" value={plan} options={PLAN_OPTIONS} onSelect={(v) => setPlan(v)} />
        <FormSelect label="Status" value={status} options={STATUS_OPTIONS} onSelect={(v) => setStatus(v as StudentStatus)} />

        <Text style={styles.sectionTitle}>Endereço</Text>
        <Text style={styles.sectionHint}>Necessário para pagamento por cartão. Digite o CEP para preencher automaticamente.</Text>
        <FormInput
          label="CEP"
          value={formatCep(cep)}
          onChangeText={handleCepChange}
          placeholder="00000-000"
          keyboardType="numeric"
          maxLength={9}
        />
        {cepLoading && <Text style={styles.sectionHint}>Buscando endereço…</Text>}
        <FormInput label="Endereço" value={logradouro} onChangeText={setLogradouro} placeholder="Rua / Avenida" />
        <FormInput label="Número" value={numero} onChangeText={setNumero} placeholder="123" keyboardType="numeric" />
        <FormInput label="Complemento" value={complemento} onChangeText={setComplemento} placeholder="Apto, bloco…" />
        <FormInput label="Bairro" value={bairro} onChangeText={setBairro} />
        <FormInput label="Cidade" value={cidade} onChangeText={setCidade} />
        <FormSelect label="Estado" value={estado} options={UF_SELECT_OPTIONS} onSelect={setEstado} />

        {isEdit && (
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('StudentHistory', { studentId, studentName: name })}>
            <Ionicons name="time-outline" size={16} color={colors.text} />
            <Text style={styles.secondaryButtonText}>Ver histórico de aulas</Text>
          </TouchableOpacity>
        )}

        <Button title={isEdit ? 'Salvar Alterações' : 'Cadastrar Aluno'} onPress={handleSubmit} loading={saving} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default StudentFormScreen;
