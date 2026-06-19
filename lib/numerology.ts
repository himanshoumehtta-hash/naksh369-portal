function reduce(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  if (n < 10) return n;
  const sum = String(n)
    .split('')
    .reduce((acc, d) => acc + parseInt(d, 10), 0);
  return reduce(sum);
}

export function calculateLifePath(dob: string): number {
  // dob format: YYYY-MM-DD
  const [year, month, day] = dob.split('-').map(Number);
  if (!year || !month || !day) return 0;
  const sum = reduce(day) + reduce(month) + reduce(year);
  return reduce(sum);
}

export function calculateBirthdayNumber(dob: string): number {
  const day = parseInt(dob.split('-')[2], 10);
  return reduce(day);
}

export function calculatePersonalYear(dob: string, year: number): number {
  const [, month, day] = dob.split('-').map(Number);
  if (!month || !day) return 0;
  const sum = reduce(day) + reduce(month) + reduce(year);
  return reduce(sum);
}

export const lifePathDescriptions: Record<number, string> = {
  1: 'The Leader — independent, pioneering, driven',
  2: 'The Diplomat — cooperative, sensitive, harmonious',
  3: 'The Creator — expressive, social, imaginative',
  4: 'The Builder — practical, disciplined, reliable',
  5: 'The Explorer — adventurous, freedom-loving, adaptable',
  6: 'The Nurturer — caring, responsible, family-oriented',
  7: 'The Seeker — introspective, analytical, spiritual',
  8: 'The Achiever — ambitious, authoritative, material success',
  9: 'The Humanitarian — compassionate, idealistic, universal',
  11: 'The Intuitive — highly sensitive, spiritual messenger',
  22: 'The Master Builder — visionary, capable of great achievement',
  33: 'The Master Teacher — selfless service, highest spiritual expression',
};
