import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type AgendaStackParamList = {
  Agenda: undefined;
  ClassDetail: { classId: string };
};

export type BookingsStackParamList = {
  Bookings: undefined;
  BookingHistory: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  MyPurchases: undefined;
  ClassHistory: undefined;
  MyCards: undefined;
  BringAFriend: undefined;
  Settings: undefined;
  Packages: undefined;
  Cart: undefined;
  Payment: { amount: number };
  PaymentConfirmation: { result: any; purchase: any; method: string; amount: number };
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  AgendaTab: NavigatorScreenParams<AgendaStackParamList>;
  BookingsTab: NavigatorScreenParams<BookingsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Packages: undefined;
  Cart: undefined;
  Payment: { amount: number };
  PaymentConfirmation: { result: any; purchase: any; method: string; amount: number };
};
