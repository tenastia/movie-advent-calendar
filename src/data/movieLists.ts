import type { RevealStyle } from './types';

/**
 * The calendars' movies, in day order: a calendar of N days runs to Christmas
 * Eve, so its first movie is on December 25 − N (24 days: the 1st; 12: the 13th).
 */
export interface MovieList {
  id: string;
  name: string;
  description: string;
  /** Days the calendar runs (6, 12, 18 or 24). */
  length: number;
  /** One movie per day, first day first. */
  movies: string[];
  revealStyle: RevealStyle;
}

export const movieLists: MovieList[] = [
  {
    id: 'nastias-calendar',
    name: 'Nastia’s Calendar',
    description: 'The movies I rewatch every December',
    length: 24,
    revealStyle: 'drifting',
    movies: [
      'Klaus',
      'Fargo',
      'Carol',
      'The Grand Budapest Hotel',
      'Paddington 2',
      'Night on Earth',
      'Project Hail Mary',
      'A Man Called Ove',
      'Tokyo Godfathers',
      'Amélie',
      '3 Idiots',
      'Edward Scissorhands',
      'Fanny and Alexander',
      'Groundhog Day',
      'The Sound of Music',
      'In Bruges',
      'Little Women',
      'The Apartment',
      'What We Do in the Shadows',
      'The Secret Life of Walter Mitty',
      'Cinema Paradiso',
      'Ratatouille',
      'Wallace & Gromit: Vengeance Most Fowl',
      'The Intouchables',
      // A 25th title: the calendar has 24 days (1–24 December), so this one has no day yet.
      'The Holdovers',
    ],
  },
  {
    id: 'dread-the-halls',
    name: 'Dread the Halls',
    description: 'Horror for the longest nights of the year.',
    length: 12,
    revealStyle: 'drifting',
    movies: [
      'Nosferatu',
      'Psycho',
      'The Innocents',
      'Rosemary’s Baby',
      'Night of the Living Dead',
      'The Exorcist',
      'Black Christmas',
      'Suspiria',
      'House',
      'Alien',
      'The Shining',
      'The Thing',
    ],
  },
  {
    id: 'silver-bells',
    name: 'Silver Bells',
    description: 'Black-and-white classics that still hold up.',
    length: 12,
    revealStyle: 'drifting',
    movies: [
      'City Lights',
      'It Happened One Night',
      'Casablanca',
      'The Third Man',
      'Roman Holiday',
      'Tokyo Story',
      'The Cranes Are Flying',
      'Some Like It Hot',
      'The 400 Blows',
      '8½',
      'The Shop Around the Corner',
      'It’s a Wonderful Life',
    ],
  },
];
