# AGENTS.md

Guidance for AI coding agents working on the Varbase AI Search recipe.

This is a **private** recipe on GitHub (`Vardot/varbase_ai_search_base`), not a drupal.org project. Issues, pull
requests and CI all live on GitHub. Its default branch is `1.0.x`, and it is managed like
[rightup_translate_to_ar](https://github.com/Vardot/rightup_translate_to_ar).

## Before you start

- **`CHANGELOG.md`**: what changed in each release, newest first. Read it before proposing a change.
- **Pull requests and their discussions** on
  [github.com/Vardot/varbase_ai_search_base](https://github.com/Vardot/varbase_ai_search_base/pulls): the reasoning behind
  recent changes.
- **Issues** on [github.com/Vardot/varbase_ai_search_base/issues](https://github.com/Vardot/varbase_ai_search_base/issues):
  the Problem/Motivation and Proposed resolution for each change.
- **`README.md`**: what was checked, what was not, and the known issues.
- **`docs/decisions/0001-vector-search-backend.md`**: why the vector database is the site's default provider rather
  than a fixed one.

## When you make a change

- One issue and one pull request per change. The PR says `Closes #<issue>` and ends with the Checkpoints list
  from `.github/pull_request_template.md`.
- Add an entry under `## [Unreleased]` in `CHANGELOG.md`.
- CI must be green before merging: `.github/workflows/ci.yml` lints the repository, then applies Varbase Search
  Base, the MariaDB provider with the Echo test provider for embeddings, and this recipe on a real Drupal 11.4 site
  with MariaDB 11.8, and runs the no-key recipe check.
- The recipe applies once: `setupVdbServerWithDefaults` cannot update a server it already created. Do not add a
  second apply to CI.
- No PHP in the repository at all: no `.php`, `.module`, `.install` or `.inc` file. The no-key checks run inline in
  `.github/workflows/ci.yml` (`drush php:eval`), and the lint job fails on any PHP file.
- Keep it provider-agnostic. Never hard-wire a vector database: the server reads the site's default provider.
- Varbase AI Answers and Varbase AI Chatbot Base depend on the `content_vector` index. A change to its id, server or
  fields is a change for them too.
- Never bump the version or tag a release without explicit maintainer approval. Tags are three-segment
  (`1.0.0`) and are never moved once pushed.
