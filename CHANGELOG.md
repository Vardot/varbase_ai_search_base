# Changelog

All notable changes to the Varbase AI Search recipe are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- README: on Drupal CMS, whose AI recipe makes amazee.io the default vector database, keep the
  `default_vdb_provider` line of step 2 (#8).

## [1.0.2] - 2026-10-12
### Changed
- Removed `tests/verify.php`: the repository now holds no PHP file. CI runs the same no-key checks inline
  (`drush php:eval` in `.github/workflows/ci.yml`), and the lint job fails on any `.php`, `.module`, `.install` or
  `.inc` file (#7).

### Checked
- CI on 1.0.x (https://github.com/Vardot/varbase_ai_search_base/actions/runs/38238514277): the lint job found no PHP file, the recipe applied twice, the inline
  check printed `RESULT: PASS` and the functional tests passed.

## [1.0.1] - 2026-10-11
### Added
- Functional tests in `tests/features`, run in CI after `tests/verify.php`: Playwright and Cucumber
  through `@vardot/varbase-e2e`, in Chromium, against the site CI builds. They check the admin pages the
  recipe sets up and that anonymous visitors cannot reach them.
### Changed
- Renamed the repository and the package from `varbase_ai_search` to `varbase_ai_search_base`
  (`vardot/varbase_ai_search_base`), beside the other Varbase AI base recipes. The old GitHub URL redirects. Projects
  that required `vardot/varbase_ai_search` change the requirement and the repository URL. The vector database
  name (`varbase_ai_search`), the server and the index are unchanged, so existing indexes keep working.

## [1.0.0] - 2026-10-08
### Added
- The recipe: applies Varbase Search Base, then builds the `content_vector` Search API server and index with AI
  Search on the site's default embeddings model and default vector database, and a `search_index` view display per
  content type. The apply stops early when no default embeddings model is set.
- `docs/decisions/0001-vector-search-backend.md`: why Milvus is the first supported backend, and what was checked
  for each vector database.
- `tests/verify.php`: 21 checks of the server, the index, the view displays and Varbase Search Base, with no AI key.
  With the argument `index` it also indexes and checks that content was embedded.
- GitHub Actions CI: lint, then a real Varbase 11 site (`drupal/varbase_project` `11.0.x-dev` with Varbase's curated
  patches, installed from Varbase Starter) on MariaDB 11.8, which is also the vector database, with the AI
  module's Echo test provider as the default embeddings model. It applies Varbase Search Base first, then the
  provider and the defaults, then the recipe once, and runs `tests/verify.php`.
- README in the Varbase AI recipe style, `AGENTS.md`, `LICENSE`, `logo.png`, composer metadata, and the Vardot
  issue and pull request templates.

### Changed
- The recipe holds only the vector index. The agent, AI Answers and the Ask AI pattern moved to
  [Varbase AI Answers](https://github.com/Vardot/varbase_ai_answers_base), which requires this recipe.
- `composer.json` also suggests `drupal/ai_vdb_provider_mariadb`, beside the Milvus and SQLite providers.

[Unreleased]: https://github.com/Vardot/varbase_ai_search_base/compare/1.0.2...1.0.x
[1.0.2]: https://github.com/Vardot/varbase_ai_search_base/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/Vardot/varbase_ai_search_base/compare/1.0.0...1.0.1
[1.0.0]: https://github.com/Vardot/varbase_ai_search_base/releases/tag/1.0.0
