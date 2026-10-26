// cucumber-js config for the Varbase AI Search Base functional testing suite.
//   LAUNCH_URL=https://your-site.ddev.site npm test
// The site is Varbase 11 with this recipe applied; see tests/README.md.

const password = process.env.LOGIN_PASS || 'dD.123123ddd';
const user = (username) => ({ username, password });

module.exports = {
  default: {
    timeout: 60000,
    requireModule: ['tsx/cjs'],
    require: ['node_modules/@vardot/varbase-e2e/tests/step-definitions/**/*.js'],
    paths: ['tests/features/**/*.feature'],
    tags: process.env.CUCUMBER_TAGS || 'not @wip',
    format: ['pretty', 'json:tests/reports/cucumber_report.json'],
    worldParameters: {
      launchUrl: process.env.LAUNCH_URL || 'http://localhost',
      users: {
        Webmaster: user(process.env.LOGIN_USER || 'webmaster'),
        'Content editor': user('content_editor'),
        'Content admin': user('content_admin'),
        'SEO admin': user('seo_admin'),
        'Site admin': user('site_admin'),
        'Authenticated user': user('authenticated_user'),
      },
      minWaitTime: {
        page: 8000,
        before_scenario: 0,
        after_scenario: 0,
        before_step: 0,
        after_step: 0,
      },
      selectors: {
        css: {},
        xpath: {},
        filesPath: './tests/selectors/',
        files: [],
        offset: 60,
      },
      screenshot: {
        dir: './tests/screenshots',
        onFailed: true,
        failedPrefix: 'failed_',
      },
      video: {
        mode: 'on-failure',
        dir: './tests/videos',
        size: { width: 1600, height: 1200 },
      },
      javascript: {
        mode: 'warn',
        levels: ['error'],
      },
    },
  },
};
