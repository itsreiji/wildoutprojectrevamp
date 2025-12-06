import { describe, it, expect } from 'vitest'
import { dummyDataService } from '../../services/dummyDataService'

describe('dummyDataService', () => {
  describe('getEvents', () => {
    it('should return an array of events', () => {
      const events = dummyDataService.getEvents()
      expect(Array.isArray(events)).toBe(true)
      expect(events.length).toBeGreaterThan(0)
    })

    it('should return events with required properties', () => {
      const events = dummyDataService.getEvents()
      const firstEvent = events[0]
      
      expect(firstEvent).toHaveProperty('id')
      expect(firstEvent).toHaveProperty('title')
      expect(firstEvent).toHaveProperty('date')
      expect(firstEvent).toHaveProperty('time')
      expect(firstEvent).toHaveProperty('venue')
      expect(firstEvent).toHaveProperty('image')
      expect(firstEvent).toHaveProperty('status')
    })

    it('should return events with valid status values', () => {
      const events = dummyDataService.getEvents()
      events.forEach(event => {
        expect(['upcoming', 'past', 'cancelled', 'ongoing']).toContain(event.status)
      })
    })

    it('should return events with proper date format', () => {
      const events = dummyDataService.getEvents()
      events.forEach(event => {
        expect(event.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })
    })
  })

  describe('getPartners', () => {
    it('should return an array of partners', () => {
      const partners = dummyDataService.getPartners()
      expect(Array.isArray(partners)).toBe(true)
      expect(partners.length).toBeGreaterThan(0)
    })

    it('should return partners with required properties', () => {
      const partners = dummyDataService.getPartners()
      const firstPartner = partners[0]
      
      expect(firstPartner).toHaveProperty('id')
      expect(firstPartner).toHaveProperty('name')
      expect(firstPartner).toHaveProperty('category')
      expect(firstPartner).toHaveProperty('status')
    })

    it('should return partners with valid status values', () => {
      const partners = dummyDataService.getPartners()
      partners.forEach(partner => {
        expect(['active', 'inactive']).toContain(partner.status)
      })
    })

    it('should return partners with proper social links structure', () => {
      const partners = dummyDataService.getPartners()
      partners.forEach(partner => {
        expect(typeof partner.social_links).toBe('object')
      })
    })
  })

  describe('getGallery', () => {
    it('should return an array of gallery images', () => {
      const gallery = dummyDataService.getGallery()
      expect(Array.isArray(gallery)).toBe(true)
      expect(gallery.length).toBeGreaterThan(0)
    })

    it('should return gallery items with required properties', () => {
      const gallery = dummyDataService.getGallery()
      const firstItem = gallery[0]
      
      expect(firstItem).toHaveProperty('id')
      expect(firstItem).toHaveProperty('title')
      expect(firstItem).toHaveProperty('category')
      expect(firstItem).toHaveProperty('status')
      expect(firstItem).toHaveProperty('image_url')
    })

    it('should return gallery items with valid status values', () => {
      const gallery = dummyDataService.getGallery()
      gallery.forEach(item => {
        expect(['published', 'draft', 'archived']).toContain(item.status)
      })
    })

    it('should return gallery items with proper image URLs', () => {
      const gallery = dummyDataService.getGallery()
      gallery.forEach(item => {
        if (item.image_url) {
          expect(typeof item.image_url).toBe('string')
          expect(item.image_url.length).toBeGreaterThan(0)
        }
      })
    })
  })

  describe('getTeam', () => {
    it('should return an array of team members', () => {
      const team = dummyDataService.getTeam()
      expect(Array.isArray(team)).toBe(true)
      expect(team.length).toBeGreaterThan(0)
    })

    it('should return team members with required properties', () => {
      const team = dummyDataService.getTeam()
      const firstMember = team[0]
      
      expect(firstMember).toHaveProperty('id')
      expect(firstMember).toHaveProperty('name')
      expect(firstMember).toHaveProperty('title')
      expect(firstMember).toHaveProperty('status')
    })

    it('should return team members with valid status values', () => {
      const team = dummyDataService.getTeam()
      team.forEach(member => {
        expect(['active', 'inactive']).toContain(member.status)
      })
    })

    it('should return team members with proper social links structure', () => {
      const team = dummyDataService.getTeam()
      team.forEach(member => {
        expect(typeof member.social_links).toBe('object')
      })
    })
  })

  describe('data consistency', () => {
    it('should return consistent data structure across calls', () => {
      const events1 = dummyDataService.getEvents()
      const events2 = dummyDataService.getEvents()
      
      expect(events1.length).toBe(events2.length)
      expect(events1[0].title).toBe(events2[0].title)
    })

    it('should handle metadata normalization properly', () => {
      const events = dummyDataService.getEvents()
      events.forEach(event => {
        expect(typeof event.metadata).toBe('object')
        expect(event.metadata).not.toBe(null)
      })
    })
  })
})
