export type {
  StudentHomeStackParamList,
  StudentAgendaStackParamList,
  StudentBookingsStackParamList,
  StudentProfileStackParamList,
  StudentMainTabParamList,
} from './student';

export type {
  TeacherDashboardStackParamList,
  TeacherClassesStackParamList,
  TeacherProfileStackParamList,
  TeacherMainTabParamList,
} from './teacher';

export type {
  AdminDashboardStackParamList,
  AdminManagementStackParamList,
  AdminMainTabParamList,
} from './admin';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
