# 행사 리서치·입력 작업 지시

행사 ID: monchhichi-research-v3
지점 ID: monchhichi-centum
카테고리: 팝업

1. contract.json의 10단계와 각 필드 순서로 조사한다. 행사와 지점, 상품과 입장료를 구분한다.
2. 공식 원문을 실제로 열고 항목별 URL·출처 종류·확인일을 기록한다. 검색 요약/2차 자료만으로 confirmed를 부여하지 않는다.
3. 확인하지 못한 사실은 status=unknown,value=null로 남긴다. 추측한 무료·예약 불필요·외국인 이용 가능·결제 가능을 넣지 않는다.
4. 날짜별 복수 회차, 상품별 예약/이용 기간, 단위·통화·포함/제외·세금·취소 조건을 분리한다.
5. 음식 알레르기·식이 정보는 출처가 있는 사실만 기록한다. 미확인을 안전/가능으로 바꾸지 않는다.
6. i18n 값은 ko/en/ja/zh-CN/zh-TW를 사용한다. 번역이 없으면 키를 생략한다.
7. 배열 행의 구조는 contract.rows를 따른다. 행도 {status,value,sources} 구조이며 미확인 행 멤버는 null로 둔다.
8. 보조 카테고리를 추가하면 해당 category_profiles의 확장 필드도 category_details에 추가한다.
9. validate → validate --ready → ingest 순서로 검토용 초안을 생성한다. DB 등록과 팝업 반영은 별도 연결 작업이다.

## 10. 행사 소개 — 어떤 행사인가?
- name: 행사명 (i18n)
- summary: 한 줄 소개 (i18n)
- image: 대표 이미지·출처·이용 조건 (object)
- event_type: 진행 형태: popup/sale/experience/exhibition/festival/stay/other (text)
- audience: 참여 대상 (text)

## 20. 방문 요약 — 내 여행 날짜에 갈 수 있나?
- period: 실제 방문 기간 (range)
- venue_summary: 지점·층 요약 (i18n)
- hours_summary: 운영시간 요약·백화점/행사 기준 구분 (i18n)
- admission: 입장료 상태: free/paid/mixed/unknown/not_applicable (text)
- booking: 예약 방식: required/optional/priority/not_required/unknown/not_applicable (text)
- foreign_booking: 외국인 예약 가능 여부: available/unavailable/conditional/unknown/not_applicable (text)

## 30. 방문 전 꼭 확인 — 헛걸음할 조건이 있나?
- restrictions: 입장 제한·예약 필수·휴점 경고 (rows:alerts)
- requirements: 한국 번호·본인인증·여권·앱·쿠폰 필요 조건 (object)

## 40. 날짜·입장·예약 — 어떻게 입장하나?
- opening_hours: 요일별 운영시간·마지막 입장·접수 마감 (rows:hours)
- exceptions: 휴점·특별 영업 (rows:exceptions)
- prices: 입장료·연령·통화·별도 비용 (rows:prices)
- booking_period: 예약 접수 기간 (range)
- booking_url: 공식 예약 URL (url)
- walk_in: 현장 입장·대기 조건 (i18n)
- alternative_booking: 한국 번호/인증 불가 시 공식 대안 (i18n)

## 50. 행사 내용·프로그램 — 가면 무엇을 경험하나?
- description: 행사 내용 (i18n)
- sessions: 특별 프로그램·날짜별 복수 회차 (rows:sessions)

## 60. 상품·메뉴·패키지 가격 — 무엇을 얼마에 이용하나?
- items: 상품·메뉴·옵션·구매 제한·재고 (rows:items)
- offers: 패키지별 예약·이용 기간·가격·인원·포함/제외 (rows:offers)

## 70. 혜택·적용 조건 — 어떤 조건에서 혜택을 받나?
- offers: 구매 기준 → 혜택 → 수량·소진·중복·채널·기간 (rows:benefits)

## 80. 해외 방문객 안내 — 입장·결제·준비가 가능한가?
- eligibility: 외국인 방문·예약 조건 (i18n)
- payments: 해외 카드·현금·간편결제 각각 (rows:payments)
- tax_refund: 환급 가능 여부·조건 (i18n)
- passport: 여권 필요 목적·준비물 (i18n)

## 90. 장소·교통 — 어떻게 찾아가나?
- name: 실제 지점명 (i18n)
- address_ko: 한국어 주소·복사용 (text)
- indoor: 건물·층·구역 (i18n)
- coordinates: 좌표·건물/입구 기준·정확도 안내 (coordinates)
- transit: 역·출구·도보 안내 (i18n)
- accessibility: 휠체어·유아 동반 등 확인 정보 (i18n)

## 100. 기타 안내·문의·출처 — 무엇을 언제 확인한 정보인가?
- notices: 취소·환불·기타 주의사항 (i18n)
- contact: 문의처 (text)
- official_url: 공식 행사 안내 URL (url)
- limitations: 이번 리서치 확인 범위·미해결 사항 (i18n)
