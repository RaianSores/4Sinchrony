import { useEffect } from 'react';
import { useTeacherSessionStore } from '../stores/useTeacherSessionStore';

export function useCurrentSession(classId: string | null) {
  const { currentSession, isLoading, isActive, startSession, endSession, getSession, clearSession } = useTeacherSessionStore();

  useEffect(() => {
    if (classId) {
      getSession(classId);
    } else {
      clearSession();
    }
  }, [classId, getSession, clearSession]);

  return {
    session: currentSession,
    isLoading,
    isActive,
    startSession: async () => classId && startSession(classId),
    endSession: async () => classId && endSession(classId),
  };
}
