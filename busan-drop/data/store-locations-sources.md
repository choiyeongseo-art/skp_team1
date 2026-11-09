# 지도 위치 데이터 · 2026-11-06

이 목록은 전체 매장을 보장하지 않는 등록 위치 목록이다. 시연용 SVG의 가상 지점은 사용하지 않는다.

- 유니클로 9곳: 사용자 지정 목록을 공식 매장 검색의 주소·지도 좌표·전화·운영시간과 대조해 교체했다. 기존 4곳의 ID는 유지하고 좌표를 수정했다.
- 자라 3곳: 아래 공식 매장 페이지의 공개 coordinates를 추출. 2026-11-05 확인.
  - https://www.zara.com/kr/ko/stores-locator/zara-busan-bujeondong-s9302
  - https://www.zara.com/kr/ko/stores-locator/zara-busan-lotte-centum-city-s14970
  - https://www.zara.com/kr/ko/stores-locator/zara-busan-lotte-dongbusan-s16694
- 티파니앤코 센텀시티점 1곳: 공식 매장 안내의 주소 확인. 좌표는 신세계 센텀시티 건물 기준 참고값이며 내부 매장 위치가 아니다.
  - https://www.tiffany.kr/stores/ko/korea/busan-shinsegae-centum-city-472
- 몬치치 팝업 1곳: `busandrop_db/BUSANDROP_몬치치팝업_신세계센텀시티_리서치_2026-11-05.md`에서 장소·주소·건물 좌표를 이관. 상설 매장으로 표시하지 않는다. 행사 기간은 2026-11-05~11-15, 공식 원문 일정 대조 미완료. 건물 기준 참고좌표.
- 탑텐: 활성 브랜드에서 제외.

## 올리브영 3곳으로 교체 · 2026-11-06

사용자가 지정한 `BUSANDROP_올리브영_블랙프라이데이_2026.md`에 따라 기존 78곳 중 75곳을 활성 데이터에서 제외했다.

- 커넥트현대 부산점: `oliveyoung-8`. 공식 오시는길 페이지의 좌표 35.141309, 129.058589로 수정. 건물 기준 좌표.
  - https://ehyundai.com/newPortal/DP/WC/WC000000_V.do?branchCd=B00124000
- 남포 타운: `oliveyoung-0`. 기존 등록 좌표 유지, 좌표 자체는 이번에 재검증하지 못함. 공식 매장 페이지에서 비프광장로 40 주소 확인.
  - https://m.oliveyoung.co.kr/m/mtn/store/information/DFB7
- 밀락더마켓점: `oliveyoung-30`. 기존 등록 좌표 유지, 좌표 자체는 이번에 재검증하지 못함.

지점 특성은 첨부 문서와 CJ올리브영 보도자료에 근거한다. 커넥트현대의 쿠폰 조건은 해당 지점에만 적용한다. 남포·밀락의 블랙프라이데이 개별 혜택은 미확인 상태로 유지한다.
- https://corp.oliveyoung.com/ko/newsroom/press/140
- https://m.ehyundai.com/mobile/SN/SN_0201000.do?branchCd=B00124000&category=event&evntCrdCd=E2402610512284

원본 백업: `archives/store-locations-20261106/before-oliveyoung-three-branches.js`. 올리브영 교체 당시 활성 데이터는 총 12곳이었다.

## 유니클로 9곳 · 2026-11-06

기존 4곳 + 신규 5곳, 현재 전체 등록 위치는 17곳이다.
공식 매장 페이지: 123508(사하), 10500333(광복), 10501173(범일), 10501174(삼정타워), 10500005(서면), 10500605(화명), 10501186(동래), 10501178(센텀시티), 10500352(동부산).
URL 형식: https://map.uniqlo.com/kr/ko/detail/{id}
각 페이지의 공개 Google 지도 링크 ll 좌표 사용. 사용자 Google Plus Code는 메타데이터에 보존. 공식 매장 좌표 기준으로 표시하며 행사 참여 확정 목록으로 사용하지 않음.
상세 근거: busandrop_db/uniqlo-official-stores-20261106.json 및 BUSANDROP_유니클로_부산9개점_행사정리_2026-11-06.md.

## 자라 행사 상세 보완 · 2026-11-06

서면점(zara-9302)·센텀시티점(zara-14970)은 기존 공식 좌표를 유지하고 중복 없이 프로필·운영시간·연락처를 추가했다. 좌표 검증일은 기존 11월 5일을 유지하고 프로필 확인일을 11월 6일로 별도 기록했다. 사용자가 제공한 Google Plus Code도 보존했다. 동부산점 기존 등록은 유지하여 자라 3곳·전체 17곳이다.

- 서면: 11월 6–12일 11:00–22:30, 여성·남성.
- 센텀: 11월 6–8일 10:30–20:30 / 9–12일 10:30–20:00, 여성·남성·아동.
- 두 공식 상세의 연락처 080-305-1200은 지점 전용 번호라고 단정하지 않음.
- 일반 결제·쿠폰: https://www.zara.com/kr/ko/help-center/PaymentMethods
- 일반 반품: https://www.zara.com/kr/ko/help-center/HowToReturn
- 행사 공식 날짜·시각·할인율·부산 참여 여부 null/미확인 유지. 매체 날짜·일반 특가를 행사 확정값으로 전용하지 않음.
