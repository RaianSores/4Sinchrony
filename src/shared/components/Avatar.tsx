import React from 'react';
import {
  View, Text, Image, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PALETTE = ['#ED7921', '#1287AF', '#8B5CF6', '#059669', '#DC2626', '#0891B2', '#D97706'];

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function bgColor(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

const SIZES = {
  xs:  { box: 28,  font: 10 },
  sm:  { box: 36,  font: 13 },
  md:  { box: 48,  font: 16 },
  lg:  { box: 80,  font: 28 },
  xl:  { box: 110, font: 40 },
};

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: keyof typeof SIZES;
  style?: object;
}

export function Avatar({ uri, name, size = 'md', style }: AvatarProps) {
  const { box, font } = SIZES[size];
  const bg = bgColor(name);
  const radius = box / 2;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[{ width: box, height: box, borderRadius: radius }, style]}
      />
    );
  }

  return (
    <View
      style={[
        { width: box, height: box, borderRadius: radius, backgroundColor: bg,
          alignItems: 'center', justifyContent: 'center' },
        style,
      ]}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: font }}>
        {initials(name)}
      </Text>
    </View>
  );
}

interface AvatarUploadProps extends AvatarProps {
  onPress: () => void;
  uploading?: boolean;
}

export function AvatarUpload({ uri, name, size = 'xl', onPress, uploading = false, style }: AvatarUploadProps) {
  const { box } = SIZES[size];
  const radius = box / 2;

  return (
    <TouchableOpacity onPress={onPress} disabled={uploading} activeOpacity={0.8} style={style}>
      <Avatar uri={uri} name={name} size={size} />
      <View style={[StyleSheet.absoluteFill, {
        borderRadius: radius,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
      }]}>
        {uploading
          ? <ActivityIndicator color="#fff" />
          : <Ionicons name="camera-outline" size={box * 0.28} color="#fff" />
        }
      </View>
    </TouchableOpacity>
  );
}
