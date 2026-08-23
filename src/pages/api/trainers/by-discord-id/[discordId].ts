import type { NextApiRequest, NextApiResponse } from 'next';

import { pool } from '@/database';
import { isUserNotLoggedIn } from '@/features/auth/api/apiGuard';
import { resolveConfig } from '@/utils/resolveConfig';

interface ApiError {
  code: number;
  message: string;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default async (request: NextApiRequest, response: NextApiResponse<string | ApiError>): Promise<void> => {
  resolveConfig();
  if (await isUserNotLoggedIn(request, response)) {
    return;
  }

  const { discordId } = request.query;

  if (typeof discordId !== 'string') {
    response.status(400).json({ code: 400, message: 'bad request' });
    return;
  }

  try {
    const [rows] = await pool.execute('SELECT `name` FROM `player` WHERE `friendship_id` = ? LIMIT 1', [discordId]);

    if (!Array.isArray(rows) || rows.length === 0) {
      response.status(404).json({ code: 404, message: 'not found' });
      return;
    }

    const trainerName = (rows[0] as { name: string }).name;
    response.status(200).json(trainerName);
  } catch {
    response.status(500).json({ code: 500, message: 'internal server error' });
  }
};
