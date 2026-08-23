import {
  STAT_CONFIGS,
  formatStatValue,
  getBadgeImagePath,
  getMonthlyLeaderboardHeader,
  getPreviousMonthDateRange,
  getStatLocalizedName,
} from './monthlyLeaderboard';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('Running Monthly Leaderboard Tests...');

// Test 1: Date Range Calculation
{
  // Test November 1, 2023 -> October 2023
  const nov1 = new Date(2023, 10, 1);
  const rangeNov1 = getPreviousMonthDateRange(nov1);
  assert(rangeNov1.startOfMonth === '2023-10-01', `Expected 2023-10-01, got ${rangeNov1.startOfMonth}`);
  assert(rangeNov1.endOfMonth === '2023-10-31', `Expected 2023-10-31, got ${rangeNov1.endOfMonth}`);
  assert(rangeNov1.year === 2023, `Expected 2023, got ${rangeNov1.year}`);

  // Test January 1, 2024 -> December 2023
  const jan1 = new Date(2024, 0, 1);
  const rangeJan1 = getPreviousMonthDateRange(jan1);
  assert(rangeJan1.startOfMonth === '2023-12-01', `Expected 2023-12-01, got ${rangeJan1.startOfMonth}`);
  assert(rangeJan1.endOfMonth === '2023-12-31', `Expected 2023-12-31, got ${rangeJan1.endOfMonth}`);
  assert(rangeJan1.year === 2023, `Expected 2023, got ${rangeJan1.year}`);

  // Test March 1, 2024 (Leap year) -> February 2024
  const mar1 = new Date(2024, 2, 1);
  const rangeMar1 = getPreviousMonthDateRange(mar1);
  assert(rangeMar1.startOfMonth === '2024-02-01', `Expected 2024-02-01, got ${rangeMar1.startOfMonth}`);
  assert(rangeMar1.endOfMonth === '2024-02-29', `Expected 2024-02-29, got ${rangeMar1.endOfMonth}`);
  assert(rangeMar1.year === 2024, `Expected 2024, got ${rangeMar1.year}`);

  console.log('✔ Date range calculation tests passed!');
}

// Test 2: Localization & Header Message
{
  const xpConfig = STAT_CONFIGS.find((s) => s.key === 'xp')!;
  const caughtConfig = STAT_CONFIGS.find((s) => s.key === 'caught_pokemon')!;
  const kmConfig = STAT_CONFIGS.find((s) => s.key === 'km_walked')!;

  assert(getStatLocalizedName(xpConfig, 'en') === 'XP', 'XP en failed');
  assert(getStatLocalizedName(caughtConfig, 'en') === 'Caught pokemon', 'Caught pokemon en failed');

  assert(getStatLocalizedName(caughtConfig, 'de') === 'Sammler', 'Caught pokemon de failed');
  assert(getStatLocalizedName(kmConfig, 'de') === 'Jogger', 'Km walked de failed');

  assert(getMonthlyLeaderboardHeader('October 2023', 'en') === 'Leaderboard for October 2023', 'Header en failed');
  assert(getMonthlyLeaderboardHeader('Oktober 2023', 'de') === 'Bestenliste für Oktober 2023', 'Header de failed');
  assert(getMonthlyLeaderboardHeader('octobre 2023', 'fr') === 'Classement pour octobre 2023', 'Header fr failed');

  console.log('✔ Localization and header tests passed!');
}

// Test 3: Number Formatting (German and English, 1 decimal place for km_walked)
{
  // km_walked in German (de): 1234.56 -> 1.234,6
  const kmDe = formatStatValue('km_walked', 1234.567, 'de');
  assert(kmDe === '1.234,6', `Expected '1.234,6', got '${kmDe}'`);

  // km_walked in English (en): 1234.56 -> 1,234.6
  const kmEn = formatStatValue('km_walked', 1234.567, 'en');
  assert(kmEn === '1,234.6', `Expected '1,234.6', got '${kmEn}'`);

  // caught_pokemon in German (de): 12345 -> 12.345
  const caughtDe = formatStatValue('caught_pokemon', 12345, 'de');
  assert(caughtDe === '12.345', `Expected '12.345', got '${caughtDe}'`);

  // caught_pokemon in English (en): 12345 -> 12,345
  const caughtEn = formatStatValue('caught_pokemon', 12345, 'en');
  assert(caughtEn === '12,345', `Expected '12,345', got '${caughtEn}'`);

  console.log('✔ Number formatting tests passed!');
}

// Test 4: Badge Image Mapping
{
  const kmConfig = STAT_CONFIGS.find((s) => s.key === 'km_walked')!;
  const xpConfig = STAT_CONFIGS.find((s) => s.key === 'xp')!;

  const kmImg = getBadgeImagePath(kmConfig);
  assert(kmImg !== null && kmImg.endsWith('.webp'), 'km_walked badge image failed');

  const xpImg = getBadgeImagePath(xpConfig);
  assert(xpImg === null, 'XP badge image should be null');

  console.log('✔ Badge image mapping tests passed!');
}

// Test 5: All Stat Configs Check
{
  assert(STAT_CONFIGS.length > 50, `Expected > 50 stat configs, got ${STAT_CONFIGS.length}`);
  const keys = new Set(STAT_CONFIGS.map((s) => s.key));
  assert(keys.has('xp'), 'Missing xp');
  assert(keys.has('level'), 'Missing level');
  assert(keys.has('caught_pokemon'), 'Missing caught_pokemon');
  assert(keys.has('dex_gen9'), 'Missing dex_gen9');
  assert(keys.has('caught_fairy'), 'Missing caught_fairy');

  console.log(`✔ Stat configs check passed (${STAT_CONFIGS.length} stats tracked)!`);
}

console.log('ALL TESTS PASSED SUCCESSFULLY!');
