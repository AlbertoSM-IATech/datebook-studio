import { useState, useEffect, useCallback } from 'react';
import { EditorialEvent, Reminder } from '@/types/calendar';
import { useToast } from '@/hooks/use-toast';
import { differenceInMinutes, format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TriggeredReminder {
  eventId: string;
  reminderId: string;
  triggeredAt: Date;
}

export function useReminders(events: EditorialEvent[]) {
  const { toast } = useToast();
  const [triggeredReminders, setTriggeredReminders] = useState<TriggeredReminder[]>([]);

  const checkReminders = useCallback(() => {
    const now = new Date();

    events.forEach(event => {
      event.reminders
        .filter(reminder => reminder.enabled)
        .forEach(reminder => {
          const reminderKey = `${event.id}-${reminder.id}`;
          const alreadyTriggered = triggeredReminders.some(
            tr => tr.eventId === event.id && tr.reminderId === reminder.id
          );

          if (alreadyTriggered) return;

          const triggerTime = new Date(event.startAt.getTime() - reminder.offsetMinutes * 60 * 1000);
          const diffMinutes = differenceInMinutes(triggerTime, now);

          // Trigger if within 1 minute window
          if (diffMinutes >= -1 && diffMinutes <= 1) {
            // Fire notification
            toast({
              title: '📅 Recordatorio',
              description: `${event.title} - ${format(event.startAt, "d 'de' MMMM 'a las' HH:mm", { locale: es })}`,
              duration: 10000,
            });

            // Mark as triggered
            setTriggeredReminders(prev => [
              ...prev,
              { eventId: event.id, reminderId: reminder.id, triggeredAt: now },
            ]);
          }
        });
    });
  }, [events, triggeredReminders, toast]);

  // Check reminders every minute
  useEffect(() => {
    const interval = setInterval(checkReminders, 60000);
    // Also check immediately on mount
    checkReminders();
    
    return () => clearInterval(interval);
  }, [checkReminders]);

  const clearTriggeredReminder = useCallback((eventId: string, reminderId: string) => {
    setTriggeredReminders(prev => 
      prev.filter(tr => !(tr.eventId === eventId && tr.reminderId === reminderId))
    );
  }, []);

  const getUpcomingReminders = useCallback((withinMinutes: number = 60): Array<{
    event: EditorialEvent;
    reminder: Reminder;
    triggerTime: Date;
  }> => {
    const now = new Date();
    const results: Array<{ event: EditorialEvent; reminder: Reminder; triggerTime: Date }> = [];

    events.forEach(event => {
      event.reminders
        .filter(reminder => reminder.enabled)
        .forEach(reminder => {
          const triggerTime = new Date(event.startAt.getTime() - reminder.offsetMinutes * 60 * 1000);
          const diffMinutes = differenceInMinutes(triggerTime, now);

          if (diffMinutes > 0 && diffMinutes <= withinMinutes) {
            results.push({ event, reminder, triggerTime });
          }
        });
    });

    return results.sort((a, b) => a.triggerTime.getTime() - b.triggerTime.getTime());
  }, [events]);

  return {
    triggeredReminders,
    clearTriggeredReminder,
    getUpcomingReminders,
    checkReminders,
  };
}
