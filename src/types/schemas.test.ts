
import { describe, it, expect } from 'vitest';
import { HeroSchema, EventSchema, TeamMemberSchema } from './schemas';

describe('Schemas Validation', () => {
  describe('HeroSchema', () => {
    it('should validate valid hero data', () => {
      const validHero = {
        title: 'Welcome',
        subtitle: 'To WildOut',
        description: 'The best platform',
        stats: {
          events: '10+',
          members: '100+',
          partners: '5+'
        }
      };
      const result = HeroSchema.safeParse(validHero);
      expect(result.success).toBe(true);
    });

    it('should fail if title is missing', () => {
      const invalidHero = {
        subtitle: 'No Title',
      };
      const result = HeroSchema.safeParse(invalidHero);
      expect(result.success).toBe(false);
    });
  });

  describe('EventSchema', () => {
    it('should validate valid event data', () => {
      const validEvent = {
        id: '1',
        title: 'Concert',
        description: 'Big concert',
        date: '2023-12-25',
        time: '20:00',
        venue: 'Arena',
        venueAddress: 'Street 1',
        image: 'https://example.com/image.jpg',
        category: 'Music',
        capacity: 100,
        attendees: 50,
        price: 'IDR 100k',
        artists: [],
        gallery: [],
        highlights: [],
        status: 'upcoming',
      };
      const result = EventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should fail if capacity is not a number', () => {
      const invalidEvent = {
        id: '1',
        title: 'Concert',
        description: 'Big concert',
        date: '2023-12-25',
        time: '20:00',
        venue: 'Arena',
        venueAddress: 'Street 1',
        image: 'https://example.com/image.jpg',
        category: 'Music',
        capacity: 'not-a-number',
        attendees: 50,
        price: 'IDR 100k',
        artists: [],
        gallery: [],
        highlights: [],
        status: 'upcoming',
      };
      const result = EventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe('TeamMemberSchema', () => {
    it('should validate valid team member', () => {
      const validMember = {
        id: '1',
        name: 'John Doe',
        role: 'CEO',
        email: 'john@example.com',
        instagram: '@johndoe',
        bio: 'Legendary developer',
        status: 'active'
      };
      const result = TeamMemberSchema.safeParse(validMember);
      expect(result.success).toBe(true);
    });

    it('should fail if email is invalid', () => {
      const invalidMember = {
        id: '1',
        name: 'John Doe',
        role: 'CEO',
        email: 'not-an-email',
        bio: 'Legendary developer',
        status: 'active'
      };
      const result = TeamMemberSchema.safeParse(invalidMember);
      expect(result.success).toBe(false);
    });
  });
});
