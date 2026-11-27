import fs from 'node:fs';
import path from 'node:path';

const catalog = fs.readFileSync('src/data/cairoSalesCatalog.ts', 'utf8');
const brandSource = fs.readFileSync('src/data/brandDirectory.ts', 'utf8');
const companySource = fs.readFileSync('src/data/companyDirectory.ts', 'utf8');
const seedSource = fs.readFileSync('src/data/seed.ts', 'utf8');

const declarations = [...catalog.matchAll(/export const (\w+)\s*:\s*[^=]+=/g)];
const sections = declarations.map((match, index) => ({
  name: match[1],
  source: catalog.slice(match.index, declarations[index + 1]?.index ?? catalog.length),
}));
const parseObjects = source => {
  const assignment = source.indexOf('=');
  const arrayStart = source.indexOf('[', assignment);
  if (arrayStart < 0) return [];

  const objects = [];
  let depth = 0;
  let objectStart = -1;
  let inString = false;
  let escaped = false;

  for (let index = arrayStart + 1; index < source.length; index += 1) {
    const character = source[index];

    if (inString) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }

    if (character === '"') {
      inString = true;
      continue;
    }

    if (character === '{') {
      if (depth === 0) objectStart = index;
      depth += 1;
      continue;
    }

    if (character === '}') {
      depth -= 1;
      if (depth === 0 && objectStart >= 0) {
        objects.push(source.slice(objectStart, index + 1));
        objectStart = -1;
      }
      continue;
    }

    if (character === ']' && depth === 0) break;
  }

  return objects;
};
const read = (block, key) => {
  const match = block.match(new RegExp('"' + key + '"\\s*:\\s*"([^"]*)"'));
  return match?.[1] ?? '';
};
const productSections = sections.filter(section => /Products$/.test(section.name));
const priceSections = sections.filter(section => /Prices$/.test(section.name));
const productBlocks = productSections.flatMap(section => parseObjects(section.source));
const seedProductSection = seedSource.match(/export const products: Product\[\] = \[([\s\S]*?)\n\];/);
if (!seedProductSection) throw new Error('seed products declaration not found');
const seedProductBlocks = [...seedProductSection[1].matchAll(/\{\s*id:\s*'prod-[^']+'[\s\S]*?\n  \},/g)].map(match => match[0]);
const readSeed = (block, key) => {
  const match = block.match(new RegExp(`\\b${key}:\\s*'([^']*)'`));
  return match?.[1] ?? '';
};
const catalogPriceBlocks = priceSections.flatMap(section => parseObjects(section.source));
const seedPriceSection = seedSource.match(/export const prices: PriceRecord\[\] = \[([\s\S]*?)\n\];/);
if (!seedPriceSection) throw new Error('seed prices declaration not found');
const seedPriceBlocks = [...seedPriceSection[1].matchAll(/\{\s*id:\s*'price-[^']+'[\s\S]*?\n  \},/g)].map(match => match[0]);
const priceBlocks = [...seedPriceBlocks, ...catalogPriceBlocks];
const priceIds = [
  ...seedPriceBlocks.map(block => readSeed(block, 'id')),
  ...catalogPriceBlocks.map(block => read(block, 'id')),
].filter(Boolean);
const duplicatePriceIds = [...new Set(priceIds.filter((id, index) => priceIds.indexOf(id) !== index))];
const rows = [
  ...seedProductBlocks.map(block => ({
    id: readSeed(block, 'id'),
    name: readSeed(block, 'name'),
    brandId: readSeed(block, 'brandId'),
    categoryId: readSeed(block, 'categoryId'),
    model: readSeed(block, 'model') || readSeed(block, 'sku'),
    verificationStatus: readSeed(block, 'verificationStatus') || 'Missing',
    sourceUrl: readSeed(block, 'sourceUrl'),
    imageUrl: readSeed(block, 'imageUrl'),
    availability: readSeed(block, 'availability'),
    published: /published:\s*true/.test(block),
    hasSpecifications: /specifications:\s*\{\s*['\"]/.test(block),
  })),
  ...productBlocks.map(block => ({
  id: read(block, 'id'),
  name: read(block, 'name'),
  brandId: read(block, 'brandId'),
  categoryId: read(block, 'categoryId'),
  model: read(block, 'model') || read(block, 'sku'),
  verificationStatus: read(block, 'verificationStatus') || 'Missing',
  sourceUrl: read(block, 'sourceUrl'),
  imageUrl: read(block, 'imageUrl'),
  availability: read(block, 'availability'),
  published: /"published"\s*:\s*true/.test(block),
  hasSpecifications: /"specifications"\s*:\s*\{\s*"/.test(block),
  })),
];
const productIds = rows.map(row => row.id).filter(Boolean);
const duplicateProductIds = [...new Set(productIds.filter((id, index) => productIds.indexOf(id) !== index))];
const priceProductIds = [
  ...seedPriceBlocks.map(block => readSeed(block, 'productId')),
  ...catalogPriceBlocks.map(block => read(block, 'productId')),
].filter(Boolean);
const orphanPriceProductIds = [...new Set(priceProductIds.filter(id => !productIds.includes(id)))];
const brandSection = brandSource.match(/export const brandDirectoryNames: string\[\] = \[([\s\S]*?)\];/);
if (!brandSection) throw new Error('brandDirectoryNames declaration not found');
const brandNames = [...brandSection[1].matchAll(/^\s*"([^"]+)",?\s*$/gm)].map(match => match[1]);
const brandIdSection = catalog.match(/export const cairoSalesBrands: Brand\[\] = \[([\s\S]*?)\n\];/);
if (!brandIdSection) throw new Error('cairoSalesBrands declaration not found');
const importedBrandIds = [...brandIdSection[1].matchAll(/"id"\s*:\s*"([^"]+)"/g)].map(match => match[1]);
const coreBrandSection = seedSource.match(/const brandRecords: Brand\[\] = \[([\s\S]*?)\n  \.\.\.cairoSalesBrands/);
if (!coreBrandSection) throw new Error('core brand records declaration not found');
const coreBrandIds = [...coreBrandSection[1].matchAll(/\bid:\s*'([^']+)'/g)].map(match => match[1]);
const knownBrandIds = new Set([...coreBrandIds, ...importedBrandIds]);
const missingBrandReferences = rows
  .filter(row => !row.brandId || !knownBrandIds.has(row.brandId))
  .map(({ id, name, brandId }) => ({ id, name, brandId }));
const companyStart = companySource.indexOf('export const companyDirectory');
const marketStart = companySource.indexOf('export const wholesaleMarketDirectory');
if (companyStart < 0 || marketStart < 0) throw new Error('company or wholesale market directory declaration not found');
const companyBlocks = parseObjects(companySource.slice(companyStart, marketStart));
const marketBlocks = parseObjects(companySource.slice(marketStart));
const supplierSection = seedSource.slice(seedSource.indexOf('export const suppliers'));
const supplierRecords = (supplierSection.match(/\bid:\s*['"]sp-/g) || []).length;
const unique = values => new Set(values.map(value => value.trim().toLocaleLowerCase()));
const counts = key => rows.reduce((acc, row) => {
  const value = row[key] || 'Missing';
  acc[value] = (acc[value] || 0) + 1;
  return acc;
}, {});

const priceMetadataGaps = priceBlocks.map(block => ({
  id: readSeed(block, 'id') || read(block, 'id'),
  source: readSeed(block, 'source') || read(block, 'source'),
  sourceUrl: readSeed(block, 'sourceUrl') || read(block, 'sourceUrl'),
  priceDate: readSeed(block, 'priceDate') || read(block, 'priceDate'),
})).filter(item => !item.source || !item.sourceUrl || !item.priceDate);

const datedPriceRecords = priceBlocks.map(block => ({
  id: readSeed(block, 'id') || read(block, 'id'),
  priceDate: readSeed(block, 'priceDate') || read(block, 'priceDate'),
})).filter(item => item.priceDate);
const invalidPriceDates = datedPriceRecords
  .filter(item => Number.isNaN(Date.parse(item.priceDate)))
  .map(item => ({ ...item, issue: 'invalid-date' }));
const futurePriceDates = datedPriceRecords
  .filter(item => !Number.isNaN(Date.parse(item.priceDate)) && Date.parse(item.priceDate) > Date.now())
  .map(item => ({ ...item, issue: 'future-date' }));


const normalizeKey = value => String(value || '').normalize('NFKC').trim().toLocaleLowerCase().replace(/[\\s\\-_]+/g, '');
const groupBy = (items, keyFn) => {
  const groups = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.entries()].filter(([, group]) => group.length > 1);
};
const duplicateBrandNames = groupBy(brandNames, normalizeKey).map(([normalized, names]) => ({ normalized, names }));
const productModelGroups = groupBy(rows, row => row.model && !/بدون كود موديل|غير محدد|غير متوفر|يلزم/i.test(row.model)
  ? `${normalizeKey(row.brandId)}::${normalizeKey(row.model)}` : '');
const duplicateBrandModelPairs = productModelGroups.map(([key, products]) => ({
  key, brandId: products[0].brandId, model: products[0].model,
  products: products.map(({ id, name, categoryId }) => ({ id, name, categoryId })),
}));
const brandsWithoutOfficialReference = parseObjects(brandIdSection[1]).map(block => ({
  id: read(block, 'id'), name: read(block, 'name'), officialUrl: read(block, 'officialUrl'),
  logo: read(block, 'logo'), sourceStatus: read(block, 'sourceStatus'),
})).filter(brand => !brand.officialUrl || !brand.logo);
const productsMissingCoreFields = rows.filter(row => !row.name || !row.brandId || !row.categoryId);
const categoryCoverage = Object.entries(counts('categoryId')).map(([categoryId, productCount]) => ({ categoryId, productCount }));

const summary = {
  generatedAt: new Date().toISOString(),
  products: rows.length,
  priceHistoryRecords: priceBlocks.length,
  uniquePriceRecordIds: new Set(priceIds).size,
  duplicatePriceIds,
  duplicateProductIds,
  duplicateBrandNames,
  duplicateBrandModelPairs,
  brandsWithoutOfficialReference,
  productsMissingCoreFields,
  categoryCoverage,
  orphanPriceProductIds,
  missingBrandReferences,
  priceMetadataGaps,
  invalidPriceDates,
  futurePriceDates,
  seedProductAudit: {
    total: seedProductBlocks.length,
    published: rows.filter(row => row.id.startsWith('prod-') && row.published).length,
    withSpecifications: rows.filter(row => row.id.startsWith('prod-') && row.hasSpecifications).length,
  },
  productSections: [
    { name: 'seed.products', records: seedProductBlocks.length },
    ...productSections.map(section => ({ name: section.name, records: parseObjects(section.source).length })),
  ],
  priceSections: [
    { name: 'seed.prices', records: seedPriceBlocks.length },
    ...priceSections.map(section => ({ name: section.name, records: parseObjects(section.source).length })),
  ],
  brands: brandNames.length,
  uniqueBrands: unique(brandNames).size,
  companyDirectoryRecords: companyBlocks.length,
  wholesaleMarketRecords: marketBlocks.length,
  supplierRecords,
  categories: counts('categoryId'),
  verification: counts('verificationStatus'),
  missingModel: rows.filter(row => !row.model || /بدون كود موديل|غير محدد|غير متوفر|يلزم/i.test(row.model)).length,
  missingSource: rows.filter(row => !row.sourceUrl).length,
  missingImage: rows.filter(row => !row.imageUrl).length,
  missingAvailability: rows.filter(row => !row.availability || /يحتاج تأكيد|غير متوفر|غير مؤكد|غير محدد/i.test(row.availability)).length,
  missingSpecifications: rows.filter(row => !row.hasSpecifications).length,
  published: rows.filter(row => row.published).length,
  eligibleForManualVerification: rows.filter(row => row.model && row.sourceUrl).length,
  issueIds: {
    missingModel: rows.filter(row => !row.model || /بدون كود موديل|غير محدد|غير متوفر|يلزم/i.test(row.model)).map(({ id, name, model }) => ({ id, name, model })),
    missingSource: rows.filter(row => !row.sourceUrl).map(({ id, name, model }) => ({ id, name, model })),
    missingImage: rows.filter(row => !row.imageUrl).map(({ id, name, model }) => ({ id, name, model })),
    missingAvailability: rows.filter(row => !row.availability || /يحتاج تأكيد|غير متوفر|غير متاح|غير مؤكد|غير محدد/i.test(row.availability)).map(({ id, name, model, availability }) => ({ id, name, model, availability })),
    missingSpecifications: rows.filter(row => !row.hasSpecifications).map(({ id, name, model }) => ({ id, name, model })),
  },
};
const outDir = 'reports';
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'catalog-audit-summary.json'), JSON.stringify(summary, null, 2) + '\n');
const columns = ['id','name','brandId','categoryId','model','verificationStatus','sourceUrl','imageUrl','availability','published','hasSpecifications'];
const csv = [columns.join(','), ...rows.map(row => columns.map(key => '"' + String(row[key] ?? '').replaceAll('"','""') + '"').join(','))].join('\n');
fs.writeFileSync(path.join(outDir, 'catalog-audit.csv'), csv + '\n');
const writeCsv = (filename, columns, data) => {
  const body = [columns.join(','), ...data.map(row => columns.map(key => {
    const value = row[key] && typeof row[key] === 'object' ? JSON.stringify(row[key]) : row[key] ?? '';
    return '"' + String(value).replaceAll('"', '""') + '"';
  }).join(','))].join('\n');
  fs.writeFileSync(path.join(outDir, filename), body + '\n');
};
writeCsv('catalog-model-collisions.csv', ['brandId','model','products'], duplicateBrandModelPairs);
writeCsv('catalog-brand-reference-gaps.csv', ['id','name','officialUrl','logo','sourceStatus'], brandsWithoutOfficialReference);
writeCsv('catalog-category-coverage.csv', ['categoryId','productCount'], categoryCoverage);
writeCsv('catalog-missing-core-fields.csv', ['id','name','brandId','categoryId'], productsMissingCoreFields);
writeCsv('catalog-missing-brand-references.csv', ['id','name','brandId'], missingBrandReferences);
writeCsv('catalog-price-metadata-gaps.csv', ['id','source','sourceUrl','priceDate'], priceMetadataGaps);
writeCsv('catalog-invalid-price-dates.csv', ['id','priceDate','issue'], [...invalidPriceDates, ...futurePriceDates]);
console.log(JSON.stringify(summary, null, 2));
if (duplicatePriceIds.length || duplicateProductIds.length || orphanPriceProductIds.length || productsMissingCoreFields.length) {
  throw new Error(`Catalog integrity failure: duplicate price IDs [${duplicatePriceIds.join(', ')}], duplicate product IDs [${duplicateProductIds.join(', ')}], orphan price product IDs [${orphanPriceProductIds.join(', ')}], missing core fields [${productsMissingCoreFields.map(row => row.id).join(', ')}]`);
}
