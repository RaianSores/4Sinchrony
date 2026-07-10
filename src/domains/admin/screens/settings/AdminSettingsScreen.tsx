import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { useTabBarBottomPadding } from '../../../../shared/hooks/useTabBarBottomPadding';
import { settingsAdminService, SettingsUpdateData } from '../../services/settingsAdminService';
import FormInput from '../../../../shared/components/FormInput';
import FormToggle from '../../../../shared/components/FormToggle';
import Button from '../../../../shared/components/Button';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import { getApiErrorMessage } from '../../../../shared/utils/getApiErrorMessage';
import { formatPhone, cleanPhone } from '../../../../shared/utils/formatPhone';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './AdminSettingsScreen.styles';

interface FormErrors {
  studioName?: string;
  bookingWindowDays?: string;
  cancellationDeadlineHours?: string;
  maxBookingsPerStudent?: string;
  reminderHoursBefore?: string;
  smtpPort?: string;
}

// Sem botão de "Testar conexão" de propósito — o do ERP não chama o backend real, ele roda
// nodemailer dentro do próprio servidor Next.js do ERP, então não existe endpoint equivalente
// pro app chamar. Documentado em docs/PLANO_ADMIN_APP.md.
const AdminSettingsScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const tabPadding = useTabBarBottomPadding();
  const { showAlert } = useAppAlert();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [studioName, setStudioName] = useState('');
  const [studioEmail, setStudioEmail] = useState('');
  const [studioPhone, setStudioPhone] = useState('');
  const [studioAddress, setStudioAddress] = useState('');

  const [bookingWindowDays, setBookingWindowDays] = useState('');
  const [cancellationDeadlineHours, setCancellationDeadlineHours] = useState('');
  const [maxBookingsPerStudent, setMaxBookingsPerStudent] = useState('');
  const [allowWaitlist, setAllowWaitlist] = useState(true);
  const [autoConfirmBookings, setAutoConfirmBookings] = useState(true);

  const [sendBookingConfirmationEmail, setSendBookingConfirmationEmail] = useState(true);
  const [sendReminderEmail, setSendReminderEmail] = useState(true);
  const [reminderHoursBefore, setReminderHoursBefore] = useState('');

  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  const [smtpSecure, setSmtpSecure] = useState(false);

  useEffect(() => {
    let cancelled = false;
    settingsAdminService.get().then(s => {
      if (cancelled) return;
      setStudioName(s.studioName);
      setStudioEmail(s.studioEmail);
      setStudioPhone(cleanPhone(s.studioPhone));
      setStudioAddress(s.studioAddress);
      setBookingWindowDays(String(s.bookingWindowDays));
      setCancellationDeadlineHours(String(s.cancellationDeadlineHours));
      setMaxBookingsPerStudent(String(s.maxBookingsPerStudent));
      setAllowWaitlist(s.allowWaitlist);
      setAutoConfirmBookings(s.autoConfirmBookings);
      setSendBookingConfirmationEmail(s.sendBookingConfirmationEmail);
      setSendReminderEmail(s.sendReminderEmail);
      setReminderHoursBefore(String(s.reminderHoursBefore));
      setSmtpHost(s.smtpHost);
      setSmtpPort(String(s.smtpPort));
      setSmtpUser(s.smtpUser);
      setSmtpFrom(s.smtpFrom);
      setSmtpSecure(s.smtpSecure);
      // smtpPassword propositalmente não é preenchido — a API sempre devolve o valor
      // mascarado ("••••••••"), nunca a senha real, então o campo começa vazio.
    }).catch(error => captureError(error)).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!studioName.trim()) errs.studioName = 'Nome é obrigatório';

    const bwd = Number(bookingWindowDays);
    if (!bookingWindowDays || isNaN(bwd) || bwd < 1) errs.bookingWindowDays = 'Deve ser maior que zero';

    const cdh = Number(cancellationDeadlineHours);
    if (cancellationDeadlineHours === '' || isNaN(cdh) || cdh < 0) errs.cancellationDeadlineHours = 'Deve ser zero ou mais';

    const mbs = Number(maxBookingsPerStudent);
    if (!maxBookingsPerStudent || isNaN(mbs) || mbs < 1) errs.maxBookingsPerStudent = 'Deve ser maior que zero';

    if (sendReminderEmail) {
      const rhb = Number(reminderHoursBefore);
      if (!reminderHoursBefore || isNaN(rhb) || rhb < 1) errs.reminderHoursBefore = 'Deve ser maior que zero';
    }

    if (smtpPort) {
      const sp = Number(smtpPort);
      if (isNaN(sp) || sp < 1) errs.smtpPort = 'Porta inválida';
    }

    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const payload: SettingsUpdateData = {
        studioName: studioName.trim(),
        studioEmail: studioEmail.trim(),
        studioPhone,
        studioAddress: studioAddress.trim(),
        bookingWindowDays: Number(bookingWindowDays),
        cancellationDeadlineHours: Number(cancellationDeadlineHours),
        maxBookingsPerStudent: Number(maxBookingsPerStudent),
        allowWaitlist,
        autoConfirmBookings,
        sendBookingConfirmationEmail,
        sendReminderEmail,
        reminderHoursBefore: Number(reminderHoursBefore) || 24,
        smtpHost: smtpHost.trim(),
        smtpPort: Number(smtpPort) || 587,
        smtpUser: smtpUser.trim(),
        smtpFrom: smtpFrom.trim(),
        smtpSecure,
      };
      if (smtpPassword.trim()) {
        payload.smtpPassword = smtpPassword.trim();
      }
      await settingsAdminService.update(payload);
      setSmtpPassword('');
      showAlert({ title: 'Salvo', message: 'Configurações atualizadas com sucesso.' });
    } catch (error) {
      captureError(error);
      showAlert({ title: 'Erro', message: getApiErrorMessage(error, 'Não foi possível salvar as configurações.') });
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 6, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(18,135,175,0.22)' }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Configurações do Studio</Text>
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={StyleSheet.flatten([styles.scrollContent, { paddingBottom: tabPadding }])}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.sectionTitle, styles.sectionTitleFirst]}>Dados do Studio</Text>
        <FormInput label="Nome" required value={studioName} onChangeText={setStudioName} error={errors.studioName} placeholder="Nome do studio" />
        <FormInput label="Email" value={studioEmail} onChangeText={setStudioEmail} placeholder="contato@studio.com" keyboardType="email-address" autoCapitalize="none" />
        <FormInput
          label="Telefone"
          value={formatPhone(studioPhone)}
          onChangeText={(v) => setStudioPhone(cleanPhone(v))}
          placeholder="(11) 99999-0000"
          keyboardType="phone-pad"
          maxLength={15}
        />
        <FormInput label="Endereço" value={studioAddress} onChangeText={setStudioAddress} placeholder="Rua, número, bairro" />

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Regras de Reserva</Text>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <FormInput label="Janela de reserva (dias)" required value={bookingWindowDays} onChangeText={setBookingWindowDays} error={errors.bookingWindowDays} placeholder="7" keyboardType="numeric" />
          </View>
          <View style={styles.rowItem}>
            <FormInput label="Prazo cancelamento (h)" required value={cancellationDeadlineHours} onChangeText={setCancellationDeadlineHours} error={errors.cancellationDeadlineHours} placeholder="2" keyboardType="numeric" />
          </View>
        </View>
        <FormInput label="Máx. reservas por aluno" required value={maxBookingsPerStudent} onChangeText={setMaxBookingsPerStudent} error={errors.maxBookingsPerStudent} placeholder="5" keyboardType="numeric" />
        <FormToggle label="Permitir lista de espera" value={allowWaitlist} onValueChange={setAllowWaitlist} />
        <FormToggle label="Confirmar reservas automaticamente" value={autoConfirmBookings} onValueChange={setAutoConfirmBookings} />

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Notificações</Text>
        <FormToggle label="Email de confirmação de reserva" value={sendBookingConfirmationEmail} onValueChange={setSendBookingConfirmationEmail} />
        <FormToggle label="Email de lembrete" value={sendReminderEmail} onValueChange={setSendReminderEmail} />
        {sendReminderEmail && (
          <FormInput
            label="Enviar lembrete quantas horas antes"
            required
            value={reminderHoursBefore}
            onChangeText={setReminderHoursBefore}
            error={errors.reminderHoursBefore}
            placeholder="24"
            keyboardType="numeric"
          />
        )}

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Configurações de Email (SMTP)</Text>
        <FormInput label="Servidor SMTP" value={smtpHost} onChangeText={setSmtpHost} placeholder="smtp.gmail.com" autoCapitalize="none" />
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <FormInput label="Porta" value={smtpPort} onChangeText={setSmtpPort} error={errors.smtpPort} placeholder="587" keyboardType="numeric" />
          </View>
          <View style={styles.rowItem}>
            <FormInput label="Usuário" value={smtpUser} onChangeText={setSmtpUser} placeholder="email@gmail.com" keyboardType="email-address" autoCapitalize="none" />
          </View>
        </View>
        <FormInput
          label="Senha"
          value={smtpPassword}
          onChangeText={setSmtpPassword}
          placeholder="•••••••• (deixe em branco para manter a senha atual)"
          secureTextEntry
          autoCapitalize="none"
        />
        <FormInput label="Remetente" value={smtpFrom} onChangeText={setSmtpFrom} placeholder="Studio <email@gmail.com>" autoCapitalize="none" />
        <FormToggle label="Usar SSL/TLS (porta 465)" value={smtpSecure} onValueChange={setSmtpSecure} />

        <View style={{ height: 8 }} />
        <Button title="Salvar Configurações" onPress={handleSubmit} loading={saving} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AdminSettingsScreen;
