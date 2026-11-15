# BUSAN DROP content v2

Target project: `yinxfrdkxohyttmkuaxa` (BUSANDROP). Applied 2026-11-14 using authenticated Supabase SQL Editor.

- Migration: ../migrations/20261114_content_v2.sql. Run once on an empty content schema; do not rerun on the applied project.
- 12 additive tables, 10 display sections, 5 locale keys.
- Existing account, analytics, and ZEN WAY tourism data untouched.
- Current static event content has not been imported; app/UI read path has not been switched.
- Do not publish imported legacy payloads before redacting internal notes. No personal information belongs in these content tables.
- Archive events rather than deleting referenced parent records.

Validation: rollback-only disposable fixtures; 12/12 checks passed (unknown defaults, negative price, missing price evidence, reversed dates, unsupported locale, required Korean name, orphan product, draft visibility, published visibility, published branch visibility, client write denial, private evidence). Test fixtures were rolled back.
