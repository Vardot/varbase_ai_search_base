# 0001: Vector search backend for Ask AI

- **Status:** Accepted as the first supported backend on 5 October 2026. Product owner review pending. Updated the same day with the three vector database recipes and what testing found.

## Context

Varbase 11 + AI has a Search API database server and one content index, and no vector provider, so it
cannot give retrieval-based answers. Ask AI needs one. The choice was managed or self-hosted, and which
Drupal provider module.

## Decision

- **Milvus is the first supported vector backend**, through `drupal/ai_vdb_provider_milvus`.
- The recipe stays provider agnostic. The vector database is chosen on the Search API server (backend
  *AI Search*, then a vector database), so the recipe does not hard-wire Milvus and another provider can be
  added later without changing it.
- Milvus runs outside Upsun. Its credentials go in the Key module.
- Each vector database is its own recipe, so Ask AI stays independent of them:
  [varbase_ai_vdb_milvus](https://www.drupal.org/project/varbase_ai_vdb_milvus) and
  [varbase_ai_vdb_mariadb](https://www.drupal.org/project/varbase_ai_vdb_mariadb). Each runs inside the same DDEV
  project or against a remote server where that makes sense, and each ships a test that needs no AI key.

## Options checked

Checked on 5 October 2026 against `Vardot/platformsh-varbase` at `a18ef4a` (Drupal 11.4.5, `drupal/ai`
1.4.7, `search_api` 1.41.0).

| Option | Result |
|---|---|
| Milvus: `ai_vdb_provider_milvus` 1.1.0-beta4 | Needs `drupal/ai ^1.2`, `ai_search ^1.2` and `key ^1.18`, and no PHP extension. Resolves against the template's lock with 2 new packages. Released 11 June 2026, 730 sites, and both the 1.1.x and 2.0.x branches were updated on 22 September 2026. No stable release, so not covered by the security advisory policy. |
| pgvector: `ai_vdb_provider_postgres` 1.0.0-alpha4 | Needs `ext-pdo_pgsql`. The template replaces that extension and loads it nowhere, so Composer installs the module and a connection then fails with `PDOException: could not find driver`. Alpha, 354 sites, not covered by the advisory policy. Pulls the standalone `ai_search` 1.3.0-alpha5 next to the one bundled in `drupal/ai`. |
| amazee.ai managed vector database (`ai_provider_amazeeio` 1.4.2) | A PostgreSQL and pgvector database per key, reached through `pdo_pgsql`, so it has the same blocker. Hosted by amazee.ai, so indexed content leaves the site. |
| Wrap `ai_recipe_answers` 1.0.0-beta3, then swap to Milvus | Its package metadata requires the Postgres provider (alpha), `ai_recipe_vdb_provider_postgres` (dev) and `ai_search` (alpha), so it installs the Postgres stack first. |
| MariaDB: `ai_vdb_provider_mariadb` 1.0.1 | **Stable release.** Needs only `ext-mysqli`, which DDEV has. Uses the site's own database by default, so there is no extra service. Needs MariaDB 11.7+: DDEV runs 11.8.9, the template's Upsun service is 10.11, and Upsun lists 11.8 (a direct upgrade is allowed, a downgrade deletes the data). Passes the end-to-end test, also through its separate-server path. See the recipe. |
| SQLite: `ai_vdb_provider_sqlite` 1.4.0 and `2.0.x-dev` | Released 1.4.0 **fails every vector search** ("Only LIMIT or 'k =?' can be provided, not both"), on sqlite-vec 0.1.6 to 0.1.9. The `2.0.x-dev` branch fixes it, requires only `drupal/ai ^1.1`, and passes the end-to-end test on sqlite-vec 0.1.9 under the command line and PHP-FPM. Needs `sqlite3.extension_dir` in `php.ini` and `vec0.so`, which a recipe cannot set. The Ask AI pilot in this repository instead patches 1.4.0 for the same query and for the PHP 8.4 deprecations (drupal.org #3604047), per its README. |
| Qdrant: `ai_vdb_provider_qdrant` 1.3.3 | Not offered. It has a stable release, but requires the legacy standalone `ai_search ~1.3@alpha`, which collides with the one bundled in `drupal/ai`. |

Upsun (its documentation, 5 October 2026): the PostgreSQL service supports the `vector` extension on
versions 11 to 18, and there is no Milvus or other vector database service.

### Why the PostgreSQL options are expensive in the template

In `Vardot/platformsh-varbase` the PostgreSQL extensions were added (#17, #33), then removed because the
Upsun build check runs in the build container, which `runtime.extensions` does not reach (#33), then
replaced in `composer.json` (#36) and removed from the DDEV web image (#46). Using a PostgreSQL provider
means reversing that: drop the `replace` entries, load the extension in the DDEV image and in CI, and solve
the Upsun build check again.

## Consequences

- Production needs a Milvus host outside Upsun. Self-hosted or a managed service is still open.
- The recipe is labelled experimental: `ai_search` declares `lifecycle: experimental` and the Milvus
  provider has no stable release.
- Local development needs a Milvus server, for example in DDEV.
- The Milvus provider's 2.0.x line needs `drupal/ai ^2.0`. Revisit when Varbase moves to AI 2.
- A PostgreSQL option can be added later at the cost described above.

## Not checked

- Indexing real content. It needs an embedding provider key, which was not available. The three providers were
  tested with 4-dimension vectors through their own API, against a live Milvus, the site's MariaDB 11.8 and a
  SQLite file.
- A real remote server. The remote paths of Milvus and MariaDB were tested against the DDEV services over the
  network. The Milvus provider documents Zilliz Cloud support but it was not tried.
- Behaviour on an Upsun environment, for all three.
- Whether the standalone `ai_search` collides with the bundled one (it was not installed).
- The claim that `ai_recipe_answers` returns zero results without an AI Search patch.

## Open

- Where production Milvus runs (self-hosted or a managed service).
- Whether to upgrade the Upsun database to 11.8 and use MariaDB instead, which avoids a separate service.
- Product owner review.

## Repeat the checks

On a copy of `platformsh-varbase` at `a18ef4a` or newer:

```bash
ddev exec php -r 'echo implode(",", PDO::getAvailableDrivers());'
ddev composer show -a drupal/ai_vdb_provider_milvus 1.1.0-beta4
ddev composer require drupal/ai_vdb_provider_milvus:1.1.0-beta4 --dry-run
ddev composer require drupal/ai_vdb_provider_postgres:1.0.0-alpha4 --dry-run
```

`composer require --dry-run` prints "composer.json has been updated" but writes nothing. Confirm with
`git diff composer.json composer.lock`.
