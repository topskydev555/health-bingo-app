export interface Participant {
  id: string;
  user_id: string | null;
  email: string;
  status: 'joined' | 'pending';
  is_organizer: boolean;
  points: number;
  wild_cards: number;
  joined_at?: string;
  user: {
    first_name: string | null;
    last_name: string | null;
    display_name?: string | null;
    country?: string | null;
    timezone?: string | null;
    image?: string | null;
  } | null;
}
