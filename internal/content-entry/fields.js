/* Admin entry order. These are draft fields, not SQL column positions. */
(function (root) {
  const availability = ['unknown:미확인','available:가능','unavailable:불가','conditional:조건부','not_applicable:해당 없음'];
  const requirement = ['unknown:미확인','required:필수','not_required:불필요','conditional:조건부','not_applicable:해당 없음'];
  const verified = ['unknown:미확인','reported:출처 기재','confirmed:확인 완료'];
  const f = (key,label,type='text',options) => ({key,label,type,options});
  const i = (key,label) => f(key,label,'i18n');
  const s = (key,label,options=availability) => f(key,label,'select',options);
  const group = (key,label,fields) => ({key,label,type:'rows',fields});
  const sections = [
    {title:'기본 정보',hint:'어떤 행사인지 식별할 정보를 입력합니다.',fields:[
      f('events.id','행사 ID'),f('events.brand_name','브랜드명'),i('events.name_i18n','행사명'),
      s('events.event_type','행사 유형',['other:기타','popup:팝업','sale:할인 행사','experience:체험','exhibition:전시','festival:축제','stay:숙박']),
      s('events.category','카테고리',['local:부산 이벤트','popup:팝업','fashion:패션','beauty:뷰티','food:푸드','dessert:디저트','stay:숙박','art:예술','shopping:쇼핑']),
      s('events.audience','참여 대상',['unknown:미확인','all:전체','foreign_only:외국인 전용','domestic_only:내국인 전용']),
      f('events.brand_category','브랜드 분류'),f('events.brand_logo_url','브랜드 로고 URL','url'),f('events.brand_url','브랜드 공식 URL','url'),f('events.instagram','Instagram'),f('events.tags','태그 (쉼표로 구분)'),f('events.card_image_url','카드 이미지 URL','url'),f('events.image_url','히어로 이미지 URL','url')
    ]},
    {title:'일정·운영시간',hint:'방문일 기준 일정과 휴무·예외 시간을 구분합니다. 시간대는 Asia/Seoul입니다.',fields:[
      f('event_venues.start_date','시작일','date'),f('event_venues.end_date','종료일','date'),
      s('event_venues.schedule_kind','일정 기준',['visit:방문 기간','booking:예약 기간','sales:판매 기간']),s('event_venues.schedule_status','일정 확인 상태',verified),s('event_venues.participation_status','해당 지점 참여 여부',[...verified,'not_participating:참여하지 않음']),i('event_venues.date_note_i18n','일정 안내'),i('event_venues.hours_note_i18n','운영시간 안내'),
      group('opening_hours','요일별 운영시간',[s('weekday','요일',['0:일요일','1:월요일','2:화요일','3:수요일','4:목요일','5:금요일','6:토요일']),f('opens_at','시작','time'),f('closes_at','종료','time'),f('closes_next_day','다음 날 종료','checkbox'),f('last_admission_at','마지막 입장','time'),f('registration_deadline_at','접수 마감','time'),i('note_i18n','안내')]),
      group('schedule_exceptions','휴무·특별 운영',[f('exception_date','날짜','date'),s('exception_type','구분',['closed:휴무','special_hours:특별 운영','session:회차 운영','sold_out:매진']),f('opens_at','시작','time'),f('closes_at','종료','time'),f('closes_next_day','다음 날 종료','checkbox'),f('last_admission_at','마지막 입장','time'),i('note_i18n','안내')])
    ]},
    {title:'입장·예약',hint:'행사 입장료와 제품 구매 가격을 분리해 입력합니다.',fields:[
      s('event_venues.admission_status','입장료',['unknown:미확인','free:무료','paid:유료','mixed:무료·유료 혼합','not_applicable:해당 없음']),
      s('event_venues.booking_status','예약',['unknown:미확인','required:필수','optional:선택','priority:예약 우선','not_required:불필요','not_applicable:해당 없음']),f('event_venues.booking_url','예약 URL','url'),i('event_venues.booking_i18n','예약 방법'),s('event_venues.walk_in_status','현장 입장'),f('event_venues.min_age','최소 이용 나이','number'),
      group('admission_prices','입장료 상세',[i('label_i18n','요금 구분'),f('amount','금액','number'),f('currency','통화 (KRW 등)'),f('min_age','최소 나이','number'),f('max_age','최대 나이','number'),i('conditions_i18n','조건'),s('price_status','가격 확인 상태',['reported:출처 기재','confirmed:확인 완료']),f('source_url','가격 출처 URL','url'),f('checked_at','확인일','datetime-local')])
    ]},
    {title:'행사 내용',hint:'행사의 특징과 실제로 경험할 수 있는 내용을 정리합니다.',fields:[i('events.headline_i18n','핵심 문구'),i('events.summary_i18n','한 줄 소개'),i('events.description_i18n','상세 설명'),i('event_venues.notice_i18n','방문 전 주의사항'),s('events.online_status','온라인 진행 여부')]},
    {title:'제품·가격',hint:'제품별 옵션과 판매가를 입력합니다. 미확인 가격은 0원이 아니라 비워 둡니다.',fields:[
      group('products','제품',[i('name_i18n','제품명'),i('description_i18n','제품 설명'),f('image_url','제품 이미지 URL','url'),f('image_credit','이미지 출처명'),f('image_source_url','이미지 출처 URL','url'),f('image_license','이미지 이용 조건'),i('sales_conditions_i18n','구매 조건'),f('purchase_limit','1인 구매 제한','number'),s('stock_status','재고 상태',['unknown:미확인','in_stock:재고 있음','sold_out:품절','limited:한정 수량','not_applicable:해당 없음']),f('stock_checked_at','재고 확인일','datetime-local'),f('is_featured','대표 제품','checkbox'),
        group('variants','옵션·가격',[i('option_i18n','옵션명'),f('sku','SKU'),f('price','판매가','number'),f('original_price','정상가','number'),f('currency','통화 (KRW 등)'),s('price_status','가격 확인 상태',verified),f('price_source_url','가격 출처 URL','url'),f('price_checked_at','가격 확인일','datetime-local')])])
    ]},
    {title:'혜택·조건',hint:'할인·사은품의 적용 조건과 적용 지점을 확인합니다.',fields:[
      group('benefits','혜택',[s('benefit_type','혜택 종류',['other:기타','discount:할인','gift:사은품','points:포인트','tax_refund:택스 리펀드','foreign_only:외국인 전용']),i('title_i18n','혜택명'),i('detail_i18n','혜택 설명'),i('conditions_i18n','적용 조건'),f('max_discount_percent','최대 할인율 (%)','number'),f('min_purchase_amount','최소 구매 금액','number'),s('channel','적용 채널',['unknown:미확인','venue:현장','online:온라인','both:현장·온라인']),f('starts_at','시작','datetime-local'),f('ends_at','종료','datetime-local'),f('quantity_limit','수량 제한','number'),s('verification_status','확인 상태',verified),f('source_url','출처 URL','url'),f('checked_at','확인일','datetime-local')])
    ]},
    {title:'외국인 안내',hint:'가능·불가·미확인을 구분해 불확실한 정보가 확정 사실처럼 표시되지 않게 합니다.',fields:[
      s('event_venues.foreign_visitor_status','외국인 참여'),s('event_venues.foreign_booking_status','외국인 예약'),s('event_venues.korean_phone_requirement','한국 전화번호 필요 여부',requirement),s('event_venues.identity_verification_requirement','본인 인증 필요 여부',requirement),s('event_venues.passport_requirement','여권 필요 여부',requirement),s('event_venues.coupon_requirement','쿠폰 필요 여부',requirement),s('event_venues.app_requirement','별도 앱 필요 여부',requirement),s('event_venues.tax_refund_status','택스 리펀드'),i('event_venues.foreign_visitor_i18n','외국인 참여 안내'),i('event_venues.requirements_i18n','준비물·인증 안내'),i('event_venues.tax_refund_i18n','택스 리펀드 안내'),
      group('payment_methods','결제 수단',[s('method','결제 수단',['foreign_card:해외 카드','visa:Visa','mastercard:Mastercard','jcb:JCB','amex:Amex','unionpay:UnionPay','alipay:Alipay','wechat_pay:WeChat Pay','cash:현금','other:기타']),s('support_status','사용 가능 여부'),i('conditions_i18n','조건'),f('source_url','출처 URL','url'),f('checked_at','확인일','datetime-local')])
    ]},
    {title:'장소·교통',hint:'행사가 열리는 실제 지점의 주소·층·구역을 입력합니다.',fields:[
      f('venues.id','장소 ID'),i('venues.name_i18n','장소명'),f('venues.area','지역'),f('venues.address_ko','한국어 주소'),i('venues.address_i18n','번역 주소'),i('venues.building_i18n','건물'),i('venues.floor_i18n','층'),i('venues.zone_i18n','구역'),f('venues.latitude','위도','number'),f('venues.longitude','경도','number'),i('venues.transit_i18n','대중교통 안내'),s('venues.accessibility_status','접근성'),i('venues.accessibility_i18n','접근성 안내'),f('venues.phone','장소 전화번호','tel'),f('venues.official_url','장소 공식 URL','url'),f('event_venues.contact_phone','행사 문의 전화','tel'),f('event_venues.official_url','행사 공식 URL','url')
    ]},
    {title:'출처·검증',hint:'가격·예약·외국인 조건 등의 출처와 확인일을 각각 기록합니다. 내부 메모는 공개하지 않습니다.',fields:[
      f('events.image_credit','행사 이미지 출처명'),f('events.image_source_url','행사 이미지 출처 URL','url'),f('events.image_license','행사 이미지 이용 조건'),
      group('evidence','항목별 검증',[f('field_key','검증할 필드명'),s('verification_status','확인 상태',[...verified,'not_applicable:해당 없음']),s('source_kind','출처 종류',['unknown:미확인','official:공식','secondary:2차 출처','on_site:현장 확인']),f('source_url','출처 URL','url'),f('checked_at','확인일','datetime-local'),f('internal_note','내부 메모','textarea')])
    ]},
    {title:'공개 상태',hint:'현재 화면은 입력 순서 검토용입니다. 초안 저장·내보내기는 Supabase 저장이나 앱 공개를 실행하지 않습니다.',fields:[s('events.publication_status','공개 상태 설정안',['draft:초안','published:공개 예정','archived:보관 예정'])]}
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = {sections};
  else root.ContentEntryFields = sections;
})(typeof window !== 'undefined' ? window : globalThis);
