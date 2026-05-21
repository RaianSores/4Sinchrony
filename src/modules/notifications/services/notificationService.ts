import { NotificationPreference } from '../../../shared/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const defaultPreferences: NotificationPreference[] = [
  {
    id: 'class_reminder',
    title: 'Lembrete de aula',
    description: 'Notifique 30 minutos antes da aula começar',
    icon: 'alarm-outline',
    enabled: true,
  },
  {
    id: 'class_cancellation',
    title: 'Cancelamento de aula',
    description: 'Avise quando uma aula for cancelada',
    icon: 'close-circle-outline',
    enabled: true,
  },
  {
    id: 'promotions',
    title: 'Promoções e ofertas',
    description: 'Receba ofertas especiais e descontos',
    icon: 'pricetags-outline',
    enabled: false,
  },
  {
    id: 'new_modalities',
    title: 'Novas modalidades',
    description: 'Saiba quando novas modalidades chegarem',
    icon: 'fitness-outline',
    enabled: true,
  },
  {
    id: 'payment_result',
    title: 'Resultado de pagamento',
    description: 'Confirmação de pagamentos e comprovantes',
    icon: 'card-outline',
    enabled: true,
  },
  // {
  //   id: 'referral',
  //   title: 'Bring a Friend',
  //   description: 'Atualizações sobre indicações e créditos',
  //   icon: 'people-outline',
  //   enabled: false,
  // },
];

export const notificationService = {
  async getPreferences(): Promise<NotificationPreference[]> {
    await delay(200);
    return defaultPreferences.map(p => ({ ...p }));
  },

  async togglePreference(_id: string, _enabled: boolean): Promise<void> {
    await delay(100);
  },

  async togglePush(_enabled: boolean): Promise<void> {
    await delay(100);
  },

  async toggleEmail(_enabled: boolean): Promise<void> {
    await delay(100);
  },
};
