import Link from "next/link";
import { prisma } from "@/lib/db";
import { ShieldIcon, CheckIcon, BookIcon, UsersIcon, GiftIcon } from "@/components/icons";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "عن المؤلف",
  description: "محمد المسقري — كاتب ومتخصص في الوعي الرقمي وحماية المجتمع العربي من الاحتيال والابتزاز الإلكتروني.",
};

export default async function AboutPage() {
  const [bookCount, readerCount] = await Promise.all([
    prisma.book.count({ where: { isPublished: true } }).catch(() => 0),
    prisma.freeClaim.count({ where: { confirmed: true } }).catch(() => 0),
  ]);

  return (
    <div className="container-x py-12">
      {/* البطل */}
      <section className="card overflow-hidden md:grid md:grid-cols-[auto_1fr]">
        <div className="grid place-items-center bg-gradient-to-br from-ink to-ink-soft p-10 text-white md:w-80">
          <div className="text-center">
            <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-shield/20 font-display text-5xl font-extrabold text-shield-light">
              م
            </div>
            <div className="mt-4 font-display text-2xl font-extrabold">محمد المسقري</div>
            <div className="mt-1 text-sm text-white/70">كاتب ومتخصص في الوعي الرقمي</div>
          </div>
        </div>
        <div className="p-8 md:p-12">
          <span className="badge bg-shield/10 text-guard"><ShieldIcon className="h-4 w-4" /> رسالة توعوية</span>
          <h1 className="mt-4 font-display text-3xl font-extrabold text-ink">عن المؤلف</h1>
          <p className="mt-4 leading-9 text-ink-soft">
            محمد المسقري كاتب عربي كرّس قلمه لتبسيط مفاهيم الأمن الرقمي وحماية الأفراد والعائلات من
            الاحتيال والابتزاز الإلكتروني. يؤمن أن الوعي صدقة تنقذ، فجعل رسالته أن يصل العلم النافع
            إلى كل بيت عربي بلغة يفهمها الجميع، وقصص واقعية، وخطوات عملية تُطبّق فورًا.
          </p>
          <div className="mt-6 flex flex-wrap gap-6">
            <div>
              <div className="font-display text-3xl font-extrabold text-shield tnum">{bookCount}+</div>
              <div className="text-sm text-ink-muted">كتاب منشور</div>
            </div>
            <div>
              <div className="font-display text-3xl font-extrabold text-safe tnum">{readerCount}+</div>
              <div className="text-sm text-ink-muted">قارئ مستفيد</div>
            </div>
          </div>
        </div>
      </section>

      {/* الرسالة والقيم */}
      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          { icon: <BookIcon className="h-7 w-7" />, t: "محتوى عربي أصيل", d: "كتب مكتوبة خصيصًا للقارئ العربي، بلغة واضحة وأمثلة من واقعنا." },
          { icon: <ShieldIcon className="h-7 w-7" />, t: "حماية عملية", d: "دروع وخطوات قابلة للتطبيق فورًا لحماية مالك وبياناتك وعائلتك." },
          { icon: <UsersIcon className="h-7 w-7" />, t: "للجميع", d: "للأهل والأبناء وكبار السن — الوعي عدوى إيجابية ننشرها معًا." },
        ].map((c, i) => (
          <div key={i} className="card card-hover p-7 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-shield/10 text-shield">{c.icon}</span>
            <h3 className="mt-4 font-display text-xl font-extrabold text-ink">{c.t}</h3>
            <p className="mt-2 leading-8 text-ink-muted">{c.d}</p>
          </div>
        ))}
      </section>

      {/* رؤية */}
      <section className="card mt-10 p-8 md:p-12">
        <h2 className="font-display text-2xl font-extrabold text-ink">الرؤية</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            "تحويل الوعي الرقمي من ترف إلى ضرورة في كل بيت عربي.",
            "تقديم المعرفة بأسلوب مبسّط لا يحتاج خلفية تقنية.",
            "نشر كتب مجانية لمن لا يقدر، وبيع ميسّر لمن أراد دعم الرسالة.",
            "تحديث المحتوى باستمرار لمواكبة أساليب المحتالين المتطورة.",
          ].map((v) => (
            <li key={v} className="flex items-start gap-2 text-ink-soft">
              <CheckIcon className="mt-1 h-5 w-5 shrink-0 text-safe" /> {v}
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/books" className="btn-dark">تصفّح المكتبة</Link>
          <Link href="/free" className="btn-primary"><GiftIcon className="h-5 w-5" /> احصل على كتاب مجاني</Link>
        </div>
      </section>
    </div>
  );
}
