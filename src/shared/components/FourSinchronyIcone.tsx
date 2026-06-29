import React from 'react';
import { Image } from 'react-native';

const iconeImg = require('../../assets/icons/4SINCHRONYICONE.jpg');

interface Props {
  size: number;
  color?: string;
}

export const FourSinchronyIcone: React.FC<Props> = ({ size }) => (
  <Image
    source={iconeImg}
    style={{ width: size, height: size }}
    resizeMode="cover"
    fadeDuration={0}
  />
);
