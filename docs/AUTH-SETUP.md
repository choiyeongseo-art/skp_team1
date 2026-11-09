# BUSAN DROP 전용 인증 설정

코드는 Supabase JS 2.115.0의 PKCE OAuth와 이메일 OTP를 사용한다. ZEN WAY 프로젝트·관광 데이터용 service_role 키와 분리한다. 실제 인증은 전용 프로젝트와 각 제공자 설정을 연결한 후 검증해야 한다.

## 1. 공개 연결 정보

이 저장소 최상위 `.env.local`과 Vercel 배포 환경 변수에 다음을 설정한다. 이 파일을 커밋하지 않는다.

```dotenv
BUSANDROP_AUTH_SUPABASE_URL=https://PROJECT_REF.supabase.co
BUSANDROP_AUTH_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
BUSANDROP_AUTH_GOOGLE_ENABLED=true
BUSANDROP_AUTH_APPLE_ENABLED=true
BUSANDROP_AUTH_EMAIL_ENABLED=true
```

`/api/busandrop/auth-config`는 위 URL과 공개 키·활성화 플래그만 반환한다. Secret/service_role 키는 거부한다. `TOURISM_*` 변수는 인증에 사용하지 않는다. 플래그는 해당 제공자의 Supabase 콘솔 설정을 대신하지 않는다.

## 2. Supabase URL Configuration

- 운영 앱 주소: `https://busandrop.vercel.app`. 운영 복귀 URL은 `https://busandrop.vercel.app/busandrop/auth/callback`이다.
- 로컬 디자이너 실행은 `http://127.0.0.1:4187`, 운영 레이아웃 미리보기는 `http://127.0.0.1:4188`이다. 담당자가 사용할 출처의 `/busandrop/auth/callback`을 Supabase Redirect URLs에 등록했는지 확인한다. localhost를 쓰면 localhost 주소도 별도로 확인한다.
- 현재 원격 허용 URL 설정이 모든 로컬 포트를 포함한다고 가정하지 않는다. 로컬 작업 때문에 운영 Site URL을 임의로 덮어쓰지 않는다.
- 회원 생성에 사용할 이메일 로그인과 신규 가입 설정을 확인한다.

## 3. Google

Google Cloud Console에서 웹 애플리케이션 OAuth 클라이언트와 동의 화면을 설정한다. Authorized redirect URI는 앱 주소가 아니라 **`https://PROJECT_REF.supabase.co/auth/v1/callback`**이다. 테스트 모드이면 테스트 사용자도 등록한다.

Supabase Authentication의 Google 제공자에 Client ID/Secret을 입력해 활성화한다. Secret은 Supabase 콘솔에만 입력하며 프런트엔드·채팅·저장소에 넣지 않는다. 앱은 `prompt=select_account`로 인증을 시작하고 `/busandrop/auth/callback`으로 복귀한다.

## 4. Apple

Apple Developer에서 Sign in with Apple을 설정한 App ID 및 웹용 Services ID를 준비한다. 웹 도메인·Return URL에는 전용 Supabase 프로젝트의 주소와 `https://PROJECT_REF.supabase.co/auth/v1/callback`을 등록한다. Supabase Apple 제공자에 Services ID와 공식 절차로 생성한 Secret을 설정한다. 키·Secret은 콘솔에서 관리하며 만료·갱신도 확인한다.

## 5. 이메일 인증코드

Supabase Email 제공자를 활성화한다. 이메일 OTP 화면은 `signInWithOtp` → `verifyOtp(type: 'email')`로 동작한다.

메일이 링크만 보여주면 입력할 코드가 없으므로, 신규 가입/로그인에 실제 적용되는 이메일 템플릿에 `{{ .Token }}` 인증코드를 포함한다. 예:

```html
<p>BUSAN DROP 로그인 인증코드</p>
<p>{{ .Token }}</p>
<p>요청하지 않았다면 이 메일을 무시해주세요.</p>
```

코드를 직접 입력하는 방식을 사용하며, 발송 후 재요청 대기 시간은 UI 기준 60초다. 서버의 발송·검증 제한도 별도로 적용된다. 기본 메일 서비스의 수신자·발송 제한을 확인하고 실제 이용자 대상 서비스 전에는 Custom SMTP를 설정한다.

## 6. 수동 검증

- Google/Apple 각각 제공자 화면 → 동의 → 앱 복귀 → 로그인 표시.
- 취소/거부/실패/잘못된 callback에서는 로그인 상태가 되지 않는지 확인.
- 이메일 신규·기존 사용자 코드 발송 → 검증, 오입력·만료·재요청 확인.
- 새로고침 시 세션 복원, 로그아웃 후 재진입, 만료·갱신 확인.
- callback URL의 code/error 파라미터가 처리 후 제거되는지 확인.
- 로그인하면 좋아요 행사·완성한 플랜·방문 상태·마지막 언어를 전용 프로젝트에 계정별 저장한다. `supabase/ACCOUNT_PERSISTENCE.md`의 복원·격리·오프라인 재시도 항목을 확인한다.
- Google/Apple 제공자 플래그가 true인 것과 실제 인증 성공은 다르다. 실제 메일 발송·OTP 입력, Apple 로그인은 별도 실기기 검증이 필요하다.

## 공식 문서

- https://supabase.com/docs/guides/auth/social-sign-in/auth-google
- https://supabase.com/docs/guides/auth/social-sign-in/auth-apple
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/auth/auth-smtp
