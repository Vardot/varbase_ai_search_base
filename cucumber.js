// cucumber-js config for this recipe's functional suite (Playwright +
// Cucumber through @vardot/varbase-e2e). Point it at a site where the recipe
// is applied:
//
//   LAUNCH_URL=https://your-site.ddev.site yarn test
//
// CI builds that site and runs this after the CI recipe check.

const baseWorldParameters = require('./cucumber.shared.js');

process.env.VARBASE_E2E_REPORT_JSON =
  process.env.VARBASE_E2E_REPORT_JSON || 'tests/reports/cucumber_report.json';
process.env.VARBASE_E2E_REPORT_OUT =
  process.env.VARBASE_E2E_REPORT_OUT || 'tests/reports/cucumber_report.html';

module.exports = {
  default: {
    timeout: 45000,
    requireModule: ['tsx/cjs'],
    require: [
      'node_modules/@vardot/varbase-e2e/tests/step-definitions/**/*.js',
      'tests/step-definitions/**/*.js',
    ],
    paths: ['tests/features/**/*.feature'],
    format: [
      'pretty',
      'json:tests/reports/cucumber_report.json',
    ],
    worldParameters: baseWorldParameters,
  },
};
