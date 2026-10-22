// Shared cucumber-js worldParameters for this recipe's functional suite.
//
// The Webmaster is the site's uid 1; CI renames it and sets this password.
// Override with LAUNCH_URL, LOGIN_USER and LOGIN_PASS for another site.

module.exports = {
  launchUrl: process.env.LAUNCH_URL || 'http://localhost',
  users: {
    'Webmaster': {
      username: process.env.LOGIN_USER || 'webmaster',
      email: 'webmaster@example.test',
      password: process.env.LOGIN_PASS || 'dD.123123ddd',
      isAdmin: true,
    },
    'webmaster': {
      username: process.env.LOGIN_USER || 'webmaster',
      email: 'webmaster@example.test',
      password: process.env.LOGIN_PASS || 'dD.123123ddd',
      isAdmin: true,
    },
    'Content editor': {
      username: 'content_editor_user',
      email: 'content_editor_user@example.test',
      password: 'dD.123123ddd',
      roles: ['content_editor'],
    },
    'Authenticated user': {
      username: 'authenticated_user',
      email: 'authenticated_user@example.test',
      password: 'dD.123123ddd',
      roles: [],
    },
  },
  minWaitTime: {
    page: 3000,
    before_scenario: 0,
    after_scenario: 0,
    before_step: 0,
    after_step: 0,
  },
  selectors: {
    css: {},
    xpath: {},
    filesPath: './tests/selectors/',
    files: [
      'cms-drupal-core-claro.json',
      'cms-drupal-cms-gin.json',
      'cms-varbase-vartheme.json',
    ],
  },
  screenshot: {
    onFailure: true,
    dir: './tests/screenshots',
  },
  video: {
    enabled: false,
    dir: './tests/videos',
  },
};
