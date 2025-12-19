/**
 * React hooks for interacting with Inngest
 */

import { useState, useCallback } from 'react';
import { inngestClient, type WildoutEvents } from './client';

/**
 * Hook to trigger Inngest events from React components
 */
export function useInngest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendEvent = useCallback(async <T extends keyof WildoutEvents>(
    eventName: T,
    data: WildoutEvents[T]
  ) => {
    setLoading(true);
    setError(null);

    try {
      // In development, you might want to send events directly
      // In production, you'd typically send to your API endpoint
      const result = await inngestClient.send({
        name: eventName as string,
        data,
      });

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send event');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sendEvent,
    loading,
    error,
  };
}

/**
 * Hook for triggering user registration events
 */
export function useUserRegistration() {
  const { sendEvent, loading, error } = useInngest();

  const triggerWelcomeEmail = useCallback(async (userId: string, email: string) => {
    return sendEvent('user/registered', {
      userId,
      email,
      timestamp: Date.now(),
    });
  }, [sendEvent]);

  return {
    triggerWelcomeEmail,
    loading,
    error,
  };
}

/**
 * Hook for triggering event creation events
 */
export function useEventCreation() {
  const { sendEvent, loading, error } = useInngest();

  const triggerEventCreated = useCallback(async (eventId: string, title: string, createdBy: string) => {
    return sendEvent('event/created', {
      eventId,
      title,
      createdBy,
    });
  }, [sendEvent]);

  return {
    triggerEventCreated,
    loading,
    error,
  };
}

/**
 * Hook for triggering audit log events
 */
export function useAuditLog() {
  const { sendEvent, loading, error } = useInngest();

  const logAction = useCallback(async (action: string, userId: string, details: Record<string, any> = {}) => {
    return sendEvent('audit/log', {
      action,
      userId,
      details,
    });
  }, [sendEvent]);

  return {
    logAction,
    loading,
    error,
  };
}

/**
 * Hook for triggering email events
 */
export function useEmail() {
  const { sendEvent, loading, error } = useInngest();

  const sendEmail = useCallback(async (to: string, subject: string, body: string) => {
    return sendEvent('email/send', {
      to,
      subject,
      body,
    });
  }, [sendEvent]);

  return {
    sendEmail,
    loading,
    error,
  };
}