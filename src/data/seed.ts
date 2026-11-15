import { Brand, NewsItem, PriceRecord, Product, SiteSettings, Supplier, Tip } from '../types';
import { cairoSalesBrands, cairoSalesProducts, cairoSalesPrices, cairoSalesCookwareProducts, cairoSalesCookwarePrices } from './cairoSalesCatalog';
import { brandDirectoryNames } from './brandDirectory';

const existingBrandKeys = new Set(['samsung', 'lg', 'bosch', 'beko', 'aux', ...cairoSalesBrands.map((brand) => brand.name.toLocaleLowerCase())]);
const additionalDirectoryBrands: Brand[] = brandDirectoryNames
  .filter((name, index, all) => all.findIndex((item) => item.toLocaleLowerCase() === name.toLocaleLowerCase()) === index && !existingBrandKeys.has(name.toLocaleLowerCase()))
  .map((name) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    country: 'غير محدد',
    description: 'ماركة مدرجة في دليل الماركات المقدم. بلد المنشأ والاعتماد والتوفر والبيانات الفنية تحتاج إلى توثيق مستقل.',
    technology: 'غير محدد',
    categories: ['غير مصنف'],
    officialUrl: '',
    logo: '',
    sourceStatus: 'Monitoring',
    createdAt: '2026-11-15T00:00:00Z',
    updatedAt: '2026-11-15T00:00:00Z',
  }));

export const siteSettings: SiteSettings = {
  brandName: 'AL HAZEM SMART',
  slogan: 'قبل ما تشتري… اسأل الحازم',
  businessName: 'الحازم جروب',
  phonePrimary: '01044111143',
  phoneWhatsApp: '01050509779',
  address: 'سيدي غازي، كفر الشيخ، أمام موقف الميكروباص',
  colors: {
    navy: '#091329',
    gold: '#C79529',
    warmWhite: '#F5F4F0',
  },
  socialLinks: {
    whatsapp: 'https://wa.me/201050509779',
    facebook: '#',
    instagram: '#',
  },
};

export const brands: Brand[] = [
  {
    id: 'samsung',
    name: 'Samsung',
    slug: 'samsung',
    country: 'كوريا الجنوبية',
    description: 'علامة رائدة في الأجهزة الذكية والهواتف والعروض المنزلية.',
    technology: 'AI Home',
    categories: ['Appliances', 'AC', 'Kitchen'],
    officialUrl: 'https://www.samsung.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/320px-Samsung_Logo.svg.png',
    sourceStatus: 'Verified',
    createdAt: '2026-05-15T00:00:00Z',
    updatedAt: '2026-05-15T00:00:00Z',
  },
  {
    id: 'lg',
    name: 'LG',
    slug: 'lg',
    country: 'كوريا الجنوبية',
    description: 'تكنولوجيا متقدمة في التكييف والغسالات والتفاصيل الذكية.',
    technology: 'ThinQ',
    categories: ['Appliances', 'AC'],
    officialUrl: 'https://www.lg.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/LG_logo_%282014%29.svg/320px-LG_logo_%282014%29.svg.png',
    sourceStatus: 'Verified',
    createdAt: '2026-05-15T00:00:00Z',
    updatedAt: '2026-05-15T00:00:00Z',
  },
  {
    id: 'bosch',
    name: 'Bosch',
    slug: 'bosch',
    country: 'ألمانيا',
    description: 'جودة صناعية في الأجهزة المنزلية والمطبخ.',
    technology: 'HomeConnect',
    categories: ['Kitchen', 'Appliances'],
    officialUrl: 'https://www.bosch-home.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Bosch-logo.svg/320px-Bosch-logo.svg.png',
    sourceStatus: 'Verified',
    createdAt: '2026-05-15T00:00:00Z',
    updatedAt: '2026-05-15T00:00:00Z',
  },
  {
    id: 'beko',
    name: 'Beko',
    slug: 'beko',
    country: 'تركيا',
    description: 'حلول منزلية قابلة للتوسع بأسعار مناسبة وجودة معقولة.',
    technology: 'SmartLife',
    categories: ['Appliances', 'Kitchen'],
    officialUrl: 'https://www.beko.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Beko_logo.svg/320px-Beko_logo.svg.png',
    sourceStatus: 'Verified',
    createdAt: '2026-05-15T00:00:00Z',
    updatedAt: '2026-05-15T00:00:00Z',
  },
  {
    id: 'aux',
    name: 'AUX',
    slug: 'aux',
    country: 'الصين',
    description: 'حلول تكييف ذات كفاءة عالية وتحديثات ذكية.',
    technology: 'Inverter',
    categories: ['AC'],
    officialUrl: 'https://www.aux.com',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/AUX-logo.svg/320px-AUX-logo.svg.png',
    sourceStatus: 'Documented',
    createdAt: '2026-05-15T00:00:00Z',
    updatedAt: '2026-05-15T00:00:00Z',
  },
  ...cairoSalesBrands,
  ...additionalDirectoryBrands,
];

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'AUX Inverter AC 1.5 Ton',
    slug: 'aux-inverter-ac-1-5-ton',
    brandId: 'aux',
    manufacturerId: 'aux-man',
    categoryId: 'ac',
    model: 'ASW-H12A4 — يلزم تحديد لاحقة الموديل قبل اعتماد المواصفات',
    sku: 'AUX-H12A4',
    description: 'بيانات الموديل غير مكتملة؛ يلزم تصوير بطاقة الجهاز أو فاتورة المورد لتحديد اللاحقة الفنية ومطابقة المواصفات قبل النشر.',
    specifications: {},

    availability: 'يحتاج تأكيد التوفر لدى الشركة',
    officialProductUrl: 'https://aux.com.ro/residential/halo-series/',
    sourceUrl: 'https://aux.com.ro/residential/halo-series/',
    sourceType: 'Official',
    verificationStatus: 'Unverified',
    published: true,
    createdAt: '2026-05-15',
    updatedAt: '2026-05-15',
    imageUrl: '',
  },
  {
    id: 'prod-2',
    name: 'Samsung Front Load Washer',
    slug: 'samsung-front-load-washer',
    brandId: 'samsung',
    manufacturerId: 'samsung-man',
    categoryId: 'appliances',
    model: 'WW90T554DAW',
    sku: 'WW90T554DAW',
    description: 'غسالة تحميل أمامي ذات سعة كبيرة، مع تقنيات AI وذكية.',
    specifications: {
      'النوع': 'Front Load',
      'السعة': '9 كجم',
      'التكنولوجيا': 'AI Control',
    },
    dimensions: '60 × 85 × 55 سم (عرض × ارتفاع × عمق)',
    capacity: '9 كجم',
    energyInformation: 'فئة كفاءة الطاقة A؛ استهلاك 49 كيلوواط ساعة لكل 100 دورة؛ ماء 50 لتر/دورة؛ ضوضاء العصر 72 dB',
    warranty: 'الضمان المحلي في مصر يحتاج تأكيداً من البائع؛ لا تعتمد مدة ضمان الصفحة البريطانية محلياً',
    availability: 'التوفر المحلي في مصر يحتاج تأكيداً من البائع',
    officialProductUrl: 'https://www.samsung.com/uk/business/washers-and-dryers/washing-machines/front-load-9kg-white-ww90t554daw-s1/',
    sourceUrl: 'https://www.samsung.com/uk/business/washers-and-dryers/washing-machines/front-load-9kg-white-ww90t554daw-s1/',
    sourceType: 'Official',
    verificationStatus: 'Verified',
    verifiedDate: '2026-11-15',
    published: true,
    createdAt: '2026-05-15',
    updatedAt: '2026-05-15',
    imageUrl: '',
  },
  {
    id: 'prod-3',
    name: 'Bosch Built-in Oven',
    slug: 'bosch-built-in-oven',
    brandId: 'bosch',
    manufacturerId: 'bosch-man',
    categoryId: 'kitchen',
    model: 'HBG676BS1 — يلزم تأكيد النسخة الإقليمية وE-Nr الكامل',
    sku: 'HBG676BS1',
    description: 'فرن Bosch مدمج؛ يلزم مطابقة رقم E-Nr الكامل والنسخة الإقليمية قبل اعتماد السعة والوظائف والصورة.',
    specifications: {},

    availability: 'يحتاج تأكيد التوفر لدى البائع',
    officialProductUrl: 'https://www.bosch-home.com/',
    sourceUrl: 'https://www.bosch-home.com/',
    sourceType: 'Official',
    verificationStatus: 'Unverified',
    published: true,
    createdAt: '2026-05-15',
    updatedAt: '2026-05-15',
    imageUrl: '',
  },
  ...cairoSalesProducts,
  ...cairoSalesCookwareProducts,
];

export const prices: PriceRecord[] = [
  {
    id: 'price-1',
    productId: 'prod-1',
    price: 18900,
    currency: 'EGP',
    priceType: 'Official Price',
    source: 'AUX Official Catalog',
    sourceUrl: 'https://www.aux.com',
    priceDate: '2026-05-15',
    verificationStatus: 'Unverified',
    createdAt: '2026-05-15T00:00:00Z',
  },
  {
    id: 'price-2',
    productId: 'prod-2',
    price: 26800,
    currency: 'EGP',
    priceType: 'Al Hazem Price',
    source: 'AL HAZEM SMART',
    sourceUrl: 'https://hazemproooo5-boop.github.io/alhazem-smart/',
    priceDate: '2026-05-15',
    verificationStatus: 'Verified',
    createdAt: '2026-05-15T00:00:00Z',
  },
  {
    id: 'price-3',
    productId: 'prod-3',
    price: 22400,
    currency: 'EGP',
    priceType: 'Trusted Market Price',
    source: 'مصدر سوق محلي غير محدد — يحتاج استبدالاً بمصدر قابل للتحقق',
    sourceUrl: 'https://hazemproooo5-boop.github.io/alhazem-smart/',
    priceDate: '2026-05-14',
    verificationStatus: 'Partially Verified',
    createdAt: '2026-05-14T00:00:00Z',
  },
  ...cairoSalesPrices,
  ...cairoSalesCookwarePrices,
];

export const news: NewsItem[] = [
  {
    id: 'n-1',
    title: 'دليل شراء مكيفات 2026',
    summary: 'مقارنة بين inverter وnon-inverter والت��كم الذكي.',
    source: 'Official AC Guide',
    date: '2026-05-10',
    verificationStatus: 'Verified',
    category: 'News',
    published: true,
    createdAt: '2026-05-10',
  },
  {
    id: 'n-2',
    title: 'كيف تقلل استهلاك الكهرباء في المنزل؟',
    summary: 'نصائح عملية لخفض الفاتورة مع الحفاظ على الراحة.',
    source: 'Energy Efficiency Authority',
    date: '2026-04-22',
    verificationStatus: 'Verified',
    category: 'Tip',
    published: true,
    createdAt: '2026-04-22',
  },
];

export const tips: Tip[] = [
  {
    id: 't-1',
    title: 'اختيار الثلاجة المناسبة لغرفة الطعام',
    body: 'اختر السعة بمعيار عدد الأفراد ومساحة المطبخ وقرب نقاط الخدمة.',
    category: 'Kitchen',
    source: 'Brand Manual',
    date: '2026-05-01',
    verificationStatus: 'Verified',
    published: true,
    createdAt: '2026-05-01',
  },
];

export const suppliers: Supplier[] = [
  {
    id: 'sp-1',
    name: 'مصدر HVAC',
    category: 'AC',
    status: 'Verified',
    phone: '01000000000',
    email: 'supplier@example.com',
    verified: true,
    createdAt: '2026-05-15T00:00:00Z',
  },
];

export const offers = [
  { id: 'o-1', title: 'خصم الصيف على مكيفات AUX', description: 'خصم حتى 12% على وحدات 1.5-2 طن', status: 'Active' },
  { id: 'o-2', title: 'عرض تجهيز مطبخ', description: 'خصم على الثلاجات والغسالات مع تركيب', status: 'Active' },
];

export const academyItems = [
  { id: 'a-1', title: 'أساسيات اختيار AC', summary: 'تقييم مساحة الغرفة وكمية الإضاءة ومصادر الحرارة' },
  { id: 'a-2', title: 'دليل شراء الغسالة', summary: 'السعة والموارد وكفاءة الطاقة' },
];

export const competitions = [
  { id: 'c-1', title: 'مسابقة العائلة الذكية', conditions: 'مشاركة عبر تسجيل الدخول والاشتراك', prize: 'مكافأة نقدية + أجهزة', deadline: '2026-06-30' },
];

export const auditLog = [
  { id: 'audit-1', event: 'Seeded catalog import', user: 'System', timestamp: '2026-05-15', action: 'Create' },
  { id: 'audit-2', event: 'Price verification', user: 'Editor', timestamp: '2026-05-15', action: 'Verify' },
];

export const faqs = [
  { id: 'f-1', question: 'هل الأسعار متغيرة خلال الموسم؟', answer: 'نعم، وقد يتم تحديث الأسعار بناءً على مصدر الإصدار الرسمي أو السوق الموثق.' },
  { id: 'f-2', question: 'هل يمكن الاستشارة قبل الشراء؟', answer: 'نعم، يمكن حجز استشارة مجانية أو معاينة فنية.' },
];

export const comparisonData = {
  category: 'ac',
  state: 'ready',
};
