import { NavigatorScreenParams } from '@react-navigation/native';

export type AdminDashboardStackParamList = {
  AdminDashboard: undefined;
};

export type AdminManagementStackParamList = {
  Students: undefined;
  Teachers: undefined;
  Studios: undefined;
};

export type AdminMainTabParamList = {
  AdminDashboardTab: NavigatorScreenParams<AdminDashboardStackParamList>;
  AdminManagementTab: NavigatorScreenParams<AdminManagementStackParamList>;
};
