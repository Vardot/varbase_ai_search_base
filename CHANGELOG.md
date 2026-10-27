# Changelog

All notable changes to the Varbase AI Search Base recipe are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0-beta1] - 2026-10-27
### Added
- Automated functional acceptance tests for AI search and accessibility, run in CI on a fresh Varbase 11 site ([#3633131](https://www.drupal.org/i/3633131)).

### Changed
- Move the documentation to docs.varbase.vardot.com ([#3633025](https://www.drupal.org/i/3633025)).
- Install the Varbase Starter dev line in CI, which carries the search view fix for Drupal CMS Search 2.2.7.
- Update the version badge to `1.0.0-beta1` in `README.md`.

### Fixed
- Use the default database of the vector database provider ([#3633097](https://www.drupal.org/i/3633097)).

## [1.0.0-alpha1] - 2026-10-24
### Added
- Initialize Varbase AI Search Base recipe ([#3632417](https://www.drupal.org/i/3632417)).
### Removed
- The GitHub Actions workflows and the `.github` templates: CI runs on git.drupalcode.org.

[Unreleased]: https://git.drupalcode.org/project/varbase_ai_search_base/-/compare/1.0.0-beta1...1.0.x
[1.0.0-beta1]: https://git.drupalcode.org/project/varbase_ai_search_base/-/compare/1.0.0-alpha1...1.0.0-beta1
[1.0.0-alpha1]: https://git.drupalcode.org/project/varbase_ai_search_base/-/tags/1.0.0-alpha1
