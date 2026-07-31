/**
 * `@mahatest/core` — framework-निरपेक्ष business logic.
 *
 * इथलं काहीही Prisma, NestJS, Next.js किंवा React वर अवलंबून नाही. म्हणूनच हेच
 * modules admin (Next.js), API (NestJS) आणि गरज पडल्यास mobile app — तिन्हीकडून
 * वापरता येतात, आणि त्यांचे tests कुठलाही database न लागता चालतात.
 *
 * नियम: इथे नवीन file टाकताना तिला `import` काहीच लागत नाही ना ते तपासा. Database
 * किंवा session लागत असेल तर ती इथे नाही — ती वापरणाऱ्या app मध्ये ठेवा.
 */

export * from './grading';
export * from './entitlements';
export * from './quiz-access';
export * from './question-import';
export * from './reading-time';
