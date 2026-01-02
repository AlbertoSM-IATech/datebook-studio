import { useEventsContext } from '@/contexts/EventsContext';

// Re-export the hook from context for backward compatibility
export function useEvents() {
  return useEventsContext();
}
