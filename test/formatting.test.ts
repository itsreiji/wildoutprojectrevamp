import { format } from 'date-fns';

describe('formatting tests', () => {
    it('should format dates correctly', () => {
        const date = new Date('2025-12-05T12:00:00Z');
        expect(format(date, 'yyyy-MM-dd')).toBe('2025-12-05');
    });
});