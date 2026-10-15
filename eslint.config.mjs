import path from 'node:path';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

function getRepoRelativePath(context) {
  const rawFilename = context.filename ?? context.getFilename?.() ?? '';
  const cwd = context.cwd ?? (typeof process !== 'undefined' ? process.cwd() : '');
  const rel = (
    cwd && path.isAbsolute(rawFilename) ? path.relative(cwd, rawFilename) : rawFilename
  ).replace(/\\/g, '/');

  // Strip 'lint-fixtures/' prefix so test fixtures go through the exact same code path as real files
  return rel.replace(/^lint-fixtures\//, '');
}

const uiPrimitiveConfinementRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow components/ui/** from importing from components/app/**, components/patterns/**, components/layout/**, context/**, services/**, or hooks/**',
    },
    schema: [],
    messages: {
      prohibitedImport:
        "UI primitive '{{filename}}' must not import from '{{importPath}}'. Primitives must remain independent of app, layout, patterns, context, services, and hooks.",
    },
  },
  create(context) {
    const rel = getRepoRelativePath(context);
    const isUiComponent = /^components\/ui\//.test(rel);

    if (!isUiComponent) {
      return {};
    }

    const forbiddenPatterns = [
      /^@\/components\/app(\/.*)?$/,
      /^@\/components\/patterns(\/.*)?$/,
      /^@\/components\/layout(\/.*)?$/,
      /^@\/context(\/.*)?$/,
      /^@\/services(\/.*)?$/,
      /^@\/hooks(\/.*)?$/,
      /^\.\.?\/(.*\/)?(components\/)?app(\/.*)?$/,
      /^\.\.?\/(.*\/)?(components\/)?patterns(\/.*)?$/,
      /^\.\.?\/(.*\/)?(components\/)?layout(\/.*)?$/,
      /^\.\.?\/(.*\/)?context(\/.*)?$/,
      /^\.\.?\/(.*\/)?services(\/.*)?$/,
      /^\.\.?\/(.*\/)?hooks(\/.*)?$/,
    ];

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        if (typeof importPath !== 'string') return;

        const isForbidden = forbiddenPatterns.some((pattern) => pattern.test(importPath));
        if (isForbidden) {
          context.report({
            node: node.source,
            messageId: 'prohibitedImport',
            data: { filename: rel, importPath },
          });
        }
      },
    };
  },
};

const serviceCallsOnlyInHooksRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow files under app/** and components/** from importing directly from services/**',
    },
    schema: [],
    messages: {
      prohibitedServiceImport:
        "Direct import of service '{{importPath}}' is prohibited in '{{filename}}'. Only hooks/** may call services directly.",
    },
  },
  create(context) {
    const rel = getRepoRelativePath(context);
    const isAppOrComponent = /^(app|components)\//.test(rel) && !rel.startsWith('components/ui/');

    if (!isAppOrComponent) {
      return {};
    }

    const serviceImportPatterns = [/^@\/services(\/.*)?$/, /^\.\.?\/(.*\/)?services(\/.*)?$/];

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        if (typeof importPath !== 'string') return;

        const isServiceImport = serviceImportPatterns.some((pattern) => pattern.test(importPath));
        if (isServiceImport) {
          context.report({
            node: node.source,
            messageId: 'prohibitedServiceImport',
            data: { filename: rel, importPath },
          });
        }
      },
    };
  },
};

export const architecturePlugin = {
  rules: {
    'ui-primitive-confinement': uiPrimitiveConfinementRule,
    'service-calls-only-in-hooks': serviceCallsOnlyInHooksRule,
  },
};

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'coverage/**',
      'lint-fixtures/**',
      'scripts/**',
      'next-env.d.ts',
    ],
  },
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.js', '**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      architecture: architecturePlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'jsx-a11y/alt-text': 'error',
      'architecture/ui-primitive-confinement': 'error',
      'architecture/service-calls-only-in-hooks': 'error',
    },
  },
  prettierConfig,
);
