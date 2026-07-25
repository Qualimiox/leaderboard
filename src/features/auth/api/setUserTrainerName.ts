import type { ResultSetHeader } from 'mysql2';

import { pool } from '@/database';

export const setUserTrainerName = async (userId: string, trainerName: string): Promise<boolean> => {
  const [resultSetHeader] = await pool.execute(
    'INSERT INTO `player` (`name`, `friendship_id`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `friendship_id` = VALUES(`friendship_id`)',
    [trainerName, userId],
  );

  return (resultSetHeader as ResultSetHeader).affectedRows >= 1;
};
