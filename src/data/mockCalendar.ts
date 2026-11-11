import day09Reveal from '../assets/reveal/day-09.png';
import type { Calendar } from './types';

/**
 * Placeholder data matching the Figma home page mock.
 * Replace with real calendar data once there is a backend.
 */
export const mockCalendar: Calendar = {
  owner: 'Nastia',
  revealTime: '19:00',
  attemptsPerDay: 3,
  today: {
    day: 9,
    reveal: {
      src: day09Reveal,
      alt: 'Today’s reveal: the number 09 spelled out in letters that hide the movie title',
      // The exported asset is a full 1440×1160 @2x frame; this crop matches the Figma layer.
      crop: { width: '187.5%', height: '218.46%', left: '-43.75%', top: '-28.44%' },
    },
  },
  days: [
    { day: 1, title: 'The secret life of Walter Mitty', status: 'guessed' },
    { day: 2, title: 'Klaus', status: 'missed' },
    { day: 3, title: 'The grand Budapest hotel', status: 'guessed' },
    { day: 9, title: 'The secret life of Walter Mitty', status: 'guessed' },
  ],
};
