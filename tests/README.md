# Varbase functional testing suite

Playwright and Cucumber through [`@vardot/varbase-e2e`](https://www.npmjs.com/package/@vardot/varbase-e2e), on a
Varbase 11 site with this recipe applied.

| Feature | Covers |
| --- | --- |
| `01-01-ai-search-base-index.feature` | The webmaster sees the site's content in a vector index connected to its vector database |
| `01-02-ai-search-base-access.feature` | Only the webmaster opens the vector index |
| `01-03-ai-search-base-accessibility.feature` | The vector index page gives every link a name |

## Run it

```bash
npm install
LAUNCH_URL=https://your-site.ddev.site npm test
```

The site needs the webmaster (`webmaster`) and one user per role, named after the role (`content_editor`,
`content_admin`, `seo_admin`, `site_admin`), all with the password in `LOGIN_PASS` (default `dD.123123ddd`).
`.gitlab-ci.yml` shows the whole setup.

## AI provider

The recipe stops when no embeddings model is set up: CI checks that first. It then applies Drupal CMS AI,
which sets up an amazee.ai trial as the default provider, so no key is needed and content is embedded by a
real model. Varbase AI VDB: MariaDB is the vector database, on MariaDB 11.8. The chatbot and Ask AI suites ask
real questions against this index.

The index page is held to the link name and ARIA role checks: Search API's own "Index now"
fields have no labels, which comes from Search API, not this recipe.
