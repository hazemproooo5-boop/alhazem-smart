import { products } from '../data/seed';
import { Product } from '../types';

// Public catalog admission is deliberately strict. Imported/partially documented
// records remain in the source dataset but are not presented as verified products.
export const isCatalogReady = (product: Product): boolean => {
  const model = product.model.trim();
  const availability = product.availability.trim();
  return product.published
    && product.verificationStatus === 'Verified'
    && Boolean(product.imageUrl.trim())
    && Boolean(product.sourceUrl.trim())
    && Boolean(model)
    && !/يلزم|غير محدد|غير متوفر|غير مؤكد/i.test(model)
    && Object.keys(product.specifications).length > 0
    && Boolean(product.verifiedDate)
    && Boolean(availability)
    && !/يحتاج تأكيد|غير محدد|غير متاح|غير مؤكد/i.test(availability);
};

export const catalogProducts = products.filter(isCatalogReady);

// Imported catalog records remain visible in a clearly separated monitoring list,
// never as verified products and never with unverified prices or purchase actions.
export const catalogMonitoringProducts = products.filter(
  (product) => !isCatalogReady(product),
);
