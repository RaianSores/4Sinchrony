import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/useTheme';
import { spacing } from '../theme';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showBack, onBackPress, rightComponent, transparent }) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
          paddingBottom: 12,
          paddingTop: insets.top + 8,
          backgroundColor: transparent ? 'transparent' : colors.card,
          borderBottomWidth: transparent ? 0 : 1,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={{ width: 40, alignItems: 'flex-start', justifyContent: 'center' }}>
        {showBack && (
          <TouchableOpacity onPress={onBackPress} style={{ padding: 4 }}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      {title ? (
        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, flex: 1, textAlign: 'center' }}>
          {title}
        </Text>
      ) : (
        <View style={{ flex: 1 }} />
      )}

      <View style={{ width: 40, alignItems: 'flex-end', justifyContent: 'center' }}>
        {rightComponent}
      </View>
    </View>
  );
};

export default Header;
