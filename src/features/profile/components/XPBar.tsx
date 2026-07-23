import { FormattedMessage, useIntl } from 'react-intl';

import { ProgressBar } from '@/features/profile/components/ProgressBar';
import { Trainer } from '@/types';
import { useBreakpoint } from '@/utils/useBreakpoint';

const XPRequirements: Record<number, { needed: number; total: number }> = {
  1: { needed: 2500, total: 0 },
  2: { needed: 3000, total: 2500 },
  3: { needed: 3500, total: 5500 },
  4: { needed: 4000, total: 9000 },
  5: { needed: 5000, total: 13000 },
  6: { needed: 6000, total: 18000 },
  7: { needed: 7000, total: 24000 },
  8: { needed: 8000, total: 31000 },
  9: { needed: 9000, total: 39000 },
  10: { needed: 10000, total: 48000 },
  11: { needed: 12000, total: 58000 },
  12: { needed: 14000, total: 70000 },
  13: { needed: 16000, total: 84000 },
  14: { needed: 18000, total: 100000 },
  15: { needed: 21000, total: 118000 },
  16: { needed: 24500, total: 139000 },
  17: { needed: 28000, total: 163500 },
  18: { needed: 31500, total: 191500 },
  19: { needed: 35000, total: 223000 },
  20: { needed: 42000, total: 258000 },
  21: { needed: 49000, total: 300000 },
  22: { needed: 56000, total: 349000 },
  23: { needed: 63000, total: 405000 },
  24: { needed: 70000, total: 468000 },
  25: { needed: 83000, total: 538000 },
  26: { needed: 96000, total: 621000 },
  27: { needed: 109000, total: 717000 },
  28: { needed: 122000, total: 826000 },
  29: { needed: 135000, total: 948000 },
  30: { needed: 158000, total: 1083000 },
  31: { needed: 181000, total: 1241000 },
  32: { needed: 204000, total: 1422000 },
  33: { needed: 2270000, total: 1626000 },
  34: { needed: 250000, total: 1853000 },
  35: { needed: 290000, total: 2103000 },
  36: { needed: 330000, total: 2393000 },
  37: { needed: 370000, total: 2723000 },
  38: { needed: 410000, total: 3093000 },
  39: { needed: 450000, total: 3503000 },
  40: { needed: 520000, total: 3953000 },
  41: { needed: 590000, total: 4473000 },
  42: { needed: 660000, total: 5063000 },
  43: { needed: 730000, total: 5723000 },
  44: { needed: 800000, total: 6453000 },
  45: { needed: 900000, total: 7253000 },
  46: { needed: 1000000, total: 8153000 },
  47: { needed: 1100000, total: 9153000 },
  48: { needed: 1200000, total: 10253000 },
  49: { needed: 1300000, total: 11453000 },
  50: { needed: 1440000, total: 12753000 },
  51: { needed: 1580000, total: 14193000 },
  52: { needed: 1720000, total: 15773000 },
  53: { needed: 1860000, total: 17493000 },
  54: { needed: 2000000, total: 19353000 },
  55: { needed: 2200000, total: 21353000 },
  56: { needed: 2400000, total: 23553000 },
  57: { needed: 2600000, total: 25953000 },
  58: { needed: 2800000, total: 28553000 },
  59: { needed: 3000000, total: 31353000 },
  60: { needed: 3350000, total: 34353000 },
  61: { needed: 3700000, total: 37703000 },
  62: { needed: 4050000, total: 41403000 },
  63: { needed: 4400000, total: 45453000 },
  64: { needed: 4750000, total: 49853000 },
  65: { needed: 5250000, total: 54603000 },
  66: { needed: 5750000, total: 59853000 },
  67: { needed: 6250000, total: 65603000 },
  68: { needed: 6750000, total: 71853000 },
  69: { needed: 7250000, total: 78603000 },
  70: { needed: 8000000, total: 85853000 },
  71: { needed: 8750000, total: 93853000 },
  72: { needed: 9500000, total: 102603000 },
  73: { needed: 10250000, total: 112103000 },
  74: { needed: 11000000, total: 122353000 },
  75: { needed: 12000000, total: 133353000 },
  76: { needed: 13000000, total: 145353000 },
  77: { needed: 14000000, total: 158353000 },
  78: { needed: 15000000, total: 172353000 },
  79: { needed: 16000000, total: 187353000 },
  80: { needed: 0, total: 203353000 },
};

const MAX_LEVEL = 80;

export const XPBar = ({ trainer }: { trainer: Trainer }): JSX.Element | null => {
  const intl = useIntl();
  const isMobile = !useBreakpoint('xs');

  const requiredXP = XPRequirements[trainer.level].needed;
  const levelProgression = trainer.level === MAX_LEVEL ? 100 : trainer.xp - XPRequirements[trainer.level].total;
  const levelPercent = trainer.level === MAX_LEVEL ? 100 : Math.min(100, (levelProgression / requiredXP) * 100);

  return (
    <>
      <div className="flex justify-between my-2.5 lg:my-4 text-secondary text-grey-70 lg:title-3">
        <div>
          <FormattedMessage
            defaultMessage="Level: {level}"
            id="profile.level"
            description="Level line in the profile page"
            values={{ level: trainer.level }}
          />
        </div>
        {trainer.level !== MAX_LEVEL && (
          <div>
            <FormattedMessage
              defaultMessage="{levelProgression} / {requiredXP} XP"
              id="profile.level_progression"
              description="Level progression sub line in the profile page"
              values={{
                levelProgression: intl.formatNumber(levelProgression, isMobile ? { notation: 'compact' } : undefined),
                requiredXP: intl.formatNumber(requiredXP, isMobile ? { notation: 'compact' } : undefined),
              }}
            />
          </div>
        )}
      </div>
      <ProgressBar value={levelPercent} />
    </>
  );
};
