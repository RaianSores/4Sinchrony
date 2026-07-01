import React from 'react';
import { Image } from 'react-native';

const img = require('../../assets/images/4SINCHRONYMARCADAGUA.png');

interface Props {
  size: number;
  color?: string;
}

export const FourSinchronyImage: React.FC<Props> = ({ size }) => (
  <Image
    source={img}
    style={{ width: size, height: size }}
    resizeMode="contain"
    fadeDuration={0}
  />
);
