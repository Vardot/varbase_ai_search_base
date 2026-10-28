---
name: varbase-ai-search
description: "Apply, repair and verify Varbase AI Search on a Varbase 11 site: the vector index of a site's content (Varbase AI Search Base) and its vector database (MariaDB or Milvus). Install and apply commands, inputs, config, post-apply steps, browser checks, traps and versions, read from the recipe code. Use when adding, fixing or checking Varbase AI Search."
---

# Varbase AI Search

Read from `recipe.yml`, `composer.json`, README, CHANGELOG and `git log` at the latest tag, 28 October 2026. Re-check versions on drupal.org before relying on them. For the full Varbase AI apply order, see the Varbase AI recipes docs page.

## Recipes

| Recipe | Latest | Stability | Require |
|---|---|---|---|
| `varbase_ai_search_base` | 1.0.0-beta1 | beta | `drupal/varbase_ai_search_base:~1` |
| `varbase_ai_vdb_mariadb` | 1.0.0-beta1 | beta | `drupal/varbase_ai_vdb_mariadb:~1` |
| `varbase_ai_vdb_milvus` | 1.0.0-beta1 | beta | `drupal/varbase_ai_vdb_milvus:~1` |

Docs (the code wins where they differ):
- https://docs.varbase.vardot.com/developers/understanding-varbase/varbase-ai-recipes/varbase-ai-search-base
- https://docs.varbase.vardot.com/developers/understanding-varbase/varbase-ai-recipes/varbase-ai-vdb-mariadb
- https://docs.varbase.vardot.com/developers/understanding-varbase/varbase-ai-recipes/varbase-ai-vdb-milvus

## What it does

- `varbase_ai_search_base` applies `varbase_search_base`, installs `node`, `search_api`, `ai`, `ai_search`. Stops and rolls back when no default embeddings model is set. Clones `core.entity_view_display.node.*.default` to `node.<type>.search_index` (skipped where one exists). Creates server and index `content_vector` on the site's default vector database: `embedding_strategy: contextual_chunks`, `chunk_size: 300`, `chunk_min_overlap: 100`, `database_name: ''` (the provider's default database, since beta1 #3633097). Composer: `ai ^1.4`, `ai_search ^1.3@alpha`, `search_api ^1.40`, `key ^1.18`, `varbase_search_base ~1`.
- `varbase_ai_vdb_mariadb` installs `ai`, `ai_search`, `ai_vdb_provider_mariadb` (^1.0), keeps it on the Drupal database connection and sets `ai.settings:default_vdb_provider`. Needs MariaDB 11.7+ (DDEV MariaDB 11.8 qualifies). A separate server: `$config` in settings.php.
- `varbase_ai_vdb_milvus` installs `key`, `ai`, `ai_search`, `ai_vdb_provider_milvus` (^1.1@beta), creates Key `milvus_api_key` (reads env `MILVUS_API_KEY`), and sets itself as the default VDB since beta1 (#3633121). Inputs `server`, `port` (env `MILVUS_SERVER`, `MILVUS_PORT`; default http://milvus:19530, the DDEV service in its `ddev/` folder), `api_key` ('').

## Apply

All commands in DDEV, from the project root; recipes are applied from the docroot path `../recipes/<name>`. Take a snapshot first: `ddev snapshot --name before-varbase-ai-search`. Add each recipe to `extra.drupal-recipe-unpack.ignore` in `composer.json` before requiring it (read the list first: `composer config --json` replaces it).

```bash
ddev composer require drupal/varbase_ai_vdb_mariadb:~1 drupal/varbase_ai_search_base:~1
ddev drush cr
ddev drush recipe ../recipes/varbase_ai_vdb_mariadb -y && ddev drush cr
ddev drush cget ai.settings default_vdb_provider          # mariadb
ddev drush recipe ../recipes/varbase_ai_search_base -y     # once
ddev drush search-api:index content_vector                 # one embeddings call per chunk
```

Milvus instead: copy the recipe's `ddev/` compose file into `.ddev/`, `ddev restart`, apply `varbase_ai_vdb_milvus` with `--input=varbase_ai_vdb_milvus.server=http://milvus`. Apply only one VDB recipe as default.

## After the apply

- Check every content type has a `search_index` view display with its body and description; a type added after the apply, or one whose default display shows only the title, is embedded by title only. Add the display, then re-index.
- MariaDB: AI Search embeds at most 10 chunks per pass and the provider deletes the earlier passes of the same item, so long items lose their beginning. Raise `chunk_size` to 600 with overlap 100 on the `content_vector` server so items fit one pass, re-index, and confirm stored chunks equal expected.

## Verify

- `ddev drush search-api:status content_vector` reaches 100%.
- `ddev drush search-api:search content_vector "<words from your content>"` returns hits. No hits at 100% means the vector database is not answering.
- Stored chunks per item match the expected count (count rows per item in the provider's table).

Test as a real editor or visitor, not user 1: a superuser bypasses permissions.

## Traps

- Apply Search Base once: a second apply fails with "Could not save the configuration". To redo, delete the `content_vector` index and server first.
- MariaDB provider 1.0.1 crashes (`getBackend() on null`) on an index with no server: apply `varbase_search_base` before the provider (Varbase 11 already has it).
- Alpha1 used `database_name: varbase_ai_search` ("Access denied"); beta1 uses the provider default. Milvus alpha1 did not set itself as default.
- Milvus: an old collection with another vector dimension makes indexing fail; drop it via `/v2/vectordb/collections/drop` (ask first). `dropCollection()` ignores the database, so cleared indexes may keep old vectors.
- No language filter; every chunk is a paid embeddings call.

## History

All three started 22 Oct 2026, 1.0.0-alpha1 on 24 Oct, docs moved 25 Oct, functional tests 26 Oct, 1.0.0-beta1 on 27 Oct.
