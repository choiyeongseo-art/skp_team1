# BUSAN DROP 등록 행사 전수 검수
기준일: 2026-11-14 (Asia/Seoul)
로컬 등록 데이터 구조·누락 검수. 공식 사이트 최신 사실 재확인/운영 DB 조회 아님.

등록 20개 / 종료 제외 13개 / 지점 연결 33개 / 종료 제외 24개. 상세 데이터 19개. 카테고리 중복 집계 허용.
|행사|카테고리|상태|지점|문제·재입력 기준|
|---|---|---|---:|---|
|올리브영|뷰티|종료/예약 마감|3|기본 5항목 미입력: fee, foreign, payment, taxFree, passport / 온라인 혜택을 지점에 일괄 적용 금지. 3개 지점의 참여 확인·박스·쿠폰 조건 분리.|
|유니클로|패션|일정 미확정|9|기본 5항목 미입력: fee, foreign, payment, taxFree / 제보 날짜를 방문 기간으로 사용 금지. 9개 지점의 영업시간·결제·면세 조건 개별 유지.|
|자라|패션|일정 미확정|3|기본 5항목 미입력: fee, foreign, payment, taxFree, passport / 할인 일정·할인율 미확정. 3개 지점 등록이 행사 참여 확정을 의미하지 않음.|
|몬치치|팝업|진행/예약 중|1|기본 5항목 미입력: fee, foreign, payment, taxFree, passport / 카탈로그 confirmed와 상세의 2차 출처 표현 충돌 / 사은품·예약·등장 회차·상품 가격이 혼재. 2차 자료 가격/기간을 공식 확정으로 승격 금지. 지난 휴점 강조 해제.|
|와키윌리|팝업|종료/예약 마감|1|기본 5항목 미입력: fee, foreign, payment, taxFree, passport / 종료 행사 보관. 상품별 정상가/할인가·할인 제외·구매 제한 구조화.|
|참치학교|팝업·푸드|진행/예약 중|1|기본 5항목 미입력: fee, foreign, payment, taxFree, passport / 팝업+푸드 교차 분류. 메뉴/중량/인분과 해체쇼 회차·식사/포장·알레르기 확인 항목 분리.|
|티파니앤코|패션|일정 미확정|1|상세 데이터 없음 / 상세 전체 확인일 없음 / 기본 5항목 미입력: fee, foreign, payment, taxFree, passport / 카탈로그는 있으나 상세 행사 데이터 없음. 일반 매장 안내와 실제 행사 구분.|
|원피스 무기와라 스토어|팝업|진행/예약 중|1|기본 5항목 미입력: fee, foreign, payment, taxFree, passport / 예약/현장 대기와 방문 특전/구매 특전을 분리. 참고 상품가·구매 제한 별도.|
|와이잭|팝업|진행/예약 중|1|기본 5항목 미입력: fee, foreign, payment, taxFree, passport / 상품별 할인과 구매액별 추가 할인 분리. 제외 품목·중복 적용 확인.|
|젤라또 피케|팝업|종료/예약 마감|1|기본 5항목 미입력: fee, foreign, payment, taxFree, passport / 종료 행사 보관. 모바일상품권·사은품·채널 추가·가챠의 조건을 각각 입력.|
|리락쿠마·스미코구라시|팝업|진행/예약 중|1|기본 5항목 미입력: fee, foreign, payment, taxFree, passport / 2027년 종료일 유지. 상품가·조건부 구매 특전·신상품 공지 구분.|
|메이플스토리|팝업|진행/예약 중|1|기본 5항목 미입력: foreign, payment, taxFree, passport / 파크 입장료와 유료 체험/굿즈 비용 분리. 공연·포토타임 회차와 이용 제한 분리.|
|시그니엘 부산|숙박|진행/예약 중|1|기본 5항목 미입력: foreign, payment, taxFree, passport / 상품별 예약 마감 혼재 1/4 / 4개 상품별 예약·투숙 기간·최저가 단위·인원·세금·포함/제외·취소 조건 분리. 마감 상품 개별 표시.|
|웨스틴 조선 부산|숙박|종료/예약 마감|1|기본 5항목 미입력: foreign, payment, taxFree, passport / 중복 섹션 제목 / 예약 마감 행사 보관. 숙박과 다이닝 오퍼 분리. 같은 제목의 섹션을 상품 ID로 구분.|
|그랜드 조선 부산|숙박|종료/예약 마감|1|기본 5항목 미입력: foreign, payment, taxFree, passport / 중복 섹션 제목 / 예약 마감 행사 보관. 객실/다이닝·제외일·포함 인원·추가 요금을 상품별로 관리.|
|해리포터 마호도코로|팝업|진행/예약 중|1|기본 5항목 미입력: fee, foreign, payment, taxFree, passport / 지점·층·행사 구역 확인. 현장 대기와 구매/방문 사은품을 구분. 온라인 상품과 현장 재고 혼동 금지.|
|히나쿠우|팝업|종료/예약 마감|1|기본 5항목 미입력: fee, foreign, taxFree, passport / 종료 행사 보관. 구매/후기 리워드·상품가·B1 실내 동선 분리. 결제 근거 재확인.|
|달달더마켓|로컬·디저트|종료/예약 마감|1|상세 전체 확인일 없음 / 기본 5항목 미입력: fee, foreign, payment, taxFree, passport / 종료 행사 보관. 부산 이벤트+디저트 교차 분류. 입점 브랜드와 실제 메뉴/가격·알레르기·보관 정보 구분.|
|광안리 M 드론×레이저쇼|로컬|예정|1|상세 전체 확인일 없음 / 하루 안의 여러 공연 회차·기상 취소·관람 구역·교통 통제·유료 좌석 여부를 항목별 확인.|
|G-STAR|로컬|예정|2|상세 전체 확인일 없음 / 기본 5항목 미입력: foreign, payment, taxFree, passport / 2개 전시장 연결 유지. BTC/BTB/G-CON 이용 범위·요금·예매 마감·현장 판매 불가·연령 조건 분리.|

## 지점별 검수
|지점 ID|행사|참여 확인 표기|개별 덮어쓰기|미입력 항목|
|---|---|---|---|---|
|oliveyoung-8|올리브영|confirmed-notice|phone, source, action, sections|fee, foreign, payment, taxFree, passport|
|oliveyoung-0|올리브영|unconfirmed||fee, foreign, payment, taxFree, passport|
|oliveyoung-30|올리브영|unconfirmed||fee, foreign, payment, taxFree, passport|
|uniqlo-4|유니클로|unconfirmed|hours, hoursNote, phone, source, action, transit, transitNote, payment|fee, foreign, taxFree|
|uniqlo-1|유니클로|unconfirmed|hours, hoursNote, phone, source, action, transit, transitNote|fee, foreign, payment, taxFree|
|uniqlo-5|유니클로|unconfirmed|hours, hoursNote, phone, source, action, transit, transitNote|fee, foreign, payment, taxFree|
|uniqlo-0|유니클로|unconfirmed|hours, hoursNote, phone, source, action, transit, transitNote|fee, foreign, payment, taxFree|
|uniqlo-6|유니클로|unconfirmed|hours, hoursNote, phone, source, action, transit, transitNote, taxFree, sections|fee, foreign, payment|
|uniqlo-7|유니클로|unconfirmed|hours, hoursNote, phone, source, action, transit, transitNote|fee, foreign, payment, taxFree|
|uniqlo-8|유니클로|unconfirmed|hours, hoursNote, phone, source, action, transit, transitNote|fee, foreign, payment, taxFree|
|uniqlo-2|유니클로|unconfirmed|hours, hoursNote, phone, source, action, transit, transitNote|fee, foreign, payment, taxFree|
|uniqlo-3|유니클로|unconfirmed|hours, hoursNote, phone, source, action, transit, transitNote|fee, foreign, payment, taxFree|
|zara-14970|자라|unconfirmed|hours, hoursNote, phone, source, action|fee, foreign, payment, taxFree, passport|
|zara-9302|자라|unconfirmed|hours, hoursNote, phone, source, action|fee, foreign, payment, taxFree, passport|
|zara-16694|자라|unknown||fee, foreign, payment, taxFree, passport|
|tiffany-centum|티파니앤코|unknown||fee, foreign, payment, taxFree, passport|
|monchhichi-centum|몬치치|unknown||fee, foreign, payment, taxFree, passport|
|wackywilly-busan-b1|와키윌리|confirmed-notice||fee, foreign, payment, taxFree, passport|
|tunaschool-gwangbok-b1|참치학교|confirmed-notice||fee, foreign, payment, taxFree, passport|
|mugiwara-popup-202611|원피스 무기와라 스토어|confirmed-notice||fee, foreign, payment, taxFree, passport|
|yjack-popup-202611|와이잭|confirmed-notice||fee, foreign, payment, taxFree, passport|
|gelatopique-popup-202611|젤라또 피케|confirmed-notice||fee, foreign, payment, taxFree, passport|
|sanx-popup-2026|리락쿠마·스미코구라시|confirmed-notice||fee, foreign, payment, taxFree, passport|
|maplestory-popup-2026|메이플스토리|confirmed-notice||foreign, payment, taxFree, passport|
|signiel-busan|시그니엘 부산|confirmed-notice||foreign, payment, taxFree, passport|
|westin-josun-busan|웨스틴 조선 부산|confirmed-notice||foreign, payment, taxFree, passport|
|grand-josun-busan|그랜드 조선 부산|confirmed-notice||foreign, payment, taxFree, passport|
|harrypotter-popup-2026|해리포터 마호도코로|confirmed-notice||fee, foreign, payment, taxFree, passport|
|hinakuu-popup-2026|히나쿠우|confirmed-notice||fee, foreign, taxFree, passport|
|daldal-market-gwangbok|달달더마켓|confirmed-notice||fee, foreign, payment, taxFree, passport|
|gwangalli-drone-beach|광안리 M 드론×레이저쇼|confirmed-notice|||
|gstar-bexco-hall1|G-STAR|confirmed-notice||foreign, payment, taxFree, passport|
|gstar-bexco-hall2|G-STAR|confirmed-notice||foreign, payment, taxFree, passport|

## 해석 주의
- confirmed/reported 등은 기존 코드의 상태값이며 이번에 공식 확인했다는 뜻이 아니다.
- 위치 등록, 행사 참여, 외국인 예약 가능 여부는 서로 다른 사실이다.
- 식품·숙박·결제 정보는 카테고리/브랜드 이름만으로 추정하지 않는다.
- 원본 스냅샷은 audit.json의 legacySnapshot에 보관한다. 기존 행사 내용을 자동 승격·이관하지 않는다.
