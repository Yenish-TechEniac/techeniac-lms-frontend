import { ESLint } from 'eslint';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const fixtures = [
  {
    file: 'lint-fixtures/ui-imports-service.tsx',
    expectedRule: 'architecture/ui-primitive-confinement',
  },
  {
    file: 'lint-fixtures/page-imports-service.tsx',
    expectedRule: 'architecture/service-calls-only-in-hooks',
  },
  {
    file: 'lint-fixtures/no-console.ts',
    expectedRule: 'no-console',
  },
  {
    file: 'lint-fixtures/no-explicit-any.ts',
    expectedRule: '@typescript-eslint/no-explicit-any',
  },
  {
    file: 'lint-fixtures/no-floating-promises.ts',
    expectedRule: '@typescript-eslint/no-floating-promises',
  },
  {
    file: 'lint-fixtures/ordered-imports.ts',
    expectedRule: 'simple-import-sort/imports',
  },
  {
    file: 'lint-fixtures/jsx-a11y-img-alt.tsx',
    expectedRule: 'jsx-a11y/alt-text',
  },
];

async function runFixtureTests() {
  console.log('Testing ESLint fixtures against expected rule IDs...\n');

  const fixtureEslint = new ESLint({
    cwd: rootDir,
    ignore: false,
  });

  let totalFailures = 0;

  for (const { file, expectedRule } of fixtures) {
    const filePath = path.join(rootDir, file);
    const results = await fixtureEslint.lintFiles([filePath]);
    const fileResult = results[0];

    if (!fileResult) {
      console.error(`[FAIL] No lint results produced for ${file}`);
      totalFailures++;
      continue;
    }

    const messages = fileResult.messages;
    const ruleIds = messages.map((m) => m.ruleId).filter(Boolean);

    if (messages.length === 0) {
      console.error(`[FAIL] ${file} passed but was expected to fail with ${expectedRule}`);
      totalFailures++;
      continue;
    }

    if (ruleIds.includes(expectedRule)) {
      console.log(`[PASS] ${file} failed as expected with rule '${expectedRule}'`);
    } else {
      console.error(
        `[FAIL] ${file} failed with rules [${ruleIds.join(', ')}], but expected rule '${expectedRule}' was not found.`,
      );
      totalFailures++;
    }
  }

  console.log('\n----------------------------------------');
  if (totalFailures > 0) {
    console.error(`Fixture testing failed with ${totalFailures} error(s).`);
    process.exit(1);
  } else {
    console.log(
      `All ${fixtures.length} fixtures passed validation against their expected rule IDs.`,
    );
    process.exit(0);
  }
}

runFixtureTests().catch((err) => {
  console.error('Unexpected error running fixture tests:', err);
  process.exit(1);
});
