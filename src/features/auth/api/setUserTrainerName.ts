import type { ResultSetHeader } from 'mysql2';

import { pool } from '@/database';

export const setUserTrainerName = async (discordId: string, trainerName: string): Promise<boolean> => {
  const [resultSetHeader] = await pool.execute(
    'INSERT INTO `player` (`name`, `last_seen`, `friendship_id`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `last_seen` = VALUES(`last_seen`), `friendship_id` = VALUES(`friendship_id`)',
    [trainerName, Math.floor(Date.now() / 1000), discordId],
  );

  return (resultSetHeader as ResultSetHeader).affectedRows >= 1;
};
