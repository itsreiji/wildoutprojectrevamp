
import { describe, it, expect } from 'vitest';
import { HeroSchema, EventSchema, TeamMemberSchema } from './schemas';

describe('Schemas Validation', () => {
  describe('HeroSchema', () => {
    it('should validate valid hero data', () => {
      const validHero = {
        title: 'Welcome',
        subtitle: 'To WildOut',
        image_url: 'https://example.com/image.jpg',
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
        title: 'Concert',
        date: '2023-12-25T20:00:00Z',
        capacity: 100,
        price: 50,
        status: 'published',
      };
      const result = EventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('should fail if capacity is negative', () => {
      const invalidEvent = {
        title: 'Concert',
        capacity: -10,
      };
      const result = EventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it('should default status to published', () => {
      const event = { title: 'New Event' };
      const result = EventSchema.parse(event);
      expect(result.status).toBe('published');
    });
  });

  describe('TeamMemberSchema', () => {
    it('should validate valid team member', () => {
      const validMember = {
        name: 'John Doe',
        role: 'CEO',
        social_links: {
          twitter: 'https://twitter.com/johndoe',
        },
      };
      const result = TeamMemberSchema.safeParse(validMember);
      if (!result.success) {
        console.log(JSON.stringify(result.error, null, 2));
      }
      expect(result.success).toBe(true);
    });

    it('should fail if social link is not a URL', () => {
      const invalidMember = {
        name: 'John Doe',
        social_links: {
          twitter: 'not-a-url',
        },
      };
      const result = TeamMemberSchema.safeParse(invalidMember);
      expect(result.success).toBe(false);
    });
  });
});
