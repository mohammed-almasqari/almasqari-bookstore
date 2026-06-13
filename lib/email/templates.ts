/**
 * قوالب البريد الاحترافية (HTML) — متوافقة مع عملاء البريد عبر تنسيقات مضمّنة وجداول.
 * بهوية "الدرع الحارس": خلفية داكنة للترويسة ولون كهرماني مميّز.
 */
import { env } from "../env";

const C = {
  ink: "#1E1B2E",
  inkSoft: "#2A2640",
  shield: "#D97706",
  shieldLight: "#F59E0B",
  safe: "#059669",
  steel: "#0369A1",
  text: "#2A2640",
  muted: "#6B6880",
  border: "#ECE7DD",
  sand: "#FBF7F0",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function button(href: string, label: string, color = C.shield): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px auto;">
    <tr>
      <td align="center" bgcolor="${color}" style="border-radius:12px;">
        <a href="${href}" target="_blank"
           style="display:inline-block;padding:15px 38px;font-family:'Tajawal',Arial,sans-serif;
                  font-size:17px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
  </table>`;
}

function baseLayout(opts: { title: string; preview: string; body: string }): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${escapeHtml(opts.title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />
  <style>
    body{margin:0;padding:0;background:${C.sand};}
    *{font-family:'Tajawal',Arial,Helvetica,sans-serif;}
    a{color:${C.shield};}
    @media (max-width:600px){ .container{width:100% !important;} .px{padding-left:22px !important;padding-right:22px !important;} }
  </style>
</head>
<body style="margin:0;padding:0;background:${C.sand};direction:rtl;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.preview)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.sand};padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0"
             style="width:600px;max-width:600px;background:#ffffff;border-radius:20px;overflow:hidden;
                    box-shadow:0 10px 40px -12px rgba(30,27,46,0.25);">
        <!-- الترويسة -->
        <tr>
          <td style="background:${C.ink};background-image:linear-gradient(135deg,${C.ink},${C.inkSoft});padding:34px 40px;" align="center">
            <div style="display:inline-block;width:46px;height:46px;border-radius:12px;background:${C.shield};
                        line-height:46px;color:#fff;font-size:24px;font-weight:800;">🛡</div>
            <div style="margin-top:12px;color:#ffffff;font-size:21px;font-weight:800;letter-spacing:-0.3px;">
              ${escapeHtml(env.siteName)}
            </div>
            <div style="margin-top:4px;color:${C.shieldLight};font-size:13px;font-weight:500;">
              كتب رقمية تحميك وتثري معرفتك
            </div>
          </td>
        </tr>
        <!-- المحتوى -->
        <tr><td class="px" style="padding:38px 44px;color:${C.text};">
          ${opts.body}
        </td></tr>
        <!-- التذييل -->
        <tr>
          <td style="background:${C.sand};padding:24px 40px;border-top:1px solid ${C.border};" align="center">
            <div style="color:${C.muted};font-size:12.5px;line-height:1.9;">
              وصلتك هذه الرسالة من ${escapeHtml(env.siteName)}.<br/>
              © ${year} محمد المسقري — جميع الحقوق محفوظة.
            </div>
          </td>
        </tr>
      </table>
      <div style="color:${C.muted};font-size:11px;margin-top:14px;">${escapeHtml(env.siteUrl)}</div>
    </td></tr>
  </table>
</body>
</html>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 14px;font-size:25px;font-weight:800;color:${C.ink};line-height:1.4;">${escapeHtml(text)}</h1>`;
}
function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:2;color:${C.text};">${text}</p>`;
}
function infoCard(rows: [string, string][]): string {
  const trs = rows
    .map(
      ([k, v]) => `
      <tr>
        <td style="padding:9px 0;color:${C.muted};font-size:14px;">${escapeHtml(k)}</td>
        <td style="padding:9px 0;color:${C.ink};font-size:14px;font-weight:700;text-align:left;">${escapeHtml(v)}</td>
      </tr>`
    )
    .join("");
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:${C.sand};border:1px solid ${C.border};border-radius:14px;padding:8px 20px;margin:6px 0 22px;">
    ${trs}
  </table>`;
}

// ---------- 1) تأكيد التسجيل للكتاب المجاني ----------
export function confirmEmail(opts: { name: string; bookTitle: string; confirmUrl: string }): {
  subject: string;
  html: string;
} {
  const body = `
    ${heading(`مرحبًا ${escapeHtml(opts.name)} 👋`)}
    ${paragraph(`شكرًا لتسجيلك للحصول على نسختك المجانية من كتاب <b style="color:${C.ink}">«${escapeHtml(opts.bookTitle)}»</b>.`)}
    ${paragraph(`لإتمام الطلب وحمايةً لبريدك، يرجى تأكيد عنوانك بالضغط على الزر التالي:`)}
    ${button(opts.confirmUrl, "تأكيد البريد واستلام الكتاب")}
    ${paragraph(`<span style="font-size:13.5px;color:${C.muted}">إن لم يعمل الزر، انسخ هذا الرابط في المتصفح:</span><br/>
      <a href="${opts.confirmUrl}" style="font-size:12.5px;word-break:break-all;">${escapeHtml(opts.confirmUrl)}</a>`)}
    ${paragraph(`<span style="font-size:13.5px;color:${C.muted}">إذا لم تطلب هذا التسجيل، تجاهل هذه الرسالة ولن يُرسل إليك أي بريد آخر.</span>`)}
  `;
  return {
    subject: `أكّد بريدك لاستلام كتاب «${opts.bookTitle}»`,
    html: baseLayout({ title: "تأكيد البريد", preview: `خطوة واحدة تفصلك عن كتاب ${opts.bookTitle}`, body }),
  };
}

// ---------- 2) تسليم الكتاب (مجاني أو بعد الشراء) ----------
export function deliveryEmail(opts: {
  name: string;
  bookTitle: string;
  downloadUrl: string;
  expiresLabel: string;
  paid?: boolean;
  guideUrl?: string;
}): { subject: string; html: string } {
  const intro = opts.paid
    ? `تم تأكيد عملية الشراء بنجاح، وهذه نسختك من كتاب`
    : `تم تأكيد بريدك بنجاح، وهذه نسختك المجانية من كتاب`;
  const guideBlock = opts.guideUrl
    ? `${paragraph(`<span style="font-size:14.5px;color:${C.text}">ومرفقٌ مع كتابك <b style="color:${C.ink}">دليل القراءة</b> ليعينك على تحقيق أقصى استفادة:</span>`)}${button(opts.guideUrl, "تحميل دليل القراءة", C.steel)}`
    : "";
  const body = `
    ${heading(`نسختك جاهزة للتحميل 📘`)}
    ${paragraph(`${escapeHtml(opts.name)}، ${intro} <b style="color:${C.ink}">«${escapeHtml(opts.bookTitle)}»</b>.`)}
    ${button(opts.downloadUrl, "تحميل الكتاب الآن", C.safe)}
    ${guideBlock}
    ${infoCard([
      ["صيغة الملف", "PDF"],
      ["صلاحية الرابط", opts.expiresLabel],
    ])}
    ${paragraph(`<span style="font-size:13.5px;color:${C.muted}">الرابط خاص بك، يرجى عدم مشاركته. إن انتهت صلاحيته يمكنك طلب رابط جديد من المتجر.</span>`)}
    ${paragraph(`نتمنى لك قراءة ممتعة ونافعة 🌿`)}
  `;
  return {
    subject: `كتابك «${opts.bookTitle}» جاهز للتحميل`,
    html: baseLayout({ title: "تحميل الكتاب", preview: `رابط تحميل ${opts.bookTitle} بالداخل`, body }),
  };
}

// ---------- 2ب) تسليم حزمة سلسلة (عدة كتب) ----------
export function bundleDeliveryEmail(opts: {
  name: string;
  seriesTitle: string;
  books: { title: string; downloadUrl: string }[];
  expiresLabel: string;
}): { subject: string; html: string } {
  const items = opts.books
    .map(
      (b, i) => `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="background:${C.sand};border:1px solid ${C.border};border-radius:14px;margin:0 0 12px;">
        <tr>
          <td style="padding:14px 18px;">
            <div style="font-size:15px;font-weight:700;color:${C.ink};margin-bottom:8px;">
              ${i + 1}. ${escapeHtml(b.title)}
            </div>
            <a href="${b.downloadUrl}" target="_blank"
               style="display:inline-block;padding:9px 22px;background:${C.safe};color:#fff;
                      font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">
              تحميل الكتاب
            </a>
          </td>
        </tr>
      </table>`
    )
    .join("");
  const body = `
    ${heading("حزمتك جاهزة للتحميل 📚")}
    ${paragraph(`${escapeHtml(opts.name)}، تم تأكيد شرائك لحزمة سلسلة <b style="color:${C.ink}">«${escapeHtml(opts.seriesTitle)}»</b> كاملةً. هذه روابط تحميل كتبها:`)}
    ${items}
    ${infoCard([
      ["عدد الكتب", String(opts.books.length)],
      ["صيغة الملفات", "PDF"],
      ["صلاحية الروابط", opts.expiresLabel],
    ])}
    ${paragraph(`<span style="font-size:13.5px;color:${C.muted}">الروابط خاصة بك، يرجى عدم مشاركتها. إن انتهت صلاحيتها يمكنك طلب روابط جديدة من المتجر.</span>`)}
    ${paragraph(`قراءة ممتعة ونافعة 🌿`)}
  `;
  return {
    subject: `حزمة «${opts.seriesTitle}» جاهزة للتحميل (${opts.books.length} كتب)`,
    html: baseLayout({ title: "تحميل الحزمة", preview: `روابط تحميل ${opts.books.length} كتب بالداخل`, body }),
  };
}

// ---------- 3) إيصال الشراء ----------
export function receiptEmail(opts: {
  name: string;
  bookTitle: string;
  amount: string;
  orderId: string;
  date: string;
  downloadUrl: string;
}): { subject: string; html: string } {
  const body = `
    ${heading("إيصال الشراء 🧾")}
    ${paragraph(`شكرًا ${escapeHtml(opts.name)} على ثقتك. تم استلام دفعتك بنجاح وهذه تفاصيل طلبك:`)}
    ${infoCard([
      ["الكتاب", opts.bookTitle],
      ["المبلغ المدفوع", opts.amount],
      ["رقم الطلب", opts.orderId],
      ["التاريخ", opts.date],
      ["طريقة الدفع", "PayPal"],
    ])}
    ${button(opts.downloadUrl, "تحميل الكتاب", C.safe)}
    ${paragraph(`<span style="font-size:13.5px;color:${C.muted}">احتفظ بهذا الإيصال لسجلاتك. لأي استفسار، رد على هذه الرسالة.</span>`)}
  `;
  return {
    subject: `إيصال شراء «${opts.bookTitle}»`,
    html: baseLayout({ title: "إيصال الشراء", preview: `تأكيد شراء ${opts.bookTitle}`, body }),
  };
}

// ---------- 4) رابط الدخول إلى حساب العميل (مكتبتي) ----------
export function loginLinkEmail(opts: { name?: string; loginUrl: string }): {
  subject: string;
  html: string;
} {
  const greet = opts.name ? `مرحبًا ${escapeHtml(opts.name)}` : "مرحبًا";
  const body = `
    ${heading("رابط الدخول إلى مكتبتك 🔑")}
    ${paragraph(`${greet}، اضغط الزر التالي للدخول إلى حسابك وعرض كتبك المشتراة والمجانية وتحميلها:`)}
    ${button(opts.loginUrl, "الدخول إلى مكتبتي")}
    ${paragraph(`<span style="font-size:13.5px;color:${C.muted}">هذا الرابط صالح لمدة ساعة واحدة ولمرة واحدة. إن لم تطلبه، تجاهل هذه الرسالة.</span>`)}
    ${paragraph(`<span style="font-size:12.5px;color:${C.muted}">أو انسخ هذا الرابط:</span><br/>
      <a href="${opts.loginUrl}" style="font-size:12px;word-break:break-all;">${escapeHtml(opts.loginUrl)}</a>`)}
  `;
  return {
    subject: "رابط الدخول إلى مكتبتك",
    html: baseLayout({ title: "الدخول إلى مكتبتي", preview: "رابط الدخول إلى حسابك بالداخل", body }),
  };
}

// ---------- 5) نشرة بريدية مخصّصة ----------
export function newsletterEmail(opts: { subject: string; body: string }): { subject: string; html: string } {
  const paras = opts.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 14px;font-size:16px;line-height:2;color:${C.text}">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
    .join("");
  const body = `${heading(opts.subject)}${paras}`;
  return {
    subject: opts.subject,
    html: baseLayout({ title: opts.subject, preview: opts.subject.slice(0, 80), body }),
  };
}
