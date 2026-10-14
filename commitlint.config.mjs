const BACKEND_COMMIT_REGEX =
  /^(feat|fix|bug|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}$/;

const config = {
  extends: ['@commitlint/config-conventional'],
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w+)(?:\((.+)\))?: (.+)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
  plugins: [
    {
      rules: {
        'backend-commit-format': (parsed) => {
          const { header } = parsed;
          const isValid = BACKEND_COMMIT_REGEX.test(header ?? '');
          return [
            isValid,
            `header must match backend regex pattern "^(feat|fix|bug|docs|style|refactor|test|chore|perf|ci|build|revert)(\\(.+\\))?: .{1,50}$"`,
          ];
        },
      },
    },
  ],
  rules: {
    'backend-commit-format': [2, 'always'],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'bug',
        'docs',
        'style',
        'refactor',
        'test',
        'chore',
        'perf',
        'ci',
        'build',
        'revert',
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [0],
    'subject-case': [0],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [0],
    'subject-min-length': [2, 'always', 1],
    'subject-max-length': [2, 'always', 50],
    'header-max-length': [0],
  },
};

export default config;
