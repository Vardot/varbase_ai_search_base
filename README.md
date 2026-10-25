[![Varbase](https://raw.githubusercontent.com/Vardot/varbase/11.0.x/images/varbase-logo.png)](https://www.drupal.org/project/varbase)

# Varbase AI Search Base
[![Varbase AI Search Base](https://img.shields.io/badge/Varbase%20AI%20Search%20Base-1.0.0--alpha1-0d6efc?labelColor=001d38&style=flat-square)](https://www.drupal.org/project/varbase_ai_search_base)

An **opt-in** Drupal recipe that gives a Varbase 11 site a vector index of its own content: Varbase
Search Base, then a Search API server and index of every node and Canvas page through AI Search into the site's
default vector database.

## Documentation

Read the [Varbase AI Search Base documentation](https://docs.varbase.vardot.com/developers/understanding-varbase/varbase-ai-recipes/varbase-ai-search-base) on the Varbase docs site.

## Install and apply

Start from a Varbase 11 build with Varbase AI Base applied, then run these commands from the project folder. They
are the whole procedure.

```bash
# 1. Fetch the recipe. The ignore line also covers the vector database recipe of step 2.
ddev composer config --json extra.drupal-recipe-unpack.ignore '["drupal/varbase_ai_search_base", "drupal/varbase_ai_vdb_milvus", "drupal/varbase_ai_vdb_mariadb"]'
ddev composer require drupal/varbase_ai_search_base:~1
```

**Step 2: a vector database. Run the commands of ONE of these recipes.** Each one installs its provider,
connects it and makes it the site default, which this recipe reads. This recipe names its vector
database `varbase_ai_search`, so each block ends with the one thing that name needs. The remote setups (Zilliz
Cloud, a separate server, Upsun) are on each recipe's docs page, linked in each heading.
On Drupal CMS keep each block's `cset ai.settings default_vdb_provider` line: Drupal CMS AI makes amazee.io the
default, and indexing then fails.

**2a. Milvus**, local in DDEV. [Docs](https://docs.varbase.vardot.com/developers/understanding-varbase/varbase-ai-recipes/varbase-ai-vdb-milvus)

```bash
ddev composer require drupal/varbase_ai_vdb_milvus:~1
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
template runs 10.11 until its database service is upgraded (read its docs page first: a downgrade deletes the
data). [Docs](https://docs.varbase.vardot.com/developers/understanding-varbase/varbase-ai-recipes/varbase-ai-vdb-mariadb)

Apply Varbase Search Base **before** the MariaDB provider is installed. A Varbase site already has it applied. On
any other site, apply it first, because the provider crashes on the keyword index it sets up (see
[Known issues](https://docs.varbase.vardot.com/developers/understanding-varbase/varbase-ai-recipes/varbase-ai-search-base)):

```bash
ddev drush cr
ddev drush recipe ../recipes/varbase_search_base
ddev drush cr
```

Then:

```bash
ddev composer require drupal/varbase_ai_vdb_mariadb:~1
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

## Automated testing

GitLab CI on [git.drupalcode.org](https://git.drupalcode.org/project/varbase_ai_search_base) (`.gitlab-ci.yml`) runs on every merge
request and every push to `1.0.x`, like the other Varbase AI recipes: `composer validate` and a lint of every YAML
file.

The functional tests in `tests/features` (Playwright and Cucumber through
[`@vardot/varbase-e2e`](https://www.npmjs.com/package/@vardot/varbase-e2e)) run against a site of your own:
`yarn install`, then `LAUNCH_URL=https://your-site.ddev.site yarn test`.

## License

GPL-2.0-or-later. See [LICENSE](LICENSE). Maintained by [Vardot](https://www.vardot.com).
