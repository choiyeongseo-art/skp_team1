# 회원탈퇴 — 2026-11-10

## 적용

- 인증 프로젝트: yinxfrdkxohyttmkuaxa. 관광 DB와 분리.
- `20261110_account_deletion.sql`을 사용자 승인 후 SQL Editor에서 적용, Success 확인.
- 마이페이지 → 회원탈퇴 → 삭제 범위 확인 → 체크박스 동의 → 탈퇴하기.
- 로그인 JWT의 auth.uid()만 대상으로 사용하는 인자 없는 대상 선택. confirmation은 고정 문구만 허용.
- public/anon은 실행 불가. authenticated만 실행. 사용자 입력 user_id나 service-role 키는 클라이언트에 사용하지 않음.
- auth.users 삭제 및 FK CASCADE로 identity/session/계정 좋아요/플랜/언어 설정 삭제.
- 해당 user_id에 연결된 analytics_events/drop_plan_drafts도 같은 트랜잭션에서 삭제. 비회원 기록 및 비회원 통계는 별도.
- 성공 응답 이후 현재 기기의 계정 캐시·플랜 초안·인증 저장소·대기 중 계정 통계를 정리하고 로그인 화면으로 이동.
- 실패하면 로그인과 계정 캐시를 유지하며 재시도 안내. UI 실행 중 중복·취소 방지, Escape/Tab 포커스 처리.
- 다른 기기에 물리적으로 남은 브라우저 캐시는 원격으로 지울 수 없음. 서버 계정 확인 실패 후 계정 자료에 접근하지 않음.

## 검증

- 전체 Node 테스트 215개 통과 (회원탈퇴 Auth 검사 4개 추가).
- 일회용 아이디 계정 2개 생성 → 계정별 3종 데이터 저장 → 익명/확인 문구 오류/대상 ID 추가 거부 → 본인 삭제 → 3종 연쇄 삭제 → 다른 계정 데이터 보존 → Auth 조회/재로그인/만료 전 JWT 재삽입 거부: 19개 통과.
- 일회용 계정 2개 정리 완료. 기존 실제 사용자 계정은 삭제하지 않음.
- 브라우저 fixture에서 동의 전 버튼 비활성·확인 후 실행·실패 안내 및 로그인 메뉴 유지 확인. 실제 회원의 계정을 UI로 삭제하는 검사는 하지 않음.
- 로그: /private/tmp/busandrop-delete-tests-full.log, /private/tmp/busandrop-delete-smoke.log.

## Apple 로그인 — 출시 전 남은 작업

현재 Apple OAuth 토큰을 서버에 보관하거나 revoke하는 기능은 없음. Supabase 계정을 삭제하는 것만으로 Apple의 연결 권한이 자동 해제되지는 않는다. 삭제 완료 화면에 Apple 계정 설정에서 연결을 해제할 수 있다는 안내를 제공하나, 이것을 Apple 토큰 자동 폐기 구현이나 심사 요건 완료로 표현하지 않는다.

후속: Apple OAuth refresh/access token을 안전하게 확보·서버 보관하고 사용자 소유를 검증한 revoke 엔드포인트를 구현. 기존 계정에 토큰이 없으면 재인증/Apple 지침에 따른 처리를 설계. Apple client secret/private key는 브라우저나 저장소에 넣지 않음.

근거:
- https://developer.apple.com/help/app-review/guideline-reference/5-1-1-account-deletion
- https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple
- https://supabase.com/docs/guides/auth/managing-user-data

## 운영 배포

- Vercel deployment: https://busandrop-i71o16h16-manoken2.vercel.app / READY.
- 운영 alias: https://busandrop.vercel.app.
- 운영 account-deletion.js/auth-client.js/my-library.js 응답과 빌드 파일 바이트 일치 확인.
- iOS는 동일 운영 웹을 로드하므로 재설치 없이 앱 종료·재실행으로 반영. 신규 네이티브 빌드는 생성하지 않음.


## Apple 연결 해제 구현 — 2026-11-10

- Apple Developer UI에서 Key ID 5P9WJX6X8Q / BUSAN DROP Sigh In / 생성 2026-11-08 / Team H3G2F2N2M4 확인.
- Supabase Apple Client ID: com.busandrop.web. 기존 OAuth 설정은 변경하지 않음.
- 로컬 키 경로: /Users/manok2ne/Desktop/MANOK/AuthKey_5P9WJX6X8Q.p8. 키는 코드·문서·Git에 복사하지 않음.
- 새 서버 API: POST /api/busandrop/apple-account-delete. Supabase getUser로 현재 사용자 확인 → Apple refresh token 검증 → Apple JWKS로 ID token 서명/issuer/audience/subject/expiry 검증 → revoke → 본인 삭제 SQL RPC.
- Apple 키로 5분짜리 ES256 client secret을 서버에서 생성. 서비스 role 불필요. 요청·토큰·Apple 응답 원문을 로그로 남기지 않음.
- Apple 토큰 누락/실패 시 계정은 남기고 Apple 재인증 안내. 재인증 후 같은 Supabase 사용자 ID인 경우만 탈퇴 확인창 재표시, 자동 삭제하지 않음.
- Apple revoke 후 DB 실패 시 같은 사용자·Apple subject에 묶인 HMAC 재시도 증명(24시간)을 클라이언트 메모리에만 보관. 재시도에도 서버 getUser 검증 필수.
- 실제 운영 키 등록은 자동 승인 검토에서 'Vercel로 개인키 전송·저장 구체적 승인 없음'으로 거절됨. 사용자의 Vercel Secret 등록 승인 응답 대기. 우회 전송하지 않음.
- 운영 서버 설정/배포/실제 Apple 사용자 탈퇴 검증은 아직 미완료. 기존 운영은 일반 계정 삭제+Apple 수동 안내 버전.
- 추가 서버 테스트 8개: 정상 순서, 익명/타출처/대상 지정 거부, 타인 토큰·위조/만료 JWT 거부, Apple 실패 시 삭제 방지, DB 실패 후 재시도. 클라이언트 테스트 2개 추가. 최신 전체 테스트는 아래 별도 결과 참조.


### 후속 승인·검증 결과

- 사용자가 Vercel manoken2/busandrop 운영 프로젝트로 해당 키 전송·Secret 저장을 구체적으로 승인함. 최초 전송 거절 후 승인 전까지 전송하지 않았음.
- 서버 전용 Production Secret 4개 등록 완료: BUSANDROP_APPLE_PRIVATE_KEY / KEY_ID / TEAM_ID / CLIENT_ID. 값은 로그 출력 안 함.
- Apple token endpoint에 실제 사용자가 아닌 의도적으로 잘못된 refresh token과 해당 client secret으로 검증: HTTP400 invalid_grant. invalid_client가 아닌 테스트 grant 거부 응답 확인. 실제 사용자 권한 폐기는 실행하지 않음.
- 전체 테스트 225개 통과. 서버 JWT 위조/타인 subject/audience/만료 거부 및 revoke 실패 시 계정 보존 포함.
- UI fixture에서 Apple로 다시 확인 버튼과 실패 시 계정 유지 확인. 재로그인 후 자동 탈퇴 없음, 다시 동의·확정 필요.
- 실제 Apple 계정의 end-to-end 탈퇴는 미검증이며 사용자 소유 계정으로 별도 확인 필요.

### 운영 배포 확인

- 배포 https://busandrop-145qkl1hf-manoken2.vercel.app / READY, https://busandrop.vercel.app 반영.
- 운영 account-deletion.js 및 auth-client.js 바이트 일치.
- 운영 POST API 비로그인 요청 401 auth/required (서버 Secret 인식, 삭제 수행 안 함).
- 공개 auth-config에 Apple private key/설정 비노출 확인.
