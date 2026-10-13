import { describe, it, expect } from 'vitest';
import { BADGES, GYM_LEADERS, REQUIRED_BADGES_FOR_CHAMPION, getSpecies } from './index.js';
describe('Gym Leaders & Badge Progression', () => {
    it('defines all 5 badges with complete metadata', () => {
        const expected = ['meadow', 'azure', 'grove', 'magma', 'crown'];
        expected.forEach((bId) => {
            const badge = BADGES[bId];
            expect(badge).toBeDefined();
            expect(badge.id).toBe(bId);
            expect(badge.name).toBeTruthy();
            expect(badge.leader).toBeTruthy();
            expect(badge.icon).toBeTruthy();
            expect(typeof badge.color).toBe('number');
        });
    });
    it('defines 4 Regional Gym Leaders with valid teams and registered species', () => {
        expect(GYM_LEADERS).toHaveLength(4);
        GYM_LEADERS.forEach((leader) => {
            expect(BADGES[leader.badgeId]).toBeDefined();
            expect(leader.team.length).toBeGreaterThanOrEqual(2);
            expect(leader.tile.x).toBeGreaterThan(0);
            expect(leader.tile.y).toBeGreaterThan(0);
            leader.team.forEach((member) => {
                const spec = getSpecies(member.speciesId);
                expect(spec).toBeDefined();
                expect(member.level).toBeGreaterThanOrEqual(5);
                expect(member.nickname).toBeTruthy();
            });
        });
    });
    it('gates the Grand Champion behind the 4 regional badges', () => {
        expect(REQUIRED_BADGES_FOR_CHAMPION).toEqual(['meadow', 'azure', 'grove', 'magma']);
        expect(REQUIRED_BADGES_FOR_CHAMPION.includes('crown')).toBe(false);
        // Verify all required badges exist in BADGES
        REQUIRED_BADGES_FOR_CHAMPION.forEach((bId) => {
            expect(BADGES[bId]).toBeDefined();
        });
    });
});
