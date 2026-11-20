import { PriceRecord } from '../types';
import { prices } from '../data/seed';

const PRICE_MAX_AGE_DAYS = 2;

export const priceService = {
  getLatest: (productId: string): PriceRecord | undefined => {
    const list = prices.filter((price) => price.productId === productId);
    return list.sort((a, b) => new Date(b.priceDate).getTime() - new Date(a.priceDate).getTime())[0];
  },

  // A historical record must not be presented as a current selling price.
  getCurrent: (productId: string, maxAgeDays = PRICE_MAX_AGE_DAYS): PriceRecord | undefined => {
    const latest = priceService.getLatest(productId);
    if (!latest || latest.isHistorical || latest.verificationStatus !== 'Verified') return undefined;

    const priceTimestamp = new Date(latest.priceDate).getTime();
    if (!Number.isFinite(priceTimestamp)) return undefined;

    const ageInDays = (Date.now() - priceTimestamp) / (1000 * 60 * 60 * 24);
    const enforcedMaxAgeDays = Math.min(maxAgeDays, PRICE_MAX_AGE_DAYS);
    return ageInDays >= 0 && ageInDays <= enforcedMaxAgeDays ? latest : undefined;
  },
};

export default priceService;
