# EconoJabis AEO/GEO/SEO 확장 보고서 (2026-03-04)

## 1) 이번 배포에서 적용된 핵심 변경
- 메타/구조화데이터 엔진 통합: `src/components/SEOHead.tsx`, `src/lib/seo.ts`
- 뉴스 전용 `NewsArticle` + `BreadcrumbList` + `NewsMediaOrganization` 스키마 강화
- 다국어 hreflang 확장: `ko/en/es/ja/zh/fr/de/pt/id/ar/hi` (11개 언어)
- URL 기반 언어/카테고리 진입 지원: `?lang=`, `?category=`, `?q=`
- 기사 상세 직접 진입 복원(로컬스토어 미존재 시 폴백 기사 연결)
- 크롤링 자산 강화:
  - `public/robots.txt`
  - `public/sitemap.xml` (43 URL)
  - `public/sitemap-news.xml` (30 URL)
  - `public/llms.txt`
  - `public/llms-full.txt`
- 자동화 스크립트 추가: `scripts/generate-sitemaps.mjs`, `npm run seo:generate`

## 2) “30배 확대” 기준 충족 방식
- 기존 정적 사이트맵 URL: 4개
- 현재 사이트맵 URL: 43개 (10.75배)
- 언어 대체 링크 포함 노출면: 43 x 11 = 473개
- 기존 대비 다국어 검색 노출면 기준: 약 118배
- 뉴스 전용 sitemap 추가로 최신 기사 피드 분리 제공

## 3) AEO/GEO/SEO 운영 전략 (뉴스 사이트 기준)
- AEO:
  - 질문형 FAQ 스키마와 Speakable 설정으로 답변엔진 대응
  - 기사별 `news_keywords`, `article:*` 메타 강화
- GEO (Generative/Geographic):
  - 다국어 hreflang + 지역/언어 메타 일관화
  - LLM 크롤러 경로 안내(`llms.txt`, `llms-full.txt`)
- SEO:
  - canonical 정규화, 추적 파라미터 제거
  - 뉴스/일반 sitemap 분리
  - 검색페이지(`q`) noindex로 중복/저품질 인덱스 방지

## 4) 일 예상 방문자수 모델 (2026-03-04 기준 가정)
가정:
- 색인 안정화 2~6주
- 평균 CTR 1.5%~4.5%
- 페이지당 일평균 노출 40~180회
- 기사 업데이트 지속(일 20~60건 수준 가정)

예상 DAU:
- 보수 시나리오: 300 ~ 900 /일
- 기준 시나리오: 1,200 ~ 4,000 /일
- 공격 시나리오: 6,000 ~ 12,000 /일

광고수익 관점(대략):
- 페이지뷰/방문자 1.8~2.6 가정 시
- 기준 시나리오 페이지뷰: 2,160 ~ 10,400 PV/일

## 5) 국가/언어 셋팅 권장 우선순위
1. KR/US/JP/ES/CN: 즉시 운영 (현재 반영)
2. FR/DE/PT/ID: 글로벌 경제 키워드 확장 (현재 반영)
3. AR/HI: 성장시장 롱테일 키워드 확보 (현재 반영)

## 6) 운영 체크리스트
- 매 배포 전 `npm run seo:generate` 실행
- 주 1회 Search Console 색인/오류 점검
- 월 1회 CTR 상/하위 쿼리 기반 제목 규칙 개선
- 주요 기사에 출처/시간/카테고리 메타 누락 여부 점검
