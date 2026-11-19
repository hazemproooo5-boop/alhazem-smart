# تدقيق دليل الشركات والأسواق والمورد المنفصل — 19 نوفمبر 2026

## الجرد

| القسم | العدد | نتيجة المراجعة |
|---|---:|---|
| companyDirectory | 43 | 43/43 لها رابط `url` ووصف مصدر؛ جميعها Unverified |
| wholesaleMarketDirectory | 4 | أربعة تجمعات/مناطق تجارية موثقة بمراجع متعددة داخل حقل `source`؛ جميعها Unverified |
| suppliers في seed.ts | 1 | سجل تجريبي منفصل غير موثق |
| brandDirectory | 243 اسماً فريداً | المراجعة المكتبية موثقة في الدفعات 01–14؛ الحالات الملتبسة تبقى Unverified |

## استعادة الروابط الأصلية في submittedUrl

أظهر فحص تاريخ `companyDirectory.ts` عند الإدراج الأول أن ستة روابط أصلية كانت محفوظة في حقل `url` ثم استُبدلت أو أصبحت روابط مصدر أكثر تحديداً دون نسخ الأصل إلى `submittedUrl`. أُعيد حفظ الروابط الأصلية الستة دون تغيير رابط المصدر الحالي:

| السجل | الرابط الأصلي المستعاد إلى submittedUrl | رابط المصدر الحالي في url |
|---|---|---|
| B.TECH | https://btech.com | https://btech.com |
| Raya Shop | https://rayashop.com | https://rayashop.com |
| Cairo Sales | https://cairosales.com | https://cairosales.com |
| Sheeni | https://sheeni-egypt.com | https://sheeni-egypt.com/aboutus.html |
| Sheffield | https://sheffieldeg.com | https://www.sheffieldeg.com/pages/about-us |
| SOKANY Egypt | https://sokany-egypt.com | https://sokany-eg.com/about-us/ |

بعد الاستعادة أصبح 40 من 43 سجل شركة يحتفظ بقيمة `submittedUrl`. بقيت ثلاثة حقول فارغة فقط لأن النسخة الأولى من المستودع لم تتضمن رابطاً أصلياً لها: Hinox وSavlon/SEVLUN وIndesit. لم يُخترع رابط أصلي لهذه السجلات، ولم يُنسخ رابط البحث أو المصدر الحالي إلى `submittedUrl` على أنه رابط مستخدم.

## أسواق الجملة الأربعة

- أبو النمرس.
- حمام التلات – الموسكي.
- درب سعادة.
- حارة اليهود.

هذه سجلات مناطق/تجمعات تجارية وليست شركات أو مورّدين قانونيين موحدين. لكل سجل عدة مراجع داخل حقل `source`؛ لذلك لا يُنشأ رابط وحيد مصطنع في `url` أو `submittedUrl`. لا تثبت المراجع القديمة الأسعار أو المخزون أو أن كل محل يبيع بالجملة. جميع السجلات الأربعة بقيت Unverified.

## المورد المنفصل

السجل الوحيد في `seed.ts` هو:

- ID: `sp-1`
- الاسم: «مصدر HVAC»
- الفئة: AC
- الحالة: «سجل تجريبي — غير موثق»
- `verified: false`
- الهاتف والبريد فارغان، ولا يوجد موقع أو رابط مصدر أو اسم قانوني لمورد محدد.

لا تتوافر بيانات كافية لتحديد هوية المورد أو إثبات اعتماده أو شروط الضمان أو التوفر. تُرك السجل كما هو دون اختراع اسم أو جهة أو وسيلة اتصال، ويظل خارج الموردين المعتمدين.

## حدود الاعتماد وحماية البيانات

- جميع سجلات الشركات الـ43 والأسواق الأربعة بقيت Unverified؛ لا يثبت الموقع الرسمي وحده السجل التجاري أو الوكالة الحصرية أو ضمان كل موديل.
- لم تُحذف أي جهة أو وسيلة اتصال أو معرف.
- لم تُدمج الأسماء المتشابهة أو التهجئات المحتملة، ومنها Alsharif/Alsherif وMidstar/Medstar وSavlon/SEVLUN.
- لم تُنقل بيانات الأسواق إلى دليل الشركات، ولم يُدمج المورد التجريبي ضمن الشركات.
- العلامات الـ243 تمت مراجعتها مكتبياً في الدفعات 01–14؛ لا تتحول العلامة أو الوكالة إلى Verified دون وثيقة أولية تخص الكيان والعلامة والسوق.

## مراجع المراجعة السابقة

- `docs/company-directory-review-batch-01-ar.md`
- `docs/company-directory-review-batch-02-ar.md`
- `docs/company-directory-review-batch-03-ar.md`
- `docs/company-directory-review-batch-04-ar.md`
- `docs/company-directory-primary-sources-2026-11-18-ar.md`
- `docs/company-directory-remaining-source-checks-2026-11-18-ar.md`
- `docs/company-directory-market-clusters-and-sevlun-2026-11-18-ar.md`
- `docs/wholesale-market-directory-audit-ar.md`
- `docs/company-market-supplier-audit-count-correction-2026-11-18-ar.md`
- `docs/brand-directory-review-batch-14-ar.md`

**النتيجة:** اكتمل تدقيق بنية وعدد سجلات الشركات والأسواق والمورد المنفصل وحفظ الروابط الأصلية المتاحة. يبقى المورد التجريبي غير قابل للتحقق حتى تتوافر هوية ومصدر مباشر، وتبقى كل ادعاءات الشركة والوكالة والضمان غير معتمدة قانونياً دون مستند مناسب.
