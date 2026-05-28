export interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  preferences: NotificationPreference[];
}
