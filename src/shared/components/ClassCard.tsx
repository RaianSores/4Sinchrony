import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../theme';

interface ClassCardProps {
  instructor: string;
  instructorAvatar?: string;
  className: string;
  time: string;
  duration: number;
  studio: string;
  availableSpots: number;
  totalSpots: number;
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
  onPress,
}) => {
  const occupancy = Math.round(((totalSpots - availableSpots) / totalSpots) * 100);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        <View style={styles.instructorContainer}>
          {instructorAvatar ? (
            <Image source={{ uri: instructorAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={20} color={theme.colors.text} />
            </View>
          )}
          <View>
            <Text style={styles.instructor}>{instructor}</Text>
            <Text style={styles.className}>{className}</Text>
          </View>
        </View>

        <View style={styles.timeContainer}>
          <Text style={styles.time}>{time}</Text>
          <Text style={styles.duration}>{duration} min</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.studio}>{studio}</Text>

        <View style={styles.spotsContainer}>
          <Text style={styles.spots}>
            {availableSpots} <Text style={styles.spotsLabel}>vagas</Text>
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: `${occupancy}%` }]} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructor: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  className: {
    fontSize: 15,
    color: theme.colors.text,
    marginTop: 2,
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  duration: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: theme.spacing.md,
  },
  studio: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  spotsContainer: {
    alignItems: 'flex-end',
  },
  spots: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  spotsLabel: {
    fontSize: 13,
    fontWeight: 'normal',
    color: theme.colors.textSecondary,
  },
  progressBar: {
    height: 4,
    width: 80,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: theme.colors.text,
  },
});

export default ClassCard;
