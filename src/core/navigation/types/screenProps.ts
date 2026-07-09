import type { RouteProp } from '@react-navigation/native';
import type {
  StudentAgendaStackParamList,
  StudentProfileStackParamList,
} from './student';
import type {
  TeacherClassesStackParamList,
} from './teacher';

type WithNavigation<
  T extends Record<string, object | undefined>,
  K extends keyof T,
> = {
  navigation: any;
  route: RouteProp<T, K>;
};

// Student screen props
export type HomeScreenProps = { navigation: any };
export type ClassesScreenProps = { navigation: any };
export type ClassDetailScreenProps = WithNavigation<StudentAgendaStackParamList, 'ClassDetail'>;
export type BookingsScreenProps = { navigation: any };
export type BookingHistoryScreenProps = { navigation: any };
export type ProfileScreenProps = { navigation: any };
export type EditProfileScreenProps = { navigation: any };
export type MyPurchasesScreenProps = { navigation: any };
export type ClassHistoryScreenProps = { navigation: any };
export type MyCardsScreenProps = { navigation: any };
export type AddCardScreenProps = { navigation: any };
export type SettingsScreenProps = { navigation: any };
export type ChangePasswordScreenProps = { navigation: any };
export type NotificationSettingsScreenProps = { navigation: any };
export type PackagesScreenProps = { navigation: any };
export type CartScreenProps = { navigation: any };
export type PaymentScreenProps = WithNavigation<StudentProfileStackParamList, 'Payment'>;
export type PaymentConfirmationScreenProps = WithNavigation<StudentProfileStackParamList, 'PaymentConfirmation'>;
export type BringAFriendScreenProps = { navigation: any };

// Teacher screen props
export type TeacherDashboardScreenProps = { navigation: any };
export type TeacherMetricsScreenProps = { navigation: any };
export type TeacherMyClassesScreenProps = { navigation: any };
export type ClassSessionScreenProps = WithNavigation<TeacherClassesStackParamList, 'ClassSession'>;
export type StudentListScreenProps = WithNavigation<TeacherClassesStackParamList, 'StudentList'>;
export type TeacherProfileScreenProps = { navigation: any };

// Admin screen props
export type AdminDashboardScreenProps = { navigation: any };
export type AdminStudentsScreenProps = { navigation: any };
export type AdminTeachersScreenProps = { navigation: any };
export type AdminStudiosScreenProps = { navigation: any };
export type AdminProfileScreenProps = { navigation: any };
