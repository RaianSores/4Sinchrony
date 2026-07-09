import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { classAdminService, ClassStatus } from '../../services/classAdminService';
import { classTypeAdminService } from '../../services/classTypeAdminService';
import { teacherAdminService } from '../../services/teacherAdminService';
import { studioAdminService } from '../../services/studioAdminService';
import FormInput from '../../../../shared/components/FormInput';
import FormSelect from '../../../../shared/components/FormSelect';
import Button from '../../../../shared/components/Button';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import { getApiErrorMessage } from '../../../../shared/utils/getApiErrorMessage';
import { formatDateInput, brDateToISO, isoDateToBR, isValidBRDate } from '../../../../shared/utils/formatDate';
import { formatTime, addMinutesToTime } from '../../../../shared/utils/formatTime';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './ClassFormScreen.styles';

interface FormErrors {
  name?: string;
  classTypeId?: string;
  teacherId?: string;
  studioId?: string;
  date?: string;
  startTime?: string;
  duration?: string;
  totalSpots?: string;
}

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

const STATUS_OPTIONS: { label: string; value: ClassStatus }[] = [
  { label: 'Agendada', value: 'scheduled' },
  { label: 'Em andamento', value: 'in_progress' },
  { label: 'Concluída', value: 'completed' },
  { label: 'Cancelada', value: 'cancelled' },
];

const ClassFormScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { classId } = route.params || {};
  const isEdit = !!classId;
  const { showAlert } = useAppAlert();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [name, setName] = useState('');
  const [classTypeId, setClassTypeId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [studioId, setStudioId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('45');
  const [totalSpots, setTotalSpots] = useState('20');
  const [status, setStatus] = useState<ClassStatus>('scheduled');

  const [classTypeOptions, setClassTypeOptions] = useState<{ label: string; value: string }[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<{ label: string; value: string }[]>([]);
  const [studioOptions, setStudioOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [classTypes, teachers, studios, cls] = await Promise.all([
          classTypeAdminService.list(),
          teacherAdminService.list(),
          studioAdminService.list(),
          isEdit ? classAdminService.getById(classId) : Promise.resolve(undefined),
        ]);
        if (cancelled) return;

        setClassTypeOptions(classTypes.map(t => ({ label: t.active ? t.name : `${t.name} (inativo)`, value: t.id })));
        setTeacherOptions(teachers.map(t => ({ label: t.active ? t.name : `${t.name} (inativo)`, value: t.id })));
        setStudioOptions(studios.map(s => ({ label: s.active ? s.name : `${s.name} (inativo)`, value: s.id })));

        if (isEdit && cls) {
          setName(cls.name);
          setClassTypeId(cls.classTypeId);
          setTeacherId(cls.teacherId);
          setStudioId(cls.studioId);
          setDate(isoDateToBR(cls.date));
          setStartTime(cls.startTime);
          setDuration(String(cls.duration));
          setTotalSpots(String(cls.totalSpots));
          setStatus(cls.status);
        }
      } catch (error) {
        captureError(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isEdit, classId]);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!name.trim() || name.trim().length < 3) errs.name = 'Nome deve ter ao menos 3 caracteres';
    if (!classTypeId) errs.classTypeId = 'Selecione o tipo de aula';
    if (!teacherId) errs.teacherId = 'Selecione o professor';
    if (!studioId) errs.studioId = 'Selecione o estúdio';

    if (!isValidBRDate(date)) {
      errs.date = 'Data inválida (DD/MM/AAAA)';
    } else if (!isEdit) {
      const [d, m, y] = date.split('/').map(Number);
      const picked = new Date(y, m - 1, d);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (picked < today) errs.date = 'Não pode ser no passado';
    }

    if (!TIME_RE.test(startTime)) errs.startTime = 'Use o formato HH:MM';

    const dur = Number(duration);
    if (!duration || isNaN(dur) || dur < 15 || dur > 240) errs.duration = 'Entre 15 e 240 minutos';

    const spots = Number(totalSpots);
    if (!totalSpots || isNaN(spots) || spots < 1 || spots > 200) errs.totalSpots = 'Entre 1 e 200 vagas';

    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const endTime = addMinutesToTime(startTime, Number(duration));
      const payload = {
        name: name.trim(),
        classTypeId,
        teacherId,
        studioId,
        date: brDateToISO(date),
        startTime,
        endTime,
        duration: Number(duration),
        totalSpots: Number(totalSpots),
      };
      if (isEdit) {
        await classAdminService.update(classId, { ...payload, status });
      } else {
        await classAdminService.create(payload);
      }
      navigation.goBack();
    } catch (error) {
      captureError(error);
      showAlert({
        title: 'Erro',
        message: getApiErrorMessage(error, isEdit ? 'Não foi possível salvar as alterações.' : 'Não foi possível cadastrar a aula.'),
      });
    } finally {
      setSaving(false);
    }
  };

  const computedEndTime = TIME_RE.test(startTime) && Number(duration) > 0
    ? addMinutesToTime(startTime, Number(duration))
    : null;

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
          <Text style={styles.title}>{isEdit ? 'Editar Aula' : 'Nova Aula'}</Text>
          <Text style={styles.subtitle}>{isEdit ? name : 'Cadastrar aula no sistema'}</Text>
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
        <FormInput label="Nome da aula" required value={name} onChangeText={setName} error={errors.name} placeholder="Ex: Yoga Manhã" />
        <FormSelect label="Tipo de aula" required value={classTypeId} options={classTypeOptions} onSelect={setClassTypeId} error={errors.classTypeId} placeholder="Selecione o tipo" />
        <FormSelect label="Professor" required value={teacherId} options={teacherOptions} onSelect={setTeacherId} error={errors.teacherId} placeholder="Selecione o professor" />
        <FormSelect label="Estúdio" required value={studioId} options={studioOptions} onSelect={setStudioId} error={errors.studioId} placeholder="Selecione o estúdio" />

        <FormInput
          label="Data"
          required
          value={date}
          onChangeText={(v) => setDate(formatDateInput(v))}
          error={errors.date}
          placeholder="DD/MM/AAAA"
          keyboardType="numeric"
          maxLength={10}
        />
        <FormInput
          label="Horário de início"
          required
          value={startTime}
          onChangeText={(v) => setStartTime(formatTime(v))}
          error={errors.startTime}
          placeholder="09:00"
          keyboardType="numeric"
          maxLength={5}
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <FormInput label="Duração (min)" required value={duration} onChangeText={setDuration} error={errors.duration} placeholder="45" keyboardType="numeric" />
          </View>
          <View style={styles.rowItem}>
            <FormInput label="Vagas totais" required value={totalSpots} onChangeText={setTotalSpots} error={errors.totalSpots} placeholder="20" keyboardType="numeric" />
          </View>
        </View>
        {computedEndTime ? (
          <Text style={styles.helperText}>Termina às {computedEndTime}</Text>
        ) : null}

        {isEdit && (
          <>
            <View style={styles.divider} />
            <FormSelect label="Status" value={status} options={STATUS_OPTIONS} onSelect={(v) => setStatus(v as ClassStatus)} />
          </>
        )}

        <Button title={isEdit ? 'Salvar Alterações' : 'Cadastrar Aula'} onPress={handleSubmit} loading={saving} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ClassFormScreen;
