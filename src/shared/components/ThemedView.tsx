import React from 'react';
import { View, ViewStyle, ScrollView, ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';

interface ThemedViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

/** Wrapper padrão para telas — aplica background do tema automaticamente */
export const ThemedSafeAreaView: React.FC<ThemedViewProps> = ({ children, style, edges }) => {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
};

/** View simples com background do tema */
export const ThemedView: React.FC<ThemedViewProps> = ({ children, style }) => {
  const { colors } = useTheme();
  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      {children}
    </View>
  );
};

/** ScrollView com background do tema */
interface ThemedScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
}

export const ThemedScrollView: React.FC<ThemedScrollViewProps> = ({ children, style, contentContainerStyle, ...rest }) => {
  const { colors } = useTheme();
  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
      contentContainerStyle={contentContainerStyle}
      {...rest}
    >
      {children}
    </ScrollView>
  );
};
