# AGENTS.md

Guidance for AI coding agents working on the Varbase AI Search Base recipe.

This is a drupal.org project: [drupal.org/project/varbase_ai_search_base](https://www.drupal.org/project/varbase_ai_search_base).
Issues live in its [issue queue](https://www.drupal.org/project/issues/varbase_ai_search_base) and merge requests on
[git.drupalcode.org](https://git.drupalcode.org/project/varbase_ai_search_base). Its default branch is `1.0.x`; the
GitHub repository is a mirror and takes no issues or pull requests.

## Before you start

- **`CHANGELOG.md`**: what changed in each release, newest first. Read it before proposing a change.
- **Issues and merge requests** on drupal.org: the Problem/Motivation, Proposed resolution and the reasoning behind
  recent changes.
- **`README.md`**: what was checked, what was not, and the known issues.
- **`docs/decisions/0001-vector-search-backend.md`**: why the vector database is the site's default provider rather
  than a fixed one.

## When you make a change

- One drupal.org issue and one issue-fork merge request per change, titled `<type>: #<issue> Summary`. The MR
  description ends with the Checkpoints list from `.gitlab/merge_request_templates/default.md`.
- CI must be green before merging: `.gitlab-ci.yml` on git.drupalcode.org validates `composer.json` and lints
  every YAML file.
- No PHP in the repository at all: no `.php`, `.module`, `.install` or `.inc` file.
- Add an entry under `## [Unreleased]` in `CHANGELOG.md`.
- The recipe applies once: `setupVdbServerWithDefaults` cannot update a server it already created. Do not add a
  second apply to CI.
- Keep it provider-agnostic. Never hard-wire a vector database: the server reads the site's default provider.
- Varbase AI Answers and Varbase AI Chatbot Base depend on the `content_vector` index. A change to its id, server or
  fields is a change for them too.
- Never bump the version or tag a release without explicit maintainer approval. Tags are three-segment
  (`1.0.0`) and are never moved once pushed.
