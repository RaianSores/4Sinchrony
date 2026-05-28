import { NavigatorScreenParams } from '@react-navigation/native';

export type TeacherDashboardStackParamList = {
  Dashboard: undefined;
  Metrics: undefined;
};

export type TeacherClassesStackParamList = {
  MyClasses: undefined;
  ClassSession: { classId: string };
  StudentList: { classId: string };
};

export type TeacherCheckInStackParamList = {
  CheckInDashboard: undefined;
  CheckInSession: { classId: string };
  Attendance: { classId: string };
};

export type TeacherProfileStackParamList = {
  TeacherProfile: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

export type TeacherMainTabParamList = {
  DashboardTab: NavigatorScreenParams<TeacherDashboardStackParamList>;
  ClassesTab: NavigatorScreenParams<TeacherClassesStackParamList>;
  CheckInTab: NavigatorScreenParams<TeacherCheckInStackParamList>;
  ProfileTab: NavigatorScreenParams<TeacherProfileStackParamList>;
};
