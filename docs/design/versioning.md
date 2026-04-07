# Versioning

This repository uses **date-based versions** in the form `YYYY.MM.DD-N`. Git tags use a `v` prefix (for example `v2026.04.07-01`).

- `YYYY.MM.DD` is the date in **Pacific Time** (`America/Los_Angeles`).
- `N` is an incrementing build number for that day (starting at 1).

## Source of truth

- **Release versions** come from **git tags**, not from `package.json`. The root `package.json` field `"version"` is set to `0.0.0` as a sentinel to show it is not maintained for releases.
- To print the version for the current commit (tag at `HEAD`, or short SHA plus optional dirty suffix):

  ```sh
  ./scripts/print-app-version.sh
  ```

  Or:

  ```sh
  pnpm print-app-version
  ```

## Automation

A push to `main` (including when a PR is merged) runs [`.github/workflows/main-push.yml`](../../.github/workflows/main-push.yml), which:

1. Runs `./scripts/tag-next-version.sh` to create and push the next `vYYYY.MM.DD-N` tag.
2. Creates a **GitHub Release** for that tag (auto-generated release notes).

## Manual tagging

On `main`, with a clean working tree and no version tag yet on `HEAD`:

```sh
./scripts/tag-next-version.sh
```

## Reference implementation

The same scheme and scripts are used in the [skybridgeskills monorepo](https://github.com/skybridgeskills/skybridgeskills-monorepo) (`docs/versioning.md` there).
