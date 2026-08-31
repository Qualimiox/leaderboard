import fs from 'fs';
import path from 'path';
import { config } from 'node-config-ts';

import { pool } from '../src/database';
import { Badge } from '../src/types';
import { badgeTranslations } from '../src/features/profile/utils/badgeTranslations';
import { badgeToAssetId } from '../src/features/profile/utils/badgeToAssetId';
import { logger } from './logger';

export interface MonthlyTrainerStat {
  name: string;
  team: number | null;
  diff: number;
}

export interface StatConfig {
  key: string;
  badge: Badge | null;
  i18nKey: string;
  defaultName: string;
}

export const STAT_CONFIGS: StatConfig[] = [
  { key: 'xp', badge: null, i18nKey: 'leaderboard_header.xp', defaultName: 'XP' },
  { key: 'level', badge: null, i18nKey: 'leaderboard_header.level', defaultName: 'Level' },
  { key: 'battles_won', badge: null, i18nKey: 'leaderboard_header.battles_won', defaultName: 'Battles Won' },
  { key: 'km_walked', badge: Badge.KM_WALKED, i18nKey: 'badge_km_walked', defaultName: 'Km Walked' },
  {
    key: 'caught_pokemon',
    badge: Badge.CAUGHT_POKEMON,
    i18nKey: 'badge_caught_pokemon',
    defaultName: 'Caught Pokemon',
  },
  { key: 'stops_spun', badge: Badge.STOPS_SPUN, i18nKey: 'badge_stops_spun', defaultName: 'Stops Spun' },
  { key: 'evolved', badge: Badge.EVOLVED, i18nKey: 'badge_evolved', defaultName: 'Evolved' },
  { key: 'hatched', badge: Badge.HATCHED, i18nKey: 'badge_hatched', defaultName: 'Hatched' },
  { key: 'quests', badge: Badge.QUESTS, i18nKey: 'badge_quests', defaultName: 'Quests' },
  { key: 'trades', badge: Badge.TRADES, i18nKey: 'badge_trades', defaultName: 'Trades' },
  { key: 'photobombs', badge: Badge.PHOTOBOMBS, i18nKey: 'badge_photobombs', defaultName: 'Photobombs' },
  { key: 'purified', badge: Badge.PURIFIED, i18nKey: 'badge_purified', defaultName: 'Purified' },
  {
    key: 'grunts_defeated',
    badge: Badge.GRUNTS_DEFEATED,
    i18nKey: 'badge_grunts_defeated',
    defaultName: 'Grunts Defeated',
  },
  {
    key: 'gym_battles_won',
    badge: Badge.GYM_BATTLES_WON,
    i18nKey: 'badge_gym_battles_won',
    defaultName: 'Gym Battles Won',
  },
  {
    key: 'normal_raids_won',
    badge: Badge.NORMAL_RAIDS_WON,
    i18nKey: 'badge_normal_raids_won',
    defaultName: 'Normal Raids Won',
  },
  {
    key: 'legendary_raids_won',
    badge: Badge.LEGENDARY_RAIDS_WON,
    i18nKey: 'badge_legendary_raids_won',
    defaultName: 'Legendary Raids Won',
  },
  { key: 'trainings_won', badge: Badge.TRAININGS_WON, i18nKey: 'badge_trainings_won', defaultName: 'Trainings Won' },
  { key: 'berries_fed', badge: Badge.BERRIES_FED, i18nKey: 'badge_berries_fed', defaultName: 'Berries Fed' },
  {
    key: 'hours_defended',
    badge: Badge.HOURS_DEFENDED,
    i18nKey: 'badge_hours_defended',
    defaultName: 'Hours Defended',
  },
  { key: 'best_friends', badge: Badge.BEST_FRIENDS, i18nKey: 'badge_best_friends', defaultName: 'Best Friends' },
  { key: 'best_buddies', badge: Badge.BEST_BUDDIES, i18nKey: 'badge_best_buddies', defaultName: 'Best Buddies' },
  {
    key: 'giovanni_defeated',
    badge: Badge.GIOVANNI_DEFEATED,
    i18nKey: 'badge_giovanni_defeated',
    defaultName: 'Giovanni Defeated',
  },
  { key: 'mega_evos', badge: Badge.MEGA_EVOS, i18nKey: 'badge_mega_evos', defaultName: 'Mega Evolutions' },
  {
    key: 'collections_done',
    badge: Badge.COLLECTIONS_DONE,
    i18nKey: 'badge_collections_done',
    defaultName: 'Collections Done',
  },
  { key: 'vivillon', badge: Badge.VIVILLON, i18nKey: 'badge_vivillon', defaultName: 'Vivillon' },
  {
    key: 'showcase_max_size_first_place',
    badge: Badge.SHOWCASE_MAX_SIZE_FIRST_PLACE,
    i18nKey: 'badge_showcase_max_size_first_place',
    defaultName: 'Showcase Star',
  },
  {
    key: 'event_check_ins',
    badge: Badge.EVENT_CHECK_INS,
    i18nKey: 'badge_event_check_ins',
    defaultName: 'Community Member',
  },
  {
    key: 'parties_completed',
    badge: Badge.PARTIES_COMPLETED,
    i18nKey: 'badge_parties_completed',
    defaultName: 'Life of the Party',
  },
  {
    key: 'total_route_play',
    badge: Badge.TOTAL_ROUTE_PLAY,
    i18nKey: 'badge_total_route_play',
    defaultName: 'Expert Navigator',
  },
  {
    key: 'unique_stops_spun',
    badge: Badge.UNIQUE_STOPS_SPUN,
    i18nKey: 'badge_unique_stops_spun',
    defaultName: 'Unique Stops Spun',
  },
  {
    key: 'unique_mega_evos',
    badge: Badge.UNIQUE_MEGA_EVOS,
    i18nKey: 'badge_unique_mega_evos',
    defaultName: 'Unique Mega Evos',
  },
  {
    key: 'unique_raid_bosses',
    badge: Badge.UNIQUE_RAID_BOSSES,
    i18nKey: 'badge_unique_raid_bosses',
    defaultName: 'Unique Raid Bosses',
  },
  { key: 'unique_unown', badge: Badge.UNIQUE_UNOWN, i18nKey: 'badge_unique_unown', defaultName: 'Unique Unown' },
  {
    key: 'seven_day_streaks',
    badge: Badge.SEVEN_DAY_STREAKS,
    i18nKey: 'badge_seven_day_streaks',
    defaultName: '7 Day Streaks',
  },
  { key: 'trade_km', badge: Badge.TRADE_KM, i18nKey: 'badge_trade_km', defaultName: 'Trade Km' },
  {
    key: 'raids_with_friends',
    badge: Badge.RAIDS_WITH_FRIENDS,
    i18nKey: 'badge_raids_with_friends',
    defaultName: 'Raids With Friends',
  },
  {
    key: 'caught_at_lure',
    badge: Badge.CAUGHT_AT_LURE,
    i18nKey: 'badge_caught_at_lure',
    defaultName: 'Caught At Lure',
  },
  {
    key: 'wayfarer_agreements',
    badge: Badge.WAYFARER_AGREEMENTS,
    i18nKey: 'badge_wayfarer_agreements',
    defaultName: 'Wayfarer Agreements',
  },
  {
    key: 'trainers_referred',
    badge: Badge.TRAINERS_REFERRED,
    i18nKey: 'badge_trainers_referred',
    defaultName: 'Trainers Referred',
  },
  {
    key: 'raid_achievements',
    badge: Badge.RAID_ACHIEVEMENTS,
    i18nKey: 'badge_raid_achievements',
    defaultName: 'Raid Achievements',
  },
  { key: 'xl_karps', badge: Badge.XL_KARPS, i18nKey: 'badge_xl_karps', defaultName: 'XL Magikarp' },
  { key: 'xs_rats', badge: Badge.XS_RATS, i18nKey: 'badge_xs_rats', defaultName: 'XS Rattata' },
  {
    key: 'tiny_pokemon_caught',
    badge: Badge.TINY_POKEMON_CAUGHT,
    i18nKey: 'badge_tiny_pokemon_caught',
    defaultName: 'Tiny Pokemon',
  },
  {
    key: 'jumbo_pokemon_caught',
    badge: Badge.JUMBO_POKEMON_CAUGHT,
    i18nKey: 'badge_jumbo_pokemon_caught',
    defaultName: 'Jumbo Pokemon',
  },
  {
    key: 'pikachu_caught',
    badge: Badge.PIKACHU_CAUGHT,
    i18nKey: 'badge_pikachu_caught',
    defaultName: 'Pikachu Caught',
  },
  {
    key: 'league_great_won',
    badge: Badge.LEAGUE_GREAT_WON,
    i18nKey: 'badge_league_great_won',
    defaultName: 'Great League Won',
  },
  {
    key: 'league_ultra_won',
    badge: Badge.LEAGUE_ULTRA_WON,
    i18nKey: 'badge_league_ultra_won',
    defaultName: 'Ultra League Won',
  },
  {
    key: 'league_master_won',
    badge: Badge.LEAGUE_MASTER_WON,
    i18nKey: 'badge_league_master_won',
    defaultName: 'Master League Won',
  },
  { key: 'dex_gen1', badge: Badge.DEX_GEN_1, i18nKey: 'badge_dex_gen_1', defaultName: 'Gen 1' },
  { key: 'dex_gen2', badge: Badge.DEX_GEN_2, i18nKey: 'badge_dex_gen_2', defaultName: 'Gen 2' },
  { key: 'dex_gen3', badge: Badge.DEX_GEN_3, i18nKey: 'badge_dex_gen_3', defaultName: 'Gen 3' },
  { key: 'dex_gen4', badge: Badge.DEX_GEN_4, i18nKey: 'badge_dex_gen_4', defaultName: 'Gen 4' },
  { key: 'dex_gen5', badge: Badge.DEX_GEN_5, i18nKey: 'badge_dex_gen_5', defaultName: 'Gen 5' },
  { key: 'dex_gen6', badge: Badge.DEX_GEN_6, i18nKey: 'badge_dex_gen_6', defaultName: 'Gen 6' },
  { key: 'dex_gen7', badge: Badge.DEX_GEN_7, i18nKey: 'badge_dex_gen_7', defaultName: 'Gen 7' },
  { key: 'dex_gen8', badge: Badge.DEX_GEN_8, i18nKey: 'badge_dex_gen_8', defaultName: 'Gen 8' },
  { key: 'dex_gen8a', badge: Badge.DEX_GEN_8A, i18nKey: 'badge_dex_gen_8a', defaultName: 'Hisui' },
  { key: 'dex_gen9', badge: Badge.DEX_GEN_9, i18nKey: 'badge_dex_gen_9', defaultName: 'Gen 9' },
  { key: 'caught_normal', badge: Badge.CAUGHT_NORMAL, i18nKey: 'type_normal', defaultName: 'Normal' },
  { key: 'caught_fighting', badge: Badge.CAUGHT_FIGHTING, i18nKey: 'type_fighting', defaultName: 'Fighting' },
  { key: 'caught_flying', badge: Badge.CAUGHT_FLYING, i18nKey: 'type_flying', defaultName: 'Flying' },
  { key: 'caught_poison', badge: Badge.CAUGHT_POISON, i18nKey: 'type_poison', defaultName: 'Poison' },
  { key: 'caught_ground', badge: Badge.CAUGHT_GROUND, i18nKey: 'type_ground', defaultName: 'Ground' },
  { key: 'caught_rock', badge: Badge.CAUGHT_ROCK, i18nKey: 'type_rock', defaultName: 'Rock' },
  { key: 'caught_bug', badge: Badge.CAUGHT_BUG, i18nKey: 'type_bug', defaultName: 'Bug' },
  { key: 'caught_ghost', badge: Badge.CAUGHT_GHOST, i18nKey: 'type_ghost', defaultName: 'Ghost' },
  { key: 'caught_steel', badge: Badge.CAUGHT_STEEL, i18nKey: 'type_steel', defaultName: 'Steel' },
  { key: 'caught_fire', badge: Badge.CAUGHT_FIRE, i18nKey: 'type_fire', defaultName: 'Fire' },
  { key: 'caught_water', badge: Badge.CAUGHT_WATER, i18nKey: 'type_water', defaultName: 'Water' },
  { key: 'caught_grass', badge: Badge.CAUGHT_GRASS, i18nKey: 'type_grass', defaultName: 'Grass' },
  { key: 'caught_electric', badge: Badge.CAUGHT_ELECTRIC, i18nKey: 'type_electric', defaultName: 'Electric' },
  { key: 'caught_psychic', badge: Badge.CAUGHT_PSYCHIC, i18nKey: 'type_psychic', defaultName: 'Psychic' },
  { key: 'caught_ice', badge: Badge.CAUGHT_ICE, i18nKey: 'type_ice', defaultName: 'Ice' },
  { key: 'caught_dragon', badge: Badge.CAUGHT_DRAGON, i18nKey: 'type_dragon', defaultName: 'Dragon' },
  { key: 'caught_dark', badge: Badge.CAUGHT_DARK, i18nKey: 'type_dark', defaultName: 'Dark' },
  { key: 'caught_fairy', badge: Badge.CAUGHT_FAIRY, i18nKey: 'type_fairy', defaultName: 'Fairy' },
];

function formatDateYMD(dateInput: Date | string): string {
  if (typeof dateInput === 'string') {
    return dateInput.slice(0, 10);
  }
  const y = dateInput.getFullYear();
  const m = String(dateInput.getMonth() + 1).padStart(2, '0');
  const d = String(dateInput.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getPreviousMonthDateRange(refDate = new Date()): {
  startOfMonth: string;
  endOfMonth: string;
  monthName: string;
  year: number;
} {
  const currentYear = refDate.getFullYear();
  const currentMonth = refDate.getMonth(); // 0-indexed

  // Previous month date
  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const year = prevMonthDate.getFullYear();
  const month = prevMonthDate.getMonth();

  const startDateObj = new Date(year, month, 1);
  const endDateObj = new Date(year, month + 1, 0); // Last day of month

  const startOfMonth = formatDateYMD(startDateObj);
  const endOfMonth = formatDateYMD(endDateObj);

  const rawLocale = config.defaultLocale && config.defaultLocale !== '@@DEFAULT_LOCALE' ? config.defaultLocale : 'en';
  const localeMap: Record<string, string> = { de: 'de-DE', en: 'en-US', fr: 'fr-FR' };
  const locale = localeMap[rawLocale] || rawLocale;

  const monthName = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(startDateObj);

  return { startOfMonth, endOfMonth, monthName, year };
}

export function getMonthlyLeaderboardHeader(monthName: string, localeOverride?: string): string {
  const rawLocale =
    localeOverride ||
    (config.defaultLocale && config.defaultLocale !== '@@DEFAULT_LOCALE' ? config.defaultLocale : 'en');

  const lang = rawLocale.toLowerCase().slice(0, 2);

  if (lang === 'de') {
    return `Bestenliste für ${monthName}`;
  }
  if (lang === 'fr') {
    return `Classement pour ${monthName}`;
  }
  return `Leaderboard for ${monthName}`;
}

export function getStatLocalizedName(statConfig: StatConfig, localeOverride?: string): string {
  const locale =
    localeOverride ||
    (config.defaultLocale && config.defaultLocale !== '@@DEFAULT_LOCALE' ? config.defaultLocale : 'en');
  const langPath = path.join(process.cwd(), 'src', 'i18n', 'lang', `${locale}.json`);
  const fallbackPath = path.join(process.cwd(), 'src', 'i18n', 'lang', 'en.json');

  let langCatalog: Record<string, { defaultMessage?: string } | string> = {};

  try {
    const selectedPath = fs.existsSync(langPath) ? langPath : fallbackPath;
    const content = fs.readFileSync(selectedPath, 'utf-8');
    langCatalog = JSON.parse(content);
  } catch (err) {
    logger.warn(`Could not load language file for locale ${locale}:`, err);
  }

  const entry = langCatalog[statConfig.i18nKey];
  if (entry) {
    if (typeof entry === 'string') return entry;
    if (entry.defaultMessage) return entry.defaultMessage;
  }

  // Fallback to defaultName
  return statConfig.defaultName;
}

export function formatStatValue(statKey: string, value: number, localeOverride?: string): string {
  const rawLocale =
    localeOverride ||
    (config.defaultLocale && config.defaultLocale !== '@@DEFAULT_LOCALE' ? config.defaultLocale : 'en');

  const localeMap: Record<string, string> = {
    de: 'de-DE',
    en: 'en-US',
    fr: 'fr-FR',
  };

  const locale = localeMap[rawLocale] || rawLocale;

  if (statKey === 'km_walked' || statKey === 'trade_km') {
    return value.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });
  }

  return value.toLocaleString(locale, {
    maximumFractionDigits: 0,
  });
}

export function getBadgeImagePath(statConfig: StatConfig): string | null {
  if (!statConfig.badge) return null;

  const assetId = badgeToAssetId[statConfig.badge];
  if (!assetId) return null;

  const candidates = [
    path.join(process.cwd(), `public/badges/achievements/Badge_${assetId}_4_01.webp`),
    path.join(process.cwd(), `public/badges/achievements/Badge_${assetId}_3_01.webp`),
    path.join(process.cwd(), `public/badges/achievements/Badge_${assetId}.webp`),
    path.join(process.cwd(), `public/badges/achievements/Badge_${assetId}.png`),
    path.join(process.cwd(), `public/badges/achievements/Badge_${assetId}_01.png`),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

export async function fetchMonthlyTopStats(
  startOfMonth: string,
  endOfMonth: string,
): Promise<Record<string, MonthlyTrainerStat[]>> {
  const statColumns = STAT_CONFIGS.map((sc) => sc.key).join(', ');

  const query = `
    SELECT name, team, DATE_FORMAT(date, '%Y-%m-%d') AS date_str, ${statColumns}
    FROM ${config.database.leaderboardDatabase}.pogo_leaderboard_trainer_history
    WHERE date >= ? AND date <= ?
    ORDER BY pogo_leaderboard_trainer_history.date ASC
  `;

  const startTimestamp = `${startOfMonth} 00:00:00`;
  const endTimestamp = `${endOfMonth} 23:59:59`;

  const [rows] = await pool.execute(query, [startTimestamp, endTimestamp]);
  const results = rows as unknown as Record<string, any>[];

  // Group entries by trainer name
  const trainerHistoryMap: Record<
    string,
    {
      team: number | null;
      records: Record<string, any>[];
    }
  > = {};

  for (const row of results) {
    const trainerName = row.name;
    if (!trainerHistoryMap[trainerName]) {
      trainerHistoryMap[trainerName] = {
        team: row.team !== null ? Number(row.team) : null,
        records: [],
      };
    }

    trainerHistoryMap[trainerName].team = row.team !== null ? Number(row.team) : trainerHistoryMap[trainerName].team;
    trainerHistoryMap[trainerName].records.push(row);
  }

  const topStats: Record<string, MonthlyTrainerStat[]> = {};

  for (const statConfig of STAT_CONFIGS) {
    const key = statConfig.key;
    const statsForKey: MonthlyTrainerStat[] = [];

    for (const [trainerName, trainerData] of Object.entries(trainerHistoryMap)) {
      // Extract all valid positive numeric records for this stat in the target month
      const recordsInMonth = trainerData.records
        .map((r) => ({
          date: r.date_str ? String(r.date_str) : formatDateYMD(r.date),
          val: Number(r[key]),
        }))
        .filter((r) => !isNaN(r.val) && r.val > 0);

      if (recordsInMonth.length > 0) {
        const baseline = recordsInMonth[0].val;
        const endpoint = recordsInMonth[recordsInMonth.length - 1].val;
        const diff = endpoint - baseline;

        if (diff > 0) {
          statsForKey.push({
            name: trainerName,
            team: trainerData.team,
            diff,
          });
        }
      }
    }

    // Sort descending by diff, tie-breaker by name ascending
    statsForKey.sort((a, b) => b.diff - a.diff || a.name.localeCompare(b.name));

    // Top 10
    topStats[key] = statsForKey.slice(0, 10);
  }

  return topStats;
}
