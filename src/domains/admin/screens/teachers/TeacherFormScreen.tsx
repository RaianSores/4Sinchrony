import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import { useTheme } from '../../../../shared/theme/useTheme';
import { teacherAdminService, AdminTeacher } from '../../services/teacherAdminService';
import FormInput from '../../../../shared/components/FormInput';
import FormSelect from '../../../../shared/components/FormSelect';
import FormToggle from '../../../../shared/components/FormToggle';
import { UnitMultiSelect } from '../../components/UnitPicker';
import { fetchAddressByCep, formatCep, cleanCep, UF_OPTIONS } from '../../../../shared/utils/viaCep';
import Button from '../../../../shared/components/Button';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import { getApiErrorMessage } from '../../../../shared/utils/getApiErrorMessage';
import { validateCPF, formatCPF, cleanCPF } from '../../../../shared/utils/validateCPF';
import { formatPhone, cleanPhone } from '../../../../shared/utils/formatPhone';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './TeacherFormScreen.styles';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  password?: string;
}

const UF_SELECT_OPTIONS = [{ label: '—', value: '' }, ...UF_OPTIONS.map(uf => ({ label: uf, value: uf }))];

const TeacherFormScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { teacherId } = route.params || {};
  const isEdit = !!teacherId;
  const { showAlert } = useAppAlert();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [active, setActive] = useState(true);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [unitIds, setUnitIds] = useState<string[]>([]);
  const [specialtyInput, setSpecialtyInput] = useState('');

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

  const [togglingActive, setTogglingActive] = useState(false);
  const [generatingPassword, setGeneratingPassword] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    teacherAdminService.getById(teacherId).then((teacher?: AdminTeacher) => {
      if (cancelled || !teacher) return;
      setName(teacher.name);
      setEmail(teacher.email);
      setCpf(teacher.cpf || '');
      setPhone(cleanPhone(teacher.phone));
      setActive(teacher.active);
      setSpecialties(teacher.specialties || []);
      setUnitIds(teacher.unitIds || (teacher.units?.map(u => u.id) ?? []));
      setCep(teacher.cep || ''); setLogradouro(teacher.logradouro || ''); setNumero(teacher.numero || '');
      setComplemento(teacher.complemento || ''); setBairro(teacher.bairro || ''); setCidade(teacher.cidade || ''); setEstado(teacher.estado || '');
    }).catch(error => captureError(error)).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isEdit, teacherId]);

  const addSpecialty = () => {
    const s = specialtyInput.trim();
    if (s && !specialties.includes(s)) {
      setSpecialties([...specialties, s]);
      setSpecialtyInput('');
    }
  };
  const removeSpecialty = (s: string) => setSpecialties(specialties.filter(x => x !== s));

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!name.trim()) errs.name = 'Nome é obrigatório';
    if (!email.trim()) errs.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Email inválido';
    if (!phone.trim()) errs.phone = 'Telefone é obrigatório';
    if (cpf && !validateCPF(cpf)) errs.cpf = 'CPF inválido';
    if (!isEdit && password.length < 6) errs.password = 'Mínimo 6 caracteres';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const payload = { name: name.trim(), email: email.trim(), phone, cpf: cpf ? cleanCPF(cpf) : undefined, specialties, unitIds,
        cep: cleanCep(cep) || undefined, logradouro: logradouro.trim() || undefined, numero: numero.trim() || undefined,
        complemento: complemento.trim() || undefined, bairro: bairro.trim() || undefined, cidade: cidade.trim() || undefined, estado: estado || undefined };
      if (isEdit) {
        await teacherAdminService.update(teacherId, payload);
      } else {
        await teacherAdminService.create({ ...payload, password });
      }
      navigation.goBack();
    } catch (error) {
      captureError(error);
      showAlert({
        title: 'Erro',
        message: getApiErrorMessage(
          error,
          isEdit ? 'Não foi possível salvar as alterações.' : 'Não foi possível cadastrar o professor.'
        ),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async () => {
    setTogglingActive(true);
    try {
      if (active) await teacherAdminService.deactivate(teacherId);
      else await teacherAdminService.activate(teacherId);
      setActive(!active);
    } catch (error) {
      captureError(error);
      showAlert({ title: 'Erro', message: 'Não foi possível alterar o status do professor.' });
    } finally {
      setTogglingActive(false);
    }
  };

  const handleGeneratePassword = () => {
    showAlert({
      title: 'Gerar senha temporária',
      message: 'Isso vai invalidar a senha atual do professor. Deseja continuar?',
      buttons: [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Gerar',
          style: 'destructive',
          onPress: async () => {
            setGeneratingPassword(true);
            try {
              const pwd = await teacherAdminService.sendTemporaryPassword(teacherId);
              setTemporaryPassword(pwd);
              setCopied(false);
            } catch (error) {
              captureError(error);
              showAlert({ title: 'Erro', message: 'Não foi possível gerar a senha temporária.' });
            } finally {
              setGeneratingPassword(false);
            }
          },
        },
      ],
    });
  };

  const handleCopyPassword = () => {
    Clipboard.setString(temporaryPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 6, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(18,135,175,0.22)' }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>{isEdit ? 'Editar Professor' : 'Novo Professor'}</Text>
          <Text style={styles.subtitle}>{isEdit ? name : 'Cadastrar professor no sistema'}</Text>
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
        {isEdit && temporaryPassword ? (
          <View style={styles.tempPasswordBox}>
            <Text style={styles.tempPasswordLabel}>Senha temporária gerada — copie e repasse ao professor</Text>
            <View style={styles.tempPasswordRow}>
              <Text style={styles.tempPasswordText}>{temporaryPassword}</Text>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopyPassword}>
                <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={14} color={colors.warning} />
                <Text style={styles.copyButtonText}>{copied ? 'Copiado' : 'Copiar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <FormInput label="Nome completo" required value={name} onChangeText={setName} error={errors.name} placeholder="Nome do professor" />
        <FormInput label="Email" required value={email} onChangeText={setEmail} error={errors.email} placeholder="email@studio.com" keyboardType="email-address" autoCapitalize="none" />
        <FormInput
          label="CPF (opcional)"
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
        {!isEdit && (
          <FormInput label="Senha" required value={password} onChangeText={setPassword} error={errors.password} placeholder="Mínimo 6 caracteres" secureTextEntry />
        )}

        <Text style={styles.sectionLabel}>Endereço</Text>
        <FormInput label="CEP" value={formatCep(cep)} onChangeText={handleCepChange} placeholder="00000-000" keyboardType="numeric" maxLength={9} />
        {cepLoading && <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 8 }}>Buscando endereço…</Text>}
        <FormInput label="Endereço" value={logradouro} onChangeText={setLogradouro} placeholder="Rua / Avenida" />
        <FormInput label="Número" value={numero} onChangeText={setNumero} placeholder="123" keyboardType="numeric" />
        <FormInput label="Complemento" value={complemento} onChangeText={setComplemento} placeholder="Apto, bloco…" />
        <FormInput label="Bairro" value={bairro} onChangeText={setBairro} />
        <FormInput label="Cidade" value={cidade} onChangeText={setCidade} />
        <FormSelect label="Estado" value={estado} options={UF_SELECT_OPTIONS} onSelect={setEstado} />

        <UnitMultiSelect value={unitIds} onChange={setUnitIds} label="Unidades (filiais)" />

        <Text style={styles.sectionLabel}>Especialidades</Text>
        <View style={styles.specialtiesRow}>
          {specialties.map(s => (
            <View key={s} style={styles.specialtyChip}>
              <Text style={styles.specialtyChipText}>{s}</Text>
              <TouchableOpacity onPress={() => removeSpecialty(s)} hitSlop={6}>
                <Ionicons name="close" size={13} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.specialtyInputRow}>
          <TextInput
            value={specialtyInput}
            onChangeText={setSpecialtyInput}
            placeholder="Ex: Yoga, Pilates..."
            placeholderTextColor={colors.textSecondary}
            onSubmitEditing={addSpecialty}
            style={styles.specialtyInput}
          />
          <TouchableOpacity style={styles.specialtyAddButton} onPress={addSpecialty}>
            <Ionicons name="add" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        {isEdit && (
          <>
            <View style={styles.divider} />
            <FormToggle
              label={active ? 'Professor ativo' : 'Professor inativo'}
              description="Professores inativos não aparecem para agendamento de novas aulas"
              value={active}
              onValueChange={handleToggleActive}
              disabled={togglingActive}
            />
            <TouchableOpacity style={styles.secondaryButton} onPress={handleGeneratePassword} disabled={generatingPassword}>
              {generatingPassword ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <>
                  <Ionicons name="key-outline" size={16} color={colors.text} />
                  <Text style={styles.secondaryButtonText}>Gerar senha temporária</Text>
                </>
              )}
            </TouchableOpacity>
            <View style={{ height: 16 }} />
          </>
        )}

        <Button title={isEdit ? 'Salvar Alterações' : 'Cadastrar Professor'} onPress={handleSubmit} loading={saving} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default TeacherFormScreen;
