import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { captureError } from '../../../lib/sentry';

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  photo: string | null;
}

let configured = false;

export const googleSignInService = {
  configure(webClientId: string) {
    GoogleSignin.configure({
      webClientId,
      offlineAccess: false,
    });
    configured = true;
  },

  isConfigured() {
    return configured;
  },

  async signIn(): Promise<GoogleUser> {
    if (!configured) {
      throw new Error(
        'Google Sign-In nao configurado. Adicione GOOGLE_WEB_CLIENT_ID no .env e chame configure().'
      );
    }

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const user = response.data?.user;
      if (!user) throw new Error('Nenhum retorno do Google');

      return {
        id: user.id || 'google_' + Date.now(),
        name: user.name || 'Sem nome',
        email: user.email || '',
        photo: user.photo || null,
      };
    } catch (error: any) {
      captureError(error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('Login cancelado');
      }
      if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('Login em andamento');
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play Services nao disponivel');
      }
      throw error;
    }
  },

  async signOut() {
    if (configured) {
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        captureError(error);
      }
    }
  },
};
