# 코지브루 (CozyBrew) ☕

> 홈카페의 하루를 담은 가상의 커피 머신·용품 브랜드샵

<br> 에스프레소 머신·그라인더·캡슐 머신·드립 용품을 둘러보고 **상품 → 장바구니 → 결제 → 주문/리뷰**로 이어지는 쇼핑 흐름에, 브랜드 스토리·홈카페 가이드까지 담은 반응형 웹 사이트입니다.
<br>

<br> 🔗 **데모**
- GitHub Pages: https://jhc2265.github.io/cozybrew/ &nbsp;
- 로그인 또는 회원가입 화면에서 **버튼을 5번 연속 클릭** → 테스트용 계정의 폼이 자동 입력됩니다.

---

## ✨ 주요 기능

- **메인 히어로 & 스크롤 모션** — GSAP + ScrollTrigger 기반 히어로 등장 연출 · 스크롤에 맞춘 섹션·카드 등장 애니메이션 (`prefers-reduced-motion` 존중)
- **상품 목록** — 4개 카테고리(에스프레소 머신·그라인더·캡슐·용품) 필터 · 가격/타입 필터 · 정렬 · 표시 개수 선택
- **상품 상세** — 다중 이미지 갤러리, 수량 선택·장바구니·바로구매, **스펙표 · 에디토리얼(스토리) · 상세 카드 · 별점·리뷰 분포·후기 · 추천 상품 · FAQ**
- **장바구니 ↔ 결제 연동** — 수량·금액·배송비 실시간 계산, 우편번호 검색(Daum 우편번호 서비스)
- **주문 / 주문조회** — 결제 완료 흐름 · 비회원 주문조회 · 배송조회
- **로그인 / 회원가입** — 데모 인증(휴대폰·이메일 **데모 인증번호** 표시), 로그인 상태에 따른 헤더 전환(마이페이지·장바구니·로그아웃)
- **🥚 이스터에그** — 로그인/회원가입 폼에서 버튼을 **5번 연속** 누르면 테스트 계정 자동 입력
- **마이페이지** — 주문내역 · 배송지 · 쿠폰 · 적립금 · 1:1 문의 내역
- **브랜드 · 스토리 · 가이드** — 브랜드 소개/철학/쇼룸(+예약), 홈카페 아이디어·스타일링·매거진, 브루잉·관리·설치·제품선택 가이드
- **검색** — 헤더 검색(모바일은 메뉴 내) → 상품 검색 결과
- **완전 반응형** — 모바일 햄버거 메뉴 · Grid/Flexbox 레이아웃 · 카드 호버 인터랙션

---

## 🧪 테스트 계정 (둘러보기용)

회원 정보를 직접 입력하지 않아도 기능을 체험할 수 있어요.

- 로그인 또는 회원가입 화면에서 **버튼을 5번 연속 클릭**(1.5초 내) → 폼이 자동 입력됩니다.
- 이메일 `test@cozybrew.com` / 비밀번호 `Test1234!`
- 테스트 계정으로 로그인하면 데모 **주문 내역·쿠폰·적립금·문의 내역**이 채워져, 마이페이지까지 바로 확인할 수 있습니다.

---

## 🛠 기술 스택

- **Frontend** — HTML / CSS / JavaScript (빌드 도구 없는 정적 사이트)
- **상태/인터랙션** — Vanilla JS · `localStorage`(계정·로그인 세션·1:1 문의) · `IntersectionObserver`
- **애니메이션** — GSAP · ScrollTrigger *(self-hosted, `vendor/gsap`)*
- **서비스** — Daum 우편번호 서비스(주소 검색)
- **웹폰트** — Paperlogy (Regular~ExtraBold 5종, self-hosted TTF · `preload`)
- **이미지** — 상품 상세 갤러리·스펙·카드 등 전 이미지 **WebP 최적화**
- **호스팅** — GitHub Pages

---

## 🚀 실행 방법

### 로컬 서버로 보기 (권장)
```bash
# 둘 중 아무거나
python -m http.server 8000        # → http://localhost:8000
# 또는 VS Code의 "Live Server" 확장 사용
```
> `file://`(더블클릭)에서도 대부분 동작하지만, 웹폰트·우편번호 검색 등 일부 기능은 로컬 서버에서 더 안정적입니다.

> 💡 CSS/JS는 캐시 무효화를 위해 `?v=YYYYMMDD-xx` 쿼리를 붙여 로드합니다. `css/style.css`·`js/site.js`를 수정하면 모든 HTML의 버전 문자열을 함께 올려야 재방문자에게 최신본이 반영됩니다.

---

## 🌐 배포 (GitHub Pages)

정적 사이트라 GitHub Pages로 바로 배포할 수 있습니다.

1. 저장소를 GitHub에 푸시 (이 폴더가 저장소 루트가 되도록, `index.html`이 최상단)
2. **Settings → Pages → Build and deployment**
3. Source를 **Deploy from a branch**, 브랜치를 `main` / 루트(`/`)로 지정
4. 발급된 URL로 접속

---

## 📁 폴더 구조

```
cozybrew/                        # 저장소 루트
├── index.html                   # 메인 페이지
├── products.html                # 상품 목록 (필터·정렬)
├── product-detail.html          # 상품 상세 (갤러리·스펙·리뷰·FAQ)
├── search.html                  # 검색 결과
├── cart.html / order.html / order-lookup.html      # 장바구니·결제·주문조회
├── login.html / join.html / find-password.html     # 로그인·회원가입·비밀번호 찾기
├── mypage.html / mypage-orders.html / mypage-delivery.html
│   ├── mypage-coupons.html / mypage-points.html / mypage-inquiries.html
├── brand.html / brand-philosophy.html / brand-showroom.html / showroom-reserve.html
├── story-idea.html / story-styling.html / story-magazine.html / story-detail.html / style-recommend.html
├── guide-brewing.html / guide-care.html / guide-install.html / guide-select.html
├── support.html / support-faq.html / support-as.html / support-delivery.html
├── notice-detail.html / terms.html / privacy.html
├── css/
│   └── style.css                # 전체 스타일 (공통·메인·상세·반응형)
├── js/
│   └── site.js                  # 전체 로직 (상품 데이터·장바구니·주문·리뷰·인증·애니메이션)
├── image/                       # 이미지 (WebP 최적화) · 아이콘
│   ├── detail/                  # 상품 상세 갤러리·스펙·카드
│   ├── story/ · guide/ · icons/
├── font/                        # Paperlogy (self-hosted TTF)
└── vendor/gsap/                 # GSAP + ScrollTrigger
```

---

## ⚠️ 데모 한계 (참고)

- 백엔드가 없어 **로그인·결제·주문·리뷰·문의**는 브라우저 `localStorage` 기반 데모입니다. 기기/브라우저 간 공유되지 않고, 데이터 삭제 시 초기화됩니다.
- 휴대폰·이메일 **인증번호**는 실제 발송이 아니라 화면에 표시되는 데모 값입니다.
- 상품의 **별점·후기·주문/적립금** 등은 데모용으로 생성된 값입니다.

---

## 📝 라이선스 / 권리

- 개인 **학습·포트폴리오** 목적의 가상 커피 브랜드샵입니다. 실재하는 브랜드가 아닙니다.
- 사용한 라이브러리·폰트는 각 제공처의 라이선스를 따릅니다 (GSAP · Paperlogy 등).
- 상품·배경 이미지는 데모용 예시 자산입니다. 상업적 사용을 금합니다.
