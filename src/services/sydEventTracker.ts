/**
 * Syd Agent Event Tracker - Omniscient Context System
 *
 * Tracks ALL user actions and sends them to backend for Syd Agent context.
 * Supports multi-user sessions with automatic session management.
 *
 * Usage:
 *   import { trackEvent } from '@/services/sydEventTracker';
 *   trackEvent('ateco_uploaded', { code: '62.01', source: 'manual' });
 */

const API_BASE = import.meta.env.VITE_API_BASE;

// Event types supported
export type EventType =
  | 'ateco_uploaded'
  | 'visura_extracted'
  | 'category_selected'
  | 'risk_evaluated'
  | 'assessment_question_answered'
  | 'report_generated'
  | 'syd_message_sent'
  | 'syd_message_received'
  | 'page_navigated';

interface SessionEvent {
  user_id: string;
  session_id: string;
  event_type: EventType;
  event_data: Record<string, any>;
}

interface SessionHistory {
  success: boolean;
  user_id: string;
  session: {
    session_id: string;
    phase: string;
    progress: number;
    start_time: string;
    last_activity: string;
  };
  events: Array<{
    event_type: string;
    event_data: Record<string, any>;
    timestamp: string;
  }>;
  summary: {
    total_events: number;
    event_counts: Record<string, number>;
    first_event: string;
    last_event: string;
  };
}

interface SessionSummary {
  success: boolean;
  user_id: string;
  session: {
    session_id: string;
    phase: string;
    progress: number;
  };
  recent_events: Array<{
    event_type: string;
    event_data: Record<string, any>;
    timestamp: string;
  }>;
  summary: {
    total_events: number;
    recent_count: number;
    older_count: number;
    event_counts: Record<string, number>;
  };
  optimization: {
    mode: string;
    tokens_saved: string;
    note: string;
  };
}

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create session ID for current user
 * Session ID is stored in localStorage and persists across page reloads
 */
function getSessionId(): string {
  const STORAGE_KEY = 'syd_session_id';

  let sessionId = localStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    sessionId = generateUUID();
    localStorage.setItem(STORAGE_KEY, sessionId);
    console.log('[SydTracker] New session created:', sessionId);
  }

  return sessionId;
}

/**
 * Get current user ID
 * Try to get from Firebase auth, fallback to localStorage anonymous ID
 */
function getUserId(): string {
  // TODO: Integrate with Firebase auth when available
  // For now, use anonymous ID stored in localStorage
  const STORAGE_KEY = 'syd_user_id';

  let userId = localStorage.getItem(STORAGE_KEY);

  if (!userId) {
    userId = `anonymous_${generateUUID()}`;
    localStorage.setItem(STORAGE_KEY, userId);
    console.log('[SydTracker] New user ID created:', userId);
  }

  return userId;
}

/**
 * Track an event and send to backend
 *
 * @param eventType - Type of event (see EventType)
 * @param eventData - Additional data for the event
 * @returns Promise<boolean> - Success status
 */
export async function trackEvent(
  eventType: EventType,
  eventData: Record<string, any> = {}
): Promise<boolean> {
  try {
    const userId = getUserId();
    const sessionId = getSessionId();

    const payload: SessionEvent = {
      user_id: userId,
      session_id: sessionId,
      event_type: eventType,
      event_data: {
        ...eventData,
        tracked_at: new Date().toISOString(),
      },
    };

    const response = await fetch(`${API_BASE}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[SydTracker] Failed to track event:', error);
      return false;
    }

    const result = await response.json();

    if (result.success) {
      console.log('[SydTracker] Event tracked:', eventType, eventData);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[SydTracker] Error tracking event:', error);
    return false;
  }
}

/**
 * Get complete session history for current user
 *
 * @returns Promise<SessionHistory | null>
 */
export async function getSessionHistory(): Promise<SessionHistory | null> {
  try {
    const userId = getUserId();

    const response = await fetch(`${API_BASE}/api/sessions/${encodeURIComponent(userId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[SydTracker] Failed to get history:', error);
      return null;
    }

    const result: SessionHistory = await response.json();

    if (result.success) {
      console.log('[SydTracker] History retrieved:', result.summary.total_events, 'events');
      return result;
    }

    return null;
  } catch (error) {
    console.error('[SydTracker] Error getting history:', error);
    return null;
  }
}

/**
 * Get optimized session summary (for Syd Agent context)
 * This is more efficient than getSessionHistory for AI context
 *
 * @param limit - Number of recent events to include (default: 10)
 * @returns Promise<SessionSummary | null>
 */
export async function getSessionSummary(limit: number = 10): Promise<SessionSummary | null> {
  try {
    const userId = getUserId();

    const response = await fetch(
      `${API_BASE}/api/sessions/${encodeURIComponent(userId)}/summary?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('[SydTracker] Failed to get summary:', error);
      return null;
    }

    const result: SessionSummary = await response.json();

    if (result.success) {
      console.log('[SydTracker] Summary retrieved:', result.summary.total_events, 'events');
      return result;
    }

    return null;
  } catch (error) {
    console.error('[SydTracker] Error getting summary:', error);
    return null;
  }
}

/**
 * Reset session (creates new session ID)
 * Use this when user logs out or starts new workflow
 */
export function resetSession(): void {
  const STORAGE_KEY = 'syd_session_id';
  localStorage.removeItem(STORAGE_KEY);
  console.log('[SydTracker] Session reset');
}

/**
 * Get current session info
 */
export function getSessionInfo(): { userId: string; sessionId: string } {
  return {
    userId: getUserId(),
    sessionId: getSessionId(),
  };
}

// Auto-track page navigation on module load
if (typeof window !== 'undefined') {
  // Track initial page load
  trackEvent('page_navigated', {
    path: window.location.pathname,
    referrer: document.referrer,
    timestamp: new Date().toISOString(),
  });

  // Track navigation changes (for SPAs)
  let lastPath = window.location.pathname;
  setInterval(() => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      trackEvent('page_navigated', {
        path: window.location.pathname,
        timestamp: new Date().toISOString(),
      });
    }
  }, 1000);
}
