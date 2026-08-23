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

// eslint-disable-next-line import/no-anonymous-default-export
export default async (request: NextApiRequest, response: NextApiResponse<ApiResponse>): Promise<void> => {
  resolveConfig();

  const session = await getServerSession(request, response, authOptions);
  if (!session) {
    response.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const trainerName = (session as unknown as Record<string, unknown>).trainerName as string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const discordId = (session as unknown as Record<string, unknown>).discordId as string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const userId = (session as unknown as Record<string, unknown>).userId as string | undefined;

  if (!trainerName && !discordId) {
    response.status(400).json({ success: false, message: 'User identity not found in session' });
    return;
  }

  const leaderboardDb = config.database.leaderboardDatabase;

  try {
    // Use transaction-like approach (run deletes in order)
    // 1. Delete from scannerDatabase.player
    if (trainerName) {
      await pool.execute('DELETE FROM `player` WHERE `name` = ?', [trainerName]);
    } else if (discordId) {
      // Look up trainer name by friendship_id first, then delete
      const [rows] = await pool.execute('SELECT `name` FROM `player` WHERE `friendship_id` = ?', [discordId]);
      if (Array.isArray(rows) && rows.length > 0) {
        const foundName = (rows[0] as { name: string }).name;
        await pool.execute('DELETE FROM `player` WHERE `name` = ?', [foundName]);
      }
    }

    // 2. Delete from leaderboardDatabase.pogo_leaderboard_users
    if (trainerName) {
      await pool.execute(`DELETE FROM \`${leaderboardDb}\`.pogo_leaderboard_users WHERE \`trainerName\` = ?`, [
        trainerName,
      ]);
    } else if (userId) {
      await pool.execute(`DELETE FROM \`${leaderboardDb}\`.pogo_leaderboard_users WHERE \`id\` = ?`, [userId]);
    }

    // 3. Delete from leaderboardDatabase.pogo_leaderboard_trainer_history
    if (trainerName) {
      await pool.execute(`DELETE FROM \`${leaderboardDb}\`.pogo_leaderboard_trainer_history WHERE \`name\` = ?`, [
        trainerName,
      ]);
    } else if (discordId) {
      await pool.execute(
        `DELETE FROM \`${leaderboardDb}\`.pogo_leaderboard_trainer_history WHERE \`friendship_id\` = ?`,
        [discordId],
      );
    }

    // 4. Delete from leaderboardDatabase.pogo_leaderboard_accounts
    if (userId) {
      await pool.execute(`DELETE FROM \`${leaderboardDb}\`.pogo_leaderboard_accounts WHERE \`userId\` = ?`, [userId]);
    }

    response.status(200).json({ success: true, message: 'Profile deleted successfully' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting profile:', error);
    response.status(500).json({ success: false, message: 'Failed to delete profile' });
  }
};
