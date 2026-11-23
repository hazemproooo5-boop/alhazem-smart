# مراجعة الأسعار المباشرة — الدفعة 09 (23 نوفمبر 2026)

- وقت الفحص: 23 نوفمبر 2026، 17:33 بتوقيت القاهرة.
- نقطة الأساس: `e6239c5c1b137462aed10ce18936a02d72ebdb88`، فرع `main`.
- نطاق الدفعة: 8 سجلات منتج؛ 7 منتجات لها رصد سعر مباشر، مع مصدرين مباشرين للموديل HM13729A، وموديل Beko FRL 2244 B لم يتأكد سعره الحالي.
- أضيفت 8 سجلات سعر مستقلة؛ لا حذف أو استبدال لأي سجل تاريخي.
- الإجمالي في سجل الأسعار بعد الدفعة: 163 سجلًا.
- لم يتغير أي سعر في المقارنة من نفس البائع؛ 7 أسعار بقيت دون تغيير، وظهر تأكيد إضافي من Carrefour Egypt لسعر HM13729A نفسه. لا تُعد المقارنة بين البائعين تغيرًا تاريخيًا لدى البائع نفسه.

## نتائج الأسعار

| المنتج والموديل | السعر المرصود | الحالة والملاحظات | سجل السعر |
|---|---:|---|---|
| Toshiba F-ASE60EG(K) | 2,999 جنيه تقريباً | Berty Center؛ متوفر؛ ضمان 5 سنوات؛ VAT غير موضح؛ لم يتغير من رصد 19 نوفمبر | cs-price-162 |
| Toshiba F-ASE50EG(K) | 2,799 جنيه تقريباً | Berty Center؛ متوفر؛ ضمان 5 سنوات؛ VAT غير موضح؛ لم يتغير من رصد 19 نوفمبر | cs-price-163 |
| Mienta HB111038A | 1,699 جنيه تقريباً | El-Iraqi؛ In Stock؛ ضمان سنتين؛ VAT غير موضح؛ لم يتغير من رصد 19 نوفمبر | cs-price-164 |
| Tornado TKS-2217E | 1,250 جنيه تقريباً | El-Iraqi؛ In Stock؛ ضمان سنة؛ VAT غير موضح؛ لم يتغير من رصد 19 نوفمبر | cs-price-165 |
| Mienta HM13729A | 1,299 جنيه تقريباً | Abdulaziz Stores؛ In Stock؛ بيانات المنتج سنتان مع نص ضمان عام 5 سنوات متضارب؛ VAT غير موضح؛ لم يتغير من رصد 19 نوفمبر | cs-price-166 |
| Mienta HM13729A | 1,299 جنيه تقريباً | Carrefour Egypt؛ شامل VAT؛ توصيل غداً؛ ضمان غير مذكور؛ مصدر إضافي يؤكد السعر | cs-price-167 |
| Mienta FP141535G | 3,599 جنيه تقريباً | Abdulaziz Stores؛ In Stock؛ توصيل 5–7 أيام؛ بيانات ضمان المنتج سنتان مع نص ضمان عام 5 سنوات متضارب؛ VAT غير موضح؛ لم يتغير من رصد 19 نوفمبر | cs-price-168 |
| Home YN5240 | 679 جنيه تقريباً | Almorshedy Marts؛ Available (5)؛ ضمان سنة؛ VAT غير موضح؛ لم يتغير من رصد 19 نوفمبر | cs-price-169 |

## السعر المتعذر التحقق منه

- **Beko FRL 2244 B:** صفحة Beko Egypt الرسمية المطابقة تعرض المواصفات، لكنها لا تعرض متاجر إلكترونية متاحة. لم يمكن إثبات سعر شراء حالي أو توفر فعلي من مصدر بيع مباشر؛ لم يُسجل مبلغ قديم أو مقتطف بحث كسعر حالي.

## أثر الدفعة على بيانات المنتجات

- تم تحديث حقول التوفر ومصدر الرصد فقط للمنتجات الثمانية؛ لم يتم دمج الأسعار في المواصفات.
- بقيت حالات المنتجات كما هي؛ لم يُرفع أي منتج إلى `Verified`.
- لم تُغيّر الصور النهائية أو المواصفات الفنية أو مدد الضمان المتضاربة.
- جميع مبالغ العرض في التقرير بصيغة «تقريباً». الأسعار في سجل السعر مستقلة عن سجل المنتج.
- تم إنشاء [سجل أسعار 23 نوفمبر](catalog-price-ledger-2026-11-23.csv) و[قائمة المنتجات غير الموثقة](catalog-price-review-unverified-products-2026-11-23.csv) دون تعديل ملفات 22 نوفمبر.

## فحص الكتالوج في CI

تمت إضافة خطوة `npm run audit:catalog` إلى Platform verification، مع رفع `catalog-audit-summary.json` و`catalog-audit.csv` كأثر بناء لمدة 30 يومًا؛ يُثبت تقرير CI العدد الفعلي بعد الفحص، ولا يُعتبر هذا التقرير المحلي بديلاً عن نجاح الفحوص.

## المصادر المباشرة

- [Berty Center F-ASE60EG(K)](https://berty-center.com/product/f-ase60egk/)
- [Berty Center F-ASE50EG(K)](https://berty-center.com/product/f-ase50egk/)
- [El-Iraqi HB111038A](https://eliraqi.com.eg/en/hand-blender-essentials-plus-mienta-1000w-hb111038a)
- [El-Iraqi TKS-2217E](https://eliraqi.com.eg/en/tornado-stainless-steel-kettle-17-liter-1850-2200-watt-stainless-tks-2217e)
- [Abdulaziz Stores HM13729A](https://www.abdulaziz-stores.com/en/500-5-hm13729a)
- [Carrefour Egypt HM13729A](https://www.carrefouregypt.com/mafegy/en/blender/mienta-hand-mixer-hm13729a-500w/p/654377)
- [Abdulaziz Stores FP141535G](https://www.abdulaziz-stores.com/en/1000-fp141535g)
- [Almorshedy Marts YN5240](https://www.almorshedymarts.net/en/products/1155014000007)
- [Beko Egypt FRL 2244 B](https://www.beko.com/eg-en/products/cookers-and-fryers/fryer-air-1500-w-frl-2244-b)
