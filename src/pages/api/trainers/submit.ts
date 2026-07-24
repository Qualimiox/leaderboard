import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { config } from 'node-config-ts';

import { pool } from '@/database';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { resolveConfig } from '@/utils/resolveConfig';

interface ApiResponse {
  success: boolean;
  message?: string;
}

// List of all allowed columns from the player table (whitelist to prevent arbitrary field injection)
const ALLOWED_COLUMNS = [
  'friendship_id',
  'friend_code',
  'team',
  'level',
  'xp',
  'battles_won',
  'km_walked',
  'caught_pokemon',
  'gbl_rank',
  'gbl_rating',
  'event_badges',
  'stops_spun',
  'evolved',
  'hatched',
  'quests',
  'trades',
  'photobombs',
  'purified',
  'grunts_defeated',
  'gym_battles_won',
  'normal_raids_won',
  'legendary_raids_won',
  'trainings_won',
  'berries_fed',
  'hours_defended',
  'best_friends',
  'best_buddies',
  'giovanni_defeated',
  'mega_evos',
  'collections_done',
  'vivillon',
  'showcase_max_size_first_place',
  'total_route_play',
  'parties_completed',
  'event_check_ins',
  'unique_stops_spun',
  'unique_mega_evos',
  'unique_raid_bosses',
  'unique_unown',
  'seven_day_streaks',
  'trade_km',
  'raids_with_friends',
  'caught_at_lure',
  'wayfarer_agreements',
  'trainers_referred',
  'raid_achievements',
  'xl_karps',
  'xs_rats',
  'tiny_pokemon_caught',
  'jumbo_pokemon_caught',
  'pikachu_caught',
  'league_great_won',
  'league_ultra_won',
  'league_master_won',
  'dex_gen1',
  'dex_gen2',
  'dex_gen3',
  'dex_gen4',
  'dex_gen5',
  'dex_gen6',
  'dex_gen7',
  'dex_gen8',
  'dex_gen8a',
  'dex_gen9',
  'caught_normal',
  'caught_fighting',
  'caught_flying',
  'caught_poison',
  'caught_ground',
  'caught_rock',
  'caught_bug',
  'caught_ghost',
  'caught_steel',
  'caught_fire',
  'caught_water',
  'caught_grass',
  'caught_electric',
  'caught_psychic',
  'caught_ice',
  'caught_dragon',
  'caught_dark',
  'caught_fairy',
];

// eslint-disable-next-line import/no-anonymous-default-export
export default async (request: NextApiRequest, response: NextApiResponse<ApiResponse>): Promise<void> => {
  resolveConfig();

  let name: string;
  const formData = request.body as Record<string, unknown>;

  if (!config.enableAuth) {
    // Without auth, require name in the body (fallback for non-auth setups)
    if (!formData.name || typeof formData.name !== 'string') {
      response.status(400).json({ success: false, message: 'Invalid trainer name' });
      return;
    }
    name = formData.name;
  } else {
    // Get trainerName from the authenticated session — prevents users from submitting data for other trainers
    const session = await getServerSession(request, response, authOptions);
    if (!session) {
      response.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const trainerName = (session as unknown as Record<string, unknown>).trainerName as string | undefined;
    if (!trainerName) {
      response.status(400).json({ success: false, message: 'Trainer name not found in session' });
      return;
    }

    name = trainerName;
  }

  // Build the SQL query with parameterized values
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  // Always set last_seen to current UNIX timestamp
  fields.push('last_seen');
  values.push(Math.floor(Date.now() / 1000));

  for (const column of ALLOWED_COLUMNS) {
    const value = formData[column];
    if (value !== undefined && value !== null && value !== '') {
      fields.push(column);
      // Convert numeric strings to numbers, keep strings as-is
      const parsed: number | null =
        column === 'km_walked' || column === 'trade_km'
          ? parseFloat(String(value))
          : typeof value === 'string'
            ? parseInt(value, 10)
            : typeof value === 'number'
              ? value
              : null;
      values.push(parsed);
    }
  }

  if (fields.length === 1) {
    // Only last_seen was set — still valid for a heartbeat update
  }

  const columns = fields.map((f) => `\`${f}\``).join(', ');
  const placeholders = fields.map(() => '?').join(', ');
  const updateClause = fields
    .filter((f) => f !== 'name')
    .map((f) => `\`${f}\` = VALUES(\`${f}\`)`)
    .join(', ');

  const sql = `INSERT INTO \`player\` (\`name\`, ${columns}) VALUES (?, ${placeholders}) ON DUPLICATE KEY UPDATE ${updateClause}`;

  const params: (string | number | null)[] = [name, ...values];

  try {
    await pool.execute(sql, params);
    response.status(200).json({ success: true, message: 'Data submitted successfully' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error submitting trainer data:', error);
    response.status(500).json({ success: false, message: 'Failed to submit data' });
  }
};
