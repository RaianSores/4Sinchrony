import * as Sentry from '@sentry/react-native';
import { SENTRY_DSN } from '@env';

export function initSentry(): void {
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  }
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (__DEV__) {
    console.error('[Sentry]', error, context);
  }
  if (SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (context) scope.setExtras(context);
      Sentry.captureException(error);
    });
  }
}
