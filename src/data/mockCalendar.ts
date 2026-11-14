import day09Reveal from '../assets/reveal/day-09.png';
import type { Calendar, RevealImage } from './types';

/**
 * Placeholder data matching the Figma mocks.
 * Replace with real calendar data once there is a backend.
 */

// The only reveal artwork so far ("09" spelled out in letters). The other
// calendars reuse it as a placeholder until they have their own.
const sampleReveal: RevealImage = {
  src: day09Reveal,
  alt: 'Today’s reveal: the day number spelled out in letters that hide the movie title',
  // The exported asset is a full 1440×1160 @2x frame; this crop matches the Figma layer.
  crop: { width: '187.5%', height: '218.46%', left: '-43.75%', top: '-28.44%' },
};

export const mockCalendar: Calendar = {
  id: 'nastias-calendar',
  name: 'Nastia’s Calendar',
  description: 'The movies I rewatch every December',
  length: 24,
  revealTime: '19:00',
  attemptsPerDay: 3,
  today: { day: 9, reveal: sampleReveal },
  days: [
    { day: 1, title: 'The secret life of Walter Mitty', status: 'guessed' },
    { day: 2, title: 'Klaus', status: 'missed' },
    { day: 3, title: 'The grand Budapest hotel', status: 'guessed' },
    { day: 4, title: 'Elf', status: 'guessed' },
    { day: 5, title: 'Home Alone', status: 'guessed' },
    { day: 6, title: 'Love Actually', status: 'missed' },
    { day: 7, title: 'The Holiday', status: 'guessed' },
    { day: 8, title: 'It’s a Wonderful Life', status: 'missed' },
    { day: 9, title: 'The secret life of Walter Mitty', status: 'guessed' },
  ],
};

// 12-day calendars run 13–24 December, so these are shown a few days in.
const dreadTheHalls: Calendar = {
  id: 'dread-the-halls',
  name: 'Dread the Halls',
  description: 'Horror for the longest nights of the year.',
  length: 12,
  revealTime: '19:00',
  attemptsPerDay: 3,
  today: { day: 15, reveal: sampleReveal },
  days: [
    { day: 13, title: 'Black Christmas', status: 'guessed' },
    { day: 14, title: 'Krampus', status: 'missed' },
    { day: 15, title: 'Gremlins', status: 'guessed' },
  ],
};

const silverBells: Calendar = {
  id: 'silver-bells',
  name: 'Silver Bells',
  description: 'Black-and-white classics that still hold up.',
  length: 12,
  revealTime: '19:00',
  attemptsPerDay: 3,
  today: { day: 15, reveal: sampleReveal },
  days: [
    { day: 13, title: 'Miracle on 34th Street', status: 'guessed' },
    { day: 14, title: 'The Shop Around the Corner', status: 'missed' },
    { day: 15, title: 'Christmas in Connecticut', status: 'guessed' },
  ],
};

export const mockCalendars: Calendar[] = [mockCalendar, dreadTheHalls, silverBells];
