/**
 * سكربت البذور: ينشئ حساب المدير من متغيرات البيئة،
 * ويضيف الكتاب المجاني الرئيسي وكتابًا تجريبيًا مدفوعًا.
 * آمن للتكرار (upsert) — لا يكرر البيانات عند إعادة التشغيل.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "author@example.com";
  const adminPass = process.env.ADMIN_PASSWORD || "ChangeMeStrongAdminPass123";
  const adminName = process.env.ADMIN_NAME || "محمد المسقري";

  const passwordHash = await bcrypt.hash(adminPass, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { name: adminName, passwordHash },
    create: { email: adminEmail, name: adminName, passwordHash },
  });
  console.log(`✓ حساب المدير جاهز: ${adminEmail}`);

  // الكتب التجريبية تُنشأ فقط على قاعدة بيانات جديدة (حتى لا تعود بعد حذفها)
  const existingBooks = await prisma.book.count();
  if (existingBooks > 0) {
    console.log(`✓ يوجد ${existingBooks} كتاب — تخطّي بذور الكتب`);
    return;
  }

  // الكتاب المجاني الرئيسي
  await prisma.book.upsert({
    where: { slug: "lan-yakhdaouk" },
    update: {},
    create: {
      slug: "lan-yakhdaouk",
      title: "لن يخدعوك بعد اليوم",
      subtitle: "الدليل العربي الشامل للحماية من الاحتيال والابتزاز الرقمي",
      author: "محمد المسقري",
      description:
        "دليل عملي شامل يكشف أساليب المحتالين على الإنترنت ويعلّمك كيف تحمي نفسك وعائلتك وأموالك من الاحتيال والابتزاز الرقمي. عشرة فصول مليئة بالقصص الواقعية والخطوات العملية ودروع الحماية.",
      isFree: true,
      isPublished: true,
      featured: true,
      priceCents: 0,
      pages: 149,
      category: "الأمن الرقمي",
      sortOrder: 1,
      // ارفع ملف الكتاب والغلاف من لوحة التحكم بعد النشر
    },
  });
  console.log("✓ الكتاب المجاني الرئيسي جاهز");

  // كتاب تجريبي مدفوع (يمكن حذفه من لوحة التحكم)
  await prisma.book.upsert({
    where: { slug: "namudhaj-madfou" },
    update: {},
    create: {
      slug: "namudhaj-madfou",
      title: "كتاب تجريبي مدفوع",
      subtitle: "مثال لعرض آلية الشراء عبر PayPal",
      author: "محمد المسقري",
      description:
        "هذا كتاب تجريبي لإظهار صفحة الشراء والدفع. يمكنك تعديله أو حذفه من لوحة التحكم وإضافة كتبك الحقيقية.",
      isFree: false,
      isPublished: true,
      featured: false,
      priceCents: 990,
      currency: "USD",
      pages: 120,
      category: "تجريبي",
      sortOrder: 2,
    },
  });
  console.log("✓ كتاب تجريبي مدفوع جاهز");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
