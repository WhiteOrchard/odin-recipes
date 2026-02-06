import { describe, it, expect } from 'vitest';
import { APP_NAME, APP_TAGLINE, DEMO_EMAIL } from '../brand/constants';

describe('Smoke Tests', () => {
  it('has correct app name constant', () => {
    expect(APP_NAME).toBe('Concrete');
  });

  it('has app tagline defined', () => {
    expect(APP_TAGLINE).toBeTruthy();
    expect(APP_TAGLINE.length).toBeGreaterThan(0);
  });

  it('has demo email defined', () => {
    expect(DEMO_EMAIL).toBe('demo@concrete.app');
  });

  it('basic math works (sanity check)', () => {
    expect(1 + 1).toBe(2);
  });
});
