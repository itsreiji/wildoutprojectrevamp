export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
  bio: string;
  photoUrl?: string;
  status: 'active' | 'inactive';
}
