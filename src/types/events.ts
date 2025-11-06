export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  venueAddress: string;
  image: string;
  category: string;
  capacity: number;
  attendees: number;
  price: string;
  artists: Array<{
    name: string;
    role: string;
    image: string;
  }>;
  gallery: string[];
  highlights: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
}
