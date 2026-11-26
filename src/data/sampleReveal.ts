import day09Reveal from '../assets/reveal/day-09.png';
import type { RevealImage } from './types';

/**
 * The only static reveal artwork so far ("09" spelled out in letters). It's
 * the fallback where the letter motion can't run, and the Create preview.
 */
export const sampleReveal: RevealImage = {
  src: day09Reveal,
  alt: 'Today’s reveal: the day number spelled out in letters that hide the movie title',
  // The exported asset is a full 1440×1160 @2x frame; this crop matches the Figma layer.
  crop: { width: '187.5%', height: '218.46%', left: '-43.75%', top: '-28.44%' },
};
