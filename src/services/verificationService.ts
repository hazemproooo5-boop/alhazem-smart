import { products, prices } from '../data/seed';

const PRICE_MAX_AGE_DAYS = 30;
const hasText = (value?: string): boolean => Boolean(value?.trim());

export const verificationService = {
  getDataQualitySummary: () => {
    const publishedProducts = products.filter((product) => product.published);
    const latestPriceByProduct = new Map<string, (typeof prices)[number]>();

    for (const price of prices) {
      const existing = latestPriceByProduct.get(price.productId);
      const priceTimestamp = new Date(price.priceDate).getTime();
      const existingTimestamp = existing ? new Date(existing.priceDate).getTime() : Number.NEGATIVE_INFINITY;
      const comparableTimestamp = Number.isFinite(priceTimestamp) ? priceTimestamp : Number.NEGATIVE_INFINITY;
      const existingComparableTimestamp = Number.isFinite(existingTimestamp)
        ? existingTimestamp
        : Number.NEGATIVE_INFINITY;

      if (!existing || comparableTimestamp > existingComparableTimestamp) {
        latestPriceByProduct.set(price.productId, price);
      }
    }

    let missingPrices = 0;
    let stalePrices = 0;
    let unverifiedPrices = 0;

    for (const product of publishedProducts) {
      const latestPrice = latestPriceByProduct.get(product.id);
      if (!latestPrice) {
        missingPrices += 1;
        continue;
      }

      if (latestPrice.isHistorical || latestPrice.verificationStatus !== 'Verified') {
        unverifiedPrices += 1;
      }

      const timestamp = new Date(latestPrice.priceDate).getTime();
      if (!Number.isFinite(timestamp)) {
        stalePrices += 1;
        continue;
      }

      const ageInDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
      if (ageInDays < 0 || ageInDays > PRICE_MAX_AGE_DAYS) {
        stalePrices += 1;
      }
    }

    return {
      summary: {
        publishedProducts: publishedProducts.length,
        missingModels: publishedProducts.filter((product) =>
          !hasText(product.model) || /بدون كود موديل|غير محدد|غير متوفر|يلزم تأكيد|غير مؤكد/i.test(product.model),
        ).length,
        missingAvailability: publishedProducts.filter((product) =>
          !hasText(product.availability) || /يحتاج تأكيد|غير محدد|غير متاح|غير مؤكد/i.test(product.availability),
        ).length,
        missingImages: publishedProducts.filter((product) => !hasText(product.imageUrl)).length,
        missingSources: publishedProducts.filter((product) => !hasText(product.sourceUrl)).length,
        missingSpecs: publishedProducts.filter((product) =>
          Object.entries(product.specifications).length === 0
          || Object.entries(product.specifications).some(([key, value]) => !hasText(key) || !hasText(value)),
        ).length,
        missingWarranty: publishedProducts.filter((product) => !hasText(product.warranty)).length,
        missingPrices,
        stalePrices,
        unverifiedPrices,
      },
    };
  },
};

export default verificationService;
