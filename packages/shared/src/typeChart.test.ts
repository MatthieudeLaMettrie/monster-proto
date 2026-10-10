import { describe, it, expect } from 'vitest';
import { ELEMENT_TYPES, getTypeMultiplier } from '../src/index.js';

describe('Type Effectiveness Chart', () => {
  it('contains exactly 8 core monster types', () => {
    expect(ELEMENT_TYPES).toHaveLength(8);
  });

  it('calculates starter triangle effectiveness correctly', () => {
    expect(getTypeMultiplier('Water', 'Fire')).toBe(2.0);
    expect(getTypeMultiplier('Grass', 'Water')).toBe(2.0);
    expect(getTypeMultiplier('Fire', 'Grass')).toBe(2.0);

    expect(getTypeMultiplier('Fire', 'Water')).toBe(0.5);
    expect(getTypeMultiplier('Water', 'Grass')).toBe(0.5);
    expect(getTypeMultiplier('Grass', 'Fire')).toBe(0.5);
  });

  it('calculates psychic triangle and fly/dragon effectiveness correctly', () => {
    expect(getTypeMultiplier('Psy', 'Fight')).toBe(2.0);
    expect(getTypeMultiplier('Dark', 'Psy')).toBe(2.0);
    expect(getTypeMultiplier('Fight', 'Dark')).toBe(2.0);

    expect(getTypeMultiplier('Fly', 'Grass')).toBe(2.0);
    expect(getTypeMultiplier('Fly', 'Fight')).toBe(2.0);
    expect(getTypeMultiplier('Dragon', 'Dragon')).toBe(2.0);
  });

  it('returns neutral 1.0 for unspecified matchups', () => {
    expect(getTypeMultiplier('Normal', 'Fire')).toBe(1.0);
    expect(getTypeMultiplier('Fire', 'Psy')).toBe(1.0);
  });
});
