import { NavigatorScreenParams } from '@react-navigation/native';

export type StudentHomeStackParamList = {
  Home: undefined;
};

export type StudentAgendaStackParamList = {
  Agenda: undefined;
  ClassDetail: { classId: string };
};

export type StudentBookingsStackParamList = {
  Bookings: undefined;
  BookingHistory: undefined;
};

export type StudentProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  MyPurchases: undefined;
  ClassHistory: undefined;
  MyCards: undefined;
  AddCard: undefined;
  BringAFriend: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  Notifications: undefined;
  Packages: undefined;
  Cart: undefined;
  Payment: { amount: number };
  PaymentConfirmation: { result: any; purchase: any; method: string; amount: number };
};

export type StudentMainTabParamList = {
  HomeTab: NavigatorScreenParams<StudentHomeStackParamList>;
  AgendaTab: NavigatorScreenParams<StudentAgendaStackParamList>;
  BookingsTab: NavigatorScreenParams<StudentBookingsStackParamList>;
  ProfileTab: NavigatorScreenParams<StudentProfileStackParamList>;
};
