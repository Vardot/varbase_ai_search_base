'use strict';

/**
 * @file
 * The two steps this suite needs that @vardot/varbase-e2e does not ship.
 *
 * Login, navigation and the "I should see" assertions are varbase-e2e
 * built-ins. These two come from the Varbase AI Figma Base suite unchanged.
 */

const { Given, Then } = require('@cucumber/cucumber');
const {
  friendly,
  gotoUrl,
  waitForPageLoad,
} = require('@vardot/varbase-e2e/tests/step-definitions/varbase-e2e');

async function attempt(body, message) {
  try {
    await body();
  } catch (err) {
    throw friendly(message, err);
  }
}

/**
 * Assert the page has no PHP error, fatal, warning or notice, and is not
 * Drupal's "unexpected error" page.
 *
 * Example: Then I the page should not have PHP errors
 */
Then(/^(?:I |we )?the page should not have PHP errors$/, async function () {
  await attempt(async () => {
    const content = await this.page.content();
    const patterns = [
      /Fatal error:/i,
      /Warning:.*on line/i,
      /Notice:.*on line/i,
      /Parse error:/i,
      /The website encountered an unexpected error/i,
    ];
    for (const pattern of patterns) {
      if (pattern.test(content)) {
        throw new Error(`PHP error detected on page: ${this.page.url()}`);
      }
    }
  }, 'Expected page to be free of PHP errors');
});

/**
 * Create every non-admin user from worldParameters.users through
 * /admin/people/create, while logged in as the Webmaster. Roles that do not
 * exist on the site are skipped.
 *
 * Example: When I add testing users
 */
Given(/^(?:I |we )?add( the)? testing users$/, async function (_the) {
  const users = this.parameters.users || {};
  await attempt(async () => {
    for (const [key, info] of Object.entries(users)) {
      if (info.isAdmin || key === 'webmaster') continue;
      await gotoUrl(this.page, `${this.parameters.launchUrl}/admin/people/create`);
      await this.page.evaluate((info) => {
        const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.value = val; };
        set('#edit-name', info.username);
        set('#edit-mail', info.email || `${info.username}@example.test`);
        set('#edit-pass-pass1', info.password);
        set('#edit-pass-pass2', info.password);
        for (const role of info.roles || []) {
          const cb = document.querySelector(`input[name="roles[${role}]"]`);
          if (cb) cb.checked = true;
        }
      }, info);
      await this.page.evaluate(() => document.querySelector('#edit-submit').click());
      await waitForPageLoad(this.page);
    }
  }, 'Could not provision the testing users');
});
