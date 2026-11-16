# 행사 저장 저장소 (2026-11-16)

운영·로컬의 `/api/busandrop/event-saves`는 인증 Supabase 프로젝트를 사용한다.
계정 저장: `busan_account_events`, 비회원 저장: `busan_guest_event_saves`.
`busan_event_save_snapshot`은 비회원 목록과 전체 저장 집계를 한 번에 반환한다.
테이블과 함수는 서버의 service_role만 접근하며, 브라우저에 서버 키를 노출하지 않는다.
로그인 집계는 서버에서 세션을 검증해 현재 계정의 수를 제외하고, 클라이언트의 현재 계정 저장 상태를 한 번만 더한다.

환경: `BUSANDROP_AUTH_SUPABASE_URL`, `BUSANDROP_SAVES_SUPABASE_SECRET_KEY`.
마이그레이션: `supabase/migrations/20261116_event_saves.sql`.
30초 자동 조회는 제거했으며, 포커스 복귀 시 5분 이내에는 재조회하지 않는다.

## 기존 Blob 기록

Vercel Blob 저장소는 무료 작업 한도 초과로 중지되어 기존 파일을 읽을 수 없다.
원본 `busandrop/event-saves.json`은 삭제하지 않았으며 2026-12-13 재개 예정으로 표시됐다.
현재 계정 저장 데이터는 기존 Supabase 테이블에서 즉시 집계한다.
과거 Blob의 비회원 기록은 아직 이전되지 않았으므로 현재 집계에 포함되지 않는다.

원본 다운로드가 가능해지면 저장소 밖의 안전한 경로에 보관한 뒤 아래 명령으로 복구한다.

```
node --env-file=.env.local scripts/restore-legacy-event-saves.cjs /safe/path/event-saves.json
node --env-file=.env.local scripts/restore-legacy-event-saves.cjs /safe/path/event-saves.json --apply
```

기본은 검증만 수행한다. `--apply`는 비회원 쿠키의 해시와 저장 시각을 유지하며,
이미 Supabase에 있는 같은 방문자·행사는 덮어쓰지 않는다. 원본 파일은 Git에 넣지 않는다.
