#!/usr/bin/env python3
"""Moved to tools/seo_package.mjs (Node port: repo-root confined, guarded).

The python original carried path-traversal findings (every write-open in it
is flagged by the Mimosa gate regardless of confinement pattern) and its
embedded sitemap predates the privacy/terms entries. The Node port is the
maintained version; this shim keeps the historical entry point discoverable.
Run: node tools/seo_package.mjs
"""
print('seo_package moved to tools/seo_package.mjs; run: node tools/seo_package.mjs')
