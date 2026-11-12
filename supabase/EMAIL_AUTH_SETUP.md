# 앱·웹 공통 이메일 인증 연결

> 후속 요청으로 로그인 UI는 이메일·비밀번호 방식으로 전환했다. 현재 구현과 남은 관리자 설정은 [ACCOUNT_PASSWORD_AUTH.md](ACCOUNT_PASSWORD_AUTH.md)를 따른다. 아래 OTP/SMTP 계획은 보관 자료이며 구매·설정은 진행하지 않았다.

상태: 메일 템플릿 및 연결 절차 준비 완료. 2026-11-10 사용자 확인: 발송용 도메인과 메일 서비스 계정 없음. 운영 SMTP·메일 템플릿은 아직 적용하지 않았고 실제 메일 수신도 미검증이다.

## 공통 인증 구조

- 앱: iOS WKWebView가 운영 웹을 사용한다. 웹과 같은 전용 인증 프로젝트 `yinxfrdkxohyttmkuaxa`를 사용한다. 관광 데이터 프로젝트가 아니다.
- 앱·웹 모두 기존 `BUSAN_AUTH.sendCode(email)` → `signInWithOtp` → `verifyCode(email, code)` → `verifyOtp(type: 'email')` → 서버 `getUser` 검증 → 홈 이동 경로를 사용한다.
- 코드는 사용자가 로그인을 요청한 원래 화면에서 입력한다. 메일에는 로그인 링크를 제공하지 않는다. 앱의 이메일 OTP에 새로운 딥링크 설정은 필요하지 않다.
- 기존 Google·Apple 인증/웹 Site URL/등록된 웹 및 앱 callback 주소는 유지한다.
- SMTP 비밀번호는 Supabase 서버 설정에만 입력한다. 앱·웹 JS·Vercel 공개 환경변수에 넣지 않는다. 별도 메일 API나 자체 OTP 저장소는 만들지 않는다.

## 먼저 준비할 항목

1. 소유하고 DNS 레코드를 수정할 수 있는 발송용 도메인.
2. 메일 발송 서비스 계정. 기본 연결안은 Supabase 공식 연동 문서가 있는 Resend SMTP이다. 가입·도메인 구매·결제는 아직 진행하지 않았다.
3. Resend에 발송용 도메인 또는 서브도메인을 추가하고 화면에서 제공하는 SPF/DKIM 레코드를 DNS에 등록한 뒤 Verified 상태를 확인한다. 실제 DNS 값은 서비스에서 발급된 값만 사용한다. DMARC는 현재 도메인 정책을 확인한 뒤 적용한다.
4. 검증한 도메인의 발신 주소를 정한다. 예시 `no-reply@auth.<소유한 도메인>`은 자리표시자이며 실제 주소가 아니다. 발신 이름은 `BUSAN DROP`.

발송용 도메인은 이메일 인증에 필요한 것이며 운영 웹 주소는 당장 `busandrop.vercel.app`을 유지할 수 있다. 앱과 웹에 각각 도메인이나 SMTP 계정을 만들 필요는 없다.

## Supabase SMTP 설정

전용 인증 프로젝트 → Authentication → Email(Notifications) → SMTP Settings에서 Custom SMTP를 설정한다. 대시보드 UI 명칭은 변경될 수 있다.

| 항목 | Resend 연결값 |
|---|---|
| Sender name | BUSAN DROP |
| Sender email | 실제 검증된 발신 도메인 주소 |
| Host | smtp.resend.com |
| Port | 465 |
| Username | resend |
| Password | 발송용 Resend API 키를 대시보드에서 직접 입력 |

저장 전 Sender가 검증된 도메인인지 확인한다. API 키·SMTP 비밀번호를 채팅으로 전달할 필요는 없다.

## 메일 템플릿 적용

Authentication → Email Templates에서 아래 두 항목을 **각각** 확인한다. 새 이메일 가입과 기존 계정의 재로그인 모두 코드 입력 화면과 일치해야 한다.

- Confirm signup: 제목은 `email-templates/login-code.subject.txt`, 본문은 `email-templates/login-code.html`.
- Magic Link: 같은 제목·본문을 사용한다. `signInWithOtp`의 기본 링크 메일 대신 `{{ .Token }}`를 보여준다.

원본 HTML의 `{{ .Token }}`를 그대로 붙여넣는다. 데모 미리보기 숫자를 실제 템플릿에 넣지 않는다. 실제 발송 후 두 경로에서 코드가 나오는지 따로 검증한다. 비밀번호 재설정·초대·이메일 변경 템플릿은 이번 범위에서 바꾸지 않는다.

메일은 외부 이미지·자바스크립트·추적 링크 없이 노란색/검은색 워드마크와 인증코드를 표시한다. 한국어·영어 안내를 함께 제공한다. 인증코드는 제목이나 미리보기 문구에 넣지 않는다. 만료 시간을 하드코딩하지 않아 실제 서버 설정과 다른 시간을 안내하지 않는다.

## 인증 설정 확인

- Email provider 활성화.
- 앱 입력폼은 현재 6~10자리 숫자를 허용한다. 서버 OTP 길이는 6자리로 맞추는 안을 사용한다.
- OTP 만료/발송 간격은 현재 서버 값을 먼저 기록한다. 초기 제안은 만료 600초/재요청 최소 60초이며 아직 운영에 적용하지 않았다. OTP 만료 변경은 다른 이메일 인증 링크에도 영향을 줄 수 있다.
- 발송량 제한은 서비스 요금제와 Supabase 실제 설정을 확인해서 정한다. 한도를 임의로 크게 늘리지 않는다.
- Supabase 기본 발송은 일반 사용자 대상 운영 SMTP의 대체로 간주하지 않는다.

## 실제 수신 검증 — 앱·웹 각각

| 시나리오 | 통과 기준 |
|---|---|
| 신규 이메일 | 요청 성공, 메일에 숫자 코드, 올바른 코드로 홈 이동 |
| 기존 이메일 재로그인 | 동일한 코드 화면, 인증 후 홈 이동 |
| 잘못된 코드 | 로그인되지 않고 오류 표시 |
| 만료된 코드 | 로그인되지 않으며 새 코드 요청 가능 |
| 이미 사용한 코드 | 재사용으로 새 세션을 만들지 못함 |
| 재요청 | 발송 제한 준수, 최신 메일의 코드로 검증 |
| 앱 재실행/웹 새로고침 | 서버 검증된 로그인 상태 유지 |
| 계정 데이터 | 같은 계정의 행사·플랜 복원, 로그아웃 후 계정 정보 분리 |

실제 코드와 수신자 주소는 검증 기록에 남기지 않고 각 시나리오의 통과/실패와 수신 지연만 기록한다. 이메일을 여는 앱을 바꿔도 코드는 최초 요청한 앱/웹 화면에 입력한다.

## 현재 자동 검증과 미완료 항목

기존 테스트에서 OTP 요청, 서버 사용자 검증 후 로그인, 이메일 인증 성공 시 홈 이동 및 로그인 실패 처리를 모의 SDK로 검증했다. 템플릿은 실제 수신함에서의 렌더링·도착률·스팸 분류를 검증한 것이 아니다. 도메인/DNS, 서비스 가입, SMTP 저장, 두 템플릿 적용, 실제 앱·웹 수신 검증이 남아 있다.

## 공식 근거 (2026-11-10 확인)

- [Supabase Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp): 기본 발송 제한, 사용자 지정 SMTP 필요 조건.
- [Supabase Email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless): signInWithOtp, Token 템플릿, verifyOtp, 만료 설정 영향.
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates): Token 변수 및 OTP 코드 사용.
- [Resend Supabase SMTP](https://resend.com/docs/send-with-supabase-smtp): 검증 도메인/API 키 필요, SMTP 필드.
- [Resend Verified Domains](https://resend.com/docs/dashboard/domains/introduction): 소유 도메인과 DNS 검증.
