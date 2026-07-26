import Head from 'next/head';
import type { NextPage } from 'next';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSession } from 'next-auth/react';
import { useState, useEffect, FormEvent, useCallback } from 'react';

import { fetcher } from '@/utils/fetcher';
import { Button } from '@/components/button';
import { wrapStaticPropsWithLocale } from '@/utils/i18n';
import { BadgeIcon } from '@/features/profile/components/BadgeIcon';
import { Badge } from '@/types';
import { Team } from '@/types';

interface TrainerData {
  [key: string]: string | number | null;
}

interface FormField {
  field: string;
  labelId: string;
  labelText: string;
  badge?: Badge;
  type?: 'text' | 'number' | 'select';
  options?: Array<{ value: number; labelId: string; labelText: string }>;
}

const FORM_FIELDS: FormField[] = [
  {
    field: 'team',
    labelId: 'data_submission.team',
    labelText: 'Team',
    type: 'select',
    options: [
      { value: Team.MYSTIC, labelId: 'team.mystic', labelText: 'Mystic' },
      { value: Team.VALOR, labelId: 'team.valor', labelText: 'Valor' },
      { value: Team.INSTINCT, labelId: 'team.instinct', labelText: 'Instinct' },
    ],
  },
  { field: 'level', labelId: 'data_submission.level', labelText: 'Level', badge: undefined },
  { field: 'xp', labelId: 'data_submission.xp', labelText: 'XP', badge: undefined },
  { field: 'km_walked', labelId: 'data_submission.km_walked', labelText: 'Km Walked', badge: Badge.KM_WALKED },
  { field: 'dex_gen1', labelId: 'data_submission.dex_gen1', labelText: 'Gen 1', badge: Badge.DEX_GEN_1 },
  {
    field: 'caught_pokemon',
    labelId: 'data_submission.caught_pokemon',
    labelText: 'Caught Pokémon',
    badge: Badge.CAUGHT_POKEMON,
  },
  { field: 'evolved', labelId: 'data_submission.evolved', labelText: 'Evolved', badge: Badge.EVOLVED },
  { field: 'hatched', labelId: 'data_submission.hatched', labelText: 'Hatched', badge: Badge.HATCHED },
  { field: 'stops_spun', labelId: 'data_submission.stops_spun', labelText: 'Stops Spun', badge: Badge.STOPS_SPUN },
  {
    field: 'unique_stops_spun',
    labelId: 'data_submission.unique_stops_spun',
    labelText: 'Unique Stops Spun',
    badge: Badge.UNIQUE_STOPS_SPUN,
  },
  {
    field: 'gym_battles_won',
    labelId: 'data_submission.gym_battles_won',
    labelText: 'Gym Battles Won',
    badge: Badge.GYM_BATTLES_WON,
  },
  { field: 'xl_karps', labelId: 'data_submission.xl_karps', labelText: 'XL Karps', badge: Badge.XL_KARPS },
  { field: 'xs_rats', labelId: 'data_submission.xs_rats', labelText: 'XS Rats', badge: Badge.XS_RATS },
  {
    field: 'pikachu_caught',
    labelId: 'data_submission.pikachu_caught',
    labelText: 'Pikachu Caught',
    badge: Badge.PIKACHU_CAUGHT,
  },
  {
    field: 'unique_unown',
    labelId: 'data_submission.unique_unown',
    labelText: 'Unique Unown',
    badge: Badge.UNIQUE_UNOWN,
  },
  { field: 'dex_gen2', labelId: 'data_submission.dex_gen2', labelText: 'Gen 2', badge: Badge.DEX_GEN_2 },
  {
    field: 'normal_raids_won',
    labelId: 'data_submission.normal_raids_won',
    labelText: 'Normal Raids Won',
    badge: Badge.NORMAL_RAIDS_WON,
  },
  {
    field: 'legendary_raids_won',
    labelId: 'data_submission.legendary_raids_won',
    labelText: 'Legendary Raids Won',
    badge: Badge.LEGENDARY_RAIDS_WON,
  },
  { field: 'berries_fed', labelId: 'data_submission.berries_fed', labelText: 'Berries Fed', badge: Badge.BERRIES_FED },
  {
    field: 'hours_defended',
    labelId: 'data_submission.hours_defended',
    labelText: 'Hours Defended',
    badge: Badge.HOURS_DEFENDED,
  },
  { field: 'dex_gen3', labelId: 'data_submission.dex_gen3', labelText: 'Gen 3', badge: Badge.DEX_GEN_3 },
  { field: 'quests', labelId: 'data_submission.quests', labelText: 'Quests Completed', badge: Badge.QUESTS },
  {
    field: 'best_friends',
    labelId: 'data_submission.best_friends',
    labelText: 'Best Friends',
    badge: Badge.BEST_FRIENDS,
  },
  { field: 'trades', labelId: 'data_submission.trades', labelText: 'Trades', badge: Badge.TRADES },
  { field: 'trade_km', labelId: 'data_submission.trade_km', labelText: 'Trade Km', badge: Badge.TRADE_KM },
  { field: 'dex_gen4', labelId: 'data_submission.dex_gen4', labelText: 'Gen 4', badge: Badge.DEX_GEN_4 },
  {
    field: 'league_great_won',
    labelId: 'data_submission.league_great_won',
    labelText: 'Great League Won',
    badge: Badge.LEAGUE_GREAT_WON,
  },
  {
    field: 'league_ultra_won',
    labelId: 'data_submission.league_ultra_won',
    labelText: 'Ultra League Won',
    badge: Badge.LEAGUE_ULTRA_WON,
  },
  {
    field: 'league_master_won',
    labelId: 'data_submission.league_master_won',
    labelText: 'Master League Won',
    badge: Badge.LEAGUE_MASTER_WON,
  },
  { field: 'photobombs', labelId: 'data_submission.photobombs', labelText: 'Photobombs', badge: Badge.PHOTOBOMBS },
  { field: 'dex_gen5', labelId: 'data_submission.dex_gen5', labelText: 'Gen 5', badge: Badge.DEX_GEN_5 },
  { field: 'purified', labelId: 'data_submission.purified', labelText: 'Purified', badge: Badge.PURIFIED },
  {
    field: 'grunts_defeated',
    labelId: 'data_submission.grunts_defeated',
    labelText: 'Grunts Defeated',
    badge: Badge.GRUNTS_DEFEATED,
  },
  {
    field: 'giovanni_defeated',
    labelId: 'data_submission.giovanni_defeated',
    labelText: 'Giovanni Defeated',
    badge: Badge.GIOVANNI_DEFEATED,
  },
  {
    field: 'best_buddies',
    labelId: 'data_submission.best_buddies',
    labelText: 'Best Buddies',
    badge: Badge.BEST_BUDDIES,
  },
  { field: 'dex_gen6', labelId: 'data_submission.dex_gen6', labelText: 'Gen 6', badge: Badge.DEX_GEN_6 },
  { field: 'dex_gen7', labelId: 'data_submission.dex_gen7', labelText: 'Gen 7', badge: Badge.DEX_GEN_7 },
  { field: 'dex_gen8', labelId: 'data_submission.dex_gen8', labelText: 'Gen 8', badge: Badge.DEX_GEN_8 },
  {
    field: 'seven_day_streaks',
    labelId: 'data_submission.seven_day_streaks',
    labelText: 'Seven Day Streaks',
    badge: Badge.SEVEN_DAY_STREAKS,
  },
  {
    field: 'unique_raid_bosses',
    labelId: 'data_submission.unique_raid_bosses',
    labelText: 'Unique Raid Bosses',
    badge: Badge.UNIQUE_RAID_BOSSES,
  },
  {
    field: 'raids_with_friends',
    labelId: 'data_submission.raids_with_friends',
    labelText: 'Raids With Friends',
    badge: Badge.RAIDS_WITH_FRIENDS,
  },
  {
    field: 'caught_at_lure',
    labelId: 'data_submission.caught_at_lure',
    labelText: 'Caught At Lure',
    badge: Badge.CAUGHT_AT_LURE,
  },
  { field: 'mega_evos', labelId: 'data_submission.mega_evos', labelText: 'Mega Evolutions', badge: Badge.MEGA_EVOS },
  {
    field: 'unique_mega_evos',
    labelId: 'data_submission.unique_mega_evos',
    labelText: 'Unique Mega Evolutions',
    badge: Badge.UNIQUE_MEGA_EVOS,
  },
  {
    field: 'trainers_referred',
    labelId: 'data_submission.trainers_referred',
    labelText: 'Trainers Referred',
    badge: Badge.TRAINERS_REFERRED,
  },
  {
    field: 'raid_achievements',
    labelId: 'data_submission.raid_achievements',
    labelText: 'Raid Achievements',
    badge: Badge.RAID_ACHIEVEMENTS,
  },
  {
    field: 'total_route_play',
    labelId: 'data_submission.total_route_play',
    labelText: 'Total Route Play',
    badge: Badge.TOTAL_ROUTE_PLAY,
  },
  { field: 'dex_gen8a', labelId: 'data_submission.dex_gen8a', labelText: 'Hisui', badge: Badge.DEX_GEN_8A },
  {
    field: 'tiny_pokemon_caught',
    labelId: 'data_submission.tiny_pokemon_caught',
    labelText: 'Tiny Pokémon Caught',
    badge: Badge.TINY_POKEMON_CAUGHT,
  },
  {
    field: 'jumbo_pokemon_caught',
    labelId: 'data_submission.jumbo_pokemon_caught',
    labelText: 'Jumbo Pokémon Caught',
    badge: Badge.JUMBO_POKEMON_CAUGHT,
  },
  { field: 'dex_gen9', labelId: 'data_submission.dex_gen9', labelText: 'Gen 9', badge: Badge.DEX_GEN_9 },
  {
    field: 'parties_completed',
    labelId: 'data_submission.parties_completed',
    labelText: 'Parties Completed',
    badge: Badge.PARTIES_COMPLETED,
  },
  {
    field: 'event_check_ins',
    labelId: 'data_submission.event_check_ins',
    labelText: 'Event Check-ins',
    badge: Badge.EVENT_CHECK_INS,
  },
  { field: 'vivillon', labelId: 'data_submission.vivillon', labelText: 'Vivillon', badge: Badge.VIVILLON },
  {
    field: 'showcase_max_size_first_place',
    labelId: 'data_submission.showcase_max_size_first_place',
    labelText: 'Showcase Max Size 1st Place',
    badge: Badge.SHOWCASE_MAX_SIZE_FIRST_PLACE,
  },
  {
    field: 'caught_normal',
    labelId: 'data_submission.caught_normal',
    labelText: 'Caught Normal',
    badge: Badge.CAUGHT_NORMAL,
  },
  {
    field: 'caught_fighting',
    labelId: 'data_submission.caught_fighting',
    labelText: 'Caught Fighting',
    badge: Badge.CAUGHT_FIGHTING,
  },
  {
    field: 'caught_flying',
    labelId: 'data_submission.caught_flying',
    labelText: 'Caught Flying',
    badge: Badge.CAUGHT_FLYING,
  },
  {
    field: 'caught_poison',
    labelId: 'data_submission.caught_poison',
    labelText: 'Caught Poison',
    badge: Badge.CAUGHT_POISON,
  },
  {
    field: 'caught_ground',
    labelId: 'data_submission.caught_ground',
    labelText: 'Caught Ground',
    badge: Badge.CAUGHT_GROUND,
  },
  { field: 'caught_rock', labelId: 'data_submission.caught_rock', labelText: 'Caught Rock', badge: Badge.CAUGHT_ROCK },
  { field: 'caught_bug', labelId: 'data_submission.caught_bug', labelText: 'Caught Bug', badge: Badge.CAUGHT_BUG },
  {
    field: 'caught_ghost',
    labelId: 'data_submission.caught_ghost',
    labelText: 'Caught Ghost',
    badge: Badge.CAUGHT_GHOST,
  },
  {
    field: 'caught_steel',
    labelId: 'data_submission.caught_steel',
    labelText: 'Caught Steel',
    badge: Badge.CAUGHT_STEEL,
  },
  { field: 'caught_fire', labelId: 'data_submission.caught_fire', labelText: 'Caught Fire', badge: Badge.CAUGHT_FIRE },
  {
    field: 'caught_water',
    labelId: 'data_submission.caught_water',
    labelText: 'Caught Water',
    badge: Badge.CAUGHT_WATER,
  },
  {
    field: 'caught_grass',
    labelId: 'data_submission.caught_grass',
    labelText: 'Caught Grass',
    badge: Badge.CAUGHT_GRASS,
  },
  {
    field: 'caught_electric',
    labelId: 'data_submission.caught_electric',
    labelText: 'Caught Electric',
    badge: Badge.CAUGHT_ELECTRIC,
  },
  {
    field: 'caught_psychic',
    labelId: 'data_submission.caught_psychic',
    labelText: 'Caught Psychic',
    badge: Badge.CAUGHT_PSYCHIC,
  },
  { field: 'caught_ice', labelId: 'data_submission.caught_ice', labelText: 'Caught Ice', badge: Badge.CAUGHT_ICE },
  {
    field: 'caught_dragon',
    labelId: 'data_submission.caught_dragon',
    labelText: 'Caught Dragon',
    badge: Badge.CAUGHT_DRAGON,
  },
  { field: 'caught_dark', labelId: 'data_submission.caught_dark', labelText: 'Caught Dark', badge: Badge.CAUGHT_DARK },
  {
    field: 'caught_fairy',
    labelId: 'data_submission.caught_fairy',
    labelText: 'Caught Fairy',
    badge: Badge.CAUGHT_FAIRY,
  },
];

const DataSubmissionPage: NextPage = () => {
  const intl = useIntl();
  const { data: session, status } = useSession();
  const trainerName = session?.trainerName ?? '';
  const discordId = session?.discordId ?? '';

  const [formData, setFormData] = useState<TrainerData>({});
  const [resolvedTrainerName, setResolvedTrainerName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing trainer data to pre-fill the form
  const fetchTrainerData = useCallback(async (name: string) => {
    if (!name) return;

    try {
      const response: TrainerData | { code: number; message: string } = await fetcher(
        `/api/trainers/${encodeURIComponent(name)}`,
      );

      if ('code' in response) {
        // Trainer not found (404) — start with empty form
        setFormData({});
      } else {
        setFormData(response as TrainerData);
      }
    } catch {
      setFormData({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      // If trainerName is in session, fetch data directly
      if (trainerName) {
        fetchTrainerData(trainerName);
      } else if (discordId) {
        // Otherwise look up trainer by Discord ID from player table
        const lookupByDiscord = async () => {
          try {
            const response: string | { code: number; message: string } = await fetcher(
              `/api/trainers/by-discord-id/${encodeURIComponent(discordId)}`,
            );

            if (typeof response === 'string') {
              setResolvedTrainerName(response);
              fetchTrainerData(response);
            } else {
              // Not registered yet — show empty form with editable trainer name
              setFormData({});
              setIsLoading(false);
            }
          } catch {
            setFormData({});
            setIsLoading(false);
          }
        };

        lookupByDiscord();
      } else {
        // No Discord ID — show empty form
        setFormData({});
        setIsLoading(false);
      }
    } else if (status === 'unauthenticated') {
      setFormData({});
      setIsLoading(false);
    }
  }, [status, trainerName, discordId, fetchTrainerData]);

  const handleChange = (field: string, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitMessage('');
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetcher<{ success: boolean; message?: string }>('/api/trainers/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trainerName || resolvedTrainerName || formData.name, ...formData }),
      });

      if (response.success) {
        setSubmitMessage(
          intl.formatMessage({
            id: 'data_submission.success',
            defaultMessage: 'Data submitted successfully!',
            description: 'Success message after data submission',
          }),
        );
      } else {
        setErrorMessage(response.message ?? 'Submission failed');
      }
    } catch {
      setErrorMessage(
        intl.formatMessage({
          id: 'data_submission.error',
          defaultMessage: 'An error occurred. Please try again.',
          description: 'Error message on submission failure',
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (config: FormField) => {
    const { field, labelId, labelText, badge, type, options } = config;
    const inputType = type ?? 'number';

    if (inputType === 'select' && options) {
      return (
        <div className="mb-3 flex items-center gap-2">
          {badge && <BadgeIcon badge={badge} value={(formData[field] as number) ?? 0} />}
          <label className="flex-1">
            <span className="block text-sm font-medium text-gray-300">
              {intl.formatMessage({ id: labelId, defaultMessage: labelText, description: `Label for ${field}` })}
            </span>
            <select
              className="mt-1 block w-full rounded border border-gray-600 bg-white px-2 py-1 text-sm text-gray-900"
              value={(formData[field] as number) ?? ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value, 10) : null;
                handleChange(field, value);
              }}
            >
              <option value="">—</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {intl.formatMessage({ id: option.labelId, defaultMessage: option.labelText })}
                </option>
              ))}
            </select>
          </label>
        </div>
      );
    }

    return (
      <div className="mb-3 flex items-center gap-2">
        {badge && <BadgeIcon badge={badge} value={(formData[field] as number) ?? 0} />}
        <label className="flex-1">
          <span className="block text-sm font-medium text-gray-300">
            {intl.formatMessage({ id: labelId, defaultMessage: labelText, description: `Label for ${field}` })}
          </span>
          <input
            type={inputType}
            className="mt-1 block w-full rounded border border-gray-600 bg-white px-2 py-1 text-sm text-gray-900"
            value={(formData[field] ?? '') as string}
            onChange={(e) => {
              const value =
                inputType === 'number' ? (e.target.value ? parseFloat(e.target.value) : null) : e.target.value || null;
              handleChange(field, value);
            }}
          />
        </label>
      </div>
    );
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center py-10">
        <FormattedMessage id="data_submission.loading" defaultMessage="Loading..." description="Loading indicator" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="py-10 text-center">
        <FormattedMessage
          id="data_submission.login_required"
          defaultMessage="Please log in to submit data."
          description="Login required message"
        />
      </div>
    );
  }

  const title = intl.formatMessage({
    id: 'data_submission.title',
    defaultMessage: 'Data Submission',
    description: 'Page title for data submission',
  });

  return (
    <div className="w-full min-h-screen bg-gray-900" style={{ padding: 'inherit' }}>
      <div className="max-w-4xl mx-auto p-6">
        <Head>
          <title key="title">{title}</title>
          <meta
            key="description"
            name="description"
            content={intl.formatMessage({
              id: 'data_submission.description',
              defaultMessage: 'Submit your Pokémon Go trainer data manually',
              description: 'Data submission page meta description',
            })}
          />
        </Head>

        <h1 className="title-1 mt-2.5 lg:mt-0.5" style={{ color: 'white' }}>
          {title}
        </h1>

        {trainerName || resolvedTrainerName ? (
          <p className="text-lg text-gray-300">
            <FormattedMessage
              id="data_submission.trainer_label"
              defaultMessage="Submitting data for trainer:"
              description="Label showing which trainer the data is being submitted for"
            />{' '}
            <strong className="text-white">{trainerName || resolvedTrainerName}</strong>
          </p>
        ) : (
          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-300">
              <FormattedMessage
                id="data_submission.trainer_name"
                defaultMessage="Trainer Name"
                description="Label for trainer name input field"
              />
              <input
                type="text"
                className="mt-1 block w-full rounded border border-gray-600 bg-white px-2 py-1 text-sm text-gray-900"
                value={(formData.name ?? '') as string}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </label>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-6">
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-3">
            {FORM_FIELDS.map((config) => renderField(config))}
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSubmitting} className="px-3">
              <FormattedMessage
                id="data_submission.submit_button"
                defaultMessage="Submit Data"
                description="Submit button for data submission form"
              />
            </Button>
            {submitMessage && <div className="rounded bg-green text-white px-3 py-1">{submitMessage}</div>}
            {errorMessage && <div className="rounded bg-red text-white px-3 py-1">{errorMessage}</div>}
          </div>
        </form>
      </div>
    </div>
  );
};

export const getStaticProps = wrapStaticPropsWithLocale(async () => {
  return {
    props: {},
  };
});

export default DataSubmissionPage;
