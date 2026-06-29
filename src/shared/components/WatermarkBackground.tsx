import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const watermarkImg = require('../../assets/images/4SINCHRONYMARCADAGUA.png');

export const WatermarkBackground: React.FC = () => (
  <View style={styles.container} pointerEvents="none">
    <Image
      source={watermarkImg}
      style={styles.image}
      resizeMode="contain"
      fadeDuration={0}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%',
    aspectRatio: 1742 / 558,
    opacity: 0.08,
  },
});
