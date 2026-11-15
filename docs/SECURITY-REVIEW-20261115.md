# GitHub 공개 파일·비밀키 점검 — 2026-11-15

대상: `choiyeongseo-art/skp_team1`, 공개 저장소, 기본 브랜치 `main`.

## 점검 범위와 결과

- 푸시 전 원격과 로컬 HEAD가 동일함을 fetch 후 확인했다.
- 기존 도달 가능한 Git 이력 28개 커밋의 UTF-8 텍스트 blob 379개와 현재 추적/추가 대상 텍스트 파일을 검사했다.
- 로컬 환경변수의 실제 키·토큰 값과 정확히 일치하는 문자열, 비밀키 형식, 비밀번호가 포함된 DB 연결 URL, JWT role 값을 검사했다. 실제 값은 보고서에 기록하지 않았다.
- 위 검사에서 비밀키 발견: **0건**. 커밋 이력의 환경설정 파일명은 `.env.example`만 확인됐다.
- `.env.local`, 로컬 지도 설정 `busan-drop/integration/mapbox-config.js`, `.vercel`, `node_modules`, 생성물 `public`은 Git 제외 대상이다.
- `.env.example`은 실제 값이 비어 있는 템플릿이다.

## 공개되어 있는 관련 문서

|파일/경로|내용|실제 비밀키|
|---|---|---|
|`.env.example`|인증·관광·KTO·Blob 환경변수 이름|없음|
|`docs/AUTH-SETUP.md`|인증 설정, 공개키 사용 방법, 콜백 주소|없음|
|`supabase/*.md`|계정·인증·분석·보관 정책 문서|없음|
|`supabase/migrations/*.sql`|테이블·함수·RLS 등 DB 스키마|없음|
|`supabase/content/verification-20261114.json`|DB 검증 결과와 프로젝트 식별자|없음|
|`lib/supabase-nearby.cjs`|서버 환경변수로 관광 데이터 조회|없음|
|`lib/auth-config.cjs`|공개 인증 URL/공개키 반환 및 서버 비밀키 거부|없음|

Supabase URL/프로젝트 식별자, 공개용 publishable/anon 키, Mapbox 공개 토큰은 비밀 서비스 역할 키와 구분한다. 공개 설정의 보안은 RLS 및 허용 도메인 등 별도의 접근 제어에 의존한다. 이번 검사에서는 운영 DB 권한이나 키 유효성·제한 설정을 변경/전수 검증하지 않았다.

## 한계

Git에서 접근 가능한 파일·이력과 푸시 대상 파일에 대한 문자열/형식 검사다. GitHub 이슈·댓글·릴리스 첨부·외부 CI 로그·접근 불가능한 삭제 이력은 검사 범위에 포함되지 않는다. 암호화·분할·임의 인코딩된 값까지 부재를 보장하는 전면 보안 감사는 아니다. 실제 비밀 값이 GitHub에 포함되는 경우 새 커밋에서 삭제하는 것만으로 과거 이력은 사라지지 않으며 키 폐기/교체가 필요하다.
