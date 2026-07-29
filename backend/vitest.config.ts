import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // फक्त source मधल्या tests. `dist/` वगळला नाही तर compiled आवृत्ती दुसऱ्यांदा
    // चालवली जाते आणि ती CommonJS असल्याने vitest मध्ये चालतच नाही.
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
  },
});
