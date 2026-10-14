import { describe, it, expect } from 'vitest';
import {
  WAYPOINTS,
  DEFAULT_UNLOCKED_WAYPOINTS,
  getWaypoint,
  getWaypointForZone,
  canFastTravel,
  discoverWaypoint
} from './waypoints.js';

describe('Waypoints & Fast Travel System (Pillar 5)', () => {
  it('has valid coordinates within the 80x60 world map for all waypoints', () => {
    expect(WAYPOINTS.length).toBeGreaterThanOrEqual(6);
    WAYPOINTS.forEach((wp) => {
      expect(wp.tile.x).toBeGreaterThanOrEqual(0);
      expect(wp.tile.x).toBeLessThan(80);
      expect(wp.tile.y).toBeGreaterThanOrEqual(0);
      expect(wp.tile.y).toBeLessThan(60);
      expect(wp.name).toBeDefined();
      expect(wp.icon).toBeDefined();
      expect(wp.zoneId).toBeDefined();
    });
  });

  it('provides Pallet Plaza as default unlocked home waypoint', () => {
    expect(DEFAULT_UNLOCKED_WAYPOINTS).toContain('pallet_town');
    const pallet = getWaypoint('pallet_town');
    expect(pallet).toBeDefined();
    expect(pallet?.tile).toEqual({ x: 10, y: 10 });
  });

  it('correctly associates map zones with their respective waypoints', () => {
    expect(getWaypointForZone('pallet_plaza')?.id).toBe('pallet_town');
    expect(getWaypointForZone('route1')?.id).toBe('route1');
    expect(getWaypointForZone('lakeshore')?.id).toBe('lake_azure');
    expect(getWaypointForZone('sunken_grotto')?.id).toBe('lake_azure');
    expect(getWaypointForZone('old_grove')?.id).toBe('old_grove');
    expect(getWaypointForZone('ember_crags')?.id).toBe('ember_crags');
    expect(getWaypointForZone('celestial_summit')?.id).toBe('pagoda_dojo');
    expect(getWaypointForZone('dojo_plateau')?.id).toBe('pagoda_dojo');
    expect(getWaypointForZone('unknown_zone')).toBeUndefined();
  });

  it('enforces fast travel unlock rules', () => {
    const initialUnlocked = ['pallet_town'];
    expect(canFastTravel(initialUnlocked, 'pallet_town')).toBe(true);
    expect(canFastTravel(initialUnlocked, 'lake_azure')).toBe(false);

    // Discover new waypoint
    const res1 = discoverWaypoint(initialUnlocked, 'lake_azure');
    expect(res1.isNew).toBe(true);
    expect(res1.unlocked).toEqual(['pallet_town', 'lake_azure']);
    expect(canFastTravel(res1.unlocked, 'lake_azure')).toBe(true);

    // Re-discovering does not duplicate
    const res2 = discoverWaypoint(res1.unlocked, 'lake_azure');
    expect(res2.isNew).toBe(false);
    expect(res2.unlocked).toEqual(['pallet_town', 'lake_azure']);

    // Attempting invalid waypoint returns false
    const resInvalid = discoverWaypoint(res1.unlocked, 'non_existent');
    expect(resInvalid.isNew).toBe(false);
  });
});
