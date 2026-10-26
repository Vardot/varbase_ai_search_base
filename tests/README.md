# Varbase functional testing suite

Playwright and Cucumber through [`@vardot/varbase-e2e`](https://www.npmjs.com/package/@vardot/varbase-e2e), on a
Varbase 11 site with this recipe applied.

| Feature | Covers |
| --- | --- |
| `01-01-ai-search-base-index.feature` | The vector server, connected to its collection on the default vector database, and the index of content and Canvas pages |
| `01-02-ai-search-base-access.feature` | Only the webmaster manages the vector index |

## Run it

```bash
npm install
LAUNCH_URL=https://your-site.ddev.site npm test
```

The site needs the webmaster (`webmaster`) and one user per role, named after the role (`content_editor`,
`content_admin`, `seo_admin`, `site_admin`), all with the password in `LOGIN_PASS` (default `dD.123123ddd`).
`.gitlab-ci.yml` shows the whole setup.

## AI provider

The recipe stops when no embeddings model is set up: CI checks that first. It then makes the AI module's test
provider (EchoAI) the default with `tests/recipes/varbase_ai_testing_provider`, applies Varbase AI VDB: MariaDB,
whose own database holds the vectors. No key is needed.

EchoAI does not return real vectors, so content is not embedded in CI. The `@ai-provider` scenario indexes the
content with a real provider (`npm run test:ai-provider`); in CI it runs in its own job, only when the project
has an `OPENAI_API_KEY` variable.
