import { env } from '../../config/env';

export const API_BASE_URL = env.API_URL || 'http://10.0.2.2:3333';
export const API_TIMEOUT = 10000;
