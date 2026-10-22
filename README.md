[![Varbase](https://raw.githubusercontent.com/Vardot/varbase/11.0.x/images/varbase-logo.png)](https://www.drupal.org/project/varbase)

# Varbase AI Search Base
[![Varbase AI Search Base](https://img.shields.io/badge/Varbase%20AI%20Search%20Base-1.0.x--dev-0d6efc?labelColor=001d38&style=flat-square)](https://www.drupal.org/project/varbase_ai_search_base)

An **opt-in** Drupal recipe that gives a Varbase 11 site a vector index of its own content: Varbase
Search Base, then a Search API server and index of every node and Canvas page through AI Search into the site's
default vector database.

It is the retrieval half of "Ask AI". The answering half, the agent, AI Answers and the Canvas
pattern, is [Varbase AI Answers](https://www.drupal.org/project/varbase_ai_answers_base), which requires this recipe and
applies it first. [Varbase AI Chatbot Base](https://www.drupal.org/project/varbase_ai_chatbot_base) reuses the same
index. For the whole Ask AI feature follow the Varbase AI Answers README. This one is the index on its own.

Varbase never applies this by default. Nothing here runs unless somebody applies it on purpose.

**Experimental.** `ai_search` declares `lifecycle: experimental`, so this stack is not covered by the Drupal
security advisory policy. Of the vector database providers, only MariaDB has a stable release.

There is **no custom PHP and no custom shell code** in the recipe. Its no-key checks run inline in CI, so the repository holds no PHP file at
all.

## What it adds

| Where | Change |
|---|---|
| [Varbase Search Base](https://www.drupal.org/project/varbase_search_base) 1.0 | Required and applied first: Search API, the Content index, the `search_index` view mode and the Canvas search page. |
| AI settings | The apply stops and rolls back when no default embeddings model is set, rather than failing in the middle of indexing. |
| View displays | A `search_index` display per content type, cloned from its default display, which renders a node to clean HTML for embedding. Skipped where Drupal CMS Search already created it. |
| Search API server | `content_vector`: backend AI Search on the site's default vector database, database `varbase_ai_search`, collection `content_vector`, cosine similarity, contextual chunks of 300 with 100 overlap. The embeddings engine and vector size come from the site's default embeddings model. |
| Search API index | `content_vector`: every node and Canvas page, published only, all languages, rendered through the `search_index` view mode, with the AI Search tracker. |

Content is re-embedded on save and by cron. After changing the chunk settings or the embeddings model:
`search-api:clear` then `search-api:index`.

## Requirements

- Drupal core `^11.4`, Varbase 11
- [`drupal/ai`](https://www.drupal.org/project/ai) `^1.4`
- [`drupal/ai_search`](https://www.drupal.org/project/ai_search) `^1.3@alpha`, the standalone module
- [`drupal/search_api`](https://www.drupal.org/project/search_api) `^1.40`
- [`drupal/key`](https://www.drupal.org/project/key) `^1.18`
- [`drupal/varbase_search_base`](https://www.drupal.org/project/varbase_search_base) `~1`, applied first by this
  recipe
- A default embeddings model (Varbase AI Base sets one, under Configuration > AI > AI settings) and a default
  vector database provider, from one of the [vector database recipes](#vector-databases).

## Install and apply

Start from a Varbase 11 build with Varbase AI Base applied, then run these commands from the project folder. They
are the whole procedure.

```bash
# 1. Fetch the recipe. The ignore line also covers the vector database recipe of step 2.
ddev composer config --json extra.drupal-recipe-unpack.ignore '["drupal/varbase_ai_search_base", "drupal/varbase_ai_vdb_milvus", "drupal/varbase_ai_vdb_mariadb"]'
ddev composer require drupal/varbase_ai_search_base:1.0.x-dev
```

**Step 2: a vector database. Run the commands of ONE of these recipes.** Each one installs its provider,
connects it and makes it the site default, which this recipe reads. This recipe names its vector
database `varbase_ai_search`, so each block ends with the one thing that name needs. The remote setups (Zilliz
Cloud, a separate server, Upsun) are in each recipe's README, linked in each heading.
On Drupal CMS keep each block's `cset ai.settings default_vdb_provider` line: Drupal CMS AI makes amazee.io the
default, and indexing then fails.

**2a. Milvus**, local in DDEV. [README](https://www.drupal.org/project/varbase_ai_vdb_milvus)

```bash
ddev composer require drupal/varbase_ai_vdb_milvus:1.0.x-dev
cp recipes/varbase_ai_vdb_milvus/ddev/docker-compose.milvus.yaml .ddev/
ddev restart
ddev drush cr
ddev drush recipe ../recipes/varbase_ai_vdb_milvus
ddev drush cr
ddev drush cset ai.settings default_vdb_provider milvus -y
# A Milvus database called varbase_ai_search must exist. If the call is refused, wait for the milvus
# container to be healthy and run it again.
ddev exec 'curl -s http://milvus:19530/v2/vectordb/databases/create -X POST -H "Content-Type: application/json" -d "{\"dbName\":\"varbase_ai_search\"}"'
```

**2b. MariaDB**, the site's own database. Needs MariaDB 11.7 or later: DDEV runs 11.8, and the Varbase Upsun
template runs 10.11 until its database service is upgraded (read the README first: a downgrade deletes the
data). [README](https://www.drupal.org/project/varbase_ai_vdb_mariadb)

Apply Varbase Search Base **before** the MariaDB provider is installed. A Varbase site already has it applied. On
any other site, apply it first, because the provider crashes on the keyword index it sets up (see
[Known issues](#known-issues)):

```bash
ddev drush cr
ddev drush recipe ../recipes/varbase_search_base
ddev drush cr
```

Then:

```bash
ddev composer require drupal/varbase_ai_vdb_mariadb:1.0.x-dev
ddev drush cr
ddev drush recipe ../recipes/varbase_ai_vdb_mariadb
ddev drush cr
ddev drush cset ai.settings default_vdb_provider mariadb -y
# A MariaDB database called varbase_ai_search must exist and the site's user needs access to it. On DDEV the
# root account is root/root. Elsewhere a database administrator does this.
ddev exec "mysql -hdb -uroot -proot -e \"CREATE DATABASE IF NOT EXISTS varbase_ai_search; GRANT ALL PRIVILEGES ON varbase_ai_search.* TO 'db'@'%'; FLUSH PRIVILEGES;\""
```

Each was tested on 5 October 2026 by running each recipe's own test with the `varbase_ai_search` name.

**Steps 3 to 5:**

```bash
# 3. Varbase Search Base, then the vector server and index.
ddev drush recipe ../recipes/varbase_ai_search_base


# 5. Embed the content. One embeddings call per chunk: review the provider pricing first.
ddev drush search-api:index content_vector
ddev drush cr
```

The apply in step 3 runs once: the AI module's `setupVdbServerWithDefaults` action creates the vector
server and cannot update it, so a second apply stops with "Could not save the configuration". To apply
again, delete the `content_vector` index and server first (Configuration > Search and metadata >
Search API).

Step 3 takes the path relative to the Drupal
root, which is why it starts with `../`. The ignore line keeps the recipes locked packages: without it core's
recipe-unpack plugin moves a recipe's dependencies into the project's `composer.json` on require and drops the
recipe itself, so a fresh `composer install` elsewhere has the modules but not the recipe.

## Check the index

```bash
ddev drush search-api:status content_vector            # must reach 100%
ddev drush search-api:search content_vector "mobile first websites"
```

No hits with the index at 100% means the vector database is not answering: check the provider settings
and the Search API server's status page.

## Vector databases

This index works with any vector database provider. Each of these has its own recipe, managed on its own, that
installs the provider, connects it, and has a CI recipe check that needs no AI key. Remote setups (Zilliz
Cloud, a separate server, Upsun) are in each recipe's own README.

| | Milvus | MariaDB |
|---|---|---|
| Recipe | [varbase_ai_vdb_milvus](https://www.drupal.org/project/varbase_ai_vdb_milvus) | [varbase_ai_vdb_mariadb](https://www.drupal.org/project/varbase_ai_vdb_mariadb) |
| Runs | A DDEV service, Zilliz Cloud, or your own server | The site's own database, or a separate server | A file on the site's host |
| Provider | 1.1.0-beta4, no stable release | 1.0.1, a stable release |
| This recipe's `varbase_ai_search` is | A Milvus database | A MariaDB database |


### Provider bugs that matter for this index

- **Milvus:** `dropCollection()` ignores the database argument and always drops from the default database.
  Clearing an index runs it, then creates the collection again, so in `varbase_ai_search` the vectors of removed
  content are likely to stay. Found by a test that left its throw-away collection behind. The clearing itself was
  not run.
- **MariaDB:** 1.0.1 crashes when an index with no server is saved, which happens while Varbase Search Base sets up
  its keyword index. Apply Varbase Search Base before installing the provider (step 2b and
  [Known issues](#known-issues)).

Each recipe's provider was tested on its own, with the `ai_search` bundled in `drupal/ai`, while this recipe
requires the standalone `ai_search` 1.3 (see [Vector backend](#vector-backend)). Together with this recipe: CI
applies it on MariaDB but does not index, the checks under [Checked](#checked) indexed content with the SQLite
provider, and the [Varbase AI Chatbot Base](https://www.drupal.org/project/varbase_ai_chatbot_base) README records Milvus
with this recipe after it indexed 63 items, on 8 October 2026.

## Vector backend

Milvus, through `drupal/ai_vdb_provider_milvus`, is the first supported backend, in
[the decision record](docs/decisions/0001-vector-search-backend.md). The recipe does not hard-wire
it: the vector database is the site's default provider, so another provider works without changing
the recipe. Two things the decision record left unchecked are now known:

- The Milvus provider 1.1.0-beta4 requires `drupal/ai-ai_search` (the subtree split of the module
  bundled in `drupal/ai`), while this recipe, like AI Answers, requires the standalone `drupal/ai_search` 1.3.
  Both install side by side and both are a module named `ai_search`. Which one Drupal loads is not
  guaranteed. With the standalone one alone (the SQLite path) Drupal picks it over the bundled copy.
- No patch is needed on AI Search: 1.3.0-alpha5 returns the per-result data AI Answers needs.

## Automated testing

GitLab CI on [git.drupalcode.org](https://git.drupalcode.org/project/varbase_ai_search_base) (`.gitlab-ci.yml`) runs on every merge
request and every push to `1.0.x`, like the other Varbase AI recipes: `composer validate` and a lint of every YAML
file.

The functional tests in `tests/features` (Playwright and Cucumber through
[`@vardot/varbase-e2e`](https://www.npmjs.com/package/@vardot/varbase-e2e)) run against a site of your own:
`yarn install`, then `LAUNCH_URL=https://your-site.ddev.site yarn test`.

## Checked

In CI on every change, as above. By hand on 5 October 2026, twice:

- On a Varbase 11 site deployed from the Upsun template (Drupal 11.4.5, `drupal/ai` 1.4.7, OpenAI
  `text-embedding-3-small`, Anthropic chat, SQLite provider 1.4.0 patched): 62 of 62 items indexed.
- On a fresh `drupal/varbase_project` 11.0 build (Drupal 11.4.8, amazee.ai embeddings with no key, SQLite provider
  `2.0.x-dev`), following this README's commands as they were then, on `1.0.x-dev`: 18 of 18 items indexed and a
  vector search returning the About, Features and Home pages.

**Not checked:** CI does not index, and no check above indexed with the MariaDB provider.

## Known issues

- **`ai_vdb_provider_mariadb` 1.0.1** crashes with `Call to a member function getBackend() on null` when a Search API
  index that has no server yet is saved. Its `search_api_index_update` hook calls
  `$index->getServerInstance()->getBackend()` without checking for a server, and the Drupal CMS Search recipe,
  which Varbase Search Base applies, saves such an index while it sets up its keyword index. The recipe's rollback
  can then hide the error behind a `ReverseContainer::generateServiceIdHash()` TypeError. **Workaround:** apply
  Varbase Search Base before installing the provider. A Varbase site already has it applied, and CI does the same.
  An upstream fix is pending.
- The index has no language field yet (ai_search 3554899), so retrieval cannot filter by language
  (ai_search 3562047).
- Unpublished content is excluded by the `entity_status` processor. Beyond the obvious, an
  unpublished Canvas page renders only Twig debug comments for anonymous, the HTML-to-Markdown
  converter rejects comment-only HTML, and Search API aborts the whole indexing run on it.
- Every indexed chunk costs an embeddings call.

## Related recipes

| Recipe | What it does |
|---|---|
| [Varbase AI Answers](https://www.drupal.org/project/varbase_ai_answers_base) | Ask AI: cited answers over this index. |
| [Varbase AI Chatbot Base](https://www.drupal.org/project/varbase_ai_chatbot_base) | A visitor chatbot over this index. |
| [Varbase AI VDB: MariaDB](https://www.drupal.org/project/varbase_ai_vdb_mariadb) | MariaDB's native `VECTOR` type as the vector database. |
| [Varbase AI VDB: Milvus](https://www.drupal.org/project/varbase_ai_vdb_milvus) | Milvus or Zilliz Cloud as the vector database. |

## License

GPL-2.0-or-later. See [LICENSE](LICENSE). Maintained by [Vardot](https://www.vardot.com).
