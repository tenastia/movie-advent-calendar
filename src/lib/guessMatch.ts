/**
 * Lenient title matching for guesses. Case, accents, punctuation, "&" vs
 * "and", "½" vs "1/2", number words ("three") vs digits and a leading "The" /
 * "A" / "An" don't matter, and a small typo still counts in longer titles.
 * Numbers must match exactly, so a sequel ("Paddington 2") isn't the original.
 */
const NUMBER_WORDS: Record<string, string> = {
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  ten: '10',
};

export function normalizeTitleForGuess(title: string): string {
  return title
    .replace(/½/g, ' 1/2 ') // before NFKD, which would turn it into "1⁄2"
    .normalize('NFKD')
    .replace(/\p{M}/gu, '') // accents: "Amélie" → "Amelie"
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ') // punctuation and symbols → spaces
    .trim()
    .split(' ')
    .map((word) => NUMBER_WORDS[word] ?? word)
    .join(' ')
    .replace(/^(the|a|an) /, '');
}

const digitsOf = (s: string) => s.match(/\d+/g)?.join(' ') ?? '';

/** Edit distance (insertions, deletions, substitutions). */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
}

export function isCorrectGuess(guess: string, title: string): boolean {
  const g = normalizeTitleForGuess(guess);
  const t = normalizeTitleForGuess(title);
  if (!g || !t) return false;
  if (g === t) return true;
  // Spaces never count against you ("night on earth" = "nightonearth").
  if (g.replace(/ /g, '') === t.replace(/ /g, '')) return true;
  if (digitsOf(g) !== digitsOf(t)) return false;
  // No typos in short titles ("Aliens" isn't "Alien"); one from 6 letters, two from 11.
  const allowed = t.length <= 5 ? 0 : t.length <= 10 ? 1 : 2;
  return levenshtein(g, t) <= allowed;
}
