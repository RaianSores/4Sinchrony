import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../theme/useTheme';
import { borderRadius, spacing } from '../theme';

interface ClassCardProps {
  instructor: string;
  instructorAvatar?: string;
  className: string;
  time: string;
  duration: number;
  studio: string;
  availableSpots: number;
  totalSpots: number;
  enrolled?: boolean;
  onPress: () => void;
}

const ClassCard: React.FC<ClassCardProps> = ({
  instructor,
  instructorAvatar,
  className,
  time,
  duration,
  studio,
  availableSpots,
  totalSpots,
  enrolled,
  onPress,
}) => {
  const { colors, isDark } = useTheme();
  const occupancy = Math.round(((totalSpots - availableSpots) / totalSpots) * 100);
  const spotsColor = availableSpots <= 3 ? colors.danger : availableSpots <= 8 ? colors.warning : colors.success;

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        marginHorizontal: spacing.md,
        marginVertical: spacing.xs,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: isDark ? '#000' : '#0A0519',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.06,
        shadowRadius: 6,
        elevation: 3,
      }}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {enrolled && (
        <View style={{
          backgroundColor: colors.success + '18',
          alignSelf: 'flex-start',
          borderRadius: 6,
          paddingHorizontal: 8,
          paddingVertical: 3,
          marginBottom: 8,
        }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: colors.success }}>
            <Ionicons name="checkmark-circle" size={11} color={colors.success} /> Matriculado
          </Text>
        </View>
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {instructorAvatar ? (
            <Image source={{ uri: instructorAvatar }} style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }} />
          ) : (
            <View style={{
              width: 48, height: 48, borderRadius: 24, marginRight: 12,
              backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center',
            }}>
              <Ionicons name="person" size={20} color={colors.textSecondary} />
            </View>
          )}
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{instructor}</Text>
            <Text style={{ fontSize: 15, color: colors.secondary, marginTop: 2, fontWeight: '500' }}>{className}</Text>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.primary }}>{time}</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>{duration} min</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: spacing.md }}>
        <Text style={{ fontSize: 14, color: colors.textSecondary }}>{studio}</Text>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: spotsColor, marginBottom: 4 }}>
            {availableSpots} <Text style={{ fontSize: 13, fontWeight: '400', color: colors.textSecondary }}>vagas</Text>
          </Text>
          <View style={{ height: 4, width: 80, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${occupancy}%`, backgroundColor: colors.primary }} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ClassCard;
