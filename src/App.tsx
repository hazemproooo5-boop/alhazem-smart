import { FormEvent, ReactNode, useState } from 'react';
import { Link, NavLink, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { academyItems, auditLog, brands, competitions, news, offers, siteSettings, suppliers, tips } from './data/seed';
import { companyDirectory, wholesaleMarketDirectory } from './data/companyDirectory';
import { NeedProfile, Product } from './types';
import { advisorService } from './services/advisorService';
import { priceService } from './services/priceService';
import { verificationService } from './services/verificationService';
import { searchService } from './services/searchService';
import { catalogMonitoringProducts, catalogProducts } from './services/catalogService';

const categoryList = [
  { id: 'ac', label: 'AC' },
  { id: 'appliances', label: 'Appliances' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'household', label: 'Household' },
  { id: 'lighting', label: 'Lighting' },
];

function ImageWithFallback({ src, alt, className }: { src?: string; alt: string; className: string }) {
  return (
    <div className={`image-frame ${className} ${src ? '' : 'image-unavailable'}`}>
      {src ? <img src={src} alt={alt} onError={(event) => {
        event.currentTarget.hidden = true;
        event.currentTarget.parentElement?.classList.add('image-unavailable');
      }} /> : null}
      <span className="image-fallback">الصورة غير متاحة حالياً</span>
    </div>
  );
}

function PriceDisplay({ productId }: { productId: string }) {
  const currentPrice = priceService.getCurrent(productId);
  const latestPrice = priceService.getLatest(productId);

  if (currentPrice) {
    return <span>السعر المرصود لدى البائع (تم التحقق من المصدر): {currentPrice.price.toLocaleString()} جنيه تقريباً — تحقق من المصدر بتاريخ {currentPrice.priceDate}{currentPrice.sourceUrl ? <> — <a href={currentPrice.sourceUrl} target="_blank" rel="noreferrer">مصدر السعر</a></> : null}</span>;
  }

  if (latestPrice && !latestPrice.isHistorical && latestPrice.verificationStatus !== 'Verified') {
    const timestamp = new Date(latestPrice.priceDate).getTime();
    const ageInDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
    if (Number.isFinite(timestamp) && ageInDays >= 0 && ageInDays <= 30) {
      return (
        <span className="price-estimate">
          <strong>السعر التقريبي: {latestPrice.price.toLocaleString()} جنيه تقريباً</strong>
          <small>سعر استرشادي غير مؤكد، مسجل بتاريخ {latestPrice.priceDate}. الأسعار قد تتغير حسب البائع والتوفر والعروض والضرائب؛ تأكد من السعر النهائي لدى البائع قبل الشراء.{latestPrice.sourceUrl ? <> <a href={latestPrice.sourceUrl} target="_blank" rel="noreferrer">راجع مصدر السعر المسجل</a>.</> : null}</small>
        </span>
      );
    }
  }

  return <span>لا يوجد سعر حالي موثق أو تقديري حديث متاح</span>;
}

function Layout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" className="brand-box">
            <div className="brand-mark">A</div>
            <div>
              <div className="brand-name">{siteSettings.brandName}</div>
              <small>{siteSettings.slogan}</small>
            </div>
          </Link>

          <button className="menu-button" onClick={() => setMenuOpen((prev) => !prev)} aria-label="Toggle menu">
            ☰
          </button>

          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            <NavLink to="/">الرئيسية</NavLink>
            <NavLink to="/need-assessment">تقييم الاحتياج</NavLink>
            <NavLink to="/smart-search">البحث الذكي</NavLink>
            <NavLink to="/compare">المقارنة</NavLink>
            <NavLink to="/brands">مركز الماركات</NavLink>
            <NavLink to="/companies">الشركات والمصانع</NavLink>
            <NavLink to="/catalog-center">كتالوج المنتجات</NavLink>
            <NavLink to="/ac">التكييف</NavLink>
            <NavLink to="/smart-advisor">المستشار الذكي</NavLink>
            <NavLink to="/offers">العروض</NavLink>
            <NavLink to="/academy">أكاديمية الحازم</NavLink>
            <NavLink to="/transparency">مركز الشفافية</NavLink>
            <NavLink to="/support">خدمة العملاء</NavLink>
            <NavLink to="/suppliers">الموردون</NavLink>
            <NavLink to="/admin">الإدارة</NavLink>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <h4>{siteSettings.businessName}</h4>
            <p>{siteSettings.slogan}</p>
            <p>{siteSettings.address}</p>
          </div>
          <div>
            <h4>تواصل مباشر</h4>
            <p>الهاتف: {siteSettings.phonePrimary}</p>
            <p>واتساب: {siteSettings.phoneWhatsApp}</p>
          </div>
          <div>
            <h4>روابط سريعة</h4>
            <Link to="/academy">أكاديمية الحازم</Link>
            <Link to="/transparency">مركز الشفافية</Link>
            <Link to="/support">خدمة العملاء</Link>
            <Link to="/suppliers">الموردون</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {

  return (
    <article className="product-card">
      <ImageWithFallback src={product.imageUrl} alt={product.name} className="product-image" />
      <div className="product-body">
        <span className="badge">{product.verificationStatus}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="meta-row">
          <strong>السعر:</strong>
          <PriceDisplay productId={product.id} />
        </div>
        <div className="meta-row">
          <strong>المصدر:</strong>
          <span>{product.sourceType}</span>
        </div>
        <div className="card-actions">
          <Link to={`/product/${product.slug}`} className="primary-button small">التفاصيل</Link>
          <Link to="/compare" className="secondary-button small">قارن</Link>
        </div>
      </div>
    </article>
  );
}

function HomePage() {
  const navigate = useNavigate();
  const [homeSearchTerm, setHomeSearchTerm] = useState('');

  const handleHomeSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = homeSearchTerm.trim();
    navigate(term ? `/smart-search?term=${encodeURIComponent(term)}` : '/smart-search');
  };

  return (
    <div className="container page-block">
      <section className="hero-card">
        <div>
          <span className="eyebrow">AL HAZEM SMART</span>
          <h1>قبل ما تشتري… اسأل الحازم</h1>
          <p>المنصة العربية المتكاملة للبحث عن الأجهزة المنزلية، التكييف، المطبخ، الإضاءة، والمقارنة بين المنتجات بناءً على مصدر موثق.</p>
          <div className="actions">
            <Link to="/smart-search" className="primary-button">ابحث الآن</Link>
            <Link to="/need-assessment" className="secondary-button">تقييم الاحتياج</Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="mini-stat">
            <strong>{brands.length}</strong>
            <span>ماركات مدرجة</span>
          </div>
          <div className="mini-stat">
            <strong>{catalogProducts.filter((product) => product.published).length}</strong>
            <span>منتجات مستوفية لشروط التوثيق</span>
          </div>
          <div className="mini-stat">
            <strong>{catalogMonitoringProducts.length}</strong>
            <span>سجلات محفوظة قيد التحقق</span>
          </div>
          <div className="mini-stat">
            <strong>قبل الشراء</strong>
            <span>استشارة تساعدك على القرار</span>
          </div>
        </div>
      </section>

      <section className="section-block">
        <h2>البحث الذكي</h2>
        <form className="search-box" onSubmit={handleHomeSearch}>
          <input value={homeSearchTerm} onChange={(event) => setHomeSearchTerm(event.target.value)} placeholder="ابحث عن مكيف، غسالة، ثلاجة، مطبخ..." aria-label="ابحث عن منتج" />
          <button type="submit" className="primary-button">بحث</button>
        </form>
      </section>

      <section className="section-block">
        <h2>تقييم الاحتياج</h2>
        <div className="feature-grid">
          <div className="feature-card"><strong>تقييم سريع</strong><p>يتم تحديد احتياج المنزل أو المكتب.</p></div>
          <div className="feature-card"><strong>مقارنة موثقة</strong><p>المنتجات تُقارن بالأسعار والتكنولوجيا والضمان.</p></div>
          <div className="feature-card"><strong>توصية ذكية</strong><p>مستندة إلى بيانات products + sources + verification.</p></div>
        </div>
      </section>

      <section className="section-block">
        <h2>مركز الماركات</h2>
        <div className="brand-grid">
          {brands.map((brand) => (
            <Link key={brand.id} to={`/brand/${brand.slug}`} className="brand-card">
              <ImageWithFallback src={brand.logo} alt={brand.name} className="brand-logo-image" />
              <strong>{brand.name}</strong>
              <small>{brand.country}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2>الأجهزة المنزلية</h2>
        <div className="cards-grid">
          {catalogProducts.filter((product) => product.published).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {catalogProducts.filter((product) => product.published).length === 0 ? <div className="result-box" role="status">لا توجد منتجات اجتازت التوثيق الكامل حتى الآن. نحتفظ بالسجلات الناقصة للمراجعة ولا نعرضها كمنتجات موثقة أو نختلق صوراً ومواصفات لها. <Link to="/support">تواصل معنا للاستفسار عن المنتجات المتاحة.</Link></div> : null}
      </section>

      <section className="section-block">
        <h2>التكييف</h2>
        <div className="cards-grid">
          {catalogProducts.filter((p) => p.categoryId === 'ac').map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {catalogProducts.every((product) => product.categoryId !== 'ac') ? (
          <div className="result-box" role="status">
            لا توجد أجهزة تكييف اجتازت شروط التوثيق حالياً. يمكنك طلب استشارة أو التحقق من موديل وتوفر جهاز معين دون عرض بيانات غير مؤكدة.
            {' '}<Link to="/ac">تفاصيل قسم التكييف</Link> أو <Link to="/support">تواصل مع خدمة العملاء</Link>.
          </div>
        ) : null}
      </section>

      <section className="section-block">
        <h2>العروض</h2>
        <p>العروض المسجلة أدناه بيانات أولية؛ يرجى التأكد من سريان العرض وتفاصيله مع خدمة العملاء قبل الاعتماد عليه.</p>
        <div className="cards-grid">
          {offers.map((offer) => (
            <div key={offer.id} className="offer-card">
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>
              <small>الحالة المسجلة: {offer.status} — السريان غير مؤكد</small>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2>الأخبار</h2>
        <div className="cards-grid">
          {news.map((item) => (
            <article key={item.id} className="news-card">
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <small>{item.source}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2>نصائح الحازم</h2>
        <div className="cards-grid">
          {tips.map((tip) => (
            <article key={tip.id} className="news-card">
              <h3>{tip.title}</h3>
              <p>{tip.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2>المسابقات</h2>
        <div className="cards-grid">
          {competitions.map((entry) => {
            const deadlinePassed = new Date(`${entry.deadline}T23:59:59`).getTime() < Date.now();
            return (
              <div key={entry.id} className="feature-card">
                <strong>{entry.title}</strong>
                <p>{entry.conditions}</p>
                <small>{entry.prize}</small>
                <p>{deadlinePassed ? `انتهت المسابقة بتاريخ ${entry.deadline}` : `آخر موعد للمشاركة: ${entry.deadline}`}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section-block">
        <h2>أكاديمية الحازم</h2>
        <div className="cards-grid">
          {academyItems.map((item) => (
            <div key={item.id} className="feature-card">
              <strong>{item.title}</strong>
              <p>{item.summary}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function NeedAssessmentPage() {
  const [state, setState] = useState({ room: 'غرفة نوم', people: 3, need: 'تبريد', budget: 20000 });

  return (
    <div className="container page-block">
      <h1>تقييم الاحتياج</h1>
      <form className="panel-form">
        <label>
          نوع الغرفة
          <input value={state.room} onChange={(e) => setState({ ...state, room: e.target.value })} />
        </label>
        <label>
          عدد السكان
          <input type="number" value={state.people} onChange={(e) => setState({ ...state, people: Number(e.target.value) })} />
        </label>
        <label>
          الاحتياج
          <input value={state.need} onChange={(e) => setState({ ...state, need: e.target.value })} />
        </label>
        <label>
          الميزانية (جنيه)
          <input type="number" value={state.budget} onChange={(e) => setState({ ...state, budget: Number(e.target.value) })} />
        </label>
      </form>

      <div className="result-box">
        <h3>ملخص احتياجك</h3>
        <p>{state.room} • {state.people} أشخاص • {state.need} • {state.budget} جنيه</p>
      </div>
    </div>
  );
}

function SmartSearchPage() {
  const [searchParams] = useSearchParams();
  const [term, setTerm] = useState(searchParams.get('term') ?? '');
  const results = searchService.search({ term });

  return (
    <div className="container page-block">
      <h1>البحث الذكي</h1>
      <div className="search-box search-large">
        <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="ابحث عن منتج أو ماركة أو موديل" />
      </div>

      <div className="cards-grid">
        {results.length ? results.map((product) => <ProductCard key={product.id} product={product} />) : <div className="feature-card" role="status">لا توجد منتجات موثقة تطابق البحث حالياً. يمكنك التواصل مع خدمة العملاء للاستفسار عن التوفر والسعر الحالي. <Link to="/support">خدمة العملاء</Link></div>}
      </div>
    </div>
  );
}

function ProductDetailPage() {
  const { slug } = useParams();
  const product = catalogProducts.find((item) => item.slug === slug);
  if (!product) return <NotFoundPage />;

  return (
    <div className="container page-block product-detail">
      <ImageWithFallback src={product.imageUrl} alt={product.name} className="detail-image" />
      <div>
        <span className="badge">{product.verificationStatus}</span>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <ul className="detail-list">
          <li>الماركة: {brands.find((brand) => brand.id === product.brandId)?.name ?? 'غير محدد'}</li>
          <li>الموديل: {product.model || 'غير متوفر في المصدر الموثق'}</li>
          <li>رقم المنتج: {product.sku || 'غير متوفر'}</li>
          <li>السعة / القدرة: {product.capacity || 'غير متوفر في المصدر الموثق'}</li>
          <li>الأبعاد: {product.dimensions || 'غير متوفرة في المصدر الموثق'}</li>
          <li>استهلاك الطاقة: {product.energyInformation || 'غير متوفر في المصدر الموثق'}</li>
          <li>الضمان: {product.warranty || 'غير متوفر في المصدر الموثق'}</li>
          <li>التوفر المسجل: {product.availability || 'غير محدد — يرجى التأكيد'}</li>
          <li>السعر: <PriceDisplay productId={product.id} /></li>
          <li>حالة التحقق: {product.verificationStatus} — راجع المصدر قبل الشراء</li>
        </ul>
        <section className="specifications-block">
          <h2>المواصفات المسجلة</h2>
          {Object.keys(product.specifications).length ? (
            <dl className="specifications-list">
              {Object.entries(product.specifications).map(([label, value]) => (
                <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
          ) : <p>لا توجد مواصفات تفصيلية موثقة لهذا المنتج حتى الآن.</p>}
        </section>
        <div className="source-links">
          {product.officialProductUrl ? <a href={product.officialProductUrl} target="_blank" rel="noreferrer">صفحة المنتج لدى الشركة المصنعة</a> : null}
          {product.sourceUrl ? <a href={product.sourceUrl} target="_blank" rel="noreferrer">فتح مصدر البيانات المسجل</a> : null}
        </div>
      </div>
    </div>
  );
}

function ComparePage() {
  const [left, setLeft] = useState(catalogProducts[0]?.id ?? '');
  const [right, setRight] = useState(catalogProducts[1]?.id ?? '');

  const productA = catalogProducts.find((item) => item.id === left);
  const productB = catalogProducts.find((item) => item.id === right);

  return (
    <div className="container page-block">
      <h1>مقارنة المنتجات</h1>
      {catalogProducts.length < 2 ? (
        <div className="result-box" role="status">
          <strong>المقارنة غير متاحة حالياً</strong>
          <p>{catalogProducts.length === 0
            ? 'لا توجد منتجات موثقة متاحة للمقارنة حتى الآن.'
            : 'يتوفر منتج موثق واحد فقط؛ نحتاج إلى منتجين موثقين على الأقل لإجراء مقارنة عادلة.'}</p>
          <p>لن نعرض مقارنة ناقصة أو نستخدم بيانات غير متحققة لاستكمال الجدول.</p>
          <Link to="/catalog-center" className="secondary-button small">عرض الكتالوج</Link>
          <Link to="/support" className="primary-button small">اطلب المساعدة</Link>
        </div>
      ) : (
        <>
          <div className="compare-controls">
            <label>
              المنتج الأول
              <select aria-label="اختر المنتج الأول للمقارنة" value={left} onChange={(e) => setLeft(e.target.value)}>
                {catalogProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
              </select>
            </label>
            <label>
              المنتج الثاني
              <select aria-label="اختر المنتج الثاني للمقارنة" value={right} onChange={(e) => setRight(e.target.value)}>
                {catalogProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
              </select>
            </label>
          </div>

          {productA && productB ? (
            <table className="compare-table">
              <thead>
                <tr>
                  <th>المعيار</th>
                  <th>{productA.name}</th>
                  <th>{productB.name}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>السعر وحالة التوثيق وتاريخ التسجيل</td>
                  <td><PriceDisplay productId={productA.id} /></td>
                  <td><PriceDisplay productId={productB.id} /></td>
                </tr>
                <tr>
                  <td>استهلاك الطاقة</td>
                  <td>{productA.energyInformation ?? 'غير متوفر في المصدر الموثق'}</td>
                  <td>{productB.energyInformation ?? 'غير متوفر في المصدر الموثق'}</td>
                </tr>
                <tr>
                  <td>الضمان</td>
                  <td>{productA.warranty ?? 'غير متوفر في المصدر الموثق'}</td>
                  <td>{productB.warranty ?? 'غير متوفر في المصدر الموثق'}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="result-box" role="status">اختر منتجين موثقين لإظهار المقارنة.</div>
          )}
        </>
      )}
    </div>
  );
}

function SmartAdvisorPage() {
  const [profile, setProfile] = useState<NeedProfile>({ category: 'ac', budget: 22000, occupants: 4 });
  const { products: recommendations, explanations } = advisorService.recommend(profile);

  return (
    <div className="container page-block">
      <h1>المستشار الذكي</h1>
      <div className="panel-form">
        <label>
          الفئة
          <select value={profile.category} onChange={(e) => setProfile({ ...profile, category: e.target.value })}>
            <option value="all">الكل</option>
            {categoryList.map((category) => (
              <option key={category.id} value={category.id}>{category.label}</option>
            ))}
          </select>
        </label>
        <label>
          الميزانية
          <input type="number" value={profile.budget ?? 0} onChange={(e) => setProfile({ ...profile, budget: Number(e.target.value) })} />
        </label>
      </div>

      <div className="result-box">
        <h3>سبب التوصية</h3>
        <ul>
          {explanations.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>

      {recommendations.length === 0 ? (
        <div className="result-box" role="status">
          <strong>لا توجد مطابقة بسعر حديث موثق ضمن هذه الميزانية حالياً.</strong>
          <p>هذا لا يعني عدم توفر المنتج في المعرض؛ تواصل مع خدمة العملاء للحصول على سعر محدث قبل اتخاذ قرار الشراء.</p>
          <Link to="/support" className="primary-button small">تواصل مع الحازم</Link>
        </div>
      ) : (
        <div className="cards-grid">
          {recommendations.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}

function BrandsPage() {
  return (
    <div className="container page-block">
      <h1>مركز الماركات</h1>
      <div className="brand-grid">
        {brands.map((brand) => (
          <Link to={`/brand/${brand.slug}`} key={brand.id} className="brand-card">
            <ImageWithFallback src={brand.logo} alt={brand.name} className="brand-logo-image" />
            <strong>{brand.name}</strong>
            <small>{brand.country}</small>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CompaniesDirectoryPage() {
  const retailKinds = ['موزع تجزئة للأجهزة والإلكترونيات','متجر/موزع أجهزة منزلية','متجر تجزئة للأجهزة والإلكترونيات','موزع أجهزة منزلية'];
  const groups = [
    { title: 'الشركات والمصانع والعلامات التجارية', items: companyDirectory.filter((item) => !retailKinds.includes(item.kind)) },
    { title: 'موزعو التجزئة والمتاجر الكبرى', items: companyDirectory.filter((item) => retailKinds.includes(item.kind)) },
  ];
  return (
    <div className="container page-block">
      <h1>دليل الشركات والمصانع والموزعين</h1>
      <p>دليل أولي للجهات وروابطها كما وردت في البيانات المقدمة. إدراج جهة هنا لا يعني اعتمادها أو ثبوت الوكالة أو استمرار نشاطها.</p>
      {groups.map((group) => (
        <section key={group.title}>
          <h2>{group.title}</h2>
          <div className="cards-grid">
            {group.items.map((item) => (
              <article className="feature-card" key={item.id}>
                <h3>{item.name}</h3>
                <p>{item.kind}</p>
                <p>{item.note}</p>
                {item.url ? <a href={item.url} target="_blank" rel="noreferrer">{item.url.replace('https://', '').replace('http://', '')}</a> : <small>لا يوجد رابط مباشر محدد في القائمة</small>}
                {'facebook' in item && item.facebook ? <p>{item.facebook.startsWith('https://') ? <a href={item.facebook} target="_blank" rel="noreferrer">صفحة فيسبوك</a> : <small>{item.facebook}</small>}</p> : null}
                <small>حالة الرابط والبيانات: غير متحقق منها</small>
              </article>
            ))}
          </div>
        </section>
      ))}
      <section>
        <h2>مراكز وأسواق تجارة الجملة</h2>
        <div className="cards-grid">
          {wholesaleMarketDirectory.map((market) => (
            <article className="feature-card" key={market.id}>
              <h3>{market.name}</h3>
              <p>{market.description}</p>
              <small>الموقع والتفاصيل التشغيلية تحتاج إلى تحقق ميداني</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function BrandDetailPage() {
  const { slug } = useParams();
  const brand = brands.find((item) => item.slug === slug);
  if (!brand) return <NotFoundPage />;

  return (
    <div className="container page-block">
      <h1>{brand.name}</h1>
      <p>{brand.description}</p>
      <p>بلد المنشأ: {brand.country}</p>
      <p>التكنولوجيا: {brand.technology}</p>
      <div className="cards-grid">
        {catalogProducts.filter((product) => product.brandId === brand.id).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {catalogProducts.every((product) => product.brandId !== brand.id) ? <div className="result-box" role="status">لا توجد منتجات موثقة لهذه الماركة حالياً. بيانات الماركة لا تعني أن موديلاتها أو أسعارها أو توفرها قد تم التحقق منها.</div> : null}
    </div>
  );
}

function CatalogCenterPage() {
  return (
    <div className="container page-block">
      <h1>مركز الكتالوج</h1>
      <p>قسمان منفصلان: المنتجات التي اجتازت بوابة التوثيق، وسجلات المصدر التي ما زالت قيد المراجعة. لا تُعرض السجلات غير المكتملة كمنتجات موثقة ولا تظهر لها أسعار شراء أو أزرار مقارنة.</p>
      <section className="section-block">
        <h2>المنتجات الموثقة ({catalogProducts.length})</h2>
        {catalogProducts.length === 0 ? <div className="result-box" role="status">لا توجد أجهزة مستوفية لجميع شروط التوثيق حالياً.</div> : null}
        <div className="cards-grid">
          {catalogProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
      <section className="section-block">
        <h2>سجلات قيد التحقق ({catalogMonitoringProducts.length})</h2>
        <div className="result-box monitoring-notice" role="note">
          <strong>تنبيه قبل الشراء:</strong>
          <p>هذه سجلات أولية مستوردة من قوائم ومصادر مختلفة. لم تكتمل بعد مطابقة الصورة والموديل والمواصفات والتوفر والضمان المحلي؛ لذلك لا تمثل توصية شراء أو عرض سعر معتمداً.</p>
        </div>
        <div className="monitoring-table-wrap">
          <table className="monitoring-table">
            <thead>
              <tr><th>المنتج والتفاصيل الأولية</th><th>الفئة</th><th>الموديل / SKU</th><th>العلامة</th><th>حالة السجل</th><th>المصادر</th></tr>
            </thead>
            <tbody>
              {catalogMonitoringProducts.map((product) => (
                <tr key={product.id}>
                  <td className="monitoring-product-cell">
                    <div className="monitoring-product">
                      <ImageWithFallback src={product.imageUrl} alt={product.name} className="monitoring-product-image" />
                      <div className="monitoring-product-info">
                        <strong>{product.name}</strong>
                        <details className="monitoring-details">
                          <summary>عرض الوصف والمواصفات المسجلة</summary>
                          {product.description && !/(سعر|price|جنيه|EGP|خصم|discount)/i.test(product.description) ? <p>{product.description}</p> : <p>الوصف الأولي غير معروض هنا لأنه قد يتضمن بيانات سعرية أو تفاصيل لم تكتمل مراجعتها.</p>}
                          <dl className="monitoring-specs">
                            <div><dt>التوفر المسجل</dt><dd>{product.availability || 'غير محدد'}</dd></div>
                            {product.warranty ? <div><dt>الضمان المسجل</dt><dd>{product.warranty}</dd></div> : null}
                            {product.energyInformation ? <div><dt>معلومات الطاقة</dt><dd>{product.energyInformation}</dd></div> : null}
                            {Object.entries(product.specifications ?? {}).filter(([label, value]) => !/(سعر|price|خصم|discount|جنيه|EGP)/i.test(`${label} ${value}`)).map(([label, value]) => (
                              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
                            ))}
                          </dl>
                          <small>هذه بيانات أولية من المصدر المسجل، وليست مواصفات معتمدة أو توصية شراء.</small>
                        </details>
                      </div>
                    </div>
                  </td>
                  <td>{({ tv: 'تلفزيونات', audio: 'صوتيات', cookware: 'أواني طهي', kitchen: 'مطبخ', home: 'منزل', appliances: 'أجهزة منزلية', 'small-appliances': 'أجهزة منزلية صغيرة' } as Record<string, string>)[product.categoryId] || product.categoryId}</td>
                  <td dir="ltr">{product.model || product.sku || 'غير محدد'}</td>
                  <td>{brands.find((brand) => brand.id === product.brandId)?.name || product.brandId}</td>
                  <td><span className="badge">{product.verificationStatus}</span><small className="monitoring-status-note">لا يجتاز جميع شروط النشر بعد</small></td>
                  <td className="monitoring-source-links">
                    {product.sourceUrl ? <a href={product.sourceUrl} target="_blank" rel="noreferrer">فتح مصدر المنتج</a> : <span>لا يوجد مصدر منتج مطابق بعد</span>}
                    {product.imageSourceUrl ? <a href={product.imageSourceUrl} target="_blank" rel="noreferrer">مصدر الصورة</a> : null}
                    {product.sourceCandidateUrl ? <a href={product.sourceCandidateUrl} target="_blank" rel="noreferrer">مصدر مرشح غير معتمد</a> : null}
                    {product.imageCandidateUrl ? <a href={product.imageCandidateUrl} target="_blank" rel="noreferrer">صورة مرشحة غير معتمدة</a> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ACPage() {
  const airConditioners = catalogProducts.filter((product) => product.categoryId === 'ac');
  return (
    <div className="container page-block">
      <h1>التكييف</h1>
      <p>نعرض أجهزة التكييف التي اجتازت التحقق من الموديل والصورة والمصدر والمواصفات وحالة التوفر.</p>
      {airConditioners.length === 0 ? <div className="result-box" role="status">لا توجد أجهزة تكييف مستوفية لشروط التوثيق حالياً. لا نعرض أجهزة أو أسعاراً غير متحققة على أنها مؤكدة. <Link to="/support">اطلب استشارة أو تحققاً من التوفر.</Link></div> : null}
      <div className="cards-grid">
        {airConditioners.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  );
}

function AdminPage() {
  const summary = verificationService.getDataQualitySummary().summary;

  return (
    <div className="container page-block">
      <h1>معاينة جودة بيانات الكتالوج</h1>
      <div className="result-box" role="note">
        <strong>تنبيه أمان:</strong>
        <p>هذه المعاينة تقرأ بيانات محلية أولية فقط. لا توجد هنا مصادقة أو صلاحيات إدارة أو اتصال بقاعدة بيانات إنتاجية؛ لذلك لا تُدخل بيانات حساسة ولا تعتبر هذه الصفحة لوحة إدارة محمية.</p>
      </div>
      <div className="cards-grid">
        <div className="feature-card"><strong>صور غير متوفرة</strong><p>{summary.missingImages}</p></div>
        <div className="feature-card"><strong>مصادر غير متوفرة</strong><p>{summary.missingSources}</p></div>
        <div className="feature-card"><strong>مواصفات غير مكتملة</strong><p>{summary.missingSpecs}</p></div>
        <div className="feature-card"><strong>ضمان غير متوفر</strong><p>{summary.missingWarranty}</p></div>
        <div className="feature-card"><strong>أسعار غير مسجلة</strong><p>{summary.missingPrices}</p></div>
        <div className="feature-card"><strong>أسعار قديمة</strong><p>{summary.stalePrices}</p></div>
        <div className="feature-card"><strong>أسعار غير موثقة بالكامل</strong><p>{summary.unverifiedPrices}</p></div>
      </div>
    </div>
  );
}

function OffersPage() {
  return (
    <div className="container page-block">
      <h1>العروض</h1>
      <p>هذه عروض مسجلة في بيانات المنصة الأولية وليست تأكيداً على استمرارها أو توفرها حالياً. يرجى التحقق من خدمة العملاء.</p>
      <div className="cards-grid">
        {offers.map((offer) => (
          <article key={offer.id} className="offer-card">
            <h2>{offer.title}</h2>
            <p>{offer.description}</p>
            <small>الحالة المسجلة: {offer.status} — السريان غير مؤكد</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function AcademyPage() {
  return (
    <div className="container page-block">
      <h1>أكاديمية الحازم</h1>
      <p>محتوى إرشادي أولي لمساعدتك على فهم احتياجك قبل الشراء.</p>
      <div className="cards-grid">
        {academyItems.map((item) => (
          <article key={item.id} className="feature-card">
            <h2>{item.title}</h2>
            <p>{item.summary}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function TransparencyPage() {
  return (
    <div className="container page-block">
      <h1>مركز الشفافية</h1>
      <p>نعرض حالة التوثيق ومصادر البيانات المتاحة، ولا نعتبر بيانات العرض المحلية بديلاً عن التحقق المستقل.</p>
      <div className="cards-grid">
        <article className="feature-card">
          <strong>مصادر المنتجات</strong>
          <p>تظهر صفحة كل منتج المصدر وحالة التحقق المسجلة له.</p>
        </article>
        <article className="feature-card">
          <strong>الأسعار</strong>
          <p>كل سعر يظهر بعبارة «تقريباً» بجوار المبلغ حتى عند التحقق من صفحة البائع؛ تاريخ التحقق يوضح وقت الرصد فقط ولا يضمن السعر النهائي. السعر الحديث غير المؤكد يظل موسوماً «السعر التقريبي»، والسعر القديم أو التاريخي لا يُعرض كسعر حالي. تأكد من السعر النهائي لدى البائع قبل الشراء.</p>
        </article>
        <article className="feature-card">
          <strong>سجل الأحداث</strong>
          <p>السجل التالي بيانات أولية محلية وليس سجل تدقيق إنتاجياً متصلاً بقاعدة بيانات.</p>
        </article>
      </div>
      <div className="section-block">
        <h2>سجل الأحداث المحلي</h2>
        <div className="cards-grid">
          {auditLog.map((entry) => (
            <article key={entry.id} className="news-card">
              <strong>{entry.event}</strong>
              <p>{entry.action} — {entry.user}</p>
              <small>{entry.timestamp}</small>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function SupportPage() {
  return (
    <div className="container page-block">
      <h1>خدمة العملاء</h1>
      <p>للاستفسار عن المنتجات أو طلب المساعدة قبل الشراء، تواصل مباشرة مع الحازم جروب.</p>
      <div className="feature-grid">
        <article className="feature-card">
          <strong>الهاتف</strong>
          <p dir="ltr">{siteSettings.phonePrimary}</p>
          <a className="primary-button small" href={`tel:${siteSettings.phonePrimary}`}>اتصل الآن</a>
        </article>
        <article className="feature-card">
          <strong>واتساب</strong>
          <p dir="ltr">{siteSettings.phoneWhatsApp}</p>
          <a className="primary-button small" href={siteSettings.socialLinks.whatsapp} target="_blank" rel="noreferrer">تواصل عبر واتساب</a>
        </article>
        <article className="feature-card">
          <strong>العنوان</strong>
          <p>{siteSettings.address}</p>
        </article>
      </div>
    </div>
  );
}

function SuppliersPage() {
  return (
    <div className="container page-block">
      <h1>الموردون</h1>
      <p>بيانات الموردين المعروضة هنا أولية ومحلية، ولا تعني اعتماد المورد أو إتاحة التعامل معه قبل مراجعة الإدارة.</p>
      <div className="cards-grid">
        {suppliers.map((supplier) => (
          <article key={supplier.id} className="feature-card">
            <h2>{supplier.name}</h2>
            <p>الفئة: {supplier.category}</p>
            <p>الحالة المسجلة: {supplier.status}</p>
            <small>{supplier.verified ? 'يتضمن السجل علامة تحقق أولية' : 'لم يتم توثيقه'}</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="container page-block">
      <h1>404 — صفحة غير موجودة</h1>
      <Link to="/" className="primary-button">العودة للصفحة الرئيسية</Link>
    </div>
  );
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/need-assessment" element={<NeedAssessmentPage />} />
        <Route path="/smart-search" element={<SmartSearchPage />} />
        <Route path="/product/:slug" element={<ProductDetailPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/smart-advisor" element={<SmartAdvisorPage />} />
        <Route path="/brands" element={<BrandsPage />} />
        <Route path="/companies" element={<CompaniesDirectoryPage />} />
        <Route path="/brand/:slug" element={<BrandDetailPage />} />
        <Route path="/catalog-center" element={<CatalogCenterPage />} />
        <Route path="/ac" element={<ACPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/academy" element={<AcademyPage />} />
        <Route path="/transparency" element={<TransparencyPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
