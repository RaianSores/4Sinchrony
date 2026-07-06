import { Alert, Platform } from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import { tokenStorage } from '../../core/storage';
import { captureError } from '../../lib/sentry';
import { API_URL } from '@env';

const BASE_URL = API_URL || 'https://sinchrony.onrender.com';

async function uploadToApi(uri: string, fileName: string, type: string): Promise<string> {
  const token = await tokenStorage.getToken();
  if (!token) throw new Error('Não autenticado');

  const formData = new FormData();
  formData.append('file', { uri, name: fileName, type } as any);

  const res = await fetch(`${BASE_URL}/api/upload/avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json().catch((parseError) => { captureError(parseError); return {}; });
  if (!res.ok) throw new Error(data.message || data.error || 'Falha no upload');
  return data.url as string;
}

export function pickAndUploadAvatar(): Promise<string | null> {
  return new Promise((resolve) => {
    Alert.alert('Foto de perfil', 'Escolha uma opção', [
      {
        text: 'Câmera',
        onPress: () => {
          launchCamera({ mediaType: 'photo', quality: 0.8, maxWidth: 800, maxHeight: 800 }, async (res: ImagePickerResponse) => {
            if (res.didCancel || res.errorCode) { resolve(null); return; }
            const asset = res.assets?.[0];
            if (!asset?.uri) { resolve(null); return; }
            try {
              const url = await uploadToApi(
                asset.uri,
                asset.fileName || `avatar_${Date.now()}.jpg`,
                asset.type || 'image/jpeg',
              );
              resolve(url);
            } catch (err) {
              captureError(err);
              Alert.alert('Erro', err instanceof Error ? err.message : 'Falha no upload');
              resolve(null);
            }
          });
        },
      },
      {
        text: 'Galeria',
        onPress: () => {
          launchImageLibrary({ mediaType: 'photo', quality: 0.8, maxWidth: 800, maxHeight: 800 }, async (res: ImagePickerResponse) => {
            if (res.didCancel || res.errorCode) { resolve(null); return; }
            const asset = res.assets?.[0];
            if (!asset?.uri) { resolve(null); return; }
            try {
              const url = await uploadToApi(
                asset.uri,
                asset.fileName || `avatar_${Date.now()}.jpg`,
                asset.type || 'image/jpeg',
              );
              resolve(url);
            } catch (err) {
              captureError(err);
              Alert.alert('Erro', err instanceof Error ? err.message : 'Falha no upload');
              resolve(null);
            }
          });
        },
      },
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}
