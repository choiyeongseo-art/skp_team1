/* Static campaign periods (KST date-only) and stable IDs shared across branches.
 * Unconfirmed reports remain separate from the dates used for map eligibility.
 */
(function(root){
 const events=[
  {id:'oliveyoung-blackfriday-2026',brand:'올리브영',image:'oliveyoung.jpg',title:'2026 올리브영 블랙프라이데이',start:'2026-11-01',end:'2026-11-07',scheduleStatus:'confirmed'},
  {id:'uniqlo-2026',brand:'유니클로',image:'uniqlo.jpg',title:'유니클로 연말 행사 안내',start:null,end:null,scheduleStatus:'unconfirmed',reportedStart:'2026-11-20',reportedEnd:'2026-11-27'},
  {id:'zara-2026',brand:'자라',image:'zara.jpg',title:'자라 블랙프라이데이 안내',start:null,end:null,scheduleStatus:'unconfirmed',reportedStart:'2026-11-27',reportedEnd:'2026-12-01'},
  {id:'monchhichi-busan-202611',brand:'몬치치',image:'monchhichi-restored-20261112.png',title:'몬치치 KARYLAND in BUSAN 팝업',start:'2026-11-05',end:'2026-11-15',scheduleStatus:'confirmed',scheduleSource:'https://news.tf.co.kr/read/releasecopy/2385514.htm'},
  {id:'wackywilly-busan-202610',brand:'와키윌리',image:'wackywilly-user-20261106.png',title:'와키윌리 × 리센느 원이 팝업',start:'2026-10-30',end:'2026-11-12',scheduleStatus:'confirmed',scheduleSource:'https://www.lotteshopping.com/shpgnews/shpgnewsDetail?shpgNewsNo=SNM00000000000511672'},
  {id:'tunaschool-gwangbok-202611',brand:'참치학교',image:'tunaschool-photo-20261112.jpeg',title:'참치학교 광복점 팝업',start:'2026-11-06',end:'2026-11-19',scheduleStatus:'confirmed',scheduleSource:'https://www.lotteshopping.com/shpgnews/shpgnewsDetail?shpgNewsNo=SNM00000000000571267'},
  {id:'tiffany-2026',brand:'티파니앤코',image:'tiffany.jpg',title:'티파니앤코 행사 소식',start:null,end:null,scheduleStatus:'unknown'}
 ,{"id": "mugiwara-busan-202611", "brand": "원피스 무기와라 스토어", "image": "mugiwara-poster-20261112.webp", "title": "원피스 무기와라 스토어 부산 롯데 팝업", "start": "2026-10-30", "end": "2026-11-26", "scheduleStatus": "confirmed", "scheduleSource": "https://www.lotteshopping.com/shpgnews/shpgnewsDetail?shpgNewsNo=SNM00000000000568731"},
 {"id": "yjack-busan-202611", "brand": "와이잭", "image": "yjack-user-20261106.png", "title": "와이잭 동부산점 팝업스토어", "start": "2026-11-05", "end": "2026-11-18", "scheduleStatus": "confirmed", "scheduleSource": "https://www.lotteshopping.com/shpgnews/shpgnewsDetail?shpgNewsNo=SNM00000000000567897"},
 {"id": "gelatopique-busan-202611", "brand": "젤라또 피케", "image": "gelatopique-user-20261106.png", "title": "젤라또 피케 부산본점 팝업스토어", "start": "2026-10-30", "end": "2026-11-12", "scheduleStatus": "confirmed", "scheduleSource": "https://www.lotteshopping.com/shpgnews/shpgnewsDetail?shpgNewsNo=SNM00000000000567431"}
 ,{"id": "sanx-busan-202610", "brand": "리락쿠마·스미코구라시", "image": "sanx-user-20261112.png", "title": "리락쿠마 스미코구라시 PLUS by San-X 부산 미니스토어", "start": "2026-10-30", "end": "2027-01-31", "scheduleStatus": "confirmed", "scheduleSource": "https://www.popcondplay.com/ip/news/view/728"},
 {"id": "maplestory-busan-202608", "brand": "메이플스토리", "image": "maplestory-poster-20261112.jpg", "title": "메이플스토리 in 롯데월드 부산", "start": "2026-08-29", "end": "2026-11-22", "scheduleStatus": "confirmed", "scheduleSource": "https://lotteworldrecruit.tistory.com/entry/%EB%A9%94%EC%9D%B4%ED%94%8C-%EC%9A%A9%EC%82%AC%EC%97%AC-%EB%B6%80%EC%82%B0%EC%9C%BC%EB%A1%9C-%EB%AA%A8%EC%97%AC%EB%9D%BC-%EB%A1%AF%EB%8D%B0%EC%9B%94%EB%93%9C-%EB%B6%80%EC%82%B0-%EA%B0%80%EC%9D%84-%EC%8B%9C%EC%A6%8C-%EC%B6%95%EC%A0%9C-MAPLESTORY-in-LOTTEWORLD-BUSAN-%EC%98%A4%ED%94%88"}
 ,{
  "id": "signiel-busan-202611",
  "brand": "시그니엘 부산",
  "image": "signiel-user-20261112.png",
  "title": "시그니엘 부산 시즌 패키지",
  "start": "2026-08-18",
  "end": "2027-06-30",
  "scheduleStatus": "confirmed",
  "scheduleKind": "booking",
  "scheduleSource": "https://app.lottehotel.com/busan-signiel/ko/offers/packages",
  "offers": [
    {
      "name": "Taste of Autumn",
      "bookingStart": "2026-09-07",
      "bookingEnd": "2026-11-29",
      "stayStart": "2026-09-14",
      "stayEnd": "2026-12-01",
      "priceFrom": 437899,
      "description": "가을 디저트와 함께하는 숙박 패키지. 현재 메뉴·제공 인원은 예약 상품에서 확인하세요.",
      "category": "숙박"
    },
    {
      "name": "In-Room Dining at SIGNIEL",
      "bookingStart": "2026-08-24",
      "bookingEnd": "2027-06-30",
      "stayStart": "2026-08-24",
      "stayEnd": "2027-07-01",
      "priceFrom": 440803,
      "description": "객실에서 즐기는 프라이빗 다이닝. 식사 시간·메뉴·인원은 선택 상품에서 확인하세요.",
      "category": "숙박"
    },
    {
      "name": "Autumn Serenity Retreat",
      "bookingStart": "2026-08-18",
      "bookingEnd": "2026-11-30",
      "stayStart": "2026-09-01",
      "stayEnd": "2026-12-01",
      "priceFrom": 466334,
      "description": "베르나르 까시에르 코코 티아레 너리싱 캔들 연계 패키지. 현재 선물 구성·재고를 확인하세요.",
      "category": "숙박"
    },
    {
      "name": "SIGNIEL BRAND FESTA",
      "bookingStart": "2026-11-02",
      "bookingEnd": "2026-11-08",
      "stayStart": "2026-11-02",
      "stayEnd": "2027-04-01",
      "priceFrom": 300080,
      "description": "객실 단독 또는 조식 결합 상품 선택. 조식은 모든 요금에 포함되지 않아요.",
      "category": "숙박"
    }
  ]
},{
  "id": "westin-josun-busan-202611",
  "brand": "웨스틴 조선 부산",
  "image": "westin-josun.svg",
  "title": "웨스틴 조선 부산 쓱데이",
  "start": "2026-10-30",
  "end": "2026-11-08",
  "scheduleStatus": "confirmed",
  "scheduleKind": "booking",
  "scheduleSource": "https://www.josunhotel.com/package/get.do?packageId=1670&propertyId=3",
  "offers": [
    {
      "name": "Room Only Special Offer",
      "bookingStart": "2026-10-30",
      "bookingEnd": "2026-11-08",
      "stayStart": "2026-11-01",
      "stayEnd": "2027-03-31",
      "priceFrom": 285000,
      "description": "디럭스 비치뷰 285,000원부터. 이그제큐티브 파크뷰 335,000원부터·비치뷰 365,000원부터. 객실별 라운지 포함 여부와 실제 전망을 확인하세요.",
      "category": "숙박"
    },
    {
      "name": "Breakfast Package",
      "bookingStart": "2026-10-30",
      "bookingEnd": "2026-11-08",
      "stayStart": "2026-11-01",
      "stayEnd": "2027-03-31",
      "priceFrom": 360000,
      "description": "디럭스 비치뷰 1박 + 까밀리아 조식 성인 2인. 어린이 조식은 별도예요.",
      "category": "숙박"
    },
    {
      "name": "Suite Offer",
      "bookingStart": "2026-10-30",
      "bookingEnd": "2026-11-08",
      "stayStart": "2026-11-01",
      "stayEnd": "2027-03-31",
      "priceFrom": 495000,
      "description": "이그제큐티브 그랜드 495,000원부터·파크뷰 스위트 525,000원부터·비치뷰 스위트 595,000원부터. 클럽 라운지 성인 2인·레스토랑 3만원 바우처 1매.",
      "category": "숙박"
    },
    {
      "name": "다이닝 오퍼",
      "bookingStart": "2026-10-30",
      "bookingEnd": "2026-11-08",
      "stayStart": "2026-11-01",
      "stayEnd": "2027-03-31",
      "priceFrom": null,
      "description": "까밀리아 20%, 오킴스 지정 세트, 파노라마 애프터눈티 10% 할인. 객실 상품과 별도 예약이에요.",
      "category": "로컬"
    }
  ]
},{
  "id": "grand-josun-busan-202611",
  "brand": "그랜드 조선 부산",
  "image": "grand-josun.svg",
  "title": "그랜드 조선 부산 쓱데이",
  "start": "2026-10-30",
  "end": "2026-11-08",
  "scheduleStatus": "confirmed",
  "scheduleKind": "booking",
  "scheduleSource": "https://gjb.josunhotel.com/package/get.do?packageId=1710&propertyId=4",
  "offers": [
    {
      "name": "Room Only Special Offer",
      "bookingStart": "2026-11-02",
      "bookingEnd": "2026-11-08",
      "stayStart": "2026-11-02",
      "stayEnd": "2027-03-31",
      "priceFrom": 236500,
      "description": "디럭스 시티뷰 236,500원부터·오션뷰 317,900원부터. 키즈 시티뷰 259,600원부터·오션뷰 335,500원부터.",
      "category": "숙박",
      "excludedStayDates": [
        "2026-11-07",
        "2026-11-14",
        "2026-11-19",
        "2026-11-20",
        "2026-11-21",
        "2026-12-31"
      ]
    },
    {
      "name": "Breakfast Package",
      "bookingStart": "2026-11-02",
      "bookingEnd": "2026-11-08",
      "stayStart": "2026-11-01",
      "stayEnd": "2027-03-31",
      "priceFrom": 349800,
      "description": "아리아 조식 성인 2인. 디럭스 시티뷰 349,800원부터·오션뷰 431,200원부터. 키즈 시티뷰 372,900원부터·오션뷰 448,800원부터.",
      "category": "숙박",
      "excludedStayDates": [
        "2026-11-07",
        "2026-11-14",
        "2026-11-19",
        "2026-11-20",
        "2026-11-21",
        "2026-12-31"
      ]
    },
    {
      "name": "Suite Offer",
      "bookingStart": "2026-11-02",
      "bookingEnd": "2026-11-08",
      "stayStart": "2026-11-01",
      "stayEnd": "2027-03-31",
      "priceFrom": 708400,
      "description": "코너 시티뷰 708,400원부터·패밀리 코너 830,500원부터·이그제큐티브 및 키즈 오션뷰 891,000원부터. 아리아 조식 성인 2인·Gran J 라운지·식음 3만원 바우처.",
      "category": "숙박",
      "excludedStayDates": [
        "2026-11-07",
        "2026-11-14",
        "2026-11-19",
        "2026-11-20",
        "2026-11-21",
        "2026-12-31"
      ]
    },
    {
      "name": "다이닝 오퍼",
      "bookingStart": "2026-10-30",
      "bookingEnd": "2026-11-08",
      "stayStart": "2026-11-01",
      "stayEnd": "2027-03-31",
      "priceFrom": null,
      "description": "아리아 20%, 팔레드 신 지정 메뉴, 테라스292 지정 세트, 조선델리 케이크 5% 할인. 객실과 별도 예약이에요.",
      "category": "로컬"
    }
  ]
}
 ,{
  "id": "harrypotter-busan-202610",
  "brand": "해리포터 마호도코로",
  "image": "harrypotter-user-20261112.png",
  "title": "해리포터 마호도코로 부산본점 팝업스토어",
  "start": "2026-10-30",
  "end": "2027-01-07",
  "scheduleStatus": "confirmed",
  "scheduleSource": "https://www.playdground.com/ip/news/view/731"
},{
  "id": "hinakuu-busan-202610",
  "brand": "히나쿠우",
  "image": "hinakuu-user-20261106.png",
  "title": "히나쿠우 in BUSAN 팝업스토어",
  "start": "2026-10-30",
  "end": "2026-11-10",
  "scheduleStatus": "confirmed",
  "scheduleSource": "https://www.lotteshopping.com/shpgnews/shpgnewsDetail?shpgNewsNo=SNM00000000000568807"
},
{
  "id": "daldal-market-busan-202611",
  "brand": "달달더마켓",
  "title": "2026 달달더마켓",
  "image": "daldal-poster-20261112.jpg",
  "start": "2026-11-06",
  "end": "2026-11-12",
  "scheduleStatus": "confirmed",
  "scheduleSource": "https://www.bepa.kr/kor/view.do?idx=19599&no=1502&state=ing&view=view"
},
{
  "id": "gwangalli-drone-laser-20261121",
  "brand": "광안리 M 드론×레이저쇼",
  "title": "광안리 M 드론×레이저쇼 — 성의 수호자",
  "image": "gwangalli-poster-20261112.jpg",
  "start": "2026-11-21",
  "end": "2026-11-21",
  "scheduleStatus": "confirmed",
  "scheduleSource": "https://www.gwangallimdrone.co.kr/notice/gwanganri-m-deuronraiteusyo-11weol-gongyeon-peurogeuraem-annae-2"
},
{
  "id": "gstar-busan-202611",
  "brand": "G-STAR",
  "title": "국제게임전시회 지스타 2026",
  "image": "gstar-poster-20261112.jpg",
  "start": "2026-11-19",
  "end": "2026-11-22",
  "scheduleStatus": "confirmed",
  "scheduleSource": "https://www.gstar.or.kr/part/gstar_btc_info.do"
}
 ];
 events.push(...[
  {
    "id": "busan-handmade-fair-winter-2026",
    "brand": "부산 핸드메이드페어",
    "title": "2026 부산 핸드메이드페어 윈터",
    "start": "2026-12-11",
    "end": "2026-12-13",
    "scheduleStatus": "confirmed",
    "scheduleSource": "https://handmadefair.co.kr/about_the_exhibition"
  },
  {
    "id": "busan-international-childrens-book-fair-2026",
    "brand": "부산국제아동도서전",
    "title": "2026 부산국제아동도서전",
    "start": "2026-12-03",
    "end": "2026-12-06",
    "scheduleStatus": "confirmed",
    "scheduleSource": "https://bicbf.or.kr/page/61"
  },
  {
    "id": "christmas-village-busan-2026",
    "brand": "크리스마스 빌리지 부산",
    "title": "크리스마스 빌리지 부산 2026",
    "start": "2026-11-26",
    "end": "2026-12-25",
    "scheduleStatus": "confirmed",
    "scheduleSource": "https://marketchango.com/CHRISTMAS_VILLAGE_BUSAN_2026"
  },
  {
    "id": "othoniel-labyrinth-2026",
    "brand": "오토니엘",
    "title": "장-미셸 오토니엘 《사랑 안의 미로》",
    "start": "2026-08-28",
    "end": "2026-12-31",
    "scheduleStatus": "confirmed",
    "scheduleSource": "https://www.busan.go.kr/eng/bsevents/1750485"
  }
]);
 events.push(...[
  {
    "id": "caplab-samjung-202611",
    "brand": "캡랩",
    "category": "팝업",
    "title": "삼정타워 캡랩 팝업",
    "start": "2026-11-13",
    "end": "2026-11-26",
    "scheduleStatus": "confirmed",
    "scheduleSource": "https://www.samjungtower.com/upload/event/2026/11/11/c255690b-d519-4e14-ad79-8d32bdc4e918.jpg"
  },
  {
    "id": "no-bad-vibes-samjung-202611",
    "brand": "노배드바이브스",
    "category": "팝업",
    "title": "삼정타워 노배드바이브스 초코겹겹이찹쌀떡 팝업",
    "start": "2026-11-13",
    "end": "2026-11-26",
    "scheduleStatus": "confirmed",
    "scheduleSource": "https://www.samjungtower.com/upload/event/2026/11/11/7540ac26-d849-4967-ba74-fbf0a96a4463.jpg"
  }
]);
 events.push(...[
  {
    "id": "lafeuille-centum-mochi",
    "brand": "라푀유",
    "title": "라푀유 모찌 판매 안내 — 확인 중",
    "category": "디저트",
    "start": null,
    "end": null,
    "scheduleStatus": "unconfirmed"
  },
  {
    "id": "teenieping-connect-busan-202611",
    "brand": "캐치! 티니핑",
    "title": "쥬얼스타 캐치! 티니핑 팝업 — 부산 일정 확인 중",
    "category": "팝업",
    "start": null,
    "end": null,
    "scheduleStatus": "unconfirmed",
    "reportedStart": "2026-11-26",
    "reportedEnd": "2026-12-13"
  }
]);
 const officialEventPosters={
  "othoniel-labyrinth-2026": {
    "brand": "오토니엘",
    "image": "othoniel-2026-official.jpg",
    "imageSource": "https://tkfile.yes24.com/upload2/perfblog/202607/20260721/20260721-59314.jpg"
  },
  "christmas-village-busan-2026": {
    "brand": "크리스마스 빌리지 부산",
    "image": "christmas-village-2026-official.png",
    "imageSource": "https://cdn.imweb.me/thumbnail/20261109/0f83742696c63.png"
  },
  "busan-handmade-fair-winter-2026": {
    "brand": "부산 핸드메이드페어",
    "image": "handmade-winter-2026-official.webp",
    "imageSource": "https://d2v5p8jgjm0j1e.cloudfront.net/613036a6ce1797564bcfb042/20260309-05h/05m34s/2026%20%E1%84%87%E1%85%AE%E1%84%92%E1%85%A2%E1%86%AB%E1%84%91%E1%85%A6%20%E1%84%91%E1%85%A9%E1%84%89%E1%85%B3%E1%84%90%E1%85%A5%20%E1%84%80%E1%85%B3%E1%84%85%E1%85%B5%E1%86%B7%E1%84%8C%E1%85%A1%28%E1%84%8C%E1%85%A5%E1%86%AB%E1%84%89%E1%85%B5%E1%84%92%E1%85%AC%20%E1%84%89%E1%85%A9%E1%84%80%E1%85%A2%29---997.0124999999999---3000.webp"
  },
  "busan-international-childrens-book-fair-2026": {
    "brand": "부산국제아동도서전",
    "image": "bicbf-2026-official.png",
    "imageSource": "https://bicbf.or.kr/data/editor/2610/thumb-c2caab56789d44157bb7299170f65405_1791270086_2746_835x1181.png"
  },
  "caplab-samjung-202611": {
    "brand": "캡랩",
    "image": "caplab-2026-official.jpg",
    "imageSource": "https://www.samjungtower.com/upload/event/2026/11/11/c255690b-d519-4e14-ad79-8d32bdc4e918.jpg"
  },
  "no-bad-vibes-samjung-202611": {
    "brand": "노배드바이브스",
    "image": "no-bad-vibes-2026-official.jpg",
    "imageSource": "https://www.samjungtower.com/upload/event/2026/11/11/7540ac26-d849-4967-ba74-fbf0a96a4463.jpg"
  }
};
 for(const event of events){const poster=officialEventPosters[event.id];if(poster)Object.assign(event,{image:poster.image,imageSource:poster.imageSource});}
 events.push(...[
  {
    "id": "haeundae-light-2026",
    "brand": "해운대 빛축제",
    "title": "제13회 해운대 빛축제",
    "image": "haeundae-light-2026.jpg",
    "category": "로컬",
    "start": "2026-11-28",
    "end": "2027-01-10",
    "scheduleStatus": "confirmed",
    "scheduleSource": "https://korean.visitkorea.or.kr/kfes/detail/fstvlDetail.do?fstvlCntntsId=b3b7a23c-c7f6-45db-930a-b139e4d8cd9f"
  },
  {
    "id": "gwangbok-street-dec-2026",
    "brand": "광복로 스트릿페스타",
    "title": "12월 스트릿페스타 앤 발코니뮤직쇼",
    "image": "gwangbok-street-dec-2026-official.png",
    "category": "로컬",
    "start": "2026-12-05",
    "end": "2026-12-19",
    "openDates": [
      "2026-12-05",
      "2026-12-12",
      "2026-12-19"
    ],
    "dateDisplay": "2026.12.05 / 2026.12.12 / 2026.12.19",
    "scheduleStatus": "confirmed",
    "scheduleSource": "https://visitbusan.net/schedule/view.do?boardId=BBS_0000009&dataSid=6482&menuCd=DOM_000000204012000000"
  },
  {
    "id": "busan-bridge-marathon-2026",
    "brand": "부산브릿지마라톤",
    "title": "2026 부산브릿지마라톤",
    "image": "busan-bridge-marathon-2026-official.png",
    "category": "로컬",
    "start": "2026-12-06",
    "end": "2026-12-06",
    "scheduleStatus": "confirmed",
    "scheduleSource": "https://www.busanmarathon.com/"
  },
  {
    "id": "kpet-busan-dec-2026",
    "brand": "케이펫페어 부산",
    "title": "2026 케이펫페어 부산 시즌2",
    "image": "kpet-busan-dec-2026-official.jpg",
    "category": "로컬",
    "start": "2026-12-11",
    "end": "2026-12-13",
    "scheduleStatus": "confirmed",
    "scheduleSource": "https://k-pet.co.kr/information/exhibition-scheduled-all/"
  },
  {
    "id": "moif-centum-nov-2026",
    "brand": "모이프",
    "title": "모이프 팝업스토어",
    "image": "moif-centum-nov-2026-official.jpg",
    "category": "팝업",
    "start": "2026-11-16",
    "end": "2026-12-03",
    "scheduleStatus": "confirmed",
    "scheduleSource": "https://www.shinsegae.com/shopping/list.do?schMainCd=02&schPgIdx=36&storeCd=SC00008"
  },
  {
    "id": "lancome-centum-holiday-2026",
    "brand": "랑콤",
    "title": "랑콤 2026년 홀리데이 세트",
    "image": "lancome-centum-holiday-2026-official.png",
    "category": "뷰티",
    "start": "2026-11-13",
    "end": "2026-11-19",
    "scheduleStatus": "confirmed",
    "scheduleSource": "https://www.shinsegae.com/shopping/list.do?schMainCd=02&schPgIdx=36&storeCd=SC00008"
  },
  {
    "id": "labruket-centum-launch-2026",
    "brand": "라부르켓",
    "title": "라부르켓 신상품 론칭",
    "image": "labruket-centum-launch-2026-official.jpg",
    "category": "뷰티",
    "start": "2026-11-13",
    "end": "2026-11-19",
    "scheduleStatus": "confirmed",
    "scheduleSource": "https://www.shinsegae.com/shopping/list.do?schMainCd=02&schPgIdx=36&storeCd=SC00008"
  },
  {
    "id": "food-fair-busan-nov-2026",
    "brand": "부산식품박람회",
    "title": "2026 FOOD FAIR 부산 하반기",
    "image": "food-fair-busan-nov-2026-official.jpg",
    "category": "푸드",
    "start": "2026-11-26",
    "end": "2026-11-29",
    "scheduleStatus": "confirmed",
    "scheduleSource": "https://foodfair.co.kr/board/?id=sub31"
  },
  {
    "id": "busan-wine-spirits-2026",
    "brand": "부산국제주류&와인박람회",
    "title": "2026 부산국제주류&와인박람회",
    "image": "busan-wine-spirits-2026-official.jpg",
    "category": "푸드",
    "start": "2026-12-11",
    "end": "2026-12-13",
    "scheduleStatus": "confirmed",
    "scheduleSource": "https://busan.siwse.com/page/31"
  },
  {
    "id": "paradise-christmas-cake-2026",
    "brand": "파라다이스 부티크",
    "title": "THE WONDER OF CHRISTMAS · 크리스마스 케이크",
    "image": "paradise-christmas-cake-2026.jpg",
    "category": "디저트",
    "start": "2026-11-16",
    "end": "2026-12-25",
    "scheduleStatus": "confirmed",
    "scheduleSource": "https://www.busanparadisehotel.co.kr/front/event/eventHtml"
  },
  {
    "id": "lotte-pusan-in-busan-2026",
    "brand": "롯데호텔 부산",
    "title": "롯데호텔 부산 Pusan in Busan",
    "image": "lotte-pusan-in-busan-2026.webp",
    "category": "숙박",
    "start": "2026-07-01",
    "end": "2026-12-31",
    "scheduleStatus": "confirmed",
    "scheduleSource": "https://app.lottehotel.com/busan-hotel/ko/offers/packages/260626/pusan_in_busan"
  },
  {
    "id": "topten-black-friday-busan-2026",
    "brand": "탑텐 블랙프라이데이",
    "title": "탑텐 2026 블랙프라이데이 · 부산 확인 중",
    "image": "topten.jpg",
    "category": "패션",
    "start": null,
    "end": null,
    "scheduleStatus": "unconfirmed",
    "scheduleSource": "https://topten10.goodwearmall.com/"
  },
  {
    "id": "musinsa-standard-black-friday-busan-2026",
    "brand": "무신사 스탠다드",
    "title": "무신사 스탠다드 겨울 블랙프라이데이 · 부산 확인 중",
    "image": "musinsa-standard.jpg",
    "category": "패션",
    "start": null,
    "end": null,
    "scheduleStatus": "unconfirmed",
    "scheduleSource": "https://www.musinsa.com/content/1566699710148818818"
  }
]);
 if(typeof module==='object'&&module.exports)module.exports=events;else root.BUSAN_EVENT_CATALOG=events;
})(typeof window==='object'?window:this);
