# BUSAN DROP — 디자이너 협업

현재 운영 화면: https://busandrop.vercel.app/busandrop/home

## 디자이너 실행

Node.js 24 LTS를 설치한 뒤 저장소 최상위에서 실행합니다.

```sh
git pull --ff-only
npm ci
npm run dev
```

http://127.0.0.1:4187/busandrop/home 을 엽니다. 방문자가 보는 HTML/CSS/JavaScript·폰트·이미지는 `busan-drop/`에 있습니다. 별도 UI 변환이나 빌드 없이 현재 배포 화면을 그대로 제공합니다.

**Python 정적 서버 대신 위 Node 서버를 사용하세요.** 현재 웹은 `/busandrop/home`, `/busandrop/login` 경로 및 행사 저장 API를 사용합니다. Node 서버가 경로와 저장 기능을 함께 제공합니다.

## 디자이너 수정 → 전달

1. `busan-drop/`의 HTML/CSS/JavaScript·이미지를 수정합니다.
2. 로컬 화면을 확인하고 `npm test`를 실행합니다.
3. 변경 파일을 Git 커밋·push합니다. 저장소 변경은 Vercel에 자동 배포되지 않습니다.
4. 개발자는 `git pull --ff-only`로 받아 검토하고 수동 배포합니다.

초기 전달본 일치 검증: `npm run verify:handoff`. 이 명령은 현재 파일을 2026-11-06 운영 배포본의 SHA-256과 비교합니다. 디자인 수정 후에는 달라진 파일이 표시되는 것이 정상입니다. 일반 기능 테스트는 `npm test`입니다.

## 개발자 수동 배포

```sh
git pull --ff-only
npm ci
npm test
npm run build
vercel link --yes --project busandrop --scope manoken2
vercel deploy --prod --scope manoken2
```

Vercel 연결은 개발자 계정에서 한 번만 하면 됩니다. 디자이너에게 배포 자격증명은 필요하지 않습니다. `vercel.json`과 `api/`는 기존 `busandrop` 프로젝트의 비공개 Blob 저장 API에 맞춰져 있습니다.

## 파일 안내

- `busan-drop/`: 화면·스타일·브라우저 로직·행사 데이터·로컬 이미지/폰트
- `server.js`, `lib/event-saves.js`: 디자이너용 로컬 실행·저장 API
- `api/event-saves.js`, `lib/saves-handler.cjs`: 운영 Vercel 저장 API
- `scripts/build.cjs`, `vercel.json`: 정적 파일 복사·운영 경로 설정
- `tests/current/`: 현재 행사·지도·기간·저장 동작 테스트
- `internal/releases/20261106-production.json`: 초기 전달본 파일 해시
- `HANDOFF.md`: 이전 작업 기록(현재 실행 방법은 이 README 우선)

화면 파일은 현재 운영 배포본과 같습니다. 로컬 저장 기록·브라우저 여행 설정은 도메인별로 독립적이며 운영 사용자의 기록을 Git에 넣지 않습니다. 지도 설정 1개는 Git에 토큰을 넣지 않고 기존 운영 사이트에서 자동으로 읽습니다. 로컬 서버와 수동 배포 빌드가 동일한 설정을 제공하므로 별도 키 입력이 필요하지 않습니다. 나머지 79개 화면 파일은 원본 그대로입니다. 지도 타일과 설정을 불러오려면 네트워크 연결이 필요합니다. 로그인은 기존 체험 화면이며 실제 회원 인증 서버가 아닙니다.
