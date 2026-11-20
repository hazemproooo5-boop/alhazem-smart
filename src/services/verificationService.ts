import { products, prices } from '../data/seed';

const PRICE_MAX_AGE_DAYS = 30;
const hasText = (value?: string): boolean => Boolean(value?.trim());
const isPlaceholder = (value?: string, pattern?: RegExp): boolean =>
  !hasText(value) || Boolean(pattern?.test(value ?? ''));

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

    const auditRows = publishedProducts.map((product) => {
      const latestPrice = latestPriceByProduct.get(product.id);
      const issues: string[] = [];
      if (isPlaceholder(product.model, /بدون كود موديل|غير محدد|غير متوفر|يلزم تأكيد|غير مؤكد/i)) {
        issues.push('الموديل يحتاج استكمالاً أو مطابقة');
      }
      if (isPlaceholder(product.availability, /يحتاج تأكيد|غير محدد|غير متاح|غير مؤكد/i)) {
        issues.push('حالة التوفر تحتاج تحققاً حديثاً');
      }
      if (!hasText(product.imageUrl)) issues.push('صورة المنتج غير مسجلة');
      if (!hasText(product.sourceUrl)) issues.push('مصدر المنتج غير مسجل');
      if (
        Object.entries(product.specifications).length === 0
        || Object.entries(product.specifications).some(([key, value]) => !hasText(key) || !hasText(value))
      ) {
        issues.push('المواصفات ناقصة أو بها حقول فارغة');
      }
      if (isPlaceholder(product.warranty, /غير محدد|غير متوفر|يحتاج تأكيد|غير مؤكد/i)) {
        issues.push('الضمان غير موثق');
      }
      if (product.verificationStatus !== 'Verified') {
        issues.push(`حالة التوثيق الحالية: ${product.verificationStatus}`);
      }

      let priceState = 'لا يوجد سجل سعر';
      if (latestPrice) {
        const timestamp = new Date(latestPrice.priceDate).getTime();
        const ageInDays = Number.isFinite(timestamp)
          ? (Date.now() - timestamp) / (1000 * 60 * 60 * 24)
          : Number.POSITIVE_INFINITY;
        const isStale = !Number.isFinite(timestamp) || ageInDays < 0 || ageInDays > PRICE_MAX_AGE_DAYS;
        const isUnverified = latestPrice.isHistorical || latestPrice.verificationStatus !== 'Verified';
        priceState = [
          latestPrice.isHistorical ? 'تاريخي' : '',
          isUnverified ? 'غير موثق' : '',
          isStale ? 'قديم أو تاريخ غير صالح' : '',
        ].filter(Boolean).join('، ') || 'حديث وموثق';
        if (isUnverified) issues.push('أحدث سعر غير موثق أو تاريخي');
        if (isStale) issues.push('أحدث سعر تجاوز 30 يوماً أو تاريخه غير صالح');
      } else {
        issues.push('لا يوجد سجل سعر');
      }

      return {
        id: product.id,
        name: product.name,
        model: product.model || product.sku || 'غير محدد',
        brandId: product.brandId,
        verificationStatus: product.verificationStatus,
        sourceUrl: product.sourceUrl,
        latestPriceDate: latestPrice?.priceDate ?? '',
        latestPriceSourceUrl: latestPrice?.sourceUrl ?? '',
        priceState,
        issues,
      };
    });

    const countIssues = (predicate: (product: (typeof publishedProducts)[number]) => boolean) =>
      publishedProducts.filter(predicate).length;
    const latestPrices = publishedProducts.map((product) => latestPriceByProduct.get(product.id)).filter(Boolean);
    const missingPrices = publishedProducts.length - latestPrices.length;
    const stalePrices = latestPrices.filter((price) => {
      const timestamp = new Date(price!.priceDate).getTime();
      const ageInDays = Number.isFinite(timestamp)
        ? (Date.now() - timestamp) / (1000 * 60 * 60 * 24)
        : Number.POSITIVE_INFINITY;
      return !Number.isFinite(timestamp) || ageInDays < 0 || ageInDays > PRICE_MAX_AGE_DAYS;
    }).length;
    const unverifiedPrices = latestPrices.filter((price) =>
      price!.isHistorical || price!.verificationStatus !== 'Verified',
    ).length;

    return {
      summary: {
        publishedProducts: publishedProducts.length,
        missingModels: countIssues((product) =>
          isPlaceholder(product.model, /بدون كود موديل|غير محدد|غير متوفر|يلزم تأكيد|غير مؤكد/i),
        ),
        missingAvailability: countIssues((product) =>
          isPlaceholder(product.availability, /يحتاج تأكيد|غير محدد|غير متاح|غير مؤكد/i),
        ),
        missingImages: countIssues((product) => !hasText(product.imageUrl)),
        missingSources: countIssues((product) => !hasText(product.sourceUrl)),
        missingSpecs: countIssues((product) =>
          Object.entries(product.specifications).length === 0
          || Object.entries(product.specifications).some(([key, value]) => !hasText(key) || !hasText(value)),
        ),
        missingWarranty: countIssues((product) =>
          isPlaceholder(product.warranty, /غير محدد|غير متوفر|يحتاج تأكيد|غير مؤكد/i),
        ),
        missingPrices,
        stalePrices,
        unverifiedPrices,
      },
      products: auditRows,
    };
  },
};

export default verificationService;
