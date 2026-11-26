import { describe, expect, it } from 'vitest';
import { isCorrectGuess, normalizeTitleForGuess } from './guessMatch';

describe('normalizeTitleForGuess', () => {
  it('drops case, accents, punctuation and a leading article', () => {
    expect(normalizeTitleForGuess('Amélie')).toBe('amelie');
    expect(normalizeTitleForGuess('The Grand Budapest Hotel')).toBe('grand budapest hotel');
    expect(normalizeTitleForGuess('Wallace & Gromit: Vengeance Most Fowl')).toBe('wallace and gromit vengeance most fowl');
    expect(normalizeTitleForGuess('Rosemary’s Baby')).toBe('rosemary s baby');
    expect(normalizeTitleForGuess('8½')).toBe('8 1 2');
    expect(normalizeTitleForGuess('Three Idiots')).toBe('3 idiots');
  });
});

describe('isCorrectGuess', () => {
  it('accepts exact titles in any case, with or without "The"', () => {
    expect(isCorrectGuess('klaus', 'Klaus')).toBe(true);
    expect(isCorrectGuess('grand budapest hotel', 'The Grand Budapest Hotel')).toBe(true);
    expect(isCorrectGuess('The Thing', 'The Thing')).toBe(true);
  });

  it('accepts the usual spellings of symbols and accents', () => {
    expect(isCorrectGuess('Amelie', 'Amélie')).toBe(true);
    expect(isCorrectGuess('wallace and gromit vengeance most fowl', 'Wallace & Gromit: Vengeance Most Fowl')).toBe(true);
    expect(isCorrectGuess('8 1/2', '8½')).toBe(true);
    expect(isCorrectGuess("Rosemary's Baby", 'Rosemary’s Baby')).toBe(true);
    expect(isCorrectGuess("It's a wonderful life", 'It’s a Wonderful Life')).toBe(true);
    expect(isCorrectGuess('three idiots', '3 Idiots')).toBe(true);
    expect(isCorrectGuess('Paddington two', 'Paddington 2')).toBe(true);
    expect(isCorrectGuess('eight and a half', '8½')).toBe(false); // "and a half" isn't mapped; "8 1/2" and "8½" are
  });

  it('forgives a small typo, more in longer titles', () => {
    expect(isCorrectGuess('Ratatouile', 'Ratatouille')).toBe(true);
    expect(isCorrectGuess('Edward Sissorhands', 'Edward Scissorhands')).toBe(true);
    expect(isCorrectGuess('Groundhog Dya', 'Groundhog Day')).toBe(true);
  });

  it('rejects different movies, including near-misses on very short titles', () => {
    expect(isCorrectGuess('Alien', 'House')).toBe(false);
    expect(isCorrectGuess('Aliens', 'Alien')).toBe(false);
    expect(isCorrectGuess('Carl', 'Carol')).toBe(false);
    expect(isCorrectGuess('Fargo 2', 'Fargo')).toBe(false);
    expect(isCorrectGuess('Little Woman', 'Little Women')).toBe(true);
    expect(isCorrectGuess('Psycho 2', 'Psycho')).toBe(false);
    expect(isCorrectGuess('Paddington', 'Paddington 2')).toBe(false);
    expect(isCorrectGuess('The 40 Blows', 'The 400 Blows')).toBe(false);
    expect(isCorrectGuess('', 'Klaus')).toBe(false);
  });
});
