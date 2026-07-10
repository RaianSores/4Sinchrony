import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../shared/theme/useTheme';
import { bookingAdminService, AdminBooking, BookingStatus } from '../../services/bookingAdminService';
import { classAdminService, AdminClass } from '../../services/classAdminService';
import { useAppAlert } from '../../../../shared/components/AlertModal';
import { getApiErrorMessage } from '../../../../shared/utils/getApiErrorMessage';
import { captureError } from '../../../../lib/sentry';
import { mkStyles } from './AdminBookingDetailScreen.styles';

const STATUS_BADGE: Record<BookingStatus, { label: string; color: string }> = {
  confirmed: { label: 'Confirmada', color: '#1287AF' },
  attended: { label: 'Presente', color: '#22C55E' },
  cancelled: { label: 'Cancelada', color: '#FF453A' },
  no_show: { label: 'Não compareceu', color: '#F59E0B' },
};

const AdminBookingDetailScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const styles = useMemo(() => mkStyles(colors), [colors]);
  const { booking } = route.params as { booking: AdminBooking };
  const { showAlert } = useAppAlert();

  const [working, setWorking] = useState(false);
  const [classInfo, setClassInfo] = useState<AdminClass | undefined>();

  useEffect(() => {
    classAdminService.getById(booking.classId).then(setClassInfo);
  }, [booking.classId]);

  // A reserva pode ficar presa em "confirmed" mesmo depois da aula acontecer (bug de backend
  // já documentado em docs/DEMANDA_CHECKIN_ATTENDANCE_BACKEND.md — o check-in do professor não
  // sincroniza de volta pro registro de reserva). Sem checar o status real da AULA, os botões
  // de ação continuavam disponíveis pra sempre: "Cancelar Reserva" chega a devolver 1 crédito
  // pro aluno mesmo numa aula que ele já frequentou. Mesma proteção que o app do aluno já usa
  // (ver canCancelBooking.ts), adaptada aqui porque o objeto de reserva do admin não traz
  // data/horário da aula, só o classId.
  const classAlreadyOver = classInfo ? (classInfo.status === 'completed' || classInfo.status === 'cancelled') : false;

  const badgeCfg = STATUS_BADGE[booking.status];
  const bookedDate = new Date(booking.bookedAt);

  const handleCancel = () => {
    showAlert({
      title: 'Cancelar reserva',
      message: `Cancelar a reserva de ${booking.studentName}? O crédito será devolvido.`,
      buttons: [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Cancelar Reserva',
          style: 'destructive',
          onPress: async () => {
            setWorking(true);
            try {
              await bookingAdminService.cancel(booking.id);
              navigation.goBack();
            } catch (error) {
              captureError(error);
              showAlert({ title: 'Erro', message: getApiErrorMessage(error, 'Não foi possível cancelar a reserva.') });
            } finally {
              setWorking(false);
            }
          },
        },
      ],
    });
  };

  const handleNoShow = () => {
    showAlert({
      title: 'Registrar falta',
      message: `Confirmar que ${booking.studentName} não compareceu a esta aula?`,
      buttons: [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Registrar Falta',
          style: 'destructive',
          onPress: async () => {
            setWorking(true);
            try {
              await bookingAdminService.markNoShow(booking.id);
              navigation.goBack();
            } catch (error) {
              captureError(error);
              showAlert({ title: 'Erro', message: getApiErrorMessage(error, 'Não foi possível registrar a falta.') });
            } finally {
              setWorking(false);
            }
          },
        },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 6, borderRadius: 50, borderWidth: 1, borderColor: 'rgba(18,135,175,0.22)' }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Detalhe da Reserva</Text>
      </View>

      <View style={styles.scrollContent}>
        <View style={styles.card}>
          <View style={[styles.badge, { backgroundColor: badgeCfg.color + '20' }]}>
            <Text style={[styles.badgeText, { color: badgeCfg.color }]}>{badgeCfg.label}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Aluno</Text>
            <Text style={styles.rowValue}>{booking.studentName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{booking.studentEmail}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Aula</Text>
            <Text style={styles.rowValue}>{booking.className}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Reservado em</Text>
            <Text style={styles.rowValue}>
              {bookedDate.toLocaleDateString('pt-BR')} às {bookedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          {booking.bikeNumber != null && (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Bicicleta</Text>
              <Text style={styles.rowValue}>#{booking.bikeNumber}</Text>
            </View>
          )}
          <View style={[styles.row, styles.rowLast]}>
            <Text style={styles.rowLabel}>Check-in</Text>
            <Text style={styles.rowValue}>{booking.checkedIn ? 'Sim' : 'Não'}</Text>
          </View>
        </View>

        {booking.status === 'confirmed' && classAlreadyOver && (
          <View style={styles.infoNote}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.infoNoteText}>
              Esta aula já foi concluída ou cancelada. O status "Confirmada"/"Check-in" acima pode
              não refletir a presença real do aluno (limitação conhecida do backend) — por isso as
              ações de cancelar e registrar falta, que devolveriam crédito ou alterariam a
              presença, ficam indisponíveis aqui.
            </Text>
          </View>
        )}

        {booking.status === 'confirmed' && !classAlreadyOver && (
          <View style={styles.actionsColumn}>
            {working ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Cancelar Reserva</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.noShowButton} onPress={handleNoShow}>
                  <Text style={styles.noShowButtonText}>Registrar Falta</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AdminBookingDetailScreen;
