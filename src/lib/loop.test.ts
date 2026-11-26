import { describe, expect, it } from 'vitest';
import { loopCopies, middleCopy, recentre, slideAt, wrapPosition } from './loop';

describe('loopCopies', () => {
  it('renders an odd number of copies with enough room to fling either way', () => {
    // 4 cards, 304px apart: a copy is 1216px, so 3 copies per side for 3000px.
    expect(loopCopies(4, 304)).toBe(7);
    // A long row needs only one copy either side.
    expect(loopCopies(20, 304)).toBe(3);
  });

  it('copes with empty rows', () => {
    expect(loopCopies(0, 304)).toBe(1);
  });
});

describe('wrapPosition', () => {
  it('maps every copy of a slide to the same place', () => {
    expect(wrapPosition(1, 4)).toBe(1);
    expect(wrapPosition(5, 4)).toBe(1);
    expect(wrapPosition(13, 4)).toBe(1);
    expect(wrapPosition(-3, 4)).toBe(1);
  });

  it('runs from the last slide back round to the first', () => {
    expect(wrapPosition(3.5, 4)).toBe(3.5);
    expect(wrapPosition(4, 4)).toBe(0);
    expect(wrapPosition(-0.25, 4)).toBe(3.75);
  });

  it('never returns the count itself', () => {
    expect(wrapPosition(4 - 1e-12, 4)).toBe(0);
  });
});

describe('slideAt', () => {
  it('names the slide nearest the scroll position', () => {
    expect(slideAt(12, 4)).toBe(0);
    expect(slideAt(13.4, 4)).toBe(1);
    expect(slideAt(15.6, 4)).toBe(0);
    expect(slideAt(-0.4, 4)).toBe(0);
  });
});

describe('recentre', () => {
  const copies = 7; // middle copy = 3, slides 12–15 for a row of 4

  it('stays put in the middle copy', () => {
    expect(middleCopy(copies)).toBe(3);
    expect(recentre(12, 4, copies)).toBeNull();
    expect(recentre(15, 4, copies)).toBeNull();
  });

  it('jumps to the same slide in the middle copy', () => {
    expect(recentre(16, 4, copies)).toBe(12);
    expect(recentre(21, 4, copies)).toBe(13);
    expect(recentre(3, 4, copies)).toBe(15);
  });

  it('keeps any fraction of a slide', () => {
    expect(recentre(16.25, 4, copies)).toBe(12.25);
  });
});
