#!/usr/bin/env python3
"""Moved to tools/site_edits.mjs (Node port: repo-root confined, idempotent).

The python original carried path-traversal findings (every write-open in it
is flagged by the Mimosa gate regardless of confinement pattern). The Node
port is the maintained version; this shim keeps the historical entry point
discoverable.
Run: node tools/site_edits.mjs
"""
print('site_edits moved to tools/site_edits.mjs; run: node tools/site_edits.mjs')
