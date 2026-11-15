-- BUSAN DROP content v2. Additive: never modifies account/analytics/tourism tables.
-- Target: yinxfrdkxohyttmkuaxa (BUSAN DROP), not shared ZEN WAY.
BEGIN;
CREATE OR REPLACE FUNCTION public.busan_content_i18n_valid(value jsonb)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path=pg_catalog AS $$
 SELECT CASE WHEN jsonb_typeof(value) <> 'object' THEN false ELSE
 NOT EXISTS (SELECT 1 FROM jsonb_each(value) e WHERE e.key NOT IN ('ko','en','ja','zh-CN','zh-TW') OR jsonb_typeof(e.value)<>'string') END;
$$;

CREATE TABLE public.busan_content_events (
 id text PRIMARY KEY, brand_name text NOT NULL,
 event_type text NOT NULL DEFAULT 'other' CHECK(event_type IN ('popup','sale','experience','exhibition','festival','stay','other')),
 category text NOT NULL DEFAULT 'local' CHECK(category IN ('local','popup','fashion','beauty','food','dessert','stay','art','shopping')),
 audience text NOT NULL DEFAULT 'unknown' CHECK(audience IN ('all','foreign_only','domestic_only','unknown')),
 name_i18n jsonb NOT NULL CHECK(public.busan_content_i18n_valid(name_i18n) AND name_i18n ? 'ko' AND length(btrim(name_i18n->>'ko'))>0),
 summary_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(summary_i18n)),
 description_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(description_i18n)),
 brand_category text, brand_logo_url text, brand_url text, instagram text, card_image_url text,
 headline_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(headline_i18n)),
 online_status text NOT NULL DEFAULT 'unknown' CHECK(online_status IN ('available','unavailable','conditional','unknown','not_applicable')),
 image_credit text, image_source_url text, image_license text,
 image_url text, tags jsonb NOT NULL DEFAULT '[]' CHECK(jsonb_typeof(tags)='array'),
 publication_status text NOT NULL DEFAULT 'draft' CHECK(publication_status IN ('draft','published','archived')),
 legacy_payload jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.busan_content_venues (
 id text PRIMARY KEY, name_i18n jsonb NOT NULL CHECK(public.busan_content_i18n_valid(name_i18n) AND name_i18n ? 'ko' AND length(btrim(name_i18n->>'ko'))>0),
 area text, address_ko text, address_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(address_i18n)),
 building_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(building_i18n)),
 floor_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(floor_i18n)),
 zone_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(zone_i18n)),
 latitude numeric(10,7) CHECK(latitude BETWEEN -90 AND 90), longitude numeric(10,7) CHECK(longitude BETWEEN -180 AND 180),
 transit_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(transit_i18n)),
 accessibility_status text NOT NULL DEFAULT 'unknown' CHECK(accessibility_status IN ('available','unavailable','conditional','unknown','not_applicable')),
 accessibility_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(accessibility_i18n)),
 phone text, official_url text, legacy_payload jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK((latitude IS NULL)=(longitude IS NULL))
);
CREATE TABLE public.busan_content_event_venues (
 id text PRIMARY KEY, event_id text NOT NULL REFERENCES public.busan_content_events(id), venue_id text NOT NULL REFERENCES public.busan_content_venues(id),
 UNIQUE(event_id,venue_id), timezone text NOT NULL DEFAULT 'Asia/Seoul' CHECK(timezone='Asia/Seoul'),
 start_date date, end_date date, schedule_kind text NOT NULL DEFAULT 'visit' CHECK(schedule_kind IN ('visit','booking','sales')),
 schedule_status text NOT NULL DEFAULT 'unknown' CHECK(schedule_status IN ('confirmed','reported','unknown')),
 participation_status text NOT NULL DEFAULT 'unknown' CHECK(participation_status IN ('confirmed','reported','unknown','not_participating')),
 date_note_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(date_note_i18n)),
 hours_note_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(hours_note_i18n)),
 admission_status text NOT NULL DEFAULT 'unknown' CHECK(admission_status IN ('free','paid','mixed','unknown','not_applicable')),
 booking_status text NOT NULL DEFAULT 'unknown' CHECK(booking_status IN ('required','optional','priority','not_required','unknown','not_applicable')),
 booking_url text, booking_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(booking_i18n)),
 walk_in_status text NOT NULL DEFAULT 'unknown' CHECK(walk_in_status IN ('available','unavailable','conditional','unknown','not_applicable')),
 foreign_visitor_status text NOT NULL DEFAULT 'unknown' CHECK(foreign_visitor_status IN ('available','unavailable','conditional','unknown','not_applicable')),
 foreign_booking_status text NOT NULL DEFAULT 'unknown' CHECK(foreign_booking_status IN ('available','unavailable','conditional','unknown','not_applicable')),
 korean_phone_requirement text NOT NULL DEFAULT 'unknown' CHECK(korean_phone_requirement IN ('required','not_required','conditional','unknown','not_applicable')),
 identity_verification_requirement text NOT NULL DEFAULT 'unknown' CHECK(identity_verification_requirement IN ('required','not_required','conditional','unknown','not_applicable')),
 passport_requirement text NOT NULL DEFAULT 'unknown' CHECK(passport_requirement IN ('required','not_required','conditional','unknown','not_applicable')),
 coupon_requirement text NOT NULL DEFAULT 'unknown' CHECK(coupon_requirement IN ('required','not_required','conditional','unknown','not_applicable')),
 app_requirement text NOT NULL DEFAULT 'unknown' CHECK(app_requirement IN ('required','not_required','conditional','unknown','not_applicable')),
 tax_refund_status text NOT NULL DEFAULT 'unknown' CHECK(tax_refund_status IN ('available','unavailable','conditional','unknown','not_applicable')),
 foreign_visitor_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(foreign_visitor_i18n)),
 requirements_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(requirements_i18n)),
 tax_refund_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(tax_refund_i18n)),
 notice_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(notice_i18n)),
 min_age smallint CHECK(min_age>=0), contact_phone text, official_url text,
 legacy_payload jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(start_date IS NULL OR end_date IS NULL OR end_date>=start_date),
 CHECK(schedule_status<>'confirmed' OR (start_date IS NOT NULL AND end_date IS NOT NULL))
);
CREATE TABLE public.busan_content_opening_hours (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, event_venue_id text NOT NULL REFERENCES public.busan_content_event_venues(id),
 weekday smallint NOT NULL CHECK(weekday BETWEEN 0 AND 6), opens_at time NOT NULL, closes_at time NOT NULL,
 closes_next_day boolean NOT NULL DEFAULT false, last_admission_at time, registration_deadline_at time,
 note_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(note_i18n)),
 UNIQUE(event_venue_id,weekday,opens_at), CHECK(closes_next_day OR closes_at>opens_at)
);
CREATE TABLE public.busan_content_schedule_exceptions (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, event_venue_id text NOT NULL REFERENCES public.busan_content_event_venues(id),
 exception_date date NOT NULL, exception_type text NOT NULL CHECK(exception_type IN ('closed','special_hours','session','sold_out')),
 opens_at time, closes_at time, closes_next_day boolean NOT NULL DEFAULT false, last_admission_at time,
 note_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(note_i18n)),
 UNIQUE(event_venue_id,exception_date,exception_type),
 CHECK(exception_type<>'special_hours' OR (opens_at IS NOT NULL AND closes_at IS NOT NULL)),
 CHECK(opens_at IS NULL OR closes_at IS NULL OR closes_next_day OR closes_at>opens_at)
);
CREATE TABLE public.busan_content_admission_prices (
 id text PRIMARY KEY, event_venue_id text NOT NULL REFERENCES public.busan_content_event_venues(id),
 label_i18n jsonb NOT NULL CHECK(public.busan_content_i18n_valid(label_i18n)),
 amount numeric(12,2) NOT NULL CHECK(amount>=0), currency text NOT NULL DEFAULT 'KRW' CHECK(currency ~ '^[A-Z]{3}$'),
 min_age smallint, max_age smallint, conditions_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(conditions_i18n)),
 price_status text NOT NULL DEFAULT 'reported' CHECK(price_status IN ('confirmed','reported')),
 checked_at timestamptz NOT NULL, source_url text NOT NULL, sort_order integer NOT NULL DEFAULT 0,
 CHECK(min_age IS NULL OR min_age>=0), CHECK(max_age IS NULL OR max_age>=coalesce(min_age,0))
);
CREATE TABLE public.busan_content_products (
 id text PRIMARY KEY, event_venue_id text NOT NULL REFERENCES public.busan_content_event_venues(id),
 name_i18n jsonb NOT NULL CHECK(public.busan_content_i18n_valid(name_i18n) AND name_i18n ? 'ko' AND length(btrim(name_i18n->>'ko'))>0),
 description_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(description_i18n)),
 image_url text, image_credit text, image_source_url text, image_license text,
 sales_conditions_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(sales_conditions_i18n)),
 purchase_limit integer CHECK(purchase_limit>0), stock_status text NOT NULL DEFAULT 'unknown' CHECK(stock_status IN ('in_stock','sold_out','limited','unknown','not_applicable')),
 stock_checked_at timestamptz, is_featured boolean NOT NULL DEFAULT false, sort_order integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.busan_content_product_variants (
 id text PRIMARY KEY, product_id text NOT NULL REFERENCES public.busan_content_products(id),
 option_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(option_i18n)), sku text,
 price numeric(12,2) CHECK(price>=0), original_price numeric(12,2) CHECK(original_price>=0), currency text NOT NULL DEFAULT 'KRW' CHECK(currency ~ '^[A-Z]{3}$'),
 price_status text NOT NULL DEFAULT 'unknown' CHECK(price_status IN ('confirmed','reported','unknown')),
 price_checked_at timestamptz, price_source_url text, sort_order integer NOT NULL DEFAULT 0,
 CHECK(original_price IS NULL OR price IS NULL OR original_price>=price),
 CHECK(price_status='unknown' OR (price IS NOT NULL AND price_checked_at IS NOT NULL AND price_source_url IS NOT NULL))
);
CREATE TABLE public.busan_content_benefits (
 id text PRIMARY KEY, event_venue_id text NOT NULL REFERENCES public.busan_content_event_venues(id),
 benefit_type text NOT NULL DEFAULT 'other' CHECK(benefit_type IN ('discount','gift','points','tax_refund','foreign_only','other')),
 title_i18n jsonb NOT NULL CHECK(public.busan_content_i18n_valid(title_i18n)),
 detail_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(detail_i18n)),
 conditions_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(conditions_i18n)),
 max_discount_percent numeric(5,2) CHECK(max_discount_percent BETWEEN 0 AND 100), min_purchase_amount numeric(12,2) CHECK(min_purchase_amount>=0),
 channel text NOT NULL DEFAULT 'unknown' CHECK(channel IN ('venue','online','both','unknown')),
 starts_at timestamptz, ends_at timestamptz, quantity_limit integer CHECK(quantity_limit>0),
 verification_status text NOT NULL DEFAULT 'unknown' CHECK(verification_status IN ('confirmed','reported','unknown')),
 source_url text, checked_at timestamptz, sort_order integer NOT NULL DEFAULT 0,
 CHECK(starts_at IS NULL OR ends_at IS NULL OR ends_at>=starts_at)
);
CREATE TABLE public.busan_content_payment_methods (
 event_venue_id text NOT NULL REFERENCES public.busan_content_event_venues(id),
 method text NOT NULL CHECK(method IN ('foreign_card','visa','mastercard','jcb','amex','unionpay','alipay','wechat_pay','cash','other')),
 support_status text NOT NULL DEFAULT 'unknown' CHECK(support_status IN ('available','unavailable','conditional','unknown','not_applicable')),
 conditions_i18n jsonb NOT NULL DEFAULT '{}' CHECK(public.busan_content_i18n_valid(conditions_i18n)),
 source_url text, checked_at timestamptz, PRIMARY KEY(event_venue_id,method)
);
-- Per-field evidence, scoped to the actual participating branch. Never a blanket verified flag.
CREATE TABLE public.busan_content_evidence (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, event_venue_id text NOT NULL REFERENCES public.busan_content_event_venues(id),
 field_key text NOT NULL, verification_status text NOT NULL DEFAULT 'unknown' CHECK(verification_status IN ('confirmed','reported','unknown','not_applicable')),
 source_kind text NOT NULL DEFAULT 'unknown' CHECK(source_kind IN ('official','secondary','on_site','unknown')),
 source_url text, checked_at timestamptz, internal_note text,
 CHECK(verification_status NOT IN ('confirmed','reported') OR (checked_at IS NOT NULL AND source_url IS NOT NULL))
);
CREATE TABLE public.busan_content_display_sections (
 section_key text PRIMARY KEY, sort_order integer NOT NULL UNIQUE,
 title_i18n jsonb NOT NULL CHECK(public.busan_content_i18n_valid(title_i18n)),
 default_expanded boolean NOT NULL DEFAULT true, preview_count integer CHECK(preview_count>0)
);
INSERT INTO public.busan_content_display_sections(section_key,sort_order,title_i18n,preview_count) VALUES
 ('intro',10,'{"ko":"행사 소개","en":"About","ja":"イベント紹介","zh-CN":"活动介绍","zh-TW":"活動介紹"}',NULL),
 ('visit_summary',20,'{"ko":"방문 요약","en":"Visit at a glance","ja":"訪問の概要","zh-CN":"到访概览","zh-TW":"到訪概覽"}',NULL),
 ('critical_notices',30,'{"ko":"방문 전 꼭 확인","en":"Before you visit","ja":"訪問前に必ず確認","zh-CN":"到访前须知","zh-TW":"到訪前須知"}',NULL),
 ('admission_booking',40,'{"ko":"날짜·입장·예약","en":"Dates, admission & booking","ja":"日程・入場・予約","zh-CN":"日期、入场与预约","zh-TW":"日期、入場與預約"}',NULL),
 ('experience',50,'{"ko":"행사 내용","en":"What to expect","ja":"イベント内容","zh-CN":"活动内容","zh-TW":"活動內容"}',NULL),
 ('products',60,'{"ko":"주요 제품·가격","en":"Products & prices","ja":"主な商品・価格","zh-CN":"主要商品与价格","zh-TW":"主要商品與價格"}',3),
 ('benefits',70,'{"ko":"혜택·조건","en":"Offers & conditions","ja":"特典・条件","zh-CN":"优惠与条件","zh-TW":"優惠與條件"}',NULL),
 ('foreign_visitors',80,'{"ko":"해외 방문객 안내","en":"International visitors","ja":"海外からの訪問者向け案内","zh-CN":"海外游客须知","zh-TW":"海外旅客須知"}',NULL),
 ('location_transit',90,'{"ko":"장소·교통","en":"Location & transport","ja":"場所・交通","zh-CN":"地点与交通","zh-TW":"地點與交通"}',NULL),
 ('sources_support',100,'{"ko":"기타 안내·출처","en":"More information & sources","ja":"その他の案内・出典","zh-CN":"其他信息与来源","zh-TW":"其他資訊與來源"}',NULL);

CREATE OR REPLACE FUNCTION public.busan_content_touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END; $$;
CREATE TRIGGER touch_updated_at BEFORE UPDATE ON public.busan_content_events FOR EACH ROW EXECUTE FUNCTION public.busan_content_touch_updated_at();
CREATE TRIGGER touch_updated_at BEFORE UPDATE ON public.busan_content_venues FOR EACH ROW EXECUTE FUNCTION public.busan_content_touch_updated_at();
CREATE TRIGGER touch_updated_at BEFORE UPDATE ON public.busan_content_event_venues FOR EACH ROW EXECUTE FUNCTION public.busan_content_touch_updated_at();
CREATE TRIGGER touch_updated_at BEFORE UPDATE ON public.busan_content_products FOR EACH ROW EXECUTE FUNCTION public.busan_content_touch_updated_at();
ALTER TABLE public.busan_content_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.busan_content_events FROM anon, authenticated;
GRANT ALL ON public.busan_content_events TO service_role;
ALTER TABLE public.busan_content_venues ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.busan_content_venues FROM anon, authenticated;
GRANT ALL ON public.busan_content_venues TO service_role;
ALTER TABLE public.busan_content_event_venues ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.busan_content_event_venues FROM anon, authenticated;
GRANT ALL ON public.busan_content_event_venues TO service_role;
ALTER TABLE public.busan_content_opening_hours ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.busan_content_opening_hours FROM anon, authenticated;
GRANT ALL ON public.busan_content_opening_hours TO service_role;
ALTER TABLE public.busan_content_schedule_exceptions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.busan_content_schedule_exceptions FROM anon, authenticated;
GRANT ALL ON public.busan_content_schedule_exceptions TO service_role;
ALTER TABLE public.busan_content_admission_prices ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.busan_content_admission_prices FROM anon, authenticated;
GRANT ALL ON public.busan_content_admission_prices TO service_role;
ALTER TABLE public.busan_content_products ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.busan_content_products FROM anon, authenticated;
GRANT ALL ON public.busan_content_products TO service_role;
ALTER TABLE public.busan_content_product_variants ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.busan_content_product_variants FROM anon, authenticated;
GRANT ALL ON public.busan_content_product_variants TO service_role;
ALTER TABLE public.busan_content_benefits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.busan_content_benefits FROM anon, authenticated;
GRANT ALL ON public.busan_content_benefits TO service_role;
ALTER TABLE public.busan_content_payment_methods ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.busan_content_payment_methods FROM anon, authenticated;
GRANT ALL ON public.busan_content_payment_methods TO service_role;
ALTER TABLE public.busan_content_evidence ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.busan_content_evidence FROM anon, authenticated;
GRANT ALL ON public.busan_content_evidence TO service_role;
ALTER TABLE public.busan_content_display_sections ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.busan_content_display_sections FROM anon, authenticated;
GRANT ALL ON public.busan_content_display_sections TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.busan_content_opening_hours_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.busan_content_schedule_exceptions_id_seq TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.busan_content_evidence_id_seq TO service_role;
GRANT SELECT ON public.busan_content_events TO anon,authenticated;
CREATE POLICY published_read ON public.busan_content_events FOR SELECT TO anon,authenticated USING (publication_status='published');
GRANT SELECT ON public.busan_content_venues TO anon,authenticated;
CREATE POLICY published_read ON public.busan_content_venues FOR SELECT TO anon,authenticated USING (EXISTS(SELECT 1 FROM public.busan_content_event_venues ev JOIN public.busan_content_events e ON e.id=ev.event_id WHERE ev.venue_id=busan_content_venues.id AND e.publication_status='published'));
GRANT SELECT ON public.busan_content_event_venues TO anon,authenticated;
CREATE POLICY published_read ON public.busan_content_event_venues FOR SELECT TO anon,authenticated USING (EXISTS(SELECT 1 FROM public.busan_content_events e WHERE e.id=event_id AND e.publication_status='published'));
GRANT SELECT ON public.busan_content_opening_hours TO anon,authenticated;
CREATE POLICY published_read ON public.busan_content_opening_hours FOR SELECT TO anon,authenticated USING (EXISTS(SELECT 1 FROM public.busan_content_event_venues ev JOIN public.busan_content_events e ON e.id=ev.event_id WHERE ev.id=event_venue_id AND e.publication_status='published'));
GRANT SELECT ON public.busan_content_schedule_exceptions TO anon,authenticated;
CREATE POLICY published_read ON public.busan_content_schedule_exceptions FOR SELECT TO anon,authenticated USING (EXISTS(SELECT 1 FROM public.busan_content_event_venues ev JOIN public.busan_content_events e ON e.id=ev.event_id WHERE ev.id=event_venue_id AND e.publication_status='published'));
GRANT SELECT ON public.busan_content_admission_prices TO anon,authenticated;
CREATE POLICY published_read ON public.busan_content_admission_prices FOR SELECT TO anon,authenticated USING (EXISTS(SELECT 1 FROM public.busan_content_event_venues ev JOIN public.busan_content_events e ON e.id=ev.event_id WHERE ev.id=event_venue_id AND e.publication_status='published'));
GRANT SELECT ON public.busan_content_products TO anon,authenticated;
CREATE POLICY published_read ON public.busan_content_products FOR SELECT TO anon,authenticated USING (EXISTS(SELECT 1 FROM public.busan_content_event_venues ev JOIN public.busan_content_events e ON e.id=ev.event_id WHERE ev.id=event_venue_id AND e.publication_status='published'));
GRANT SELECT ON public.busan_content_product_variants TO anon,authenticated;
CREATE POLICY published_read ON public.busan_content_product_variants FOR SELECT TO anon,authenticated USING (EXISTS(SELECT 1 FROM public.busan_content_products p JOIN public.busan_content_event_venues ev ON ev.id=p.event_venue_id JOIN public.busan_content_events e ON e.id=ev.event_id WHERE p.id=product_id AND e.publication_status='published'));
GRANT SELECT ON public.busan_content_benefits TO anon,authenticated;
CREATE POLICY published_read ON public.busan_content_benefits FOR SELECT TO anon,authenticated USING (EXISTS(SELECT 1 FROM public.busan_content_event_venues ev JOIN public.busan_content_events e ON e.id=ev.event_id WHERE ev.id=event_venue_id AND e.publication_status='published'));
GRANT SELECT ON public.busan_content_payment_methods TO anon,authenticated;
CREATE POLICY published_read ON public.busan_content_payment_methods FOR SELECT TO anon,authenticated USING (EXISTS(SELECT 1 FROM public.busan_content_event_venues ev JOIN public.busan_content_events e ON e.id=ev.event_id WHERE ev.id=event_venue_id AND e.publication_status='published'));
GRANT SELECT ON public.busan_content_display_sections TO anon,authenticated;
CREATE POLICY published_read ON public.busan_content_display_sections FOR SELECT TO anon,authenticated USING (true);
CREATE INDEX ON public.busan_content_event_venues(event_id);
CREATE INDEX ON public.busan_content_event_venues(venue_id);
CREATE INDEX ON public.busan_content_opening_hours(event_venue_id);
CREATE INDEX ON public.busan_content_schedule_exceptions(event_venue_id);
CREATE INDEX ON public.busan_content_admission_prices(event_venue_id);
CREATE INDEX ON public.busan_content_products(event_venue_id);
CREATE INDEX ON public.busan_content_product_variants(product_id);
CREATE INDEX ON public.busan_content_benefits(event_venue_id);
CREATE INDEX ON public.busan_content_evidence(event_venue_id);
CREATE INDEX ON public.busan_content_events(publication_status,category);
COMMENT ON TABLE public.busan_content_event_venues IS '행사-지점별 방문 조건. unknown은 불가나 가능으로 해석하지 않음. 시간대 Asia/Seoul.';
COMMENT ON TABLE public.busan_content_product_variants IS '제품 판매가격. 입장료와 분리. reported는 참고가이며 재고 보장이 아님.';
COMMENT ON TABLE public.busan_content_evidence IS '내부 검증 이력. 공개 조회 불가. 사용자 정보는 저장하지 않음.';
COMMIT;
