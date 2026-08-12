import React from 'react';
import { Image } from 'react-native';

// PNG, não JPG: o JPG original (mesmo pixel a pixel, reconvertido e confirmado idêntico)
// não renderizava no iOS — decodificava em qualquer decodificador padrão (Android, Jimp),
// mas ficava em branco no UIImage/ImageIO do iOS. PNG elimina essa ambiguidade de formato.
const iconeImg = require('../../../ios/assets/icons/4SINCHRONYICONE.png');

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
