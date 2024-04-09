module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    '@vue/eslint-config-typescript',
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-strongly-recommended',
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: {
      ts: '@typescript-eslint/parser',
    },
    sourceType: 'module',
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    // 'max-len': ['error', { code: 100 }],
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    indent: 'off',
    semi: ['error', 'always'],
    quotes: ['error', 'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true
      }
    ],
    eqeqeq: ['error', 'always'],
    'comma-spacing': [
      'error',
      {
        before: false,
        after: true,
      },
    ],
    'brace-style': ['error', '1tbs'],
    'no-eval': 'error',
    'block-spacing': 'error',
    'no-useless-rename': [
      'error',
      {
        ignoreDestructuring: false,
        ignoreImport: false,
        ignoreExport: false,
      },
    ],
    'keyword-spacing': [
      'warn',
      {
        before: true,
        after: true,
      },
    ],
    'space-infix-ops': ['warn', { 'int32Hint': false }],
    'no-useless-escape': 'off',
    'css-ruleorselectorexpected': 'off',
    'no-unused-vars': 'off',
    'no-extra-boolean-cast': 'error',
    'no-shadow': 'off',
    'no-empty': [
      'warn',
      {
        'allowEmptyCatch': true,
      }
    ],
    'no-undef': 0,  // NodeListOf<T> type undefined error clear
    'no-redeclare': 'off',
    'no-import-assign': 'off',
    'key-spacing': ['error', { 'afterColon': true }],
    'no-multiple-empty-lines': ['error', { 'max': 2 }],
    'object-curly-spacing': ['error', 'always'],
    'padded-blocks': 'off',
    'curly': 'error',


    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/no-shadow': [
      'off',
      {
        ignoreTypeValueShadow: true,
        ignoreFunctionTypeParameterNameValueShadow: true,
      }
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/semi': ['error', 'always'],
    '@typescript-eslint/no-extra-semi': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/type-annotation-spacing': 'warn',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        disallowTypeAnnotations: false,
      }
    ],
    '@typescript-eslint/array-type': [
      'error',
      {
        default: 'array',
        readonly: 'array-simple',
      }
    ],
    '@typescript-eslint/no-empty-function': 'warn',

    'vue/script-indent': ['error', 2, { switchCase: 1 }],
    'vue/no-v-html': 'off',
    'vue/html-indent': ['error', 2],
    'vue/multi-word-component-names': 'off',
    'vue/no-setup-props-destructure': 'off',
    'vue/component-tags-order': 'off',
    'vue/require-default-prop': 'off',
    'vue/no-multi-spaces': ['error'],
    'vue/prop-name-casing': ['error', 'camelCase'],
    'vue/attribute-hyphenation': ['error', 'always'],
    'vue/v-on-event-hyphenation': ['error', 'always', { autofix: true }],
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/no-template-shadow': 'off',
    'vue/component-name-in-template-casing': [
      'error',
      'PascalCase',
      {
        registeredComponentsOnly: false,
        ignores: ['component'],
      },
    ],
    // attr이 3개 이하일때 무조건 1줄로 가능한지 확인
    'vue/first-attribute-linebreak': [
      'error',
      {
        singleline: 'beside',
        multiline: 'below',
      },
    ],
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: {
          max: 3,
        },
        multiline: {
          max: 1,
        },
      },
    ],
    'vue/singleline-html-element-content-newline': 'off',
    'vue/attributes-order': [
      'error',
      {
        order: [
          'ATTR_SHORTHAND_BOOL', // prop
          ['UNIQUE', 'SLOT'], //  'ref', 'key',  'v-slot', 'slot'.
          'ATTR_STATIC', // prop=""
          'DEFINITION', // 'is', 'v-is'
          'ATTR_DYNAMIC', // :prop=""
          'EVENTS', // '@click="functionCall"', 'v-on="event"'
          'OTHER_DIRECTIVES',
          'RENDER_MODIFIERS', // 'v-once', 'v-pre'
          'CONTENT', //  'v-text', 'v-html'
          'TWO_WAY_BINDING', // 'v-model'
          'LIST_RENDERING', // v-for
          'CONDITIONALS', //  'v-if', 'v-else-if', 'v-else', 'v-show', 'v-cloak'
        ],
        alphabetical: false,
      },
    ],
    'vue/html-closing-bracket-spacing': [
      'error',
      {
        startTag: 'never',
        endTag: 'never',
        selfClosingTag: 'always',
      },
    ],
    'vue/html-closing-bracket-newline': [
      'error',
      {
        singleline: 'never',
        multiline: 'always',
      },
    ],
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'never',
          component: 'always',
        },
        svg: 'always',
        math: 'always',
      },
    ],
    'vue/no-duplicate-attributes': [
      'error',
      {
        allowCoexistClass: false,
        allowCoexistStyle: false,
      },
    ],
    'vue/multiline-html-element-content-newline': [
      'error',
      {
        ignoreWhenEmpty: false,
        allowEmptyLines: true,
        ignores: ['pre', 'textarea'],
      },
    ],
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
  ],
};
