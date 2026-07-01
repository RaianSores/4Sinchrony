import { api } from '../../http/api';
import { captureError } from '../../../lib/sentry';
import type {
  VerifyEmailData,
  VerifyEmailResponse,
  ResendVerificationData,
  ResendVerificationResponse,
} from '../types';

export const verifyEmailService = {
  async verifyEmail(data: VerifyEmailData): Promise<VerifyEmailResponse> {
    const res = await api.post<VerifyEmailResponse>('/auth/verify-email', data);
    return res.data;
  },

  async resendVerification(data: ResendVerificationData): Promise<ResendVerificationResponse> {
    const res = await api.post<ResendVerificationResponse>('/auth/resend-verification', data);
    return res.data;
  },
};
