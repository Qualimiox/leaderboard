import path from 'path';
import { config } from 'node-config-ts';
import { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } from 'discord.js';

import {
  STAT_CONFIGS,
  fetchMonthlyTopStats,
  formatStatValue,
  getBadgeImagePath,
  getMonthlyLeaderboardHeader,
  getPreviousMonthDateRange,
  getStatLocalizedName,
} from './monthlyLeaderboard';
import { logger } from './logger';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runMonthlyDiscordLeaderboard(referenceDate?: Date): Promise<void> {
  const botToken = config.discord?.botToken;
  const channelId = config.discord?.monthlyLeaderboardChannelId;

  if (!botToken || botToken === '@@DISCORD_BOT_TOKEN' || botToken === 'token') {
    throw new Error('Discord botToken is not configured in config/default.json or environment.');
  }

  if (!channelId || channelId === '@@DISCORD_MONTHLY_LEADERBOARD_CHANNEL_ID') {
    throw new Error('Discord monthlyLeaderboardChannelId is not configured in config/default.json or environment.');
  }

  const { startOfMonth, endOfMonth, monthName } = getPreviousMonthDateRange(referenceDate);
  logger.info(`Fetching monthly leaderboard stats for ${monthName} (${startOfMonth} to ${endOfMonth})...`);

  const topStats = await fetchMonthlyTopStats(startOfMonth, endOfMonth);

  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  await new Promise<void>((resolve, reject) => {
    client.once('ready', async () => {
      try {
        logger.info(`Logged in to Discord as ${client.user?.tag}`);

        const channel = await client.channels.fetch(channelId);
        if (!channel || !channel.isTextBased() || !('send' in channel)) {
          const errMsg = `Channel ID ${channelId} was not found or is not a sendable text channel.`;
          logger.error(errMsg);
          client.destroy();
          reject(new Error(errMsg));
          return;
        }

        // Send Leaderboard Header Message
        const headerText = getMonthlyLeaderboardHeader(monthName);
        await channel.send(headerText);
        await sleep(350);

        let sentCount = 0;

        for (const statConfig of STAT_CONFIGS) {
          const stats = topStats[statConfig.key];
          if (!stats || stats.length === 0) {
            logger.debug(`Skipping ${statConfig.key}: no active entries for ${monthName}`);
            continue;
          }

          const statName = getStatLocalizedName(statConfig);
          const badgePath = getBadgeImagePath(statConfig);

          const descriptionLines = stats.map((trainer, index) => {
            const formattedDiff = formatStatValue(statConfig.key, trainer.diff);
            return `**${index + 1}.** ${trainer.name} — +${formattedDiff}`;
          });

          const embed = new EmbedBuilder()
            .setTitle(statName)
            .setDescription(descriptionLines.join('\n'))
            .setColor(0x3b82f6)
            .setFooter({ text: `${monthName} Leaderboard` })
            .setTimestamp();

          if (badgePath) {
            const ext = path.extname(badgePath);
            const fileName = `badge${ext}`;
            const attachment = new AttachmentBuilder(badgePath, { name: fileName });
            embed.setThumbnail(`attachment://${fileName}`);

            await channel.send({
              embeds: [embed],
              files: [attachment],
            });
          } else {
            await channel.send({
              embeds: [embed],
            });
          }

          sentCount++;
          // Rate limit protection
          await sleep(350);
        }

        logger.info(`Successfully posted ${sentCount} monthly stat leaderboards to Discord channel ${channelId}.`);
        client.destroy();
        resolve();
      } catch (err) {
        logger.error('Error sending monthly leaderboard messages to Discord:', err);
        client.destroy();
        reject(err);
      }
    });

    client.login(botToken).catch((err) => {
      logger.error('Failed to log in to Discord:', err);
      reject(err);
    });
  });
}

// Execute if run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('discord-monthly-leaderboard.ts')) {
  const argDate = process.argv[2] ? new Date(process.argv[2]) : undefined;
  runMonthlyDiscordLeaderboard(argDate)
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      logger.fatal(err);
      process.exit(1);
    });
}
