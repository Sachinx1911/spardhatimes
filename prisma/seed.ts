import { PrismaClient, Role, Difficulty, QuizStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean up existing data (optional, but good for resetting)
  await prisma.adminLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.bookmark.deleteMany({});
  await prisma.questionResponse.deleteMany({});
  await prisma.quizAttempt.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.quiz.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Default Users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash("Admin@123", salt);
  const studentPasswordHash = await bcrypt.hash("Student@123", salt);

  const admin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@quizplatform.com",
      passwordHash: adminPasswordHash,
      role: Role.SUPERADMIN,
    },
  });

  const student = await prisma.user.create({
    data: {
      name: "Jane Doe",
      email: "student@quizplatform.com",
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
    },
  });

  console.log(`Created users: Admin (${admin.email}), Student (${student.email})`);

  // 2. Create Categories
  const categoriesData = [
    { name: "General Knowledge", slug: "general-knowledge", icon: "Brain" },
    { name: "Current Affairs", slug: "current-affairs", icon: "Globe" },
    { name: "History", slug: "history", icon: "BookOpen" },
    { name: "Geography", slug: "geography", icon: "Map" },
    { name: "Science", slug: "science", icon: "Atom" },
    { name: "Mathematics", slug: "mathematics", icon: "Percent" },
    { name: "Reasoning", slug: "reasoning", icon: "GitBranch" },
    { name: "Marathi Grammar", slug: "marathi-grammar", icon: "PenTool" },
    { name: "English Grammar", slug: "english-grammar", icon: "Languages" },
    { name: "Computer Knowledge", slug: "computer-knowledge", icon: "Laptop" },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        metaTitle: `${cat.name} Quizzes & Test Series`,
        metaDescription: `Practice online mock tests for ${cat.name} with instant result analysis and detailed explanations.`,
      },
    });
    categories.push(createdCat);
  }

  console.log(`Created ${categories.length} categories.`);

  // 3. Create Sample Quizzes
  const gkCategory = categories.find((c) => c.slug === "general-knowledge")!;
  const scienceCategory = categories.find((c) => c.slug === "science")!;

  // GK Quiz
  const gkQuiz = await prisma.quiz.create({
    data: {
      title: "World Capitals Challenge",
      slug: "world-capitals-challenge",
      description: "Test your knowledge of major world capitals from different continents.",
      duration: 10, // 10 minutes
      marks: 10.0,
      negativeMarks: 0.25,
      passingMarks: 5.0,
      difficulty: Difficulty.EASY,
      status: QuizStatus.PUBLISHED,
      instructions: "Read all questions carefully. Choose the single best answer. Each wrong answer deducts 0.25 marks.",
      categoryId: gkCategory.id,
    },
  });

  // Science Quiz
  const scienceQuiz = await prisma.quiz.create({
    data: {
      title: "General Physics Mock Test",
      slug: "general-physics-mock-test",
      description: "Evaluate your understanding of classical mechanics, light, and thermodynamics.",
      duration: 15, // 15 minutes
      marks: 15.0,
      negativeMarks: 0.5,
      passingMarks: 7.5,
      difficulty: Difficulty.MEDIUM,
      status: QuizStatus.PUBLISHED,
      instructions: "No calculator allowed. Negative marking of 0.5 marks applies for incorrect answers.",
      categoryId: scienceCategory.id,
    },
  });

  console.log("Created sample quizzes.");

  // 4. Create Questions for GK Quiz
  const gkQuestionsData = [
    {
      text: "What is the capital of France?",
      optionA: "Berlin",
      optionB: "Madrid",
      optionC: "Paris",
      optionD: "Rome",
      correctAnswer: "C",
      explanation: "Paris is the capital and most populous city of France.",
      difficulty: Difficulty.EASY,
      marks: 2.0,
      categoryName: "Geography",
    },
    {
      text: "What is the capital of Australia?",
      optionA: "Sydney",
      optionB: "Melbourne",
      optionC: "Brisbane",
      optionD: "Canberra",
      correctAnswer: "D",
      explanation: "Canberra was selected as the capital in 1908 as a compromise between Sydney and Melbourne.",
      difficulty: Difficulty.MEDIUM,
      marks: 2.0,
      categoryName: "Geography",
    },
    {
      text: "What is the capital of Japan?",
      optionA: "Kyoto",
      optionB: "Tokyo",
      optionC: "Osaka",
      optionD: "Hiroshima",
      correctAnswer: "B",
      explanation: "Tokyo is the capital city of Japan and the world's most populous metropolitan area.",
      difficulty: Difficulty.EASY,
      marks: 2.0,
      categoryName: "Geography",
    },
    {
      text: "What is the capital of Canada?",
      optionA: "Toronto",
      optionB: "Vancouver",
      optionC: "Ottawa",
      optionD: "Montreal",
      correctAnswer: "C",
      explanation: "Ottawa was chosen by Queen Victoria in 1857 to be the capital of Canada.",
      difficulty: Difficulty.MEDIUM,
      marks: 2.0,
      categoryName: "Geography",
    },
    {
      text: "What is the capital of Brazil?",
      optionA: "Rio de Janeiro",
      optionB: "Sao Paulo",
      optionC: "Brasilia",
      optionD: "Salvador",
      correctAnswer: "C",
      explanation: "Brasilia is a planned city, inaugurated in 1960, replacing Rio de Janeiro as the capital.",
      difficulty: Difficulty.MEDIUM,
      marks: 2.0,
      categoryName: "Geography",
    },
  ];

  for (const q of gkQuestionsData) {
    await prisma.question.create({
      data: {
        quizId: gkQuiz.id,
        ...q,
      },
    });
  }

  // 5. Create Questions for Science Quiz
  const scienceQuestionsData = [
    {
      text: "What is the speed of light in a vacuum?",
      optionA: "3 x 10^8 m/s",
      optionB: "3 x 10^6 m/s",
      optionC: "1.5 x 10^8 m/s",
      optionD: "3 x 10^10 m/s",
      correctAnswer: "A",
      explanation: "The speed of light in a vacuum is approximately 299,792,458 meters per second, commonly rounded to 3 x 10^8 m/s.",
      difficulty: Difficulty.EASY,
      marks: 3.0,
      categoryName: "Optics",
    },
    {
      text: "Which of the following laws explains the working of a rocket?",
      optionA: "Newton's First Law of Motion",
      optionB: "Newton's Second Law of Motion",
      optionC: "Newton's Third Law of Motion",
      optionD: "Archimedes' Principle",
      correctAnswer: "C",
      explanation: "Rocket propulsion is based on Newton's third law of motion: 'For every action, there is an equal and opposite reaction.'",
      difficulty: Difficulty.EASY,
      marks: 3.0,
      categoryName: "Mechanics",
    },
    {
      text: "What is the unit of electric resistance?",
      optionA: "Volt",
      optionB: "Ampere",
      optionC: "Ohm",
      optionD: "Watt",
      correctAnswer: "C",
      explanation: "The Ohm (symbol: Ω) is the SI unit of electrical resistance, named after German physicist Georg Ohm.",
      difficulty: Difficulty.EASY,
      marks: 3.0,
      categoryName: "Electricity",
    },
    {
      text: "Who discovered the Theory of General Relativity?",
      optionA: "Isaac Newton",
      optionB: "Albert Einstein",
      optionC: "Galileo Galilei",
      optionD: "Stephen Hawking",
      correctAnswer: "B",
      explanation: "Albert Einstein published the theory of general relativity in 1915, describing gravity as the curvature of spacetime.",
      difficulty: Difficulty.MEDIUM,
      marks: 3.0,
      categoryName: "Modern Physics",
    },
    {
      text: "Absolute zero temperature in Celsius scale is equal to:",
      optionA: "0 °C",
      optionB: "-100 °C",
      optionC: "-273.15 °C",
      optionD: "-300 °C",
      correctAnswer: "C",
      explanation: "Absolute zero is 0 Kelvin, which corresponds exactly to -273.15 degrees Celsius.",
      difficulty: Difficulty.MEDIUM,
      marks: 3.0,
      categoryName: "Thermodynamics",
    },
  ];

  for (const q of scienceQuestionsData) {
    await prisma.question.create({
      data: {
        quizId: scienceQuiz.id,
        ...q,
      },
    });
  }

  // Update Category Counters
  await prisma.category.update({
    where: { id: gkCategory.id },
    data: {
      totalTests: 1,
      totalQuestions: gkQuestionsData.length,
    },
  });

  await prisma.category.update({
    where: { id: scienceCategory.id },
    data: {
      totalTests: 1,
      totalQuestions: scienceQuestionsData.length,
    },
  });

  console.log("Seeding complete successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
