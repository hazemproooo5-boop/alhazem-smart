import fs from 'node:fs';
import path from 'node:path';

const catalogPath = 'src/data/cairoSalesCatalog.ts';
const brandsPath = 'src/data/brandDirectory.ts';
const catalog = fs.readFileSync(catalogPath, 'utf8');
const brandSource = fs.readFileSync(brandsPath, 'utf8');

const productsStart = catalog.indexOf('export const cairoSalesProducts');
if (productsStart < 0) throw new Error('cairoSalesProducts declaration not found');
const productsSource = catalog.slice(productsStart);
const records = productsSource.split(/(?=  \\{\\n    "id": "cs-)/).filter(part => /^  \\{\\n    "id": "cs-/.test(part));

const read = (block, key) => {
  const match = block.match(new RegExp('"' + key + '"\\\\s*:\\\\s*"([^"]*)"'));
  return match?.[1] ?? '';
};
const rows = records.map(block => ({
  id: read(block, 'id'),
  name: read(block, 'name'),
  brandId: read(block, 'brandId'),
  categoryId: read(block, 'categoryId'),
  model: read(block, 'model') || read(block, 'sku'),
  verificationStatus: read(block, 'verificationStatus') || 'Missing',
  sourceUrl: read(block, 'sourceUrl'),
  imageUrl: read(block, 'imageUrl'),
  availability: read(block, 'availability'),
  published: /"published"\\s*:\\s*true/.test(block),
  hasSpecifications: /"specifications"\\s*:\\s*\\{\\s*"/.test(block),
}));

const brandSection = brandSource.match(/export const brandDirectoryNames: string\\[\\] = \\[([\\s\\S]*?)\\];/);
if (!brandSection) throw new Error('brandDirectoryNames declaration not found');
const brandNames = [...brandSection[1].matchAll(/^\\s*"([^"]+)",?\\s*$/gm)].map(match => match[1]);

const counts = (key) => rows.reduce((acc, row) => {
  const value = row[key] || 'Missing';
  acc[value] = (acc[value] || 0) + 1;
  return acc;
}, {});
const summary = {
  generatedAt: new Date().toISOString(),
  products: rows.length,
  brands: brandNames.length,
  categories: counts('categoryId'),
  verification: counts('verificationStatus'),
  missingModel: rows.filter(row => !row.model).length,
  missingSource: rows.filter(row => !row.sourceUrl).length,
  missingImage: rows.filter(row => !row.imageUrl).length,
  missingAvailability: rows.filter(row => !row.availability || /يحتاج تأكيد|غير متوفر|غير مؤكد|غير محدد/i.test(row.availability)).length,
  published: rows.filter(row => row.published).length,
  eligibleForManualVerification: rows.filter(row => row.model && row.sourceUrl).length,
};

const outDir = 'reports';
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'catalog-audit-summary.json'), JSON.stringify(summary, null, 2) + '\\n');
const columns = ['id','name','brandId','categoryId','model','verificationStatus','sourceUrl','imageUrl','availability','published','hasSpecifications'];
const csv = [columns.join(','), ...rows.map(row => columns.map(key => '"' + String(row[key] ?? '').replaceAll('"','""') + '"').join(','))].join('\\n');
fs.writeFileSync(path.join(outDir, 'catalog-audit.csv'), csv + '\\n');
console.log(JSON.stringify(summary, null, 2));
