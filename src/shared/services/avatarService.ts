import { launchImageLibrary, launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import { tokenStorage } from '../../core/storage';
import { captureError } from '../../lib/sentry';
import type { AlertConfig } from '../components/AlertModal';
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

// A `AlertModal` fecha com uma animação de fade (~300ms) — diferente do `Alert.alert` nativo
// que usada antes, que era um diálogo do próprio Android e fechava instantaneamente antes do
// `onPress` disparar. Abrir a câmera/galeria no mesmo tick do fechamento do modal customizado
// pode colidir com essa animação no Android e a câmera simplesmente não abre. Esse atraso dá
// tempo do modal terminar de sumir antes de abrir a câmera/galeria.
const MODAL_CLOSE_DELAY_MS = 350;

// Recebe `showAlert` do chamador (via `useAppAlert()`) em vez de usar o `Alert.alert` nativo do
// react-native — esse serviço não é um componente/hook, então não pode chamar `useAppAlert()`
// ele mesmo; o modal de escolha (Câmera/Galeria/Cancelar) e o de erro usam o modal
// personalizado do app, igual ao resto da interface.
export function pickAndUploadAvatar(showAlert: (config: AlertConfig) => void): Promise<string | null> {
  return new Promise((resolve) => {
    const handlePicked = async (res: ImagePickerResponse) => {
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
        showAlert({ title: 'Erro', message: err instanceof Error ? err.message : 'Falha no upload' });
        resolve(null);
      }
    };

    showAlert({
      title: 'Foto de perfil',
      message: 'Escolha uma opção',
      buttons: [
        {
          text: 'Câmera',
          onPress: () => {
            setTimeout(() => {
              launchCamera({ mediaType: 'photo', quality: 0.8, maxWidth: 800, maxHeight: 800 }, handlePicked);
            }, MODAL_CLOSE_DELAY_MS);
          },
        },
        {
          text: 'Galeria',
          onPress: () => {
            setTimeout(() => {
              launchImageLibrary({ mediaType: 'photo', quality: 0.8, maxWidth: 800, maxHeight: 800 }, handlePicked);
            }, MODAL_CLOSE_DELAY_MS);
          },
        },
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
      ],
    });
  });
}
