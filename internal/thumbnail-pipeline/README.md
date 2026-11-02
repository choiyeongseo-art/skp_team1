# 채팅 전용 상품 썸네일 파이프라인

방문자용 업로드/관리 UI 없이 Codex 채팅에서 실행한다. 별도 pip/npm 의존성이나 API 키가 없다. 실제 생성은 채팅의 built-in image_gen이 수행한다. 이 스크립트는 이미지 생성 API를 호출하지 않는다.

## 작업 흐름
1. 상품 식별: 키, 상품명, 첨부 원본 경로를 확인한다. 동일 상품의 여러 사진은 한 작업에 넣고, 서로 다른 상품은 작업을 분리한다.
2. `python internal/thumbnail-pipeline/pipeline.py prepare --key <key> --name "상품명" --source "원본 경로"`
3. 출력된 job.json / prompt.txt를 읽고 원본을 view_image로 확인한다. imagegen 스킬을 적용하고 `image_gen`에 `referenced_image_paths`와 프롬프트를 전달한다. PNG, 불투명 배경으로 요청한다. 기존 니베아의 아이보리·앰버 배경, 제품 전체와 부드러운 그림자, 약 6~10도 기울임을 적용한다. 동일 키는 동일 구도 기본값을 사용한다. 고해상도 재생성은 원본에 없는 세부정보의 정확성을 보장하지 않으므로 라벨을 검사한다.
4. 결과 이미지를 확인한다. 로고·라벨·제품 형태 오류, 잘림이 있으면 생성 결과를 수정한다. 검사 전에는 --reviewed를 쓰지 않는다.
5. `python internal/thumbnail-pipeline/pipeline.py publish --job <job-id> --result "생성된 PNG 경로" --reviewed`
6. 기존 카드는 `deal-<id>` 키로 자동 연결된다. 니베아는 `nivea-repair-care`. 새 상품은 앱 데이터에 `thumbnailKey`를 지정한다. 상품명·가격·브랜드·URL 추가는 별도의 상품 데이터 작업이며 이미지만으로 추정하지 않는다.
7. 미리보기 새로고침 후 카드와 상세에서 확인한다. 생성 이미지용 회전이 이미 적용됐으므로 CSS로 다시 회전하지 않는다.

## 보관 및 복구
- style.json: 공유 스타일 프리셋과 생성 규칙.
- jobs/<id>/: 원본 경로와 프롬프트, 적용 상태. 원본 파일을 변경하지 않는다.
- manifest.json: 내부 적용 이력.
- busan-drop/assets/products/<key>/<hash>.png: 버전별 결과. 이전 결과를 덮어쓰지 않는다.
- busan-drop/thumbnail-assets.js: 공개용 키·이미지 URL·대체 텍스트만 포함. 경로·프롬프트는 내보내지 않는다.
- `python internal/thumbnail-pipeline/pipeline.py list`
- `python internal/thumbnail-pipeline/pipeline.py rollback --key <key>`: 이전 버전으로 되돌리기.

PNG 서명·청크 CRC·완결 여부·파일 크기·정사각 비율·1024~4096px 해상도를 적용 전에 검사한다. 외형/텍스트 정확성은 시각 검사한다. 생성 실패·검증 실패는 공개 매핑에 영향을 주지 않는다.

실서비스 정적 배포 루트는 busan-drop/만 사용한다. internal/, AGENTS.md, tmp/는 배포하지 않는다. 로컬 개발 서버가 상위 폴더 전체를 제공하는 경우 내부 경로가 HTTP로 접근 가능하므로 외부 공개에 사용하지 않는다. 현재 기능은 채팅 요청 시 실행하는 작업 경로이며, 폴더 감시·무인 생성·사이트 자체의 AI 서비스는 아니다.
