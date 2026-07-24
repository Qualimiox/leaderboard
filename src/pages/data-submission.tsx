import Head from 'next/head';
import type { NextPage } from 'next';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSession } from 'next-auth/react';
import { useState, useEffect, FormEvent, useCallback } from 'react';

import { fetcher } from '@/utils/fetcher';
import { Button } from '@/components/button';
import { wrapStaticPropsWithLocale } from '@/utils/i18n';

interface TrainerData {
  [key: string]: string | number | null;
}

const DataSubmissionPage: NextPage = () => {
  const intl = useIntl();
  const { data: session, status } = useSession();
  const trainerName = session?.trainerName ?? '';

  const [formData, setFormData] = useState<TrainerData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing trainer data to pre-fill the form
  const fetchTrainerData = useCallback(async () => {
    if (!trainerName) return;

    try {
      const response: TrainerData | { code: number; message: string } = await fetcher(
        `/api/trainers/${encodeURIComponent(trainerName)}`,
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
  }, [trainerName]);

  useEffect(() => {
    if (status === 'authenticated' && trainerName) {
      fetchTrainerData();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [status, trainerName, fetchTrainerData]);

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
        body: JSON.stringify({ name: trainerName, ...formData }),
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

  const renderField = (field: string, labelId: string, labelText: string, type: 'text' | 'number' = 'number') => (
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {intl.formatMessage({ id: labelId, defaultMessage: labelText, description: `Label for ${field}` })}
        <input
          type={type}
          className="mt-1 block w-full rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
          value={(formData[field] ?? '') as string}
          onChange={(e) =>
            handleChange(
              field,
              type === 'number' ? (e.target.value ? parseFloat(e.target.value) : null) : e.target.value || null,
            )
          }
        />
      </label>
    </div>
  );

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex justify-center py-10">
        <FormattedMessage id="data_submission.loading" defaultMessage="Loading..." description="Loading indicator" />
      </div>
    );
  }

  if (!trainerName) {
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
    <>
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

      <h1 className="title-1 mt-2.5 lg:mt-0.5">{title}</h1>

      {submitMessage && (
        <div className="my-3 rounded bg-green text-black p-2">{submitMessage}</div>
      )}
      {errorMessage && (
        <div className="my-3 rounded bg-red text-black p-2">{errorMessage}</div>
      )}

      <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-6">
        {/* General Info */}
        <fieldset className="rounded border border-gray-300 p-4 dark:border-gray-600">
          <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            <FormattedMessage id="data_submission.general_info" defaultMessage="General Info" description="Section header for general info" />
          </legend>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-3">
            {renderField('friendship_id', 'data_submission.friendship_id', 'Friendship ID', 'text')}
            {renderField('friend_code', 'data_submission.friend_code', 'Friend Code', 'text')}
            {renderField('team', 'data_submission.team', 'Team')}
            {renderField('level', 'data_submission.level', 'Level')}
            {renderField('xp', 'data_submission.xp', 'XP')}
          </div>
        </fieldset>

        {/* Walking & Catching */}
        <fieldset className="rounded border border-gray-300 p-4 dark:border-gray-600">
          <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            <FormattedMessage
              id="data_submission.walking_catching"
              defaultMessage="Walking & Catching"
              description="Section header for walking and catching stats"
            />
          </legend>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-3">
            {renderField('km_walked', 'data_submission.km_walked', 'Km Walked')}
            {renderField('caught_pokemon', 'data_submission.caught_pokemon', 'Caught Pokémon')}
          </div>
        </fieldset>

        {/* Battles & Gym */}
        <fieldset className="rounded border border-gray-300 p-4 dark:border-gray-600">
          <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            <FormattedMessage id="data_submission.battles_gym" defaultMessage="Battles & Gym" description="Section header for battles and gym stats" />
          </legend>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-3">
            {renderField('battles_won', 'data_submission.battles_won', 'Battles Won')}
            {renderField('gym_battles_won', 'data_submission.gym_battles_won', 'Gym Battles Won')}
            {renderField('grunts_defeated', 'data_submission.grunts_defeated', 'Grunts Defeated')}
          </div>
        </fieldset>

        {/* Raids */}
        <fieldset className="rounded border border-gray-300 p-4 dark:border-gray-600">
          <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            <FormattedMessage id="data_submission.raids" defaultMessage="Raids" description="Section header for raid stats" />
          </legend>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-3">
            {renderField('normal_raids_won', 'data_submission.normal_raids_won', 'Normal Raids Won')}
            {renderField('legendary_raids_won', 'data_submission.legendary_raids_won', 'Legendary Raids Won')}
            {renderField('trainings_won', 'data_submission.trainings_won', 'Trainings Won')}
            {renderField('raids_with_friends', 'data_submission.raids_with_friends', 'Raids With Friends')}
            {renderField('raid_achievements', 'data_submission.raid_achievements', 'Raid Achievements')}
            {renderField('unique_raid_bosses', 'data_submission.unique_raid_bosses', 'Unique Raid Bosses')}
          </div>
        </fieldset>

        {/* Evolution & Hatching */}
        <fieldset className="rounded border border-gray-300 p-4 dark:border-gray-600">
          <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            <FormattedMessage
              id="data_submission.evolution_hatching"
              defaultMessage="Evolution & Hatching"
              description="Section header for evolution and hatching stats"
            />
          </legend>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-3">
            {renderField('evolved', 'data_submission.evolved', 'Evolved')}
            {renderField('hatched', 'data_submission.hatched', 'Hatched')}
            {renderField('mega_evos', 'data_submission.mega_evos', 'Mega Evolutions')}
            {renderField('unique_mega_evos', 'data_submission.unique_mega_evos', 'Unique Mega Evolutions')}
          </div>
        </fieldset>

        {/* Social */}
        <fieldset className="rounded border border-gray-300 p-4 dark:border-gray-600">
          <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            <FormattedMessage id="data_submission.social" defaultMessage="Social" description="Section header for social stats" />
          </legend>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-3">
            {renderField('trades', 'data_submission.trades', 'Trades')}
            {renderField('photobombs', 'data_submission.photobombs', 'Photobombs')}
            {renderField('purified', 'data_submission.purified', 'Purified')}
            {renderField('best_friends', 'data_submission.best_friends', 'Best Friends')}
            {renderField('best_buddies', 'data_submission.best_buddies', 'Best Buddies')}
            {renderField('trainers_referred', 'data_submission.trainers_referred', 'Trainers Referred')}
          </div>
        </fieldset>

        {/* League (PvP) */}
        <fieldset className="rounded border border-gray-300 p-4 dark:border-gray-600">
          <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            <FormattedMessage id="data_submission.league_pvp" defaultMessage="League (PvP)" description="Section header for league PvP stats" />
          </legend>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-3">
            {renderField('gbl_rank', 'data_submission.gbl_rank', 'GBL Rank')}
            {renderField('gbl_rating', 'data_submission.gbl_rating', 'GBL Rating')}
            {renderField('league_great_won', 'data_submission.league_great_won', 'Great League Won')}
            {renderField('league_ultra_won', 'data_submission.league_ultra_won', 'Ultra League Won')}
            {renderField('league_master_won', 'data_submission.league_master_won', 'Master League Won')}
          </div>
        </fieldset>

        {/* Stops & Quests */}
        <fieldset className="rounded border border-gray-300 p-4 dark:border-gray-600">
          <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            <FormattedMessage id="data_submission.stops_quests" defaultMessage="Stops & Quests" description="Section header for stops and quests stats" />
          </legend>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-3">
            {renderField('stops_spun', 'data_submission.stops_spun', 'Stops Spun')}
            {renderField('unique_stops_spun', 'data_submission.unique_stops_spun', 'Unique Stops Spun')}
            {renderField('quests', 'data_submission.quests', 'Quests Completed')}
            {renderField('berries_fed', 'data_submission.berries_fed', 'Berries Fed')}
            {renderField('hours_defended', 'data_submission.hours_defended', 'Hours Defended')}
          </div>
        </fieldset>

        {/* Special Pokémon */}
        <fieldset className="rounded border border-gray-300 p-4 dark:border-gray-600">
          <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            <FormattedMessage id="data_submission.special_pokemon" defaultMessage="Special Pokémon" description="Section header for special pokemon stats" />
          </legend>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-3">
            {renderField('vivillon', 'data_submission.vivillon', 'Vivillon')}
            {renderField('pikachu_caught', 'data_submission.pikachu_caught', 'Pikachu Caught')}
            {renderField('tiny_pokemon_caught', 'data_submission.tiny_pokemon_caught', 'Tiny Pokémon Caught')}
            {renderField('jumbo_pokemon_caught', 'data_submission.jumbo_pokemon_caught', 'Jumbo Pokémon Caught')}
            {renderField('xl_karps', 'data_submission.xl_karps', 'XL Karps')}
            {renderField('xs_rats', 'data_submission.xs_rats', 'XS Rats')}
          </div>
        </fieldset>

        {/* Giovanni & Collections */}
        <fieldset className="rounded border border-gray-300 p-4 dark:border-gray-600">
          <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            <FormattedMessage
              id="data_submission.giovanni_collections"
              defaultMessage="Giovanni & Collections"
              description="Section header for Giovanni and collections stats"
            />
          </legend>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-3">
            {renderField('giovanni_defeated', 'data_submission.giovanni_defeated', 'Giovanni Defeated')}
            {renderField('collections_done', 'data_submission.collections_done', 'Collections Done')}
          </div>
        </fieldset>

        {/* Events & Activities */}
        <fieldset className="rounded border border-gray-300 p-4 dark:border-gray-600">
          <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            <FormattedMessage
              id="data_submission.events_activities"
              defaultMessage="Events & Activities"
              description="Section header for events and activities stats"
            />
          </legend>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-3">
            {renderField('event_badges', 'data_submission.event_badges', 'Event Badges', 'text')}
            {renderField(
              'showcase_max_size_first_place',
              'data_submission.showcase_max_size_first_place',
              'Showcase Max Size 1st Place',
            )}
            {renderField('total_route_play', 'data_submission.total_route_play', 'Total Route Play')}
            {renderField('parties_completed', 'data_submission.parties_completed', 'Parties Completed')}
            {renderField('event_check_ins', 'data_submission.event_check_ins', 'Event Check-ins')}
          </div>
        </fieldset>

        {/* Streaks & Lures */}
        <fieldset className="rounded border border-gray-300 p-4 dark:border-gray-600">
          <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            <FormattedMessage
              id="data_submission.streaks_lures"
              defaultMessage="Streaks & Lures"
              description="Section header for streaks and lures stats"
            />
          </legend>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-3">
            {renderField('seven_day_streaks', 'data_submission.seven_day_streaks', 'Seven Day Streaks')}
            {renderField('caught_at_lure', 'data_submission.caught_at_lure', 'Caught At Lure')}
          </div>
        </fieldset>

        {/* Wayfarer & Trade */}
        <fieldset className="rounded border border-gray-300 p-4 dark:border-gray-600">
          <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            <FormattedMessage
              id="data_submission.wayfarer_trade"
              defaultMessage="Wayfarer & Trade"
              description="Section header for Wayfarer and trade stats"
            />
          </legend>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-3">
            {renderField('wayfarer_agreements', 'data_submission.wayfarer_agreements', 'Wayfarer Agreements')}
            {renderField('trade_km', 'data_submission.trade_km', 'Trade Km')}
          </div>
        </fieldset>

        {/* Unique Unown */}
        <fieldset className="rounded border border-gray-300 p-4 dark:border-gray-600">
          <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            <FormattedMessage id="data_submission.unique_unown_section" defaultMessage="Unique Unown" description="Section header for unique unown stat" />
          </legend>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-3">
            {renderField('unique_unown', 'data_submission.unique_unown', 'Unique Unown')}
          </div>
        </fieldset>

        {/* Pokédex */}
        <fieldset className="rounded border border-gray-300 p-4 dark:border-gray-600">
          <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            <FormattedMessage id="data_submission.pokedex" defaultMessage="Pokédex" description="Section header for Pokedex stats" />
          </legend>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-4">
            {renderField('dex_gen1', 'data_submission.dex_gen1', 'Gen 1')}
            {renderField('dex_gen2', 'data_submission.dex_gen2', 'Gen 2')}
            {renderField('dex_gen3', 'data_submission.dex_gen3', 'Gen 3')}
            {renderField('dex_gen4', 'data_submission.dex_gen4', 'Gen 4')}
            {renderField('dex_gen5', 'data_submission.dex_gen5', 'Gen 5')}
            {renderField('dex_gen6', 'data_submission.dex_gen6', 'Gen 6')}
            {renderField('dex_gen7', 'data_submission.dex_gen7', 'Gen 7')}
            {renderField('dex_gen8', 'data_submission.dex_gen8', 'Gen 8')}
            {renderField('dex_gen8a', 'data_submission.dex_gen8a', 'Hisui')}
            {renderField('dex_gen9', 'data_submission.dex_gen9', 'Gen 9')}
          </div>
        </fieldset>

        {/* Type-specific Catches */}
        <fieldset className="rounded border border-gray-300 p-4 dark:border-gray-600">
          <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            <FormattedMessage
              id="data_submission.type_specific_catches"
              defaultMessage="Type-specific Catches"
              description="Section header for type-specific catch stats"
            />
          </legend>
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2 lg:grid-cols-4">
            {renderField('caught_normal', 'data_submission.caught_normal', 'Caught Normal')}
            {renderField('caught_fighting', 'data_submission.caught_fighting', 'Caught Fighting')}
            {renderField('caught_flying', 'data_submission.caught_flying', 'Caught Flying')}
            {renderField('caught_poison', 'data_submission.caught_poison', 'Caught Poison')}
            {renderField('caught_ground', 'data_submission.caught_ground', 'Caught Ground')}
            {renderField('caught_rock', 'data_submission.caught_rock', 'Caught Rock')}
            {renderField('caught_bug', 'data_submission.caught_bug', 'Caught Bug')}
            {renderField('caught_ghost', 'data_submission.caught_ghost', 'Caught Ghost')}
            {renderField('caught_steel', 'data_submission.caught_steel', 'Caught Steel')}
            {renderField('caught_fire', 'data_submission.caught_fire', 'Caught Fire')}
            {renderField('caught_water', 'data_submission.caught_water', 'Caught Water')}
            {renderField('caught_grass', 'data_submission.caught_grass', 'Caught Grass')}
            {renderField('caught_electric', 'data_submission.caught_electric', 'Caught Electric')}
            {renderField('caught_psychic', 'data_submission.caught_psychic', 'Caught Psychic')}
            {renderField('caught_ice', 'data_submission.caught_ice', 'Caught Ice')}
            {renderField('caught_dragon', 'data_submission.caught_dragon', 'Caught Dragon')}
            {renderField('caught_dark', 'data_submission.caught_dark', 'Caught Dark')}
            {renderField('caught_fairy', 'data_submission.caught_fairy', 'Caught Fairy')}
          </div>
        </fieldset>

        <Button type="submit" disabled={isSubmitting} className="px-3">
          <FormattedMessage id="data_submission.submit_button" defaultMessage="Submit Data" description="Submit button for data submission form" />
        </Button>
      </form>
    </>
  );
};

export const getStaticProps = wrapStaticPropsWithLocale(async () => {
  return {
    props: {},
  };
});

export default DataSubmissionPage;
