[![Varbase](https://raw.githubusercontent.com/Vardot/varbase/11.0.x/images/varbase-logo.png)](https://www.drupal.org/project/varbase)

# Varbase AI Search Base
[![CI](https://github.com/Vardot/varbase_ai_search_base/actions/workflows/ci.yml/badge.svg?branch=1.0.x)](https://github.com/Vardot/varbase_ai_search_base/actions/workflows/ci.yml)
[![Varbase AI Search Base](https://img.shields.io/badge/Varbase%20AI%20Search%20Base-1.0.2-0d6efc?labelColor=001d38&style=flat-square)](https://github.com/Vardot/varbase_ai_search_base/releases/tag/1.0.2)

A private, **opt-in** Drupal recipe that gives a Varbase 11 site a vector index of its own content: Varbase
Search Base, then a Search API server and index of every node and Canvas page through AI Search into the site's
default vector database.

It is the retrieval half of "Ask AI". The answering half, the agent, AI Answers and the Canvas
pattern, is [Varbase AI Answers](https://github.com/Vardot/varbase_ai_answers_base), which requires this recipe and
applies it first. [Varbase AI Chatbot Base](https://github.com/Vardot/varbase_ai_chatbot_base) reuses the same
index. For the whole Ask AI feature follow the Varbase AI Answers README. This one is the index on its own.

Varbase never applies this by default. Nothing here runs unless somebody applies it on purpose.

**Experimental.** `ai_search` declares `lifecycle: experimental`, so this stack is not covered by the Drupal
security advisory policy. Of the three vector database providers, only MariaDB has a stable release.

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
  vector database provider, from one of the three [vector database recipes](#vector-databases). `composer.json`
  suggests the three providers.

## Install and apply

Start from a Varbase 11 build with Varbase AI Base applied, then run these commands from the project folder. They
are the whole procedure.

```bash
# 1. Fetch the recipe. The repository is private, so Composer clones it over SSH.
#    The ignore line also covers the vector database recipe of step 2.
ddev auth ssh
ddev composer config repositories.varbase_ai_search_base vcs git@github.com:Vardot/varbase_ai_search_base.git
ddev composer config --json extra.drupal-recipe-unpack.ignore '["vardot/varbase_ai_search_base", "vardot/varbase_ai_vdb_milvus", "vardot/varbase_ai_vdb_mariadb", "vardot/varbase_ai_vdb_sqlite"]'
ddev composer require vardot/varbase_ai_search_base:~1.0.2 --prefer-source
```

**Step 2: a vector database. Run the commands of ONE of these three recipes.** Each one installs its provider,
connects it and makes it the site default, which this recipe reads. This recipe names its vector
database `varbase_ai_search`, so each block ends with the one thing that name needs. The remote setups (Zilliz
Cloud, a separate server, Upsun) are in each recipe's README, linked in each heading.
On Drupal CMS keep each block's `cset ai.settings default_vdb_provider` line: Drupal CMS AI makes amazee.io the
default, and indexing then fails.

**2a. Milvus**, local in DDEV. [README](https://github.com/Vardot/varbase_ai_vdb_milvus)

```bash
ddev composer config repositories.varbase_ai_vdb_milvus vcs git@github.com:Vardot/varbase_ai_vdb_milvus.git
ddev composer require vardot/varbase_ai_vdb_milvus:~1.0.0 --prefer-source
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
data). [README](https://github.com/Vardot/varbase_ai_vdb_mariadb)

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
ddev composer config repositories.varbase_ai_vdb_mariadb vcs git@github.com:Vardot/varbase_ai_vdb_mariadb.git
ddev composer require vardot/varbase_ai_vdb_mariadb:~1.0.0 --prefer-source
ddev drush cr
ddev drush recipe ../recipes/varbase_ai_vdb_mariadb
ddev drush cr
ddev drush cset ai.settings default_vdb_provider mariadb -y
# A MariaDB database called varbase_ai_search must exist and the site's user needs access to it. On DDEV the
# root account is root/root. Elsewhere a database administrator does this.
ddev exec "mysql -hdb -uroot -proot -e \"CREATE DATABASE IF NOT EXISTS varbase_ai_search; GRANT ALL PRIVILEGES ON varbase_ai_search.* TO 'db'@'%'; FLUSH PRIVILEGES;\""
```

**2c. SQLite**, a file, local in DDEV. Needs the provider's unreleased `2.0.x-dev`.
[README](https://github.com/Vardot/varbase_ai_vdb_sqlite)

```bash
ddev composer config repositories.varbase_ai_vdb_sqlite vcs git@github.com:Vardot/varbase_ai_vdb_sqlite.git
ddev composer require vardot/varbase_ai_vdb_sqlite:~1.0.0 --prefer-source
mkdir -p private/sqlite-vec private/varbase_ai_vdb_sqlite
curl -fsSL https://github.com/asg017/sqlite-vec/releases/download/v0.1.9/sqlite-vec-0.1.9-loadable-linux-x86_64.tar.gz \
  | tar xz -C private/sqlite-vec vec0.so
cp recipes/varbase_ai_vdb_sqlite/ddev/php/sqlite-vec.ini .ddev/php/
ddev restart
ddev drush cr
ddev drush recipe ../recipes/varbase_ai_vdb_sqlite
ddev drush cr
ddev drush cset ai.settings default_vdb_provider sqlite -y
# The provider's 2.0.x-dev cannot create a new database file from a plain path, so create the empty one.
touch private/varbase_ai_vdb_sqlite/varbase_ai_search.sqlite.sql
```

All three were tested on 5 October 2026 by running each recipe's own test with the `varbase_ai_search` name.

**Steps 3 to 5:**

```bash
# 3. Varbase Search Base, then the vector server and index.
ddev drush recipe ../recipes/varbase_ai_search_base

# 4. Check it. No AI key is needed.
ddev drush php:eval "$(sed -n "/<<'PHP'/,/^ *PHP\$/p" recipes/varbase_ai_search_base/.github/workflows/ci.yml | sed '1d;$d')"

# 5. Embed the content. One embeddings call per chunk: review the provider pricing first.
ddev drush search-api:index content_vector
ddev drush cr
```

The apply in step 3 runs once: the AI module's `setupVdbServerWithDefaults` action creates the vector
server and cannot update it, so a second apply stops with "Could not save the configuration". To apply
again, delete the `content_vector` index and server first (Configuration > Search and metadata >
Search API).

Use `1.0.x-dev` instead of `~1.0.2` to follow the development branch. Step 3 takes the path relative to the Drupal
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

This index works with any of three vector databases. Each has its own private recipe, managed on its own, that
installs the provider, connects it, and has a CI recipe check that needs no AI key. Remote setups (Zilliz
Cloud, a separate server, Upsun) are in each recipe's own README.

| | Milvus | MariaDB | SQLite |
|---|---|---|---|
| Recipe | [varbase_ai_vdb_milvus](https://github.com/Vardot/varbase_ai_vdb_milvus) | [varbase_ai_vdb_mariadb](https://github.com/Vardot/varbase_ai_vdb_mariadb) | [varbase_ai_vdb_sqlite](https://github.com/Vardot/varbase_ai_vdb_sqlite) |
| Runs | A DDEV service, Zilliz Cloud, or your own server | The site's own database, or a separate server | A file on the site's host |
| Provider | 1.1.0-beta4, no stable release | 1.0.1, a stable release | `2.0.x-dev`, unreleased |
| This recipe's `varbase_ai_search` is | A Milvus database | A MariaDB database | The file `varbase_ai_search.sqlite.sql` |

**SQLite by hand, without the recipe** (how the pilot was verified):

The SQLite provider needs the `sqlite-vec` loadable extension (`vec0.so`) in the directory PHP's
`sqlite3.extension_dir` names, for the CLI and FPM SAPIs separately, and a private files directory
with a `vdb` folder in it. On DDEV: the binary from the
[sqlite-vec releases](https://github.com/asg017/sqlite-vec/releases) in `.ddev/sqlite-vec/`, a
`.ddev/php/sqlite-vec.ini` with `sqlite3.extension_dir = /var/www/html/.ddev/sqlite-vec`, and
`mkdir -p private/vdb`. The provider's `2.0.x-dev` still carries PHP 8.4 implicitly nullable
deprecations (fixed on its 1.4.x branch after 1.4.0, drupal.org #3604047, not on 2.0.x). On a site that
displays errors they print before the endpoint's JSON, which the blocks tolerate but a plain `curl` does
not. A project that must stay on the released 1.4.0 needs two local patches instead: that PHP 8.4 fix,
and the vector query sqlite-vec 0.1.7+ refuses because 1.4.0 sends `k = ?` together with `LIMIT`.

### Provider bugs that matter for this index

- **Milvus:** `dropCollection()` ignores the database argument and always drops from the default database.
  Clearing an index runs it, then creates the collection again, so in `varbase_ai_search` the vectors of removed
  content are likely to stay. Found by a test that left its throw-away collection behind. The clearing itself was
  not run.
- **SQLite:** the released 1.4.0 cannot search, and `2.0.x-dev` cannot create a new database file from a plain
  path (step 2c).
- **MariaDB:** 1.0.1 crashes when an index with no server is saved, which happens while Varbase Search Base sets up
  its keyword index. Apply Varbase Search Base before installing the provider (step 2b and
  [Known issues](#known-issues)).

Each recipe's provider was tested on its own, with the `ai_search` bundled in `drupal/ai`, while this recipe
requires the standalone `ai_search` 1.3 (see [Vector backend](#vector-backend)). Together with this recipe: CI
applies it on MariaDB but does not index, the checks under [Checked](#checked) indexed content with the SQLite
provider, and the [Varbase AI Chatbot Base](https://github.com/Vardot/varbase_ai_chatbot_base) README records Milvus
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

`.github/workflows/ci.yml` runs on every pull request, every push to `1.0.x` and every tag:

1. **Lint**: `composer validate`, every YAML file, and PHP syntax.
2. **Apply on a Varbase 11 site with MariaDB vectors**: a real Varbase 11 site, built the way Vardot's public recipe CI builds one: `drupal/varbase_project` `11.0.x-dev` with Varbase's curated patches, installed from Varbase Starter, on MariaDB 11.8, which is also the vector database. Twig is held below 3.30, which breaks the `cva` module Varbase uses. It requires this checkout and the MariaDB
   provider.
   - Varbase Search Base is applied first, before the MariaDB provider (see the known issues).
   - Then the provider and the defaults: the AI module's Echo test provider (`echoai`, model `gpt-test`) is the
     default embeddings model, so no AI key is needed, MariaDB is the default vector database, and the
     `varbase_ai_search` database is created.
   - Then the recipe, **once**. The AI module's `setupVdbServerWithDefaults` cannot update a server it already
     created, so a second apply stops by design (see [Install and apply](#install-and-apply)).
   - The no-key recipe check runs last.
3. **Functional tests**: the same job then serves the site and runs the Playwright + Cucumber scenarios in
   `tests/features` through [`@vardot/varbase-e2e`](https://www.npmjs.com/package/@vardot/varbase-e2e) in
   Chromium. The Webmaster provisions the testing users first, then the scenarios check the admin pages the
   recipe adds, every page for PHP errors, and that a visitor without the permission is kept out. Screenshots
   and reports of a failed run are kept as the `functional-tests` artifact. To run them against a site of
   your own: `yarn install`, then `LAUNCH_URL=https://your-site.ddev.site yarn test`.

The CI step "Check the recipe without an AI key" (an inline `drush php:eval` in `.github/workflows/ci.yml`) makes 21 checks and needs no AI key:

- the modules `search_api`, `ai` and `ai_search`;
- Varbase Search Base applied (the Content index exists);
- a default vector database set;
- the server `content_vector`: the AI Search backend, the default vector database, database `varbase_ai_search`,
  collection `content_vector`, cosine similarity, contextual chunks of 300, and an embeddings engine;
- the index `content_vector`: on that server, enabled, the AI Search tracker, covers nodes, skips unpublished
  content, and has the rendered item and URL fields;
- a `search_index` view display for every content type.

With the argument `index` it also indexes the content and checks that at least one item was embedded. That calls the
site's embeddings model, so it needs the embeddings key:

```bash
ddev drush php:eval "$(sed -n "/<<'PHP'/,/^ *PHP\$/p" recipes/varbase_ai_search_base/.github/workflows/ci.yml | sed '1d;$d' \
  | sed "s/^ *\$extra = .*/\$extra = ['index'];/")"
```

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
| [Varbase AI Answers](https://github.com/Vardot/varbase_ai_answers_base) | Ask AI: cited answers over this index. |
| [Varbase AI Chatbot Base](https://github.com/Vardot/varbase_ai_chatbot_base) | A visitor chatbot over this index. |
| [Varbase AI VDB: MariaDB](https://github.com/Vardot/varbase_ai_vdb_mariadb) | MariaDB's native `VECTOR` type as the vector database. |
| [Varbase AI VDB: Milvus](https://github.com/Vardot/varbase_ai_vdb_milvus) | Milvus or Zilliz Cloud as the vector database. |
| [Varbase AI VDB: SQLite](https://github.com/Vardot/varbase_ai_vdb_sqlite) | SQLite with sqlite-vec as the vector database. |

## License

GPL-2.0-or-later. See [LICENSE](LICENSE). Maintained by [Vardot](https://www.vardot.com).
