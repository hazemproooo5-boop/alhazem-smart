import fs from 'node:fs';
import path from 'node:path';

const catalog = fs.readFileSync('src/data/cairoSalesCatalog.ts', 'utf8');
const brandSource = fs.readFileSync('src/data/brandDirectory.ts', 'utf8');
const companySource = fs.readFileSync('src/data/companyDirectory.ts', 'utf8');

const declarations = [...catalog.matchAll(/export const (\\w+)\\s*:\\s*[^=]+=/g)];
const sections = declarations.map((match, index) => ({
  name: match[1],
  source: catalog.slice(match.index, declarations[index + 1]?.index ?? catalog.length),
}));
const parseObjects = source => source
  .split(/(?=  \\{\\n    "id": ")/)
  .filter(part => /^  \\{\\n    "id": "/.test(part));
const read = (block, key) => {
  const match = block.match(new RegExp('"' + key + '"\\\\s*:\\\\s*"([^"]*)"'));
  return match?.[1] ?? '';
};
const productSections = sections.filter(section => /Products$/.test(section.name));
const priceSections = sections.filter(section => /Prices$/.test(section.name));
const productBlocks = productSections.flatMap(section => parseObjects(section.source));
const priceBlocks = priceSections.flatMap(section => parseObjects(section.source));
const rows = productBlocks.map(block => ({
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
const companyBlocks = parseObjects(companySource.slice(companySource.indexOf('export const companyDirectory')));
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
  productSections: productSections.map(section => ({ name: section.name, records: parseObjects(section.source).length })),
  priceSections: priceSections.map(section => ({ name: section.name, records: parseObjects(section.source).length })),
  brands: brandNames.length,
  uniqueBrands: unique(brandNames).size,
  companyDirectoryRecords: companyBlocks.length,
  categories: counts('categoryId'),
  verification: counts('verificationStatus'),
  missingModel: rows.filter(row => !row.model || /بدون كود موديل|غير محدد|غير متوفر|يلزم/i.test(row.model)).length,
  missingSource: rows.filter(row => !row.sourceUrl).length,
  missingImage: rows.filter(row => !row.imageUrl).length,
  missingAvailability: rows.filter(row => !row.availability || /يحتاج تأكيد|غير متوفر|غير مؤكد|غير محدد/i.test(row.availability)).length,
  missingSpecifications: rows.filter(row => !row.hasSpecifications).length,
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
