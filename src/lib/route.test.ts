import { describe, expect, it } from 'vitest';
import { parseRoute } from './route';

describe('parseRoute', () => {
  it('routes the create page', () => {
    expect(parseRoute('#/create')).toBe('create');
    expect(parseRoute('#create')).toBe('create');
    expect(parseRoute('#/create?view=list')).toBe('create');
  });

  it('falls back to home for empty or unknown hashes', () => {
    expect(parseRoute('')).toBe('home');
    expect(parseRoute('#/')).toBe('home');
    expect(parseRoute('#/calendars')).toBe('home');
  });
});
