# BUSAN DROP

실행·구조·현재 기능·제한·배포 방법은 상위 `HANDOFF.md`를 참고하세요.

단독 앱 폴더에서 실행:

```powershell
python -m http.server 4187 --bind 127.0.0.1
```

http://127.0.0.1:4187/ 접속. HTML/CSS/JavaScript와 로컬 자산만 사용하며 npm 설치는 필요하지 않습니다.

내부 썸네일 작업은 상위 `internal/thumbnail-pipeline/README.md`를 따릅니다. 배포에는 이 `busan-drop/` 폴더만 사용하세요.
