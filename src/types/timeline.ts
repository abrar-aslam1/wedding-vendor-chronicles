export interface TimelineEventType {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  date: string;
  completed: boolean;
  created_at: string;
}
