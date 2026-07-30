/**
 * App साठी एक चाचणी विद्यार्थी तयार करतो — mobile app जोडताना login लागतो.
 *
 * हा `seed.ts` पेक्षा वेगळा आहे आणि **मुद्दाम.** तो script सुरुवातीलाच
 * `deleteMany` ने सगळं मिटवतो; तो चुकून चालवला तर खऱ्या विद्यार्थ्यांचे attempts
 * जातील. हा काहीच मिटवत नाही — फक्त एक user आणि त्याचे access rows असल्याची
 * खात्री करतो, आणि पुन्हा पुन्हा चालवला तरी तेच निकाल देतो.
 *
 *   npm run seed:app-student --workspace @mahatest/db
 */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/** App मध्ये login करण्यासाठी — फक्त development. */
const PHONE = '9000000001';
const PASSWORD = 'Student@123';

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // Password नेहमी पुन्हा लिहितो — जुना काय ठेवला होता ते आठवत नसेल तरी हा
  // script चालवला की तो पुन्हा माहीत होतो.
  const student = await prisma.user.upsert({
    where: { phone: PHONE },
    update: { passwordHash },
    create: {
      name: 'Test App Student',
      email: 'testapp@spardhatimes.com',
      phone: PHONE,
      passwordHash,
      role: Role.STUDENT,
    },
    select: { id: true, name: true },
  });

  // प्रकाशित series पैकी ज्यांचा access नाही त्याच जोडतो.
  const series = await prisma.testSeries.findMany({
    where: { published: true },
    select: { id: true, title: true },
  });

  if (series.length > 0) {
    await prisma.testSeriesAccess.createMany({
      data: series.map((s) => ({ userId: student.id, testSeriesId: s.id })),
      skipDuplicates: true,
    });
  }

  const granted = await prisma.testSeriesAccess.count({ where: { userId: student.id } });

  console.log(`विद्यार्थी : ${student.name}`);
  console.log(`Phone      : ${PHONE}`);
  console.log(`Password   : ${PASSWORD}`);
  console.log(`Series     : ${granted} पैकी ${series.length} प्रकाशित`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
