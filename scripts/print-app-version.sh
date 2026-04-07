#!/usr/bin/env bash
set -euo pipefail

# Parse arguments
REQUIRE_TAG=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --require-tag)
            REQUIRE_TAG=true
            shift
            ;;
        *)
            echo "Error: Unknown argument $1"
            echo "Usage: $0 [--require-tag]"
            exit 1
            ;;
    esac
done

# Get the current commit hash
COMMIT=$(git rev-parse HEAD)

# Try to find a tag pointing at the current commit
# If multiple tags exist, use the version-sorted largest one
TAG=$(git tag --points-at "$COMMIT" | grep -E '^v[0-9]{4}\.[0-9]{2}\.[0-9]{2}-[0-9]+$' | sort -V | tail -n 1 || true)

if [ -n "$TAG" ]; then
    # Strip the 'v' prefix when outputting
    echo "${TAG#v}"
    exit 0
fi

# No tag found
if [ "$REQUIRE_TAG" = "true" ]; then
    echo
    echo "Error: The current commit is not tagged with a version." >&2
    echo

    exit 1
fi

# Use branch@sha as fallback
SHA=$(git rev-parse --short HEAD)
DIRTY=$(git status --porcelain | wc -l | tr -d ' ')
if [ "$DIRTY" -gt 0 ]; then
    # Get current time in Pacific timezone and format as HHMMSS
    TIMESTAMP="$(TZ="America/Los_Angeles" date +"%H%M%S")PT"
    DIRTY="-dirty-$TIMESTAMP"
fi
echo "$SHA$DIRTY"
