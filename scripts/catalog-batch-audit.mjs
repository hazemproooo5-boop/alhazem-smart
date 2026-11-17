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
const parseObjects = source => source
  .split(/(?=  \{\n    "id": ")/)
  .filter(part => /^  \{\n    "id": "/.test(part));
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
const priceBlocks = priceSections.flatMap(section => parseObjects(section.source));
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
const brandSection = brandSource.match(/export const brandDirectoryNames: string\[\] = \[([\s\S]*?)\];/);
if (!brandSection) throw new Error('brandDirectoryNames declaration not found');
const brandNames = [...brandSection[1].matchAll(/^\s*"([^"]+)",?\s*$/gm)].map(match => match[1]);
const companyStart = companySource.indexOf('export const companyDirectory');
const marketStart = companySource.indexOf('export const wholesaleMarketDirectory');
if (companyStart < 0 || marketStart < 0) throw new Error('company or wholesale market directory declaration not found');
const companyBlocks = parseObjects(companySource.slice(companyStart, marketStart));
const marketBlocks = parseObjects(companySource.slice(marketStart));
const supplierSection = seedSource.slice(seedSource.indexOf('export const suppliers'));
const supplierRecords = (supplierSection.match(/\\bid:\\s*['"]sp-/g) || []).length;
const unique = values => new Set(values.map(value => value.trim().toLocaleLowerCase()));
const counts = key => rows.reduce((acc, row) => {
  const value = row[key] || 'Missing';
  acc[value] = (acc[value] || 0) + 1;
  return acc;
}, {});
const summary = {
  generatedAt: new Date().toISOString(),
  products: rows.length,
  priceHistoryRecords: priceBlocks.length,
  seedProductAudit: {
    total: seedProductBlocks.length,
    published: rows.filter(row => row.id.startsWith('prod-') && row.published).length,
    withSpecifications: rows.filter(row => row.id.startsWith('prod-') && row.hasSpecifications).length,
  },
  productSections: [
    { name: 'seed.products', records: seedProductBlocks.length },
    ...productSections.map(section => ({ name: section.name, records: parseObjects(section.source).length })),
  ],
  priceSections: priceSections.map(section => ({ name: section.name, records: parseObjects(section.source).length })),
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
    missingAvailability: rows.filter(row => !row.availability || /يحتاج تأكيد|غير مؤكد|غير محدد/i.test(row.availability)).map(({ id, name, model, availability }) => ({ id, name, model, availability })),
    missingSpecifications: rows.filter(row => !row.hasSpecifications).map(({ id, name, model }) => ({ id, name, model })),
  },
};
const outDir = 'reports';
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'catalog-audit-summary.json'), JSON.stringify(summary, null, 2) + '\n');
const columns = ['id','name','brandId','categoryId','model','verificationStatus','sourceUrl','imageUrl','availability','published','hasSpecifications'];
const csv = [columns.join(','), ...rows.map(row => columns.map(key => '"' + String(row[key] ?? '').replaceAll('"','""') + '"').join(','))].join('\n');
fs.writeFileSync(path.join(outDir, 'catalog-audit.csv'), csv + '\n');
console.log(JSON.stringify(summary, null, 2));
