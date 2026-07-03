(() => {
  const won = (value) => `₩ ${value.toLocaleString("ko-KR")}`;

  /* ============================================================
     로그인 상태 / 장바구니 수량 (데모용 클라이언트 상태)
     ※ 백엔드가 없는 정적 사이트라 localStorage로 상태만 흉내냅니다.
     ============================================================ */
  const AUTH_KEY = "cozybrew_login";
  const CART_KEY = "cozybrew_cart";
  const isLoggedIn = () => { try { return localStorage.getItem(AUTH_KEY) === "1"; } catch (e) { return false; } };
  const setLogin = (on) => { try { on ? localStorage.setItem(AUTH_KEY, "1") : localStorage.removeItem(AUTH_KEY); } catch (e) {} };
  const getCart = () => {
    try {
      const v = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(v) ? v.filter((x) => x && x.id && Number(x.qty) > 0) : [];
    } catch (e) { return []; }
  };
  const saveCart = (arr) => { try { localStorage.setItem(CART_KEY, JSON.stringify(arr)); } catch (e) {} };
  const cartCount = () => getCart().length;
  // 장바구니 뱃지 갱신: 0이면 뱃지를 숨겨 빈 원이 보이지 않게 한다
  const setCartBadge = (el, count) => {
    if (!el) return;
    const n = Number(count) || 0;
    el.textContent = n > 0 ? String(n) : "";
    el.hidden = n <= 0;
  };
  const addToCart = (id, qty) => {
    const amount = Math.max(1, Number(qty) || 1);
    const cart = getCart();
    const line = cart.find((x) => x.id === id);
    if (line) line.qty = Number(line.qty) + amount; else cart.push({ id, qty: amount });
    saveCart(cart);
  };

  /* 하단 토스트 알림 (담기 성공 등 즉각 피드백용) */
  let toastTimer = null;
  const showToast = (message, actionText, actionHref) => {
    let toast = document.querySelector(".cb-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "cb-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<span class="cb-toast-msg"></span>';
    toast.querySelector(".cb-toast-msg").textContent = message;
    if (actionText && actionHref) {
      const a = document.createElement("a");
      a.className = "cb-toast-action";
      a.href = actionHref;
      a.textContent = actionText;
      toast.appendChild(a);
    }
    void toast.offsetHeight;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
  };

  /* 필드 하단 인라인 에러 메시지 (브라우저 기본 말풍선 대체) */
  const setFieldError = (input, message) => {
    if (!input) return;
    const host = input.closest("label") || input.parentElement;
    let msg = host.querySelector(".field-error");
    if (message) {
      if (!msg) {
        msg = document.createElement("p");
        msg.className = "field-error";
        host.appendChild(msg);
      }
      msg.textContent = message;
      input.setAttribute("aria-invalid", "true");
    } else if (msg) {
      msg.remove();
      input.removeAttribute("aria-invalid");
    }
  };

  /* ============================================================
     공유 제품 데이터 (카탈로그 + 상세 페이지 공용)
     ============================================================ */
  const PRODUCTS = [
    {
      id: "bex-300", category: "espresso", badge: "BEST",
      name: "시그니처 에스프레소 머신 BEX-300", price: 549000,
      image: "./image/sec01_1.webp?v=norm1",
      images: ["./image/sec01_1.webp?v=norm1", "./image/product_espresso_black.webp?v=norm1", "./image/brand_life_machine.webp"],
      color: "실버", components: "본체, 포터필터, 스팀피처, 관리 브러시",
      summary: "풍부한 크레마와 스팀 성능을 모두 갖춘 프리미엄 머신",
      desc: "풍부한 크레마와 안정적인 스팀 성능을 모두 갖춘 프리미엄 홈카페 머신입니다. 매일의 커피 루틴을 더 섬세하고 편안하게 완성해보세요.",
      points: [
        { t: "안정적인 추출 온도", d: "예열과 추출 온도를 일정하게 유지해 맛의 균형을 잡아줍니다." },
        { t: "섬세한 스팀 성능", d: "라떼와 카푸치노에 어울리는 부드러운 밀크폼을 쉽게 만들 수 있습니다." },
        { t: "홈카페에 맞는 크기", d: "주방과 거실 어디에 두어도 부담 없는 비율과 차분한 실버 톤입니다." }
      ],
      spec: { model: "BEX-300", size: "W 285 x D 310 x H 330mm", weight: "약 6.8kg", volt: "220V / 60Hz", power: "1350W", pump: "15Bar", tank: "1.8L (분리형)", warranty: "구매일로부터 1년" },
      story: {
        title: "매일 쓰기 좋은 홈카페 머신",
        body: "BEX-300은 버튼 배치와 스팀 노즐, 물받이 구조까지 자주 사용하는 동선을 기준으로 정리했습니다. 필요한 기능만 또렷하게 담아 커피 한 잔을 준비하는 시간이 복잡하지 않습니다.",
        bullets: ["15bar 압력 추출 시스템", "분리형 물탱크와 물받이", "싱글/더블 샷 대응 포터필터", "간편 세척 가능한 스팀 노즐"]
      }
    },
    {
      id: "bex-200", category: "espresso",
      name: "에스프레소 머신 BEX-200", price: 349000,
      image: "./image/product_espresso_black.webp?v=norm1",
      images: ["./image/product_espresso_black.webp?v=norm1", "./image/sec01_1.webp?v=norm1", "./image/brand_life_machine.webp"],
      color: "매트 블랙", components: "본체, 포터필터, 스팀피처",
      summary: "작은 공간에도 잘 어울리는 컴팩트 홈카페 머신",
      desc: "작은 공간에도 잘 어울리는 컴팩트한 본체에 안정적인 추출 성능을 담았습니다. 처음 에스프레소를 시작하는 분께도 부담 없는 모델입니다.",
      points: [
        { t: "컴팩트한 사이즈", d: "좁은 주방 선반에도 무리 없이 들어가는 슬림한 폭입니다." },
        { t: "균형 잡힌 추출", d: "기본에 충실한 압력과 온도로 일관된 한 잔을 내려줍니다." },
        { t: "쉬운 관리", d: "분리형 부품으로 세척과 유지 관리가 간편합니다." }
      ],
      spec: { model: "BEX-200", size: "W 250 x D 300 x H 320mm", weight: "약 5.6kg", volt: "220V / 60Hz", power: "1250W", pump: "15Bar", tank: "1.5L (분리형)", warranty: "구매일로부터 1년" },
      story: {
        title: "처음 시작하기 좋은 한 대",
        body: "복잡한 설정 없이 바로 쓸 수 있도록 핵심 기능만 담았습니다. 데일리 홈카페에 필요한 추출과 스팀을 모두 갖췄습니다.",
        bullets: ["15bar 압력 추출", "컴팩트 바디", "분리형 물탱크", "스팀 노즐 기본 제공"]
      }
    },
    {
      id: "bex-150", category: "espresso",
      name: "컴팩트 에스프레소 머신 BEX-150", price: 299000,
      image: "./image/product_espresso_bex150_black.webp?v=norm1",
      images: ["./image/product_espresso_bex150_black.webp?v=norm1", "./image/product_espresso_black.webp?v=norm1", "./image/category_espresso_hero.webp"],
      color: "매트 블랙", components: "본체, 포터필터",
      summary: "처음 홈카페를 시작하는 분을 위한 입문형 머신",
      desc: "꼭 필요한 기능만 담아 가볍게 시작할 수 있는 입문형 에스프레소 머신입니다. 합리적인 가격으로 홈카페의 첫걸음을 떼어보세요.",
      points: [
        { t: "입문에 최적", d: "간단한 조작으로 누구나 쉽게 에스프레소를 추출할 수 있습니다." },
        { t: "가벼운 무게", d: "이동과 보관이 편한 가벼운 바디입니다." },
        { t: "합리적인 가격", d: "부담 없이 홈카페를 시작하기 좋은 가격대입니다." }
      ],
      spec: { model: "BEX-150", size: "W 240 x D 290 x H 310mm", weight: "약 4.9kg", volt: "220V / 60Hz", power: "1100W", pump: "15Bar", tank: "1.2L (분리형)", warranty: "구매일로부터 1년" },
      story: {
        title: "가볍게 시작하는 홈카페",
        body: "기본 추출에 집중한 구성으로, 처음 에스프레소를 접하는 분도 어렵지 않게 사용할 수 있습니다. 가벼운 바디와 합리적인 가격으로 홈카페의 첫걸음에 부담이 없습니다.",
        bullets: ["입문형 추출 시스템", "간단한 버튼 조작", "분리형 물탱크", "콤팩트 디자인"]
      }
    },
    {
      id: "beu-100", category: "espresso",
      name: "바리스타 에스프레소 머신 BEU-100", price: 399000,
      image: "./image/product_espresso_bex100_silver.webp?v=norm1",
      images: ["./image/product_espresso_bex100_silver.webp?v=norm1", "./image/sec01_1.webp?v=norm1", "./image/brand_life_machine.webp"],
      color: "스테인리스", components: "본체, 포터필터, 스팀피처, 탬퍼",
      summary: "섬세한 스팀과 압력 조절을 갖춘 고급형 머신",
      desc: "압력과 스팀을 세밀하게 다룰 수 있는 고급형 머신으로, 한층 깊이 있는 추출을 원하는 분께 어울립니다.",
      points: [
        { t: "정밀 압력 조절", d: "원두와 취향에 맞춰 추출 압력을 세밀하게 맞출 수 있습니다." },
        { t: "프로급 스팀", d: "강하고 안정적인 스팀으로 라떼아트도 자유롭게 연출됩니다." },
        { t: "견고한 마감", d: "스테인리스 소재로 오래 사용해도 깔끔함을 유지합니다." }
      ],
      spec: { model: "BEU-100", size: "W 290 x D 320 x H 340mm", weight: "약 7.4kg", volt: "220V / 60Hz", power: "1450W", pump: "15Bar", tank: "2.0L (분리형)", warranty: "구매일로부터 1년" },
      story: {
        title: "한 잔에 더 깊이를 더하다",
        body: "추출의 변수를 직접 다루고 싶은 홈바리스타를 위한 모델입니다. 압력과 스팀을 조절하며 나만의 레시피를 완성해보세요.",
        bullets: ["가변 압력 추출", "강력한 스팀 보일러", "스테인리스 바디", "탬퍼 기본 제공"]
      }
    },
    {
      id: "co-200", category: "grinder", badge: "BEST",
      name: "코지 버 그라인더 CO-200", price: 389000,
      image: "./image/product_grinder_black.webp?v=norm1",
      images: ["./image/product_grinder_black.webp?v=norm1", "./image/product_grinder_silver.webp?v=norm1", "./image/brand_life_coffee.webp"],
      color: "매트 블랙", components: "본체, 원두 호퍼, 가루받이, 청소솔",
      summary: "원두의 향을 살리는 균일한 입도 분쇄",
      desc: "균일한 입도로 원두 본연의 향을 살려주는 버 그라인더입니다. 에스프레소부터 핸드드립까지 폭넓은 단계를 지원합니다.",
      points: [
        { t: "균일한 입도", d: "정밀 버가 일정한 굵기로 분쇄해 추출 편차를 줄여줍니다." },
        { t: "다양한 단계", d: "에스프레소부터 드립까지 폭넓은 분쇄 단계를 제공합니다." },
        { t: "향 보존 설계", d: "발열을 낮춰 원두의 아로마를 최대한 보존합니다." }
      ],
      spec: { model: "CO-200", size: "W 130 x D 180 x H 350mm", weight: "약 3.2kg", volt: "220V / 60Hz", power: "150W", pump: "해당 없음", tank: "해당 없음", warranty: "구매일로부터 1년" },
      story: {
        title: "추출의 시작, 분쇄",
        body: "좋은 한 잔은 균일한 분쇄에서 시작합니다. CO-200은 단계별 조절과 안정적인 버 구조로 매일의 추출을 일정하게 만들어줍니다.",
        bullets: ["코니컬 버 방식", "단계별 입도 조절", "정전기 저감 설계", "분리형 가루받이"]
      }
    },
    {
      id: "fg-100", category: "grinder",
      name: "클래식 버 그라인더 FG-100", price: 290000,
      image: "./image/product_grinder_silver.webp?v=norm1",
      images: ["./image/product_grinder_silver.webp?v=norm1", "./image/product_grinder_black.webp?v=norm1"],
      color: "실버", components: "본체, 원두 호퍼, 가루받이",
      summary: "홈카페에 어울리는 정밀 분쇄 그라인더",
      desc: "클래식한 디자인에 정밀한 분쇄 성능을 담은 그라인더입니다. 데일리 홈카페에 어울리는 균형 잡힌 모델입니다.",
      points: [
        { t: "정밀 분쇄", d: "일정한 입도로 안정적인 추출을 돕습니다." },
        { t: "클래식 디자인", d: "어떤 주방에도 잘 어울리는 단정한 실버 톤입니다." },
        { t: "조용한 작동", d: "저소음 모터로 아침에도 편하게 사용할 수 있습니다." }
      ],
      spec: { model: "FG-100", size: "W 125 x D 175 x H 340mm", weight: "약 2.9kg", volt: "220V / 60Hz", power: "120W", pump: "해당 없음", tank: "해당 없음", warranty: "구매일로부터 1년" },
      story: {
        title: "매일의 분쇄를 단정하게",
        body: "필요한 만큼 간편하게 갈아 쓰기 좋은 구성입니다. 분쇄 단계를 돌려 취향에 맞게 조절해보세요.",
        bullets: ["스텝식 입도 조절", "저소음 모터", "분리형 호퍼", "간편 세척 구조"]
      }
    },
    {
      id: "hg-80", category: "grinder",
      name: "홈 그라인더 HG-80", price: 179000,
      image: "./image/product_grinder_hg80_black.webp?v=norm1",
      images: ["./image/product_grinder_hg80_black.webp?v=norm1", "./image/product_grinder_black.webp?v=norm1", "./image/category_grinder_hero.webp"],
      color: "매트 블랙", components: "본체, 가루받이",
      summary: "작은 공간에 어울리는 데일리 그라인더",
      desc: "작은 공간에도 부담 없는 콤팩트 그라인더입니다. 매일 한두 잔을 내리는 데 알맞은 합리적인 모델입니다.",
      points: [
        { t: "콤팩트 사이즈", d: "좁은 공간에도 자리 잡기 좋은 작은 크기입니다." },
        { t: "간편 조작", d: "버튼 하나로 손쉽게 분쇄할 수 있습니다." },
        { t: "데일리용", d: "매일 한두 잔을 즐기기에 알맞은 용량입니다." }
      ],
      spec: { model: "HG-80", size: "W 110 x D 150 x H 300mm", weight: "약 2.1kg", volt: "220V / 60Hz", power: "100W", pump: "해당 없음", tank: "해당 없음", warranty: "구매일로부터 1년" },
      story: {
        title: "작지만 충실한 한 대",
        body: "공간은 아끼고 기본기는 챙긴 데일리 그라인더입니다. 부담 없이 매일의 커피를 준비해보세요.",
        bullets: ["콤팩트 바디", "원터치 분쇄", "분리형 가루받이", "가벼운 무게"]
      }
    },
    {
      id: "mg-01", category: "grinder",
      name: "수동 그라인더 MG-01", price: 89000,
      image: "./image/product_grinder_mg01_manual.webp?v=norm1",
      images: ["./image/product_grinder_mg01_manual.webp?v=norm1", "./image/product_grinder_silver.webp?v=norm1", "./image/brand_life_coffee.webp"],
      color: "실버", components: "본체, 핸들, 분쇄도 조절 너트",
      summary: "가볍게 즐기는 핸드밀 타입 그라인더",
      desc: "전기 없이 손으로 천천히 갈아 즐기는 핸드밀입니다. 캠핑이나 여행에서도 신선한 분쇄를 즐길 수 있습니다.",
      points: [
        { t: "휴대성", d: "전원이 필요 없어 어디서든 분쇄할 수 있습니다." },
        { t: "세라믹 버", d: "발열이 적은 세라믹 버로 향을 보존합니다." },
        { t: "정숙성", d: "조용히 갈 수 있어 이른 아침에도 부담이 없습니다." }
      ],
      spec: { model: "MG-01", size: "W 50 x D 50 x H 180mm", weight: "약 0.4kg", volt: "수동(전원 불필요)", power: "수동(전원 불필요)", pump: "해당 없음", tank: "해당 없음", warranty: "구매일로부터 1년" },
      story: {
        title: "천천히, 손으로 내리는 커피",
        body: "분쇄하는 시간조차 즐거움이 되는 핸드밀입니다. 분쇄도 조절로 드립부터 프렌치프레스까지 대응합니다.",
        bullets: ["세라믹 코니컬 버", "무단 분쇄도 조절", "휴대용 사이즈", "분리 세척 가능"]
      }
    },
    {
      id: "cc-10", category: "capsule", badge: "BEST",
      name: "컴팩트 캡슐머신 CC-10", price: 190000,
      image: "./image/product_capsule_cream.webp?v=norm1",
      images: ["./image/product_capsule_cream.webp?v=norm1", "./image/category_capsule_hero.webp", "./image/brand_life_coffee.webp"],
      color: "크림", components: "본체, 물탱크, 캡슐 트레이",
      summary: "간편하게 즐기는 풍부한 커피 아로마",
      desc: "캡슐을 넣고 버튼만 누르면 완성되는 간편한 캡슐머신입니다. 바쁜 아침에도 풍부한 아로마의 한 잔을 빠르게 즐기세요.",
      points: [
        { t: "원터치 추출", d: "버튼 한 번으로 일정한 맛의 커피가 완성됩니다." },
        { t: "빠른 예열", d: "짧은 예열 시간으로 기다림을 줄였습니다." },
        { t: "간편 관리", d: "사용한 캡슐은 트레이에 모여 정리가 쉽습니다." }
      ],
      spec: { model: "CC-10", size: "W 130 x D 250 x H 280mm", weight: "약 3.0kg", volt: "220V / 60Hz", power: "1200W", pump: "19Bar", tank: "0.8L", warranty: "구매일로부터 1년" },
      story: {
        title: "바쁜 아침을 위한 한 잔",
        body: "복잡한 과정 없이 캡슐 하나로 완성되는 데일리 커피입니다. 누구나 같은 맛을 손쉽게 즐길 수 있습니다.",
        bullets: ["원터치 추출", "19bar 펌프", "자동 캡슐 배출", "분리형 물탱크"]
      }
    },
    {
      id: "cc-s10", category: "capsule",
      name: "슬림 캡슐머신 CC-S10", price: 150000,
      image: "./image/product_capsule_ccs10_slim.webp?v=norm1",
      images: ["./image/product_capsule_ccs10_slim.webp?v=norm1", "./image/product_capsule_cream.webp?v=norm1", "./image/category_capsule_hero.webp"],
      color: "크림", components: "본체, 물탱크, 캡슐 트레이",
      summary: "좁은 공간에도 편리한 슬림 타입 머신",
      desc: "폭을 줄인 슬림 바디로 좁은 공간에도 잘 어울리는 캡슐머신입니다. 간결한 디자인으로 어디에나 자연스럽게 놓입니다.",
      points: [
        { t: "슬림 바디", d: "좁은 틈에도 들어가는 얇은 폭입니다." },
        { t: "간편 추출", d: "버튼 조작으로 손쉽게 커피를 내립니다." },
        { t: "조용한 작동", d: "작동 소음을 줄여 더 편안합니다." }
      ],
      spec: { model: "CC-S10", size: "W 90 x D 320 x H 290mm", weight: "약 2.6kg", volt: "220V / 60Hz", power: "1150W", pump: "19Bar", tank: "0.6L", warranty: "구매일로부터 1년" },
      story: {
        title: "공간을 아끼는 슬림 캡슐머신",
        body: "좁은 주방에서도 자리 걱정 없이 쓸 수 있도록 폭을 줄였습니다. 깔끔한 라인으로 인테리어에도 잘 어울립니다.",
        bullets: ["슬림 디자인", "원터치 추출", "분리형 물탱크", "자동 캡슐 배출"]
      }
    },
    {
      id: "cc-mini", category: "capsule",
      name: "미니 캡슐머신 CC-Mini", price: 129000,
      image: "./image/product_capsule_ccmini_ivory.webp?v=norm1",
      images: ["./image/product_capsule_ccmini_ivory.webp?v=norm1", "./image/product_capsule_cream.webp?v=norm1", "./image/category_capsule_hero.webp"],
      color: "아이보리", components: "본체, 물탱크",
      summary: "혼자 쓰기 좋은 미니 캡슐 커피 머신",
      desc: "1인 가구에 알맞은 작고 가벼운 미니 캡슐머신입니다. 책상이나 작은 주방에도 부담 없이 놓을 수 있습니다.",
      points: [
        { t: "초소형", d: "한 손에 들어오는 작은 크기입니다." },
        { t: "1인용", d: "혼자 즐기기에 알맞은 용량과 구성입니다." },
        { t: "간편함", d: "캡슐만 넣으면 바로 추출됩니다." }
      ],
      spec: { model: "CC-Mini", size: "W 100 x D 200 x H 250mm", weight: "약 1.9kg", volt: "220V / 60Hz", power: "1100W", pump: "15Bar", tank: "0.5L", warranty: "구매일로부터 1년" },
      story: {
        title: "나를 위한 작은 한 잔",
        body: "작은 공간, 혼자만의 시간에 어울리는 미니 머신입니다. 부담 없이 매일의 커피를 즐겨보세요.",
        bullets: ["초소형 바디", "원터치 추출", "간편 급수", "가벼운 무게"]
      }
    },
    {
      id: "cc-box", category: "capsule",
      name: "캡슐머신 보관함 CC-Box", price: 39000,
      image: "./image/detail/detail-cc-box-1.webp?v=20260626",
      images: ["./image/detail/detail-cc-box-1.webp?v=20260626", "./image/detail/detail-cc-box-2.webp?v=20260626", "./image/detail/detail-cc-box-3.webp?v=20260626", "./image/detail/detail-cc-box-4.webp?v=20260626"],
      color: "우드", components: "보관함 본체",
      summary: "캡슐과 액세서리를 깔끔하게 정리하는 보관함",
      desc: "캡슐과 소품을 한곳에 정리할 수 있는 보관함입니다. 어수선한 커피 공간을 단정하게 만들어줍니다.",
      points: [
        { t: "넉넉한 수납", d: "여러 종류의 캡슐을 한눈에 정리할 수 있습니다." },
        { t: "감각적인 마감", d: "따뜻한 우드 톤으로 공간에 자연스럽게 어울립니다." },
        { t: "공간 절약", d: "쌓이지 않게 정리해 공간을 효율적으로 씁니다." }
      ],
      spec: { model: "CC-Box", size: "W 220 x D 130 x H 90mm", weight: "약 0.6kg", volt: "해당 없음", power: "해당 없음", pump: "해당 없음", tank: "해당 없음", warranty: "구매일로부터 1년" },
      story: {
        title: "정리된 커피 공간",
        body: "흩어지기 쉬운 캡슐을 한곳에 모아 정돈해줍니다. 보기 좋게 정리된 커피 코너를 완성해보세요.",
        bullets: ["다단 수납 구조", "우드 마감", "미끄럼 방지 바닥", "조립 불필요"]
      }
    },
    {
      id: "drip-900", category: "goods", badge: "BEST",
      name: "드립 포트 900ml", price: 79000,
      image: "./image/product_drip_kettle.webp?v=norm1",
      images: ["./image/product_drip_kettle.webp?v=norm1", "./image/brand_life_leaf.webp"],
      color: "매트 블랙", components: "드립 포트 본체",
      summary: "정밀한 물줄기로 안정적인 드립 추출",
      desc: "가늘고 일정한 물줄기를 만들어주는 드립 전용 포트입니다. 핸드드립의 안정감을 한층 높여줍니다.",
      points: [
        { t: "정밀한 물줄기", d: "가는 구즈넥 노즐로 물줄기를 섬세하게 조절합니다." },
        { t: "안정적인 무게중심", d: "균형 잡힌 디자인으로 흔들림 없이 따를 수 있습니다." },
        { t: "넉넉한 용량", d: "900ml 용량으로 여러 잔을 한 번에 준비합니다." }
      ],
      spec: { model: "K1", size: "W 250 x D 130 x H 180mm", weight: "약 0.7kg", volt: "해당 없음", power: "해당 없음", pump: "해당 없음", tank: "0.9L", warranty: "구매일로부터 1년" },
      story: {
        title: "물줄기가 만드는 차이",
        body: "핸드드립의 완성도는 물줄기에서 갈립니다. 가늘고 일정한 흐름으로 안정적인 추출을 도와줍니다.",
        bullets: ["구즈넥 노즐", "900ml 용량", "열전도 우수", "인덕션 호환"]
      }
    },
    {
      id: "dripper-set", category: "goods",
      name: "드리퍼 세트", price: 49000,
      image: "./image/product_dripper_set_wood_cutout.webp?v=20260624-cutout1",
      images: ["./image/product_dripper_set_wood_cutout.webp?v=20260624-cutout1", "./image/brand_life_leaf.webp"],
      color: "클리어", components: "드리퍼, 서버, 필터 50매",
      summary: "필터와 서버가 함께 구성된 핸드드립 세트",
      desc: "드리퍼와 서버, 필터까지 한 번에 갖춘 핸드드립 입문 세트입니다. 따로 고르지 않고 바로 시작할 수 있습니다.",
      points: [
        { t: "올인원 구성", d: "드립에 필요한 도구를 한 세트로 구성했습니다." },
        { t: "안정적인 추출", d: "리브 구조 드리퍼로 균일한 추출을 돕습니다." },
        { t: "보기 좋은 디자인", d: "투명한 서버로 추출량을 한눈에 확인합니다." }
      ],
      spec: { model: "DS-01", size: "W 150 x D 250 x H 220mm", weight: "약 0.5kg", volt: "해당 없음", power: "해당 없음", pump: "해당 없음", tank: "해당 없음", warranty: "구매일로부터 1년" },
      story: {
        title: "핸드드립, 이 세트로 시작",
        body: "무엇을 골라야 할지 고민이라면 이 세트 하나로 충분합니다. 드립에 필요한 기본을 모두 담았습니다.",
        bullets: ["드리퍼 + 서버 + 필터", "리브 구조", "투명 서버", "입문용 구성"]
      }
    },
    {
      id: "server-600", category: "goods",
      name: "스테인리스 서버 600ml", price: 42000,
      image: "./image/product_steam_pitcher.webp?v=norm1",
      images: ["./image/product_steam_pitcher.webp?v=norm1", "./image/brand_life_leaf.webp"],
      color: "실버", components: "스테인리스 피처 본체",
      summary: "라떼아트와 추출 보조에 좋은 스테인리스 피처",
      desc: "스팀 밀크와 추출 보조에 두루 쓰기 좋은 스테인리스 피처입니다. 견고하고 손에 잘 잡히는 형태입니다.",
      points: [
        { t: "라떼아트에 적합", d: "뾰족한 주둥이로 섬세한 라인을 그릴 수 있습니다." },
        { t: "견고한 소재", d: "스테인리스로 오래 사용해도 변형이 적습니다." },
        { t: "편안한 그립", d: "손에 잘 잡히는 손잡이로 안정적으로 다룹니다." }
      ],
      spec: { model: "SV-600", size: "W 130 x D 90 x H 110mm", weight: "약 0.3kg", volt: "해당 없음", power: "해당 없음", pump: "해당 없음", tank: "0.6L", warranty: "구매일로부터 1년" },
      story: {
        title: "한 손에 잡히는 안정감",
        body: "스팀 밀크부터 물 따르기까지, 손에 익는 피처 하나가 작업을 편하게 만듭니다. 균형 잡힌 무게와 깔끔한 라인으로 매일 손이 가는 도구입니다.",
        bullets: ["스테인리스 소재", "라떼아트 주둥이", "600ml 용량", "용량 눈금 표시"]
      }
    },
    {
      id: "scale-st01", category: "goods",
      name: "스케일 타이머 ST-01", price: 38000,
      image: "./image/product_scale_black.webp",
      images: ["./image/product_scale_black.webp", "./image/brand_life_coffee.webp"],
      color: "블랙", components: "스케일 본체, USB 케이블",
      summary: "추출 시간과 무게를 동시에 관리하는 스마트 스케일",
      desc: "무게와 시간을 함께 측정해 추출을 일정하게 관리해주는 스마트 스케일입니다. 같은 맛을 반복하고 싶을 때 유용합니다.",
      points: [
        { t: "동시 측정", d: "무게와 추출 시간을 한 화면에서 확인합니다." },
        { t: "정밀 센서", d: "0.1g 단위 측정으로 레시피를 정확히 재현합니다." },
        { t: "충전식", d: "USB 충전으로 건전지 교체가 필요 없습니다." }
      ],
      spec: { model: "ST-01", size: "W 130 x D 150 x H 30mm", weight: "약 0.4kg", volt: "USB 충전식", power: "USB 충전식", pump: "해당 없음", tank: "해당 없음", warranty: "구매일로부터 1년" },
      story: {
        title: "같은 맛을 반복하는 비결",
        body: "좋았던 한 잔을 다시 내리려면 기록이 필요합니다. 무게와 시간을 재며 나만의 레시피를 만들어보세요.",
        bullets: ["0.1g 정밀 측정", "내장 타이머", "USB 충전", "방수 코팅 상판"]
      }
    }
  ];

  const DETAIL_CATEGORY = {
    espresso: {
      setupTitle: "추출부터 스팀까지 한 번에 정리되는 홈카페 세팅",
      lead: "에스프레소 머신은 물탱크 위치, 포터필터 동선, 스팀 노즐 관리까지 함께 볼 때 매일 쓰기 편해집니다."
    },
    grinder: {
      setupTitle: "분쇄 입도와 원두 동선을 깔끔하게 맞춘 세팅",
      lead: "그라인더는 원두 보관, 분쇄량 확인, 가루받이 세척이 자연스럽게 이어질 때 추출 편차가 줄어듭니다."
    },
    capsule: {
      setupTitle: "작은 공간에서도 바로 마실 수 있는 캡슐 커피 코너",
      lead: "캡슐머신은 예열 시간, 물탱크 용량, 사용 캡슐 정리까지 함께 챙기면 바쁜 루틴에 더 잘 맞습니다."
    },
    goods: {
      setupTitle: "도구의 위치만 정리해도 추출 흐름이 편해지는 구성",
      lead: "커피용품은 손에 잡히는 감각과 세척, 보관 방식이 중요합니다. 자주 쓰는 순서대로 두면 매일의 커피가 단정해집니다."
    }
  };

  const DETAIL_ENRICH = {
    "bex-300": {
      ideal: "라떼와 아메리카노를 모두 자주 즐기는 2~3인 홈카페",
      setup: ["물탱크를 뒤쪽에 여유 있게 두기", "스팀피처와 행주를 오른쪽에 배치", "예열 후 빈 샷으로 그룹헤드 온도 안정화"],
      care: ["스팀 사용 직후 노즐 닦기", "물받이는 매일 비우기", "주 1회 포터필터와 바스켓 세척"],
      tags: ["프리미엄", "스팀", "BEST"],
      highlightsImage: "./image/detail/detail-bex-300-scene.webp",
      usageImage: "./image/detail/detail-bex-300-brewing.webp",
      detailCards: [
        { img: "./image/detail/detail-bex-300-card-controls.webp", t: "직관적인 조작 패널", d: "전원·추출·스팀을 한 줄로 정리해 누구나 직관적으로 조작할 수 있습니다." },
        { img: "./image/detail/detail-bex-300-card-portafilter.webp", t: "포터필터 & 스팀 완드", d: "싱글·더블 샷 포터필터와 부드러운 스팀 완드로 다양한 메뉴를 완성합니다." },
        { img: "./image/detail/detail-bex-300-card-cupwarmer.webp", t: "상단 컵 워머", d: "상판에 컵을 미리 올려 데우면 추출 온도를 더 안정적으로 유지합니다." }
      ]
    },
    "bex-200": {
      ideal: "작은 주방에서 에스프레소와 우유 메뉴를 번갈아 즐기는 데일리 세팅",
      setup: ["컵 워머 공간을 비워두기", "포터필터는 사용 후 바로 헹구기", "그라인더와 30cm 안에 배치"],
      care: ["물탱크 물은 매일 교체", "스팀 노즐은 사용 직후 퍼지", "분리형 물받이 주기 세척"],
      tags: ["컴팩트", "데일리", "입문"],
      storyImage: "./image/detail/detail-bex-200-story.webp",
      highlightsImage: "./image/detail/detail-bex-200-scene.webp",
      usageImage: "./image/detail/detail-bex-200-usage.webp",
      detailCards: [
        { img: "./image/detail/detail-bex-200-card-controls.webp", t: "간결한 조작 패널", d: "자주 쓰는 버튼과 다이얼을 전면에 정리해 처음 사용하는 날에도 조작이 쉽습니다." },
        { img: "./image/detail/detail-bex-200-card-portafilter.webp", t: "추출과 스팀을 한 공간에", d: "포터필터와 우측 스팀 완드를 가까이 배치해 에스프레소와 우유 메뉴를 자연스럽게 이어갑니다." },
        { img: "./image/detail/detail-bex-200-card-cupwarmer.webp", t: "상단 컵 워머", d: "상단 공간에 컵을 올려두면 추출 전 잔을 따뜻하게 준비할 수 있습니다." }
      ]
    },
    "bex-150": {
      ideal: "처음 홈카페를 시작하며 핵심 기능만 간단히 쓰고 싶은 공간",
      setup: ["작은 컵부터 예열해 추출 온도 유지", "포터필터 장착 전 바스켓 물기 제거", "자주 쓰는 원두만 소량 보관"],
      care: ["추출 후 빈 샷으로 잔여 커피 제거", "물받이 넘침 전 확인", "월 1회 내부 세척 모드 사용"],
      tags: ["입문형", "간편 조작", "합리적"],
      storyImage: "./image/detail/detail-bex-150-story.webp",
      highlightsImage: "./image/detail/detail-bex-150-scene.webp",
      usageImage: "./image/detail/detail-bex-150-usage.webp",
      detailCards: [
        { img: "./image/detail/detail-bex-150-card-controls.webp", t: "입문자도 쉬운 조작", d: "중앙 다이얼과 두 개의 버튼만으로 추출 흐름을 간단하게 다룰 수 있습니다." },
        { img: "./image/detail/detail-bex-150-card-portafilter.webp", t: "기본에 충실한 추출부", d: "포터필터와 스팀 완드를 갖춰 에스프레소와 우유 메뉴의 기본을 모두 경험할 수 있습니다." },
        { img: "./image/detail/detail-bex-150-card-compact.webp", t: "작은 공간에 맞는 바디", d: "상단과 측면을 간결하게 정리해 좁은 주방이나 1인 공간에도 부담 없이 놓입니다." }
      ]
    },
    "beu-100": {
      ideal: "추출 압력과 스팀을 직접 조절하며 레시피를 다듬는 홈바리스타",
      setup: ["압력 게이지가 잘 보이는 위치에 두기", "탬퍼와 피처를 한 트레이에 정리", "원두별 추출 시간 기록"],
      care: ["스팀 완드 내부 퍼지", "스테인리스 표면 물자국 닦기", "정기적인 디스케일링"],
      tags: ["압력 조절", "스테인리스", "홈바리스타"],
      storyImage: "./image/detail/detail-beu-100-story.webp",
      highlightsImage: "./image/detail/detail-beu-100-scene.webp",
      usageImage: "./image/detail/detail-beu-100-usage.webp",
      detailCards: [
        { img: "./image/detail/detail-beu-100-card-gauge.webp", t: "압력 게이지와 정밀 조작", d: "전면 게이지와 버튼 구성을 통해 추출 상태를 확인하며 레시피를 세밀하게 다듬을 수 있습니다." },
        { img: "./image/detail/detail-beu-100-card-portafilter.webp", t: "견고한 추출부와 스팀 완드", d: "중앙 포터필터와 우측 스팀 완드가 에스프레소 추출부터 밀크 메뉴 준비까지 안정적으로 이어줍니다." },
        { img: "./image/detail/detail-beu-100-card-stainless.webp", t: "스테인리스 마감", d: "브러시드 스테인리스 바디와 상단 트레이가 홈바리스타 공간에 어울리는 단단한 인상을 줍니다." }
      ]
    },
    "co-200": {
      ideal: "에스프레소부터 드립까지 원두별 입도를 자주 바꾸는 사용자",
      setup: ["호퍼에는 당일 사용할 원두만 담기", "입도 변경 후 소량 분쇄해 잔여분 제거", "가루받이 위치를 정확히 맞추기"],
      care: ["버 주변 분쇄 가루 털기", "호퍼는 물기 없이 마른 천으로 관리", "원두 오일이 쌓이면 전용 클리너 사용"],
      tags: ["정밀 버", "입도 조절", "BEST"],
      storyImage: "./image/detail/detail-co-200-story.webp",
      highlightsImage: "./image/detail/detail-co-200-scene.webp",
      usageImage: "./image/detail/detail-co-200-usage.webp",
      detailCards: [
        { img: "./image/detail/detail-co-200-card-adjustment.webp", t: "정밀 입도 조절", d: "호퍼 하단의 조절 링으로 추출 도구에 맞는 분쇄 굵기를 세밀하게 맞출 수 있습니다." },
        { img: "./image/detail/detail-co-200-card-container.webp", t: "분리형 가루받이", d: "분쇄된 원두를 깔끔하게 모아 바로 옮길 수 있어 작업대 주변을 정돈하기 쉽습니다." },
        { img: "./image/detail/detail-co-200-card-hopper.webp", t: "투명 원두 호퍼", d: "원두 잔량을 한눈에 확인하며 필요한 만큼만 담아 신선한 분쇄 흐름을 유지합니다." }
      ]
    },
    "fg-100": {
      ideal: "드립과 모카포트를 중심으로 균일한 분쇄를 원하는 홈카페",
      setup: ["분쇄 단계는 추출 도구별로 메모", "가루받이는 추출 전 건조 상태 유지", "원두는 밀폐 용기와 함께 보관"],
      care: ["분쇄 후 남은 가루 털기", "호퍼 분리 세척 후 완전 건조", "모터 통풍구 주변 먼지 제거"],
      tags: ["클래식", "저소음", "정밀 분쇄"],
      storyImage: "./image/detail/detail-fg-100-story.webp",
      highlightsImage: "./image/detail/detail-fg-100-scene.webp",
      usageImage: "./image/detail/detail-fg-100-usage.webp",
      detailCards: [
        { img: "./image/detail/detail-fg-100-card-knob.webp", t: "클래식 조절 노브", d: "전면의 큰 노브로 분쇄 흐름을 간단하게 다루며 데일리 추출에 맞춰 사용합니다." },
        { img: "./image/detail/detail-fg-100-card-hopper.webp", t: "넓은 원두 호퍼", d: "투명 호퍼가 원두 상태와 잔량을 보여줘 매일 필요한 만큼 준비하기 좋습니다." },
        { img: "./image/detail/detail-fg-100-card-container.webp", t: "정돈되는 가루받이", d: "하단 컨테이너가 분쇄 가루를 안정적으로 받아 드립 준비 과정을 깔끔하게 이어줍니다." }
      ]
    },
    "hg-80": {
      ideal: "매일 한두 잔을 빠르게 준비하는 1인 데일리 커피 코너",
      setup: ["컵과 드리퍼 가까이에 배치", "한 번에 필요한 만큼만 분쇄", "작은 트레이 위에 두어 가루 날림 정리"],
      care: ["사용 후 가루받이 비우기", "외부는 마른 천으로 닦기", "장시간 연속 작동 피하기"],
      tags: ["소형", "원터치", "1인용"],
      storyImage: "./image/detail/detail-hg-80-story.webp",
      highlightsImage: "./image/detail/detail-hg-80-scene.webp",
      usageImage: "./image/detail/detail-hg-80-usage.webp",
      detailCards: [
        { img: "./image/detail/detail-hg-80-card-dial.webp", t: "원터치 다이얼", d: "전면의 큰 원형 다이얼로 한두 잔 분량의 분쇄를 빠르게 시작할 수 있습니다." },
        { img: "./image/detail/detail-hg-80-card-cup.webp", t: "작은 가루받이", d: "소량 분쇄에 맞춘 컨테이너가 1인 커피 루틴을 간단하게 정리해줍니다." },
        { img: "./image/detail/detail-hg-80-card-hopper.webp", t: "컴팩트 호퍼", d: "작은 호퍼에 당일 사용할 원두만 담아 공간과 원두 신선도를 함께 관리합니다." }
      ]
    },
    "mg-01": {
      ideal: "여행, 캠핑, 사무실에서도 신선한 원두를 직접 갈고 싶은 사용자",
      setup: ["핸들은 사용 전 단단히 고정", "드립용 중간 입도부터 맞추기", "분쇄 후 바로 추출해 향 보존"],
      care: ["물 세척 후 완전 건조", "세라믹 버에 원두 가루 남기지 않기", "휴대 시 핸들 분리 보관"],
      tags: ["수동", "휴대용", "세라믹 버"],
      storyImage: "./image/detail/detail-mg-01-story.webp",
      highlightsImage: "./image/detail/detail-mg-01-scene.webp",
      usageImage: "./image/detail/detail-mg-01-usage.webp",
      detailCards: [
        { img: "./image/detail/detail-mg-01-card-handle.webp", t: "손에 잡히는 핸들", d: "우드 노브와 금속 핸들이 손으로 천천히 갈아내는 감각을 안정적으로 전달합니다." },
        { img: "./image/detail/detail-mg-01-card-ring.webp", t: "분쇄도 조절 링", d: "중앙의 질감 있는 조절 링으로 드립부터 진한 추출까지 입도를 세밀하게 맞춥니다." },
        { img: "./image/detail/detail-mg-01-card-chamber.webp", t: "분리형 하단 챔버", d: "분쇄 후 하단 챔버를 분리해 가루를 바로 옮길 수 있어 휴대와 세척이 간편합니다." }
      ]
    },
    "cc-10": {
      ideal: "아침마다 버튼 한 번으로 일정한 커피를 빠르게 마시는 공간",
      setup: ["캡슐 보관함을 머신 옆에 배치", "물탱크는 전면에서 꺼내기 쉬운 위치로", "자주 쓰는 컵 높이에 맞춰 받침 확인"],
      care: ["사용 캡슐 트레이 비우기", "물탱크는 매일 헹구기", "주기적으로 물만 내려 내부 헹굼"],
      tags: ["원터치", "빠른 예열", "BEST"],
      storyImage: "./image/detail/detail-cc-10-story.webp",
      highlightsImage: "./image/detail/detail-cc-10-scene.webp",
      usageImage: "./image/detail/detail-cc-10-usage.webp",
      detailCards: [
        { img: "./image/detail/detail-cc-10-card-head.webp", t: "원터치 추출 헤드", d: "캡슐을 넣고 버튼을 누르면 전면 추출부에서 일정한 커피가 빠르게 완성됩니다." },
        { img: "./image/detail/detail-cc-10-card-tank.webp", t: "측면 물탱크", d: "투명 물탱크로 남은 물의 양을 쉽게 확인하고 필요할 때 간편하게 보충할 수 있습니다." },
        { img: "./image/detail/detail-cc-10-card-tray.webp", t: "분리형 받침 트레이", d: "컵을 올리는 하단 트레이가 사용 후 물기와 커피 자국을 정리하기 쉽게 돕습니다." }
      ]
    },
    "cc-s10": {
      ideal: "폭이 좁은 선반이나 오피스 탕비실에 두기 좋은 슬림 세팅",
      setup: ["측면 여유 공간을 확보", "캡슐은 세로형 보관함에 정리", "전원선이 보이지 않게 뒤쪽으로 정돈"],
      care: ["추출구 주변 커피 자국 닦기", "트레이 물 고임 확인", "장기간 미사용 전 물탱크 비우기"],
      tags: ["슬림", "공간 절약", "간편"],
      storyImage: "./image/detail/detail-cc-s10-story.webp",
      highlightsImage: "./image/detail/detail-cc-s10-scene.webp",
      usageImage: "./image/detail/detail-cc-s10-usage.webp",
      detailCards: [
        { img: "./image/detail/detail-cc-s10-card-lever.webp", t: "상단 캡슐 레버", d: "좁은 폭 안에서도 캡슐을 쉽게 넣고 닫을 수 있도록 상단 구조를 간결하게 정리했습니다." },
        { img: "./image/detail/detail-cc-s10-card-panel.webp", t: "슬림 전면 패널", d: "긴 리브 패널이 컵 위치를 안정적으로 잡아주며 세로형 디자인을 더 깔끔하게 보여줍니다." },
        { img: "./image/detail/detail-cc-s10-card-tray.webp", t: "좁은 공간용 트레이", d: "작은 받침 구조로 컵을 받쳐 좁은 선반이나 오피스 공간에서도 부담 없이 사용할 수 있습니다." }
      ]
    },
    "cc-mini": {
      ideal: "책상, 원룸, 작은 주방에서 혼자 마시는 미니 커피 코너",
      setup: ["머그컵 하나와 함께 작은 트레이 구성", "물 보충이 쉬운 앞쪽에 배치", "캡슐은 1주일 분량만 가까이에 보관"],
      care: ["추출 후 캡슐 바로 제거", "작은 물탱크는 자주 헹구기", "외부 크림 컬러 표면 얼룩 즉시 닦기"],
      tags: ["미니", "1인", "아이보리"],
      storyImage: "./image/detail/detail-cc-mini-story.webp",
      highlightsImage: "./image/detail/detail-cc-mini-scene.webp",
      usageImage: "./image/detail/detail-cc-mini-usage.webp",
      detailCards: [
        { img: "./image/detail/detail-cc-mini-card-head.webp", t: "둥근 추출 헤드", d: "작은 바디 안에 원형 추출부를 담아 혼자 마시는 한 잔을 간단하게 준비합니다." },
        { img: "./image/detail/detail-cc-mini-card-tray.webp", t: "미니 컵 받침", d: "작은 컵에 맞춘 받침 구조로 책상이나 원룸에서도 깔끔하게 추출할 수 있습니다." },
        { img: "./image/detail/detail-cc-mini-card-body.webp", t: "초소형 라운드 바디", d: "부드러운 곡선과 작은 깊이로 개인 공간에 자연스럽게 놓이는 크기를 완성했습니다." }
      ]
    },
    "cc-box": {
      ideal: "캡슐과 작은 액세서리가 흩어지는 커피 코너 정리용",
      setup: ["맛별 캡슐을 줄 단위로 분리", "머신 아래나 옆에 놓아 동선 단축", "자주 쓰는 액세서리는 상단에 정리"],
      care: ["캡슐 가루는 마른 솔로 제거", "우드 표면은 젖은 천 사용 최소화", "무거운 물건을 한쪽에 몰아두지 않기"],
      tags: ["정리", "우드", "수납"],
      storyImage: "./image/detail/detail-cc-box-story.webp",
      highlightsImage: "./image/detail/detail-cc-box-scene.webp",
      usageImage: "./image/detail/detail-cc-box-usage.webp",
      detailCards: [
        { img: "./image/detail/detail-cc-box-card-compartments.webp", t: "나뉘어진 수납칸", d: "캡슐을 종류별로 나누어 보관할 수 있어 원하는 맛을 한눈에 고르기 쉽습니다." },
        { img: "./image/detail/detail-cc-box-card-lid.webp", t: "슬라이딩 우드 커버", d: "손가락 홈이 있는 나무 커버가 캡슐을 덮어 커피 공간을 더 단정하게 정리합니다." },
        { img: "./image/detail/detail-cc-box-card-sorting.webp", t: "컬러별 캡슐 정리", d: "금속 캡슐을 색상과 맛별로 배열해 보기 좋은 커피 코너를 만들 수 있습니다." }
      ]
    },
    "drip-900": {
      ideal: "물줄기를 세밀하게 조절해 핸드드립 맛을 안정시키고 싶은 사용자",
      setup: ["드리퍼 중심을 기준으로 손목 높이 맞추기", "물을 80% 이하로 담아 컨트롤 유지", "스케일과 함께 사용해 주입량 확인"],
      care: ["사용 후 내부 물기 제거", "노즐 끝 막힘 확인", "외부 코팅은 부드러운 스펀지로 세척"],
      tags: ["구즈넥", "900ml", "BEST"],
      storyImage: "./image/detail/detail-drip-900-story.webp",
      highlightsImage: "./image/detail/detail-drip-900-scene.webp",
      usageImage: "./image/detail/detail-drip-900-usage.webp",
      detailCards: [
        { img: "./image/detail/detail-drip-900-card-spout.webp", t: "정밀 구즈넥 노즐", d: "가는 노즐이 물줄기 방향과 속도를 섬세하게 잡아 핸드드립 추출을 안정적으로 돕습니다." },
        { img: "./image/detail/detail-drip-900-card-handle.webp", t: "잡기 쉬운 핸들과 뚜껑", d: "무광 바디와 손잡이, 뚜껑 구조가 물을 따를 때 균형 잡힌 그립감을 제공합니다." },
        { img: "./image/detail/detail-drip-900-card-pour.webp", t: "일정한 물줄기", d: "얇고 부드러운 흐름으로 커피 베드에 물을 고르게 올려 추출 편차를 줄여줍니다." }
      ]
    },
    "dripper-set": {
      ideal: "핸드드립을 처음 시작하며 도구를 한 번에 갖추고 싶은 구성",
      setup: ["필터 린싱 후 서버 예열", "드리퍼와 서버 중심선 맞추기", "추출량은 서버 눈금으로 확인"],
      care: ["유리 서버는 급격한 온도 변화 피하기", "드리퍼 리브 사이 커피 오일 세척", "필터는 건조한 곳에 보관"],
      tags: ["입문 세트", "서버", "필터 포함"],
      storyImage: "./image/detail/detail-dripper-set-story.webp",
      highlightsImage: "./image/detail/detail-dripper-set-scene.webp",
      usageImage: "./image/detail/detail-dripper-set-usage.webp",
      detailCards: [
        { img: "./image/detail/detail-dripper-set-card-ribs.webp", t: "리브 구조 드리퍼", d: "투명 드리퍼의 세로 리브가 물길을 만들어 균일한 추출 흐름을 도와줍니다." },
        { img: "./image/detail/detail-dripper-set-card-wood.webp", t: "우드 칼라 포인트", d: "따뜻한 우드 링이 드리퍼와 서버를 안정적으로 연결하며 손에 닿는 감각을 더합니다." },
        { img: "./image/detail/detail-dripper-set-card-server.webp", t: "투명 글라스 서버", d: "추출량과 커피 색을 바로 확인할 수 있어 처음 핸드드립을 시작할 때도 다루기 쉽습니다." }
      ]
    },
    "server-600": {
      ideal: "라떼아트 연습과 스팀 밀크 계량을 함께 하는 에스프레소 세팅",
      setup: ["우유는 피처 하단까지 차갑게 준비", "스팀 노즐 각도에 맞춰 손잡이 방향 고정", "따르기 전 바닥을 가볍게 두드려 큰 거품 제거"],
      care: ["우유 사용 직후 바로 헹구기", "스테인리스 물자국 닦기", "연마제 제거 후 첫 사용"],
      tags: ["스테인리스", "600ml", "라떼아트"],
      storyImage: "./image/detail/detail-server-600-story.webp",
      highlightsImage: "./image/detail/detail-server-600-scene.webp",
      usageImage: "./image/detail/detail-server-600-usage.webp",
      detailCards: [
        { img: "./image/detail/detail-server-600-card-spout.webp", t: "라떼아트 스파우트", d: "V자 형태의 주둥이가 우유 흐름을 모아 섬세한 라인을 그리기 좋습니다." },
        { img: "./image/detail/detail-server-600-card-handle.webp", t: "안정적인 핸들", d: "손에 잡히는 손잡이와 균형 잡힌 바디가 스팀 밀크를 따를 때 안정감을 줍니다." },
        { img: "./image/detail/detail-server-600-card-interior.webp", t: "넉넉한 내부 공간", d: "600ml 용량감으로 우유를 데우고 회전시킬 여유를 만들어줍니다." }
      ]
    },
    "scale-st01": {
      ideal: "무게와 시간을 기록하며 매번 같은 맛을 재현하고 싶은 추출 루틴",
      setup: ["드리퍼와 서버를 올린 뒤 영점 조정", "타이머 시작 시점 통일", "레시피별 원두량과 추출 시간을 메모"],
      care: ["상판에 물이 고이면 바로 닦기", "충전 단자 물기 주의", "무거운 물건을 오래 올려두지 않기"],
      tags: ["0.1g", "타이머", "USB 충전"],
      storyImage: "./image/detail/detail-scale-st01-story.webp",
      highlightsImage: "./image/detail/detail-scale-st01-scene.webp",
      usageImage: "./image/detail/detail-scale-st01-usage.webp",
      detailCards: [
        { img: "./image/detail/detail-scale-st01-card-top.webp", t: "논슬립 질감 상판", d: "돌기 패턴의 상판이 서버와 드리퍼를 안정적으로 받쳐 추출 중 흔들림을 줄입니다." },
        { img: "./image/detail/detail-scale-st01-card-display.webp", t: "무게와 시간 표시", d: "전면 디스플레이에서 무게와 타이머를 함께 확인하며 레시피를 관리할 수 있습니다." },
        { img: "./image/detail/detail-scale-st01-card-measurement.webp", t: "추출 레시피 관리", d: "드리퍼와 서버를 올린 상태에서 무게와 시간을 함께 기록해 같은 맛을 반복하기 쉽습니다." }
      ]
    }
  };

  const SPEC_VISUALS = {
    "bex-300": "./image/detail/spec-bex-300.webp",
    "bex-200": "./image/detail/spec-bex-200.webp",
    "bex-150": "./image/detail/spec-bex-150.webp",
    "beu-100": "./image/detail/spec-beu-100.webp",
    "co-200": "./image/detail/spec-co-200.webp",
    "fg-100": "./image/detail/spec-fg-100.webp",
    "hg-80": "./image/detail/spec-hg-80.webp",
    "mg-01": "./image/detail/spec-mg-01.webp",
    "cc-10": "./image/detail/spec-cc-10.webp",
    "cc-s10": "./image/detail/spec-cc-s10.webp",
    "cc-mini": "./image/detail/spec-cc-mini.webp",
    "cc-box": "./image/detail/spec-cc-box.webp",
    "drip-900": "./image/detail/spec-drip-900.webp",
    "dripper-set": "./image/detail/spec-dripper-set.webp",
    "server-600": "./image/detail/spec-server-600.webp",
    "scale-st01": "./image/detail/spec-scale-st01.webp"
  };

  PRODUCTS.forEach((product) => {
    const category = DETAIL_CATEGORY[product.category] || DETAIL_CATEGORY.goods;
    const detail = DETAIL_ENRICH[product.id] || {};
    product.storyImage = detail.storyImage || `./image/detail/detail-${product.id}-lifestyle.webp?v=20260624-photoreal`;
    product.usageImage = detail.usageImage || "";
    product.highlightsImage = detail.highlightsImage || "";
    product.specImage = SPEC_VISUALS[product.id] || "";
    product.images = [product.image];
    product.gallery = [
      { src: product.image, label: "대표 이미지", view: "front" },
      { src: product.storyImage, label: "사용 장면", view: "lifestyle" }
    ];
    if (product.id === "bex-300") {
      product.gallery = [1, 2, 3, 4, 5, 6, 7]
        .map((n) => ({
          src: `./image/detail/detail-bex-300-${n}.webp`,
          label: `상세 이미지 ${n}`,
          view: "front"
        }))
        .concat([{ src: product.storyImage, label: "사용 장면", view: "lifestyle" }]);
    }
    if (product.id === "bex-200") {
      product.gallery = [{ src: product.image, label: "대표 이미지", view: "front" }]
        .concat(
          [1, 2, 3, 4, 5, 6, 7].map((n) => ({
            src: `./image/detail/detail-bex-200-${n}.webp`,
            label: `상세 이미지 ${n}`,
            view: "front"
          }))
        )
        .concat([{ src: product.storyImage, label: "사용 장면", view: "lifestyle" }]);
    }
    if (product.id === "bex-150") {
      product.gallery = [{ src: product.image, label: "대표 이미지", view: "front" }]
        .concat(
          [1, 2, 3, 4, 5, 6, 7].map((n) => ({
            src: `./image/detail/detail-bex-150-${n}.webp`,
            label: `상세 이미지 ${n}`,
            view: "front"
          }))
        )
        .concat([{ src: product.storyImage, label: "사용 장면", view: "lifestyle" }]);
    }
    if (product.id === "beu-100") {
      product.gallery = [{ src: product.image, label: "대표 이미지", view: "front" }]
        .concat(
          [1, 2, 3, 4, 5, 6, 7].map((n) => ({
            src: `./image/detail/detail-beu-100-${n}.webp`,
            label: `상세 이미지 ${n}`,
            view: "front"
          }))
        )
        .concat([{ src: product.storyImage, label: "사용 장면", view: "lifestyle" }]);
    }
    if (product.id === "co-200") {
      product.gallery = [{ src: product.image, label: "대표 이미지", view: "front" }]
        .concat(
          [1, 2, 3, 4, 5, 6, 7].map((n) => ({
            src: `./image/detail/detail-co-200-${n}.webp`,
            label: `상세 이미지 ${n}`,
            view: "front"
          }))
        )
        .concat([{ src: product.storyImage, label: "사용 장면", view: "lifestyle" }]);
    }
    if (product.id === "fg-100") {
      product.gallery = [{ src: product.image, label: "대표 이미지", view: "front" }]
        .concat(
          [1, 2, 3, 4, 5, 6, 7].map((n) => ({
            src: `./image/detail/detail-fg-100-${n}.webp`,
            label: `상세 이미지 ${n}`,
            view: "front"
          }))
        )
        .concat([{ src: product.storyImage, label: "사용 장면", view: "lifestyle" }]);
    }
    if (product.id === "hg-80") {
      product.gallery = [{ src: product.image, label: "대표 이미지", view: "front" }]
        .concat(
          [1, 2, 3, 4, 5, 6, 7].map((n) => ({
            src: `./image/detail/detail-hg-80-${n}.webp`,
            label: `상세 이미지 ${n}`,
            view: "front"
          }))
        )
        .concat([{ src: product.storyImage, label: "사용 장면", view: "lifestyle" }]);
    }
    if (product.id === "mg-01") {
      product.gallery = [{ src: product.image, label: "대표 이미지", view: "front" }]
        .concat(
          [1, 2, 3, 4, 5, 6, 7].map((n) => ({
            src: `./image/detail/detail-mg-01-${n}.webp`,
            label: `상세 이미지 ${n}`,
            view: "front"
          }))
        )
        .concat([{ src: product.storyImage, label: "사용 장면", view: "lifestyle" }]);
    }
    if (product.id === "cc-10") {
      product.gallery = [{ src: product.image, label: "대표 이미지", view: "front" }]
        .concat(
          [1, 2, 3, 4, 5, 6, 7].map((n) => ({
            src: `./image/detail/detail-cc-10-${n}.webp`,
            label: `상세 이미지 ${n}`,
            view: "front"
          }))
        )
        .concat([{ src: product.storyImage, label: "사용 장면", view: "lifestyle" }]);
    }
    if (product.id === "cc-mini") {
      product.gallery = [{ src: product.image, label: "대표 이미지", view: "front" }]
        .concat(
          [1, 2, 3, 4, 5, 6, 7].map((n) => ({
            src: `./image/detail/detail-cc-mini-${n}.webp`,
            label: `상세 이미지 ${n}`,
            view: "front"
          }))
        )
        .concat([{ src: product.storyImage, label: "사용 장면", view: "lifestyle" }]);
    }
    if (product.id === "cc-box") {
      product.gallery = [1, 2, 3, 4].map((n) => ({
        src: `./image/detail/detail-cc-box-${n}.webp?v=20260626`,
        label: `상세 이미지 ${n}`,
        view: "front"
      }));
    }
    if (product.id === "cc-s10") {
      product.gallery = [{ src: product.image, label: "대표 이미지", view: "front" }]
        .concat(
          [1, 2, 3, 4, 5, 6, 7].map((n) => ({
            src: `./image/detail/detail-cc-s10-${n}.webp`,
            label: `상세 이미지 ${n}`,
            view: "front"
          }))
        )
        .concat([{ src: product.storyImage, label: "사용 장면", view: "lifestyle" }]);
    }
    if (product.id === "drip-900") {
      product.gallery = [{ src: product.image, label: "대표 이미지", view: "front" }]
        .concat(
          [1, 2, 3, 4, 5, 6, 7].map((n) => ({
            src: `./image/detail/detail-drip-900-${n}.webp`,
            label: `상세 이미지 ${n}`,
            view: "front"
          }))
        )
        .concat([{ src: product.storyImage, label: "사용 장면", view: "lifestyle" }]);
    }
    if (product.id === "server-600") {
      product.gallery = [{ src: product.image, label: "대표 이미지", view: "front" }]
        .concat(
          [1, 2, 3, 4, 5, 6, 7].map((n) => ({
            src: `./image/detail/detail-server-600-${n}.webp`,
            label: `상세 이미지 ${n}`,
            view: "front"
          }))
        )
        .concat([{ src: product.storyImage, label: "사용 장면", view: "lifestyle" }]);
    }
    if (product.id === "dripper-set") {
      product.gallery = [{ src: product.image, label: "대표 이미지", view: "front" }]
        .concat(
          [1, 2, 3, 4, 5, 6, 7].map((n) => ({
            src: `./image/detail/detail-dripper-set-${n}.webp`,
            label: `상세 이미지 ${n}`,
            view: "front"
          }))
        )
        .concat([{ src: product.storyImage, label: "사용 장면", view: "lifestyle" }]);
    }
    if (product.id === "scale-st01") {
      product.gallery = [{ src: product.image, label: "대표 이미지", view: "front" }]
        .concat(
          [1, 2, 3, 4, 5, 6, 7].map((n) => ({
            src: `./image/detail/detail-scale-st01-${n}.webp`,
            label: `상세 이미지 ${n}`,
            view: "front"
          }))
        )
        .concat([{ src: product.storyImage, label: "사용 장면", view: "lifestyle" }]);
    }
    // 라이프스타일 컷과, 맨 앞의 '대표 이미지'(약간 틀어진 카탈로그 컷)는 상세 갤러리에서 제외
    // → 상세 페이지 진입 시 정면 상세샷이 가장 먼저 보이도록. (카탈로그 썸네일은 product.image 그대로 사용)
    const visibleGallery = product.gallery.filter((item) => item.view !== "lifestyle" && item.label !== "대표 이미지");
    product.gallery = visibleGallery.length ? visibleGallery : product.gallery.filter((item) => item.view !== "lifestyle");
    product.detail = {
      setup: detail.setup || [],
      care: detail.care || [],
      cards: detail.detailCards || []
    };
  });

  const productById = (id) => PRODUCTS.find((p) => p.id === id);

  /* ============================================================
     공지사항 데이터 (목록 + 상세 공용)
     ============================================================ */
  const NL = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
  const NOTICES = [
    { id: "n12", no: 12, tag: "이벤트", title: "COZYBREW 텀블러 기획 특가 안내", date: "2024.05.20", views: "1,284",
      body: "<p>늘 곁에 두고 쓰는 커피 한 잔의 온도를 더 오래 지켜드리기 위해, COZYBREW 시그니처 텀블러를 기획 특가로 선보입니다. 이중 진공 구조로 보온·보냉 성능을 한층 끌어올린 신규 라인업을 합리적인 가격에 만나보세요.</p>"
        + "<h3>행사 안내</h3>"
        + NL(["행사 기간: 2024년 5월 20일(월) ~ 5월 31일(금)", "할인 혜택: 텀블러 전 색상 최대 30% 할인", "추가 혜택: 5만 원 이상 구매 시 전용 파우치 증정"])
        + "<p>수량이 한정되어 있어 색상별로 조기 품절될 수 있습니다. 인기 색상은 행사 시작과 동시에 마감되는 경우가 많으니 서둘러 준비해주세요.</p>"
        + "<p>본 행사는 온라인 공식몰에서만 진행되며, 일부 상품은 다른 쿠폰과 중복 적용되지 않을 수 있습니다. 자세한 내용은 각 상품 상세 페이지에서 확인하실 수 있습니다.</p>" },
    { id: "n11", no: 11, tag: "", title: "제품 가격 조정 안내", date: "2024.05.14", views: "823",
      body: "<p>안녕하세요, COZYBREW입니다. 원자재 가격과 물류 비용의 지속적인 상승으로 인해 부득이하게 일부 제품의 판매 가격을 조정하게 되었습니다. 고객님께 더 나은 품질의 제품을 안정적으로 공급해 드리기 위한 결정인 점 너른 양해 부탁드립니다.</p>"
        + "<h3>변경 사항</h3>"
        + NL(["적용 일자: 2024년 6월 1일(토) 주문 건부터", "대상 제품: 에스프레소 머신 일부 모델 및 그라인더 라인업", "변동 폭: 모델별 3~7% 내외"])
        + "<p>가격 조정 이전에 주문하신 건은 기존 가격이 그대로 적용됩니다. 구매를 계획 중이셨다면 적용 일자 이전에 주문하시는 것을 권해 드립니다.</p>"
        + "<p>앞으로도 변함없는 품질과 서비스로 보답하겠습니다. 감사합니다.</p>" },
    { id: "n10", no: 10, tag: "", title: "일부 지역 배송 지연 안내", date: "2024.05.07", views: "612",
      body: "<p>최근 기상 악화와 연휴 기간 물량 증가로 인해 일부 지역의 배송이 평소보다 지연되고 있습니다. 기다려 주시는 고객님께 진심으로 양해의 말씀을 드립니다.</p>"
        + "<h3>지연 예상 지역</h3>"
        + NL(["제주 및 도서·산간 지역: 평균 1~2일 추가 소요", "강원 산간 일부 지역: 평균 1일 추가 소요"])
        + "<p>배송 현황은 마이페이지 > 주문내역에서 운송장 번호로 실시간 확인하실 수 있습니다. 빠른 시일 내에 정상화될 수 있도록 최선을 다하겠습니다.</p>" },
    { id: "n9", no: 9, tag: "", title: "홈페이지 시스템 점검 안내", date: "2024.04.30", views: "538",
      body: "<p>보다 안정적이고 쾌적한 서비스 제공을 위해 시스템 정기 점검을 진행합니다. 점검 시간 동안에는 로그인, 주문, 결제 등 일부 서비스 이용이 제한되오니 이용에 참고 부탁드립니다.</p>"
        + "<h3>점검 일정</h3>"
        + NL(["일시: 2024년 5월 3일(금) 02:00 ~ 05:00 (약 3시간)", "영향 범위: 공식몰 전체 서비스 일시 중단"])
        + "<p>점검 시간은 작업 상황에 따라 단축되거나 연장될 수 있습니다. 더 나은 서비스를 위한 과정이니 너른 양해 부탁드립니다.</p>" },
    { id: "n8", no: 8, tag: "", title: "COZYBREW 공식몰 리뉴얼 오픈 안내", date: "2024.04.22", views: "1,092",
      body: "<p>COZYBREW 공식몰이 더 편리하고 보기 좋은 모습으로 새롭게 단장했습니다. 고객님의 소중한 의견을 반영해 메뉴 구조와 제품 탐색 경험을 전면 개선했습니다.</p>"
        + "<h3>새로워진 점</h3>"
        + NL(["카테고리별로 한눈에 보이는 제품 탐색", "제품마다 상세 사양과 추천 구성을 담은 상세 페이지", "모바일에서도 편안한 반응형 화면"])
        + "<p>앞으로도 좋은 커피 라이프를 위한 콘텐츠와 서비스를 꾸준히 더해가겠습니다. 많은 관심과 이용 부탁드립니다.</p>" },
    { id: "n7", no: 7, tag: "이벤트", title: "봄맞이 홈카페 클래스 참가자 모집", date: "2024.04.15", views: "947",
      body: "<p>홈카페를 막 시작하셨거나, 한 단계 더 깊이 있게 즐기고 싶은 분들을 위한 오프라인 클래스를 진행합니다. 전문 바리스타와 함께 추출의 기초부터 라떼아트까지 직접 배워보세요.</p>"
        + "<h3>클래스 안내</h3>"
        + NL(["일정: 2024년 5월 매주 토요일 14:00 ~ 16:00", "장소: COZYBREW 성수 쇼룸 2층 클래스룸", "정원: 회차당 8명 (선착순 마감)", "참가비: 3만 원 (전액 제품 구매 시 사용 가능한 쿠폰으로 환급)"])
        + "<p>신청은 쇼룸 예약 페이지를 통해 가능하며, 신청 후 확정 안내를 개별적으로 드립니다. 많은 참여 부탁드립니다.</p>" },
    { id: "n6", no: 6, tag: "", title: "5월 가정의 달 배송 일정 안내", date: "2024.04.10", views: "421",
      body: "<p>가정의 달을 맞아 선물 주문이 크게 늘어나는 시기입니다. 원활한 배송을 위해 주문 일정을 미리 안내드리니, 선물용 주문은 여유 있게 준비해주시기 바랍니다.</p>"
        + "<h3>권장 주문 기한</h3>"
        + NL(["어버이날(5월 8일) 전 수령 희망 시: 5월 3일까지 결제 완료 권장", "스승의날(5월 15일) 전 수령 희망 시: 5월 10일까지 결제 완료 권장"])
        + "<p>주문이 집중되는 기간에는 배송이 평소보다 1~2일 지연될 수 있습니다. 따뜻한 마음이 제때 전해질 수 있도록 미리 준비해주세요.</p>" },
    { id: "n5", no: 5, tag: "이벤트", title: "신규 회원 웰컴 쿠폰 지급 안내", date: "2024.04.03", views: "1,560",
      body: "<p>COZYBREW와 처음 함께하시는 모든 분께 감사의 마음을 담아 웰컴 쿠폰을 드립니다. 가입 직후 마이페이지에서 바로 확인하실 수 있습니다.</p>"
        + "<h3>웰컴 혜택</h3>"
        + NL(["신규 가입 즉시 10% 할인 쿠폰 1매 지급", "첫 구매 후 리뷰 작성 시 3,000원 적립", "생일 월 추가 할인 쿠폰 제공"])
        + "<p>쿠폰 유효 기간은 발급일로부터 30일이며, 일부 특가 상품에는 적용되지 않을 수 있습니다. 좋은 커피와 함께 즐거운 시작이 되시길 바랍니다.</p>" },
    { id: "n4", no: 4, tag: "", title: "캡슐 정기구독 서비스 출시 안내", date: "2024.03.27", views: "880",
      body: "<p>매번 떨어질 때마다 주문하는 번거로움 없이, 원하는 주기에 맞춰 캡슐을 자동으로 받아보실 수 있는 정기구독 서비스를 새롭게 시작합니다.</p>"
        + "<h3>구독 혜택</h3>"
        + NL(["구독가 최대 15% 상시 할인", "구독 회원 전용 무료배송", "배송 주기 자유 변경 및 언제든 해지 가능"])
        + "<p>2주, 4주, 6주 단위로 배송 주기를 선택하실 수 있으며, 다음 배송일은 마이페이지에서 자유롭게 조정할 수 있습니다. 끊김 없는 커피 일상을 경험해보세요.</p>" },
    { id: "n3", no: 3, tag: "", title: "개인정보처리방침 개정 안내", date: "2024.03.20", views: "333",
      body: "<p>관련 법령 개정 및 서비스 개선에 따라 개인정보처리방침이 일부 변경됩니다. 변경 내용을 안내드리오니 이용에 참고 부탁드립니다.</p>"
        + "<h3>주요 변경 사항</h3>"
        + NL(["개인정보 보관 기간 및 파기 절차 문구 명확화", "정기구독 서비스 도입에 따른 결제 정보 처리 항목 추가", "개인정보 보호책임자 연락처 갱신"])
        + "<p>시행일은 2024년 4월 1일이며, 전체 내용은 하단 개인정보처리방침 페이지에서 확인하실 수 있습니다. 변경 사항에 동의하지 않으실 경우 회원 탈퇴를 요청하실 수 있습니다.</p>" },
    { id: "n2", no: 2, tag: "", title: "설 연휴 고객센터 운영 안내", date: "2024.03.12", views: "705",
      body: "<p>설 연휴를 맞아 고객센터 운영 일정을 안내드립니다. 연휴 기간 동안 전화 상담이 일시 중단되며, 1:1 문의는 정상 접수되나 답변은 운영 재개 후 순차적으로 드립니다.</p>"
        + "<h3>운영 일정</h3>"
        + NL(["휴무 기간: 2024년 2월 9일(금) ~ 2월 12일(월)", "정상 운영: 2월 13일(화) 오전 10시부터", "연휴 중 배송: 택배사 사정에 따라 순차 발송"])
        + "<p>연휴 직전·직후에는 배송이 다소 지연될 수 있는 점 너른 양해 부탁드립니다. 따뜻하고 행복한 명절 보내세요.</p>" },
    { id: "n1", no: 1, tag: "이벤트", title: "플래그십 스토어 오픈 기념 이벤트", date: "2024.03.05", views: "1,210",
      body: "<p>COZYBREW의 모든 제품을 직접 만나고 체험하실 수 있는 첫 플래그십 스토어가 문을 엽니다. 오픈을 기념해 방문객을 위한 다양한 혜택을 준비했습니다.</p>"
        + "<h3>오픈 이벤트</h3>"
        + NL(["기간: 2024년 3월 9일(토) ~ 3월 31일(일)", "매장 방문 고객 대상 시그니처 메뉴 무료 시음", "현장 구매 시 사은품 증정 및 전용 할인 적용", "SNS 인증 시 원두 샘플 증정"])
        + "<p>위치는 서울 성수동이며, 전문 컨설턴트가 제품 선택을 도와드립니다. 커피를 사랑하는 분이라면 누구나 환영합니다.</p>" }
  ];

  /* ============================================================
     스토리 데이터 (목록 + 상세 공용)
     ============================================================ */
  const SB = (blocks) => blocks.map((b) => {
    if (b.h) return `<h2>${b.h}</h2>`;
    if (b.img) return `<figure><img loading="lazy" decoding="async" src="${b.img}" alt="">${b.cap ? `<figcaption>${b.cap}</figcaption>` : ""}</figure>`;
    if (b.q) return `<blockquote>${b.q}</blockquote>`;
    return `<p>${b.p}</p>`;
  }).join("");
  const STORIES = [
    { id: "idea-feature", cat: "홈카페 아이디어", title: "따뜻한 우드톤으로 완성한 나만의 홈카페", image: "./image/story/story-idea-feature.jpg",
      lead: "자연 소재와 부드러운 컬러로 완성된 공간은 커피의 향을 더 깊게 만들어줍니다.",
      body: SB([
        { p: "매일 마시는 커피라면, 그 커피를 내리는 공간도 마음에 들어야 합니다. 우드톤은 별다른 공사 없이도 공간에 따뜻함과 안정감을 불어넣는 가장 손쉬운 방법입니다. 원목 트레이나 작은 선반 하나만 더해도 커피 코너의 분위기가 확연히 달라집니다." },
        { img: "./image/story/story-idea-card-1.jpg", cap: "원목 소재의 작은 선반으로 완성한 커피 코너" },
        { h: "소재로 분위기를 만든다" },
        { p: "우드, 라탄, 린넨처럼 자연에서 온 소재들은 서로 잘 어우러집니다. 너무 어둡지 않은 미디엄 톤의 원목을 베이스로 두고, 패브릭 소품으로 포인트를 주면 차분하면서도 생기 있는 공간이 됩니다." },
        { p: "잔과 도구도 공간의 일부입니다. 같은 색 계열로 맞추면 정돈된 느낌을 주고, 한두 가지 포인트 컬러만 더하면 단조롭지 않게 마무리할 수 있습니다." },
        { img: "./image/story/story-idea-card-2.jpg", cap: "꼭 필요한 도구만 남긴 미니멀한 테이블" },
        { h: "빛과 초록으로 완성하기" },
        { p: "조명은 너무 밝지 않은 전구색을 추천합니다. 부드러운 빛이 원두와 잔의 질감을 살려주어 한 잔의 커피가 한층 특별하게 느껴집니다." },
        { q: "작은 식물 한 포기가 공간 전체의 분위기를 바꿉니다. 초록의 생기가 우드톤과 만나 머물고 싶은 자리가 완성됩니다." },
        { p: "거창한 인테리어가 아니어도 좋습니다. 좋아하는 소재와 빛, 약간의 초록만으로 매일의 커피 시간이 기다려지는 나만의 홈카페를 만들어보세요." }
      ]) },
    { id: "idea-1", cat: "소형 공간", title: "작은 집을 위한 홈카페 아이디어", image: "./image/story/story-idea-card-1.jpg",
      lead: "좁은 공간도 답답하지 않게 보이는 배치와 수납 기준입니다.",
      body: SB([
        { p: "공간이 작다고 홈카페를 포기할 필요는 없습니다. 오히려 작은 공간일수록 '무엇을 두지 않을지'를 정하는 것이 중요합니다. 자주 쓰는 도구만 꺼내두고 나머지는 보이지 않게 정리하면, 같은 면적도 훨씬 넓고 여유롭게 느껴집니다." },
        { img: "./image/story/story-idea-card-2.jpg", cap: "비움에서 시작하는 작은 커피 코너" },
        { h: "벽과 높이를 활용한다" },
        { p: "바닥 면적이 부족하다면 시선을 위로 올려보세요. 벽에 선반을 달거나 후크를 더하면 컵과 도구를 가볍게 걸어둘 수 있어, 좁은 공간을 효율적으로 쓸 수 있습니다." },
        { p: "수납은 '한 번에 보이는 양'을 줄이는 것이 핵심입니다. 같은 크기의 보관함으로 통일하면 어수선함이 사라지고 정돈된 인상을 줍니다." },
        { img: "./image/story/story-idea-feature.jpg", cap: "밝은 톤으로 넓어 보이는 효과를 더한 공간" },
        { h: "밝은 톤으로 넓어 보이게" },
        { p: "밝은 색의 가구와 소품은 빛을 반사해 공간을 한층 환하고 넓게 보이도록 만들어줍니다. 큰 가구 하나보다, 작고 가벼운 가구 여러 개가 좁은 공간에는 더 잘 어울립니다." },
        { q: "작은 공간의 홈카페는 '채우기'가 아니라 '고르기'입니다. 꼭 필요한 것만 남기면 공간이 답을 합니다." }
      ]) },
    { id: "idea-2", cat: "미니멀", title: "간결함이 주는 편안함", image: "./image/story/story-idea-card-2.jpg",
      lead: "꼭 필요한 도구만 남겨 매일 쓰기 좋은 커피 코너를 만들어보세요.",
      body: SB([
        { p: "미니멀한 커피 코너의 핵심은 '매일 쓰는 것'에 집중하는 것입니다. 멋져 보여서 사두었지만 손이 가지 않는 도구들은, 사실 공간과 마음을 어수선하게 만드는 가장 큰 원인입니다." },
        { img: "./image/story/story-idea-card-3.jpg", cap: "꼭 필요한 것만 남긴 차분한 구성" },
        { h: "통일감이 만드는 차분함" },
        { p: "같은 톤, 같은 소재의 소품으로 맞추면 시각적으로 정돈되고 차분한 느낌을 줍니다. 색과 형태의 수를 줄이는 것만으로도 공간은 한결 단정해집니다." },
        { p: "도구의 수가 줄면 청소와 관리도 쉬워집니다. 매일 닦고 정리하는 부담이 줄어들면, 커피를 내리는 일 자체가 더 가벼운 즐거움이 됩니다." },
        { img: "./image/story/story-idea-feature.jpg", cap: "여백이 주는 여유로운 분위기" },
        { q: "비움은 부족함이 아니라 여유입니다. 덜어낼수록 남은 것이 더 또렷하게 보입니다." },
        { p: "오늘 한 가지만 정리해보세요. 잘 쓰지 않는 잔 하나를 치우는 것에서, 매일 머물고 싶은 간결한 커피 코너가 시작됩니다." }
      ]) },
    { id: "idea-3", cat: "브런치", title: "주말을 특별하게 만드는 홈카페", image: "./image/story/story-idea-card-3.jpg",
      lead: "식사와 커피가 자연스럽게 이어지는 테이블 구성을 제안합니다.",
      body: SB([
        { p: "느긋한 주말 아침, 브런치와 함께하는 커피 한 잔은 평범한 하루를 작은 카페처럼 만들어줍니다. 음식과 커피가 자연스럽게 어우러지는 테이블 세팅만으로도 분위기가 완성됩니다." },
        { img: "./image/story/story-idea-card-1.jpg", cap: "같은 소재로 통일한 브런치 테이블" },
        { h: "테이블에 통일감을 주기" },
        { p: "식기와 잔을 같은 소재나 색 계열로 맞추면 테이블 전체가 한 장의 그림처럼 정돈됩니다. 우드 트레이 위에 올리는 것만으로도 분위기가 살아납니다." },
        { p: "커피는 음식과의 균형을 고려해 산미가 부드러운 원두를 추천합니다. 진한 브런치 메뉴에는 고소한 미디엄 로스팅이 특히 잘 어울립니다." },
        { img: "./image/story/story-idea-feature.jpg", cap: "햇살과 음악이 더해진 여유로운 주말" },
        { q: "특별한 날이 아니어도, 정성껏 차린 테이블 하나가 주말을 선물처럼 만들어줍니다." },
        { p: "여유로운 음악과 창으로 들어오는 햇살을 더해보세요. 익숙한 집이 가장 편안한 카페가 되는 순간입니다." }
      ]) },
    { id: "styling-feature", cat: "공간별 스타일링", title: "따뜻한 우드톤 홈카페 스타일링", image: "./image/story/story-styling-feature.jpg",
      lead: "자연스러운 우드 질감과 부드러운 컬러의 조화로 머물기 편안한 홈카페를 완성해보세요.",
      body: SB([
        { p: "우드톤 스타일링의 매력은 '편안함'입니다. 화려하지 않지만 질리지 않고, 시간이 지날수록 더 정감 있게 느껴집니다. 우드 가구는 공간의 중심을 잡아주는 든든한 베이스가 됩니다." },
        { img: "./image/story/story-styling-card-1.jpg", cap: "미디엄 톤 원목을 중심으로 한 구성" },
        { h: "베이스가 되는 우드 고르기" },
        { p: "너무 어둡지 않은 미디엄 톤의 원목을 고르면 다양한 소품과 무리 없이 어울립니다. 바닥, 가구, 소품의 톤을 비슷하게 맞추면 통일감 있는 분위기를 연출할 수 있습니다." },
        { p: "패브릭 소품으로 포인트를 더해보세요. 린넨이나 코튼처럼 자연스러운 질감의 소재는 우드의 따뜻함을 한층 살려줍니다." },
        { img: "./image/story/story-styling-card-2.jpg", cap: "패브릭과 소품으로 더한 포인트" },
        { h: "색은 세 가지 이내로" },
        { p: "전체 색을 세 가지 이내로 제한하면 차분하면서도 세련된 분위기가 유지됩니다. 베이스 컬러, 우드 컬러, 그리고 하나의 포인트 컬러만 정해도 충분합니다." },
        { q: "잘 어울리는 공간은 비싼 가구가 아니라, 톤이 정돈된 공간입니다." }
      ]) },
    { id: "styling-1", cat: "원룸", title: "원룸에 어울리는 작은 커피 코너", image: "./image/story/story-styling-card-1.jpg",
      lead: "작은 가구와 밝은 톤으로 부담 없는 홈카페를 완성합니다.",
      body: SB([
        { p: "원룸에서는 모든 가구가 여러 역할을 해야 합니다. 커피 코너 역시 독립된 공간을 따로 만들기보다, 이미 있는 가구를 똑똑하게 활용하는 것이 현실적입니다." },
        { img: "./image/story/story-styling-card-2.jpg", cap: "멀티 기능 가구로 완성한 코너" },
        { h: "멀티 기능 가구 활용하기" },
        { p: "사이드 테이블 하나로 커피 코너와 작업 공간을 겸할 수 있습니다. 바퀴가 달린 이동식 선반은 필요할 때 꺼내 쓰고 평소엔 안쪽으로 넣어둘 수 있어 특히 유용합니다." },
        { p: "콘센트 위치를 고려해 머신을 배치하면 선이 어수선해지지 않고 동선도 깔끔해집니다. 작은 공간일수록 '동선'이 곧 인테리어입니다." },
        { img: "./image/story/story-styling-feature.jpg", cap: "밝은 톤으로 넓어 보이게" },
        { q: "원룸의 홈카페는 더하기보다 겹치기입니다. 하나의 가구가 여러 역할을 하게 만드세요." },
        { p: "밝은 톤의 소품으로 마무리하면 좁은 공간도 환하고 넓어 보입니다. 작지만 나에게 꼭 맞는 커피 자리를 만들어보세요." }
      ]) },
    { id: "styling-2", cat: "주방", title: "주방 한 켠 커피 스테이션", image: "./image/story/story-styling-card-2.jpg",
      lead: "물 사용, 전원, 컵 보관을 고려한 실용적인 스타일링입니다.",
      body: SB([
        { p: "주방은 물과 전원이 가까워 커피 스테이션을 만들기에 가장 좋은 공간입니다. 싱크대 근처의 작은 영역만 정해도 효율적인 커피 코너가 완성됩니다." },
        { img: "./image/story/story-styling-card-3.jpg", cap: "싱크대 옆에 마련한 커피 스테이션" },
        { h: "동선을 먼저 생각하기" },
        { p: "물을 받고, 원두를 갈고, 추출하고, 정리하는 일련의 과정이 한자리에서 이어지도록 배치하면 사용이 훨씬 편해집니다. 자주 쓰는 잔은 손이 닿는 선반에, 원두와 도구는 가까운 서랍에 정리해보세요." },
        { p: "물기가 닿기 쉬운 공간인 만큼, 방수가 잘 되는 소재의 트레이를 깔아두면 관리가 한결 수월합니다." },
        { img: "./image/story/story-styling-feature.jpg", cap: "정돈된 수납이 만드는 깔끔함" },
        { q: "잘 쓰는 커피 공간의 비결은 멋진 도구가 아니라, 손에 익는 동선입니다." },
        { p: "주방의 작은 한 켠이 매일 아침을 여는 가장 부지런한 자리가 됩니다." }
      ]) },
    { id: "styling-3", cat: "거실", title: "거실에서 즐기는 여유로운 홈카페", image: "./image/story/story-styling-card-3.jpg",
      lead: "대화와 휴식이 이어지는 거실형 홈카페 세팅입니다.",
      body: SB([
        { p: "거실은 가족, 친구와 함께 커피를 즐기기에 가장 좋은 공간입니다. 혼자만의 커피 코너와 달리, 거실 홈카페는 '함께하는 시간'을 중심에 둡니다." },
        { img: "./image/story/story-styling-card-1.jpg", cap: "낮은 테이블 중심의 거실 세팅" },
        { h: "함께 머무는 구성" },
        { p: "낮은 테이블과 편안한 좌석을 중심으로 구성하면 대화와 휴식이 자연스럽게 이어집니다. 이동식 트롤리에 커피 도구를 모아두면 필요한 자리로 옮겨 쓸 수 있어 편리합니다." },
        { p: "조명은 분위기를 좌우합니다. 천장 조명 대신 스탠드나 간접 조명을 더하면 카페 같은 아늑함이 살아납니다." },
        { img: "./image/story/story-styling-feature.jpg", cap: "러그와 조명으로 더한 아늑함" },
        { q: "거실 홈카페의 완성은 인테리어가 아니라, 그 자리에서 나누는 시간입니다." },
        { p: "포근한 러그 한 장을 더하면 공간의 온도가 달라집니다. 좋아하는 사람과 함께 머무는 여유로운 자리를 만들어보세요." }
      ]) },
    { id: "mag-feature", cat: "커피 라이프 매거진", title: "일상에 스며든 작은 커피의 순간들", image: "./image/story/story-magazine-feature.jpg",
      lead: "평범한 하루 속에서 발견하는 커피의 시간, 작은 여유가 만드는 큰 변화에 대해 이야기합니다.",
      body: SB([
        { p: "커피 한 잔을 내리는 짧은 시간은, 생각보다 많은 것을 바꿉니다. 물이 끓기를 기다리고, 원두를 갈고, 향을 맡는 그 몇 분이 하루를 정리하고 마음을 다듬는 작은 의식이 되어줍니다." },
        { img: "./image/story/story-magazine-card-1.jpg", cap: "천천히 흐르는 핸드드립의 시간" },
        { h: "특별하지 않아도 좋다" },
        { p: "꼭 비싼 도구나 화려한 레시피가 필요한 것은 아닙니다. 매일 같은 자리에서 같은 잔으로 마시는 커피가 주는 안정감이 있습니다. 익숙함은 그 자체로 위로가 됩니다." },
        { p: "바쁜 날일수록 이 짧은 의식이 더 큰 힘을 발휘합니다. 잠깐 멈춰 향을 맡는 것만으로도, 마음의 속도가 조금 느려집니다." },
        { img: "./image/story/story-magazine-card-2.jpg", cap: "매일 반복되는 작은 루틴" },
        { q: "작은 여유의 순간들이 쌓여, 일상은 조금 더 단단하고 풍요로워집니다." },
        { p: "오늘도 한 잔의 커피로 잠시 멈춰보세요. 그 짧은 시간이 하루를 지탱하는 작은 기둥이 되어줄지 모릅니다." }
      ]) },
    { id: "mag-1", cat: "브루잉 팁", title: "핸드드립이 주는 여유", image: "./image/story/story-magazine-card-1.jpg",
      lead: "천천히 흐르는 시간, 핸드드립으로 나만의 커피를 완성하는 방법.",
      body: SB([
        { p: "핸드드립의 매력은 결과만큼이나 과정에 있습니다. 물줄기를 따라 천천히 부풀어 오르는 원두를 바라보는 시간은, 그 자체로 하루 중 가장 고요한 휴식이 됩니다." },
        { img: "./image/story/story-magazine-card-2.jpg", cap: "물줄기를 따라 부풀어 오르는 원두" },
        { h: "기본만 지켜도 충분하다" },
        { p: "물의 온도는 90~93도 사이, 물줄기는 가늘고 일정하게 유지하는 것이 기본입니다. 처음엔 소량의 물로 원두를 적셔 30초 정도 뜸을 들이면, 한층 균형 잡힌 맛을 얻을 수 있습니다." },
        { p: "분쇄도와 물의 양, 붓는 속도를 조금씩 바꿔보세요. 같은 원두라도 전혀 다른 잔이 만들어지는 것이 핸드드립의 즐거움입니다." },
        { img: "./image/story/story-magazine-feature.jpg", cap: "나만의 레시피를 찾아가는 과정" },
        { q: "정답을 찾기보다, 매일 조금씩 바꿔보며 나만의 레시피를 만들어가는 즐거움을 느껴보세요." },
        { p: "서두르지 않아도 됩니다. 천천히 내리는 한 잔 속에, 바쁜 하루가 잠시 멈추는 여유가 담깁니다." }
      ]) },
    { id: "mag-2", cat: "라이프스타일", title: "아침을 여는 커피 루틴", image: "./image/story/story-magazine-card-2.jpg",
      lead: "더 좋은 하루를 만드는 아침 커피 루틴을 소개합니다.",
      body: SB([
        { p: "하루의 시작을 어떻게 여느냐가 그날 전체의 리듬을 좌우합니다. 일정한 아침 루틴은 마음을 안정시키고, 커피를 내리는 시간은 그 시작점으로 삼기에 더없이 좋습니다." },
        { img: "./image/story/story-magazine-card-3.jpg", cap: "하루를 여는 한 잔" },
        { h: "전날 밤의 작은 준비" },
        { p: "전날 밤 원두와 도구를 미리 꺼내두면, 바쁜 아침에도 여유를 잃지 않습니다. 작은 준비 하나가 아침의 분주함을 한결 가볍게 만들어줍니다." },
        { p: "같은 시간, 같은 순서로 반복되는 루틴은 몸과 마음에 안정감을 줍니다. 거창할 필요 없이, 나에게 맞는 단순한 흐름이면 충분합니다." },
        { img: "./image/story/story-magazine-feature.jpg", cap: "창가에서 맞이하는 아침" },
        { q: "창문을 열고 마시는 첫 모금의 커피가, 하루를 기분 좋게 깨워줍니다." },
        { p: "내일 아침, 조금 더 일찍 일어나 커피 한 잔의 여유를 더해보세요. 작은 루틴이 하루의 질을 바꿉니다." }
      ]) },
    { id: "mag-3", cat: "시즌 픽", title: "여름을 위한 시원한 커피 레시피", image: "./image/story/story-magazine-card-3.jpg",
      lead: "더운 날씨에도 즐기기 좋은 시원한 홈카페 레시피 모음.",
      body: SB([
        { p: "기온이 오르기 시작하면 따뜻한 커피보다 시원한 한 잔이 간절해집니다. 집에서도 카페 못지않은 아이스 음료를 즐길 수 있는 간단한 레시피를 소개합니다." },
        { img: "./image/story/story-magazine-card-1.jpg", cap: "기본이자 정석, 아이스 아메리카노" },
        { h: "기본은 역시 아이스 아메리카노" },
        { p: "진하게 추출한 에스프레소에 얼음과 차가운 물을 더하면 가장 기본적이면서도 시원한 한 잔이 완성됩니다. 얼음을 넉넉히 채우고 물을 천천히 부으면 층이 분리되는 예쁜 비주얼도 즐길 수 있습니다." },
        { p: "부드러운 맛을 원한다면 우유나 오트밀크를 더해 아이스 라떼로 즐겨보세요. 시럽 대신 연유를 살짝 넣으면 색다른 단맛을 낼 수 있습니다." },
        { img: "./image/story/story-magazine-feature.jpg", cap: "미리 만들어두는 콜드브루" },
        { h: "여름엔 콜드브루를 상비하기" },
        { p: "차게 식힌 콜드브루를 미리 만들어 냉장고에 두면, 무더운 여름 내내 손쉽게 시원한 커피를 즐길 수 있습니다. 물 대신 우유에 희석하거나 탄산수를 더해 다양하게 변주해보세요." },
        { q: "더운 날의 커피는 시원함만큼이나 '준비해둔 여유'가 만들어줍니다." }
      ]) }
  ];

  /* ============================================================
     모바일 내비게이션 (햄버거 드로어)
     ============================================================ */
  const siteHeader = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const primaryNav = document.getElementById("primary-nav");
  if (siteHeader && navToggle && primaryNav) {
    const backdrop = document.createElement("div");
    backdrop.className = "nav-backdrop";
    siteHeader.appendChild(backdrop);
    const setNav = (open) => {
      siteHeader.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
      document.body.style.overflow = open ? "hidden" : "";
    };
    navToggle.addEventListener("click", () => setNav(!siteHeader.classList.contains("nav-open")));
    backdrop.addEventListener("click", () => setNav(false));
    primaryNav.addEventListener("click", (event) => { if (event.target.closest("a")) setNav(false); });
    window.addEventListener("keydown", (event) => { if (event.key === "Escape") setNav(false); });
    window.addEventListener("resize", () => { if (window.innerWidth > 860) setNav(false); });
  }

  /* ============================================================
     헤더 장바구니 뱃지 (모든 페이지 공통) — 기본 0에서 시작
     ============================================================ */
  const headerCartLink = document.querySelector('.header-icons a[href$="cart.html"]');
  if (headerCartLink) {
    headerCartLink.classList.add("cart-link");
    let headerBadge = headerCartLink.querySelector("em");
    if (!headerBadge) {
      headerBadge = document.createElement("em");
      headerCartLink.appendChild(headerBadge);
    }
    setCartBadge(headerBadge, cartCount());
  }

  /* ============================================================
     로그인 / 로그아웃 (login.html) — 데모용 상태 토글
     ============================================================ */
  const loginCard = document.querySelector(".login-card");
  if (loginCard) {
    const loginBtn = loginCard.querySelector('button[type="submit"]');
    const syncLoginBtn = () => {
      if (!loginBtn) return;
      const loggedIn = isLoggedIn();
      loginBtn.textContent = loggedIn ? "로그아웃" : "로그인";
      // 로그아웃 시에는 빈 입력값 검증을 건너뛴다
      loginBtn.formNoValidate = loggedIn;
    };
    const idField = loginCard.querySelector('input[name="userid"]');
    const pwField = loginCard.querySelector('input[name="password"]');
    // 자격 검증: 가입 시 저장한 계정 + 데모용 기본 테스트 계정(test@cozybrew.com / Test1234!)
    const credentialsMatch = (id, pw) => {
      if (id === "test@cozybrew.com" && pw === "Test1234!") return true;
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem("cozybrew_account")); } catch (e) {}
      return !!saved && id === String(saved.email || "").trim() && pw === saved.password;
    };
    // 에러 메시지는 입력을 수정하면 즉시 해제
    if (pwField) {
      const clearAuthError = () => setFieldError(pwField, "");
      idField && idField.addEventListener("input", clearAuthError);
      pwField.addEventListener("input", clearAuthError);
    }
    loginCard.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();   // 일반 폼 피드백 핸들러(버튼 "완료") 차단
      if (isLoggedIn()) {
        setLogin(false);
        syncLoginBtn();
        return;
      }
      const id = idField ? idField.value.trim() : "";
      const pw = pwField ? pwField.value : "";
      if (credentialsMatch(id, pw)) {
        pwField && setFieldError(pwField, "");
        // 로그인한 계정 정보를 저장해 마이페이지 프로필에 반영
        // 테스트 계정은 데모용 통계 유지, 실제 가입 계정은 0부터 시작
        let profile = { name: "코지브루", email: id, stats: { points: 0, coupons: 3, orders: 12 } };
        try {
          const acc = JSON.parse(localStorage.getItem("cozybrew_account") || "null");
          if (acc && id === String(acc.email || "").trim()) {
            profile = { name: acc.name || "회원", email: acc.email, stats: { points: 0, coupons: 0, orders: 0 } };
          }
        } catch (e) {}
        try { localStorage.setItem("cozybrew_user", JSON.stringify(profile)); } catch (e) {}
        setLogin(true);
        window.location.href = "./index.html";
      } else if (pwField) {
        setFieldError(pwField, "이메일(또는 아이디)이나 비밀번호가 일치하지 않습니다.");
        pwField.focus();
      }
    });
    syncLoginBtn();

    /* 테스트 편의: 로그인 버튼을 5번 연속 클릭하면 테스트 계정이 자동 입력됩니다 */
    if (loginBtn) {
      let clicks = 0;
      let timer = null;
      loginBtn.addEventListener("click", (event) => {
        if (isLoggedIn()) return;            // 로그인 상태(로그아웃 버튼)일 때는 무시
        // 빈 칸이 있으면 브라우저 기본 검증(화면이 위로 튐)을 막고 클릭만 집계
        if (!loginCard.checkValidity()) event.preventDefault();
        clicks += 1;
        clearTimeout(timer);
        timer = setTimeout(() => { clicks = 0; }, 1500);  // 1.5초 안에 연속 클릭해야 카운트 유지
        if (clicks >= 5) {
          event.preventDefault();            // 5번째 클릭은 제출 대신 자동 입력만
          const idField = loginCard.querySelector('input[name="userid"]');
          const pwField = loginCard.querySelector('input[name="password"]');
          if (idField) idField.value = "test@cozybrew.com";
          if (pwField) pwField.value = "Test1234!";
          clicks = 0;
        }
      });
    }
  }

  /* ============================================================
     회원가입 (join.html) — 가입하기 버튼 5번 클릭 시 테스트 정보 자동 입력
     ============================================================ */
  const joinTestForm = document.querySelector(".join-form");
  if (joinTestForm) {
    const joinBtn = joinTestForm.querySelector('button[type="submit"]');
    if (joinBtn) {
      let clicks = 0;
      let timer = null;
      joinBtn.addEventListener("click", (event) => {
        // 빈 칸이 있으면 브라우저 기본 검증(화면이 위로 튐)을 막고 클릭만 집계
        if (!joinTestForm.checkValidity()) event.preventDefault();
        clicks += 1;
        clearTimeout(timer);
        timer = setTimeout(() => { clicks = 0; }, 1500);
        if (clicks >= 5) {
          event.preventDefault();
          const setVal = (name, value) => {
            const el = joinTestForm.querySelector(`input[name="${name}"]`);
            if (el) el.value = value;
          };
          setVal("name", "테스트");
          setVal("email", "test@cozybrew.com");
          setVal("password", "Test1234!");
          setVal("passwordConfirm", "Test1234!");
          setVal("phone", "01012345678");
          setVal("address", "서울특별시 마포구 월드컵로 123");
          setVal("addressDetail", "10층");
          // 필수 약관 체크박스도 모두 체크
          joinTestForm.querySelectorAll('.agree-box input[type="checkbox"]').forEach((cb) => { cb.checked = true; });
          clicks = 0;
        }
      });
    }
  }

  /* ============================================================
     회원가입 (join.html) — 인증번호 발송 데모 팝업
     ============================================================ */
  (function initPhoneVerify() {
    const form = document.querySelector(".join-form");
    if (!form) return;
    const sendBtn = form.querySelector(".inline-input button");
    const phoneInput = form.querySelector('input[name="phone"]');
    if (!sendBtn || !phoneInput) return;

    const backdrop = document.createElement("div");
    backdrop.className = "cb-modal-backdrop";
    backdrop.innerHTML =
      '<div class="cb-modal" role="dialog" aria-modal="true" aria-labelledby="cbVerifyTitle">' +
        '<h3 id="cbVerifyTitle"></h3>' +
        '<p class="cb-modal-desc"></p>' +
        '<input type="text" class="code-input" inputmode="numeric" maxlength="6" placeholder="인증번호 6자리">' +
        '<div class="cb-modal-actions">' +
          '<button type="button" class="btn-confirm"></button>' +
          '<button type="button" class="btn-cancel">취소</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(backdrop);

    const titleEl = backdrop.querySelector("#cbVerifyTitle");
    const descEl = backdrop.querySelector(".cb-modal-desc");
    const codeInput = backdrop.querySelector(".code-input");
    const confirmBtn = backdrop.querySelector(".btn-confirm");
    const cancelBtn = backdrop.querySelector(".btn-cancel");
    let currentCode = null;
    let mode = "verify";

    const open = () => backdrop.classList.add("open");
    const close = () => backdrop.classList.remove("open");

    sendBtn.addEventListener("click", () => {
      if (sendBtn.disabled) return;
      const phone = phoneInput.value.replace(/\D/g, "");
      if (phone.length < 10) {
        mode = "phone";
        titleEl.textContent = "휴대폰 번호를 확인해주세요";
        descEl.textContent = "인증번호를 받을 휴대폰 번호를 먼저 입력해주세요.";
        codeInput.style.display = "none";
        cancelBtn.style.display = "none";
        confirmBtn.textContent = "확인";
        open();
        return;
      }
      mode = "verify";
      currentCode = String(Math.floor(100000 + Math.random() * 900000));
      titleEl.textContent = "인증번호가 발송되었습니다";
      descEl.innerHTML = "입력하신 번호로 인증번호를 보냈어요.<br>" +
        '<span class="demo-code">데모 인증번호 ' + currentCode + "</span>";
      codeInput.style.display = "";
      codeInput.value = "";
      cancelBtn.style.display = "";
      confirmBtn.textContent = "인증하기";
      open();
      setTimeout(() => codeInput.focus(), 60);
    });

    confirmBtn.addEventListener("click", () => {
      if (mode === "phone") {
        close();
        phoneInput.focus();
        return;
      }
      if (codeInput.value.trim() === currentCode) {
        close();
        sendBtn.textContent = "인증 완료";
        sendBtn.disabled = true;
      } else {
        descEl.innerHTML = '<span class="cb-modal-error">인증번호가 일치하지 않습니다. 다시 확인해주세요.</span>';
        codeInput.focus();
        codeInput.select();
      }
    });

    cancelBtn.addEventListener("click", close);
    backdrop.addEventListener("click", (event) => { if (event.target === backdrop) close(); });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && backdrop.classList.contains("open")) close();
    });
    codeInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") { event.preventDefault(); confirmBtn.click(); }
    });
  })();

  /* ============================================================
     검색 페이지
     ============================================================ */
  const searchForm = document.querySelector("[data-search-form]");
  if (searchForm) {
    // 실제 카탈로그(PRODUCTS)에서 검색 결과 카드와 필터 탭을 생성한다
    const searchGrid = document.querySelector(".catalog-grid");
    if (searchGrid) {
      searchGrid.innerHTML = PRODUCTS.map((p) =>
        `<article class="catalog-card" data-category="${p.category}" data-name="${p.name}">` +
        (p.badge ? `<span class="badge">${p.badge}</span>` : "") +
        `<img loading="eager" decoding="sync" fetchpriority="high" src="${p.image}" alt="">` +
        `<h3>${p.name}</h3><p>${p.summary}</p><strong>${won(p.price)}</strong>` +
        `<a href="./product-detail.html?id=${p.id}">자세히 보기</a></article>`).join("");
    }
    const filterTabs = document.querySelector(".filter-tabs");
    const cats = [
      { key: "all", label: "전체" },
      { key: "espresso", label: "에스프레소 머신" },
      { key: "grinder", label: "그라인더" },
      { key: "capsule", label: "캡슐머신" },
      { key: "goods", label: "커피용품" }
    ];
    const input = searchForm.querySelector('input[type="search"]');
    const clearButton = searchForm.querySelector(".search-clear");
    const resultSection = document.querySelector(".product-results");
    const emptyState = document.querySelector("[data-empty-state]");
    const resultText = document.querySelector(".page-title-row p");
    const resultCount = document.querySelector(".sort-box span");
    const cards = [...document.querySelectorAll(".catalog-card")];
    const recentList = document.querySelector(".keyword-list");
    let currentFilter = "all";
    const emptyRecent = document.createElement("p");
    emptyRecent.className = "empty-inline";
    emptyRecent.textContent = "최근 검색어가 없습니다.";
    const setQuery = (query) => {
      currentFilter = "all";
      input.value = query;
      resultText.textContent = query ? `'${query}'에 대한 검색 결과입니다.` : "검색어를 입력하면 관련 제품이 표시됩니다.";
      input.focus();
    };
    const syncClear = () => { clearButton.hidden = !input.value.trim(); };
    const norm = (t) => t.toLowerCase().replace(/\s+/g, "");
    const cardMatchesQuery = (card, nq) => norm(card.dataset.name).includes(nq) || norm(card.textContent).includes(nq);
    const renderTabs = (query) => {
      if (!filterTabs) return;
      const nq = norm(query);
      const matching = query ? cards.filter((card) => cardMatchesQuery(card, nq)) : [];
      const countOf = (key) => (key === "all" ? matching.length : matching.filter((card) => card.dataset.category === key).length);
      if (currentFilter !== "all" && countOf(currentFilter) === 0) currentFilter = "all";
      filterTabs.innerHTML = cats
        .filter((c) => c.key === "all" || countOf(c.key) > 0)
        .map((c) => `<button class="${c.key === currentFilter ? "active" : ""}" data-filter="${c.key}">${c.label} (${countOf(c.key)})</button>`)
        .join("");
    };
    const filterCards = () => {
      const query = input.value.trim().replace(/^\d+\s*/, "");
      const hasQuery = Boolean(query);
      const nq = norm(query);
      renderTabs(query);
      let visible = 0;
      cards.forEach((card) => {
        const matchesFilter = currentFilter === "all" || card.dataset.category === currentFilter;
        const matchesQuery = hasQuery && cardMatchesQuery(card, nq);
        const show = matchesFilter && matchesQuery;
        card.hidden = !show;
        if (show) visible += 1;
      });
      resultCount.textContent = `총 ${visible}개의 결과`;
      resultText.textContent = hasQuery ? `'${query}'에 대한 검색 결과입니다.` : "검색어를 입력하면 관련 제품이 표시됩니다.";
      const showResults = hasQuery && visible > 0;
      if (resultSection) resultSection.hidden = !showResults;
      if (emptyState) {
        emptyState.hidden = showResults;
        const et = emptyState.querySelector(".empty-title");
        const ed = emptyState.querySelector(".empty-desc");
        if (!hasQuery) {
          if (et) et.textContent = "현재 검색 결과가 없습니다.";
          if (ed) ed.textContent = "위 검색창에 원하시는 제품을 입력하면 이곳에 결과가 표시됩니다.";
        } else {
          if (et) et.textContent = `'${query}'에 대한 검색 결과가 없습니다.`;
          if (ed) ed.textContent = "다른 검색어로 다시 시도해 보세요.";
        }
      }
    };
    searchForm.addEventListener("submit", (event) => { event.preventDefault(); setQuery(input.value.trim()); filterCards(); syncClear(); });
    input.addEventListener("input", () => { currentFilter = "all"; syncClear(); filterCards(); });
    clearButton.addEventListener("click", () => { setQuery(""); filterCards(); syncClear(); });
    document.querySelectorAll("[data-keyword]").forEach((button) => {
      button.addEventListener("click", (event) => {
        if (event.target.tagName === "SPAN") {
          button.remove();
          if (recentList && !recentList.querySelector("button")) recentList.append(emptyRecent);
          return;
        }
        setQuery(button.dataset.keyword); filterCards(); syncClear();
      });
    });
    document.querySelector("[data-clear-keywords]")?.addEventListener("click", () => { recentList.innerHTML = ""; recentList.append(emptyRecent); });
    if (filterTabs) {
      filterTabs.addEventListener("click", (event) => {
        const btn = event.target.closest("button");
        if (!btn) return;
        currentFilter = btn.dataset.filter;
        filterCards();
      });
    }
    document.querySelector(".sort-box select")?.addEventListener("change", (event) => {
      const grid = document.querySelector(".catalog-grid");
      const sorted = [...cards].sort((a, b) => {
        const aPrice = Number(a.querySelector("strong").textContent.replace(/[^\d]/g, ""));
        const bPrice = Number(b.querySelector("strong").textContent.replace(/[^\d]/g, ""));
        if (event.target.value === "낮은 가격순") return aPrice - bPrice;
        if (event.target.value === "인기순") {
          const rank = (c) => (c.querySelector(".badge") ? 0 : 1);
          return rank(a) - rank(b) || cards.indexOf(a) - cards.indexOf(b);
        }
        return 0;
      });
      sorted.forEach((card) => grid.append(card));
    });
    syncClear(); setQuery(""); filterCards();
  }

  /* ============================================================
     장바구니
     ============================================================ */
  const cartMain = document.querySelector(".cart-main");
  if (cartMain) {
    const MEMBER_RATE = 0.1; // 로그인(회원) 시 적용되는 할인율
    const COUPONS = {
      welcome10: { type: "rate", value: 0.1, min: 50000, label: "신규 가입 웰컴 쿠폰" },
      first3000: { type: "amount", value: 3000, min: 30000, label: "첫 구매 감사 쿠폰" },
      review5: { type: "rate", value: 0.05, min: 0, label: "리뷰 작성 감사 쿠폰" }
    };
    const couponSelect = document.querySelector("[data-coupon-select]");
    const couponMsg = document.querySelector("[data-coupon-msg]");
    const computeCoupon = (subtotal, selectedQty) => {
      if (!couponSelect || !couponSelect.value || selectedQty <= 0) { if (couponMsg) couponMsg.hidden = true; return 0; }
      const c = COUPONS[couponSelect.value];
      if (!c) { if (couponMsg) couponMsg.hidden = true; return 0; }
      if (subtotal < c.min) {
        if (couponMsg) { couponMsg.hidden = false; couponMsg.classList.add("is-warn"); couponMsg.textContent = `${won(c.min)} 이상 구매 시 사용 가능한 쿠폰이에요.`; }
        return 0;
      }
      if (couponMsg) { couponMsg.hidden = false; couponMsg.classList.remove("is-warn"); couponMsg.textContent = `${c.label}이 적용되었습니다.`; }
      return c.type === "rate" ? Math.floor(subtotal * c.value) : c.value;
    };
    const summary = document.querySelector(".order-summary");
    const orderCta = summary && summary.querySelector("a.btn-dark");
    if (orderCta) orderCta.textContent = isLoggedIn() ? "주문하기" : "비회원으로 주문하기";
    const selectAll = document.querySelector("[data-cart-select-all]");
    const titleCount = document.querySelector(".cart-top strong span");
    const cartBadge = document.querySelector(".cart-link em");
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "cart-empty";
    emptyMessage.textContent = "장바구니가 비어 있습니다.";
    const items = () => [...document.querySelectorAll(".cart-item")];
    const checkedItems = () => items().filter((item) => item.querySelector('input[type="checkbox"]').checked);
    const qty = (item) => Number(item.querySelector(".qty span").textContent);
    const price = (item) => Number(item.dataset.price);
    const cartActions = cartMain.querySelector(".cart-actions");
    const renderItems = () => {
      items().forEach((node) => node.remove());
      getCart().forEach((line) => {
        const p = productById(line.id);
        if (!p) return;
        const article = document.createElement("article");
        article.className = "cart-item";
        article.dataset.id = p.id;
        article.dataset.price = p.price;
        article.innerHTML =
          `<input type="checkbox" checked>` +
          `<img loading="lazy" decoding="async" src="${p.image}" alt="">` +
          `<div><h3>${p.name}${p.badge ? ` <span>${p.badge}</span>` : ""}</h3><p>색상: ${p.color}</p></div>` +
          `<div class="qty"><button type="button" data-qty="minus">-</button><span>${Math.max(1, Number(line.qty) || 1)}</span><button type="button" data-qty="plus">+</button></div>` +
          `<strong>${won(p.price)}</strong>` +
          `<button class="cart-remove" type="button" aria-label="상품 삭제">×</button>`;
        if (cartActions) cartActions.before(article); else cartMain.appendChild(article);
      });
    };
    const persistCart = () => saveCart(items().map((item) => ({ id: item.dataset.id, qty: qty(item) })));
    const refreshBorders = () => {
      items().forEach((item) => { item.classList.remove("is-first", "is-last"); item.style.borderRadius = ""; });
      items()[0]?.classList.add("is-first");
      items().at(-1)?.classList.add("is-last");
    };
    const refreshCart = () => {
      const allItems = items();
      const selected = checkedItems();
      const itemCount = allItems.length;
      const selectedQty = selected.reduce((sum, item) => sum + qty(item), 0);
      const subtotal = selected.reduce((sum, item) => sum + price(item) * qty(item), 0);
      const appliedDiscount = isLoggedIn() && selectedQty > 0 ? Math.floor(subtotal * MEMBER_RATE) : 0;
      const couponDiscount = computeCoupon(subtotal, selectedQty);
      const total = Math.max(0, subtotal - appliedDiscount - couponDiscount);
      titleCount.textContent = `${itemCount}개`;
      persistCart();
      setCartBadge(cartBadge, itemCount);
      if (selectAll) {
        selectAll.checked = itemCount > 0 && selected.length === itemCount;
        selectAll.indeterminate = selected.length > 0 && selected.length < itemCount;
      }
      summary.querySelector("dt").textContent = `상품 금액 (${selectedQty}개)`;
      summary.querySelector("dd").textContent = won(subtotal);
      summary.querySelector(".sale").textContent = `- ${won(appliedDiscount)}`;
      const couponLineDt = summary.querySelector(".coupon-line");
      const couponLineDd = summary.querySelector(".coupon-sale");
      if (couponLineDt && couponLineDd) {
        const showCoupon = couponDiscount > 0;
        couponLineDt.hidden = !showCoupon;
        couponLineDd.hidden = !showCoupon;
        couponLineDd.textContent = `- ${won(couponDiscount)}`;
      }
      summary.querySelector(".total strong").textContent = won(total);
      document.querySelectorAll("[data-delete-selected], [data-empty-cart]").forEach((button) => { button.disabled = itemCount === 0; });
      if (itemCount === 0 && !cartMain.contains(emptyMessage)) cartMain.querySelector(".cart-actions").before(emptyMessage);
      if (itemCount > 0 && cartMain.contains(emptyMessage)) emptyMessage.remove();
      refreshBorders();
    };
    couponSelect?.addEventListener("change", refreshCart);
    cartMain.addEventListener("click", (event) => {
      const item = event.target.closest(".cart-item");
      if (event.target.closest(".cart-remove")) { item.remove(); refreshCart(); }
      if (event.target.dataset.qty && item) {
        const count = item.querySelector(".qty span");
        const next = event.target.dataset.qty === "plus" ? qty(item) + 1 : Math.max(1, qty(item) - 1);
        count.textContent = next; refreshCart();
      }
      if (event.target.matches("[data-delete-selected]")) { checkedItems().forEach((s) => s.remove()); refreshCart(); }
      if (event.target.matches("[data-empty-cart]")) { items().forEach((c) => c.remove()); refreshCart(); }
    });
    cartMain.addEventListener("change", (event) => {
      if (event.target === selectAll) items().forEach((item) => { item.querySelector('input[type="checkbox"]').checked = selectAll.checked; });
      refreshCart();
    });
    renderItems();
    refreshCart();
  }

  /* ============================================================
     제품 목록 (카탈로그)
     ============================================================ */
  const productsPage = document.querySelector(".products-page");
  if (productsPage) {
    const categories = {
      all: { title: "좋은 커피의 시작,\nCOZYBREW 제품", kicker: "ALL PRODUCTS", desc: "원하는 커피 경험에 맞춰 COZYBREW의 다양한 제품을 만나보세요.", hero: "./image/category_products_hero.webp", section: "전체 제품" },
      espresso: { title: "에스프레소 머신", kicker: "ESPRESSO MACHINE", desc: "완벽한 한 잔을 위한 COZYBREW의 기술력, 섬세한 온도 제어와 안정적인 추출을 경험하세요.", hero: "./image/category_espresso_hero.webp", section: "에스프레소 머신" },
      grinder: { title: "그라인더", kicker: "COFFEE GRINDER", desc: "원두의 풍미를 극대화하는 정밀함, 균일한 분쇄로 매일의 추출을 안정적으로 완성합니다.", hero: "./image/category_grinder_hero.webp", section: "그라인더" },
      capsule: { title: "캡슐머신", kicker: "CAPSULE MACHINE", desc: "간편함 속에 담긴 완성도 높은 맛, 부담 없이 즐기는 풍부한 아로마를 만나보세요.", hero: "./image/category_capsule_hero.webp", section: "캡슐머신" },
      goods: { title: "커피용품", kicker: "COFFEE GOODS", desc: "더 나은 커피 라이프를 위한 선택, 추출 도구부터 관리 용품까지 감각적으로 제안합니다.", hero: "./image/category_goods_hero.webp", section: "커피용품" }
    };
    const params = new URLSearchParams(window.location.search);
    let currentCategory = categories[params.get("category")] ? params.get("category") : "all";
    const heroImg = productsPage.querySelector("[data-category-hero-img]");
    const title = productsPage.querySelector("[data-category-title]");
    const kicker = productsPage.querySelector("[data-category-kicker]");
    const desc = productsPage.querySelector("[data-category-desc]");
    const sectionTitle = productsPage.querySelector("[data-category-section-title]");
    const count = productsPage.querySelector("[data-category-count]");
    const grid = productsPage.querySelector("[data-category-grid]");
    const select = productsPage.querySelector("[data-category-select]");
    const sort = productsPage.querySelector("[data-category-sort]");
    const search = productsPage.querySelector("[data-category-search]");
    const input = search.querySelector('input[type="search"]');
    const cardMarkup = (p) => `
      <article class="catalog-card" data-category="${p.category}" data-name="${p.name}" data-price="${p.price}">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
        <img loading="eager" decoding="sync" fetchpriority="high" src="${p.image}" alt="">
        <h3>${p.name}</h3>
        <p>${p.summary}</p>
        <strong>${won(p.price)}</strong>
        <a href="./product-detail.html?id=${p.id}">자세히 보기</a>
      </article>`;
    const renderProducts = () => {
      const query = input.value.trim();
      const filtered = PRODUCTS
        .filter((p) => currentCategory === "all" || p.category === currentCategory)
        .filter((p) => !query || p.name.includes(query) || p.summary.includes(query));
      const sorted = [...filtered].sort((a, b) => {
        if (sort.value === "낮은 가격순") return a.price - b.price;
        if (sort.value === "인기순") {
          const rank = (x) => (x.badge === "BEST" ? 0 : 1);
          return rank(a) - rank(b) || PRODUCTS.indexOf(a) - PRODUCTS.indexOf(b);
        }
        return 0;
      });
      grid.innerHTML = sorted.map(cardMarkup).join("");
      count.textContent = `총 ${sorted.length}개의 제품`;
    };
    const applyCategory = (category) => {
      currentCategory = category;
      const data = categories[currentCategory];
      document.title = `${data.section} | COZYBREW`;
      heroImg.src = data.hero;
      if (kicker) kicker.textContent = data.kicker;
      title.innerHTML = data.title.replace("\n", "<br>");
      desc.textContent = data.desc;
      sectionTitle.textContent = currentCategory === "all" ? "전체 제품" : data.section;
      select.value = currentCategory;
      productsPage.querySelectorAll(".category-feature-nav a").forEach((a) => {
        const u = new URL(a.getAttribute("href"), window.location.href);
        const cat = new URLSearchParams(u.search).get("category") || "all";
        a.classList.toggle("is-active", cat === currentCategory);
      });
      renderProducts();
    };
    select.addEventListener("change", () => {
      const next = select.value;
      history.replaceState(null, "", next === "all" ? "./products.html" : `./products.html?category=${next}`);
      applyCategory(next);
    });
    search.addEventListener("submit", (event) => { event.preventDefault(); renderProducts(); });
    input.addEventListener("input", renderProducts);
    sort.addEventListener("change", renderProducts);
    applyCategory(currentCategory);
  }

  /* ============================================================
     제품 상세 (?id 기반 동적 렌더링)
     ============================================================ */
  const detailPage = document.querySelector(".product-detail-page");
  if (detailPage) {
    const params = new URLSearchParams(window.location.search);
    const product = productById(params.get("id")) || PRODUCTS[0];
    const set = (sel, text) => { const el = detailPage.querySelector(sel); if (el) el.textContent = text; };

    document.title = `${product.name} | COZYBREW`;
    set("[data-d-title]", product.name);
    set("[data-d-crumb]", product.name);
    set("[data-d-desc]", product.desc);
    set("[data-d-price]", won(product.price));
    set("[data-d-color]", product.color);
    set("[data-d-components]", product.components);

    const badge = detailPage.querySelector("[data-d-badge]");
    if (badge) {
      if (product.badge) { badge.textContent = product.badge; badge.hidden = false; }
      else badge.hidden = true;
    }

    const gallery = product.gallery || product.images.map((src) => ({ src, label: "상품 이미지", view: "front" }));
    const mainImg = detailPage.querySelector("[data-detail-main]");
    if (mainImg) {
      mainImg.src = gallery[0].src;
      mainImg.alt = product.name;
      mainImg.dataset.view = gallery[0].view;
    }
    const thumbs = detailPage.querySelector("[data-d-thumbs]");
    if (thumbs) {
      thumbs.innerHTML = gallery.map((item, i) =>
        `<button type="button" class="${i === 0 ? "active" : ""}" data-detail-thumb="${item.src}" data-detail-view="${item.view}" aria-label="${item.label} 보기"><img loading="lazy" decoding="async" src="${item.src}" alt=""></button>`).join("");
    }

    set("[data-d-editorial-kicker]", product.category === "espresso" ? "BUILT FOR BETTER COFFEE" : "COZYBREW DETAIL");
    set("[data-d-editorial-title]", product.story.title);
    set("[data-d-editorial-body]", product.story.body);

    const renderVisual = (sel, src, alt = "") => {
      const el = detailPage.querySelector(sel);
      if (!el) return;
      el.innerHTML = src ? `<img loading="lazy" decoding="async" src="${src}" alt="${alt}">` : "";
      el.classList.toggle("empty", !src);
    };
    renderVisual("[data-d-editorial-visual]", product.storyImage, `${product.name} 상세 이미지`);
    renderVisual("[data-d-split-visual-1]", product.highlightsImage || gallery[1]?.src || product.image, `${product.name} 상세 이미지`);
    renderVisual("[data-d-split-visual-2]", product.usageImage || gallery[0]?.src, product.name);
    renderVisual("[data-d-spec-visual]", product.specImage || product.image, product.name);

    // 1번 분할: 핵심 특징 한눈에 보기 → 제목(일반 헤딩)과 본문/불릿(제품 스펙 하이라이트)이 한 묶음
    set("[data-d-split-kicker-1]", "HIGHLIGHTS");
    set("[data-d-split-title-1]", "핵심 특징을 한눈에");
    set("[data-d-split-body-1]", product.summary);
    const splitList1 = detailPage.querySelector("[data-d-split-list-1]");
    if (splitList1) splitList1.innerHTML = product.story.bullets.slice(0, 4).map((b) => `<li>${b}</li>`).join("");

    // 2번 분할: 사용 & 세팅 → 제목/본문(카테고리 세팅 가이드)과 불릿(배치 팁)이 같은 '사용' 주제로 일치
    const detailCat = DETAIL_CATEGORY[product.category] || DETAIL_CATEGORY.goods;
    set("[data-d-split-kicker-2]", "USAGE");
    set("[data-d-split-title-2]", detailCat.setupTitle);
    set("[data-d-split-body-2]", detailCat.lead);
    const splitList2 = detailPage.querySelector("[data-d-split-list-2]");
    if (splitList2) splitList2.innerHTML = (product.detail.setup.length ? product.detail.setup : product.detail.care).slice(0, 3).map((b) => `<li>${b}</li>`).join("");

    // 디테일 카드: 제목(기능)과 설명(효용)을 같은 points 객체에서 가져와 제목-내용 일치
    const detailCards = detailPage.querySelector("[data-d-detail-cards]");
    if (detailCards) {
      const cards = (product.detail.cards && product.detail.cards.length)
        ? product.detail.cards
        : product.points.map((p, i) => ({ t: p.t, d: p.d, img: (gallery[i] && gallery[i].src) || product.image }));
      detailCards.innerHTML = cards.map((c) =>
        `<div class="pd2-card"><div class="img${c.img ? "" : " empty"}">${c.img ? `<img loading="lazy" decoding="async" src="${c.img}" alt="${c.t}">` : ""}</div><div class="txt"><h4>${c.t}</h4><p>${c.d}</p></div></div>`).join("");
    }

    const spec = detailPage.querySelector("[data-d-spec]");
    if (spec) {
      const s = product.spec;
      const na = "해당 없음";
      spec.innerHTML =
        `<tr><th>제품명</th><td>${product.name}</td></tr>` +
        `<tr><th>모델명</th><td>${s.model}</td></tr>` +
        `<tr><th>정격 전압</th><td>${s.volt}</td></tr>` +
        `<tr><th>소비전력</th><td>${s.power || na}</td></tr>` +
        `<tr><th>펌프 압력</th><td>${s.pump || na}</td></tr>` +
        `<tr><th>물탱크 용량</th><td>${s.tank || na}</td></tr>` +
        `<tr><th>제품 크기</th><td>${s.size}</td></tr>` +
        `<tr><th>무게</th><td>${s.weight}</td></tr>` +
        `<tr><th>구성품</th><td>${product.components}</td></tr>` +
        `<tr><th>보증 기간</th><td>${s.warranty}</td></tr>`;
    }

    const recommend = detailPage.querySelector("[data-d-recommend]");
    if (recommend) {
      const recs = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category)
        .concat(PRODUCTS.filter((p) => p.id !== product.id && p.category !== product.category))
        .slice(0, 4);
      const CAT_LABEL = { espresso: "에스프레소", grinder: "그라인더", capsule: "캡슐머신", goods: "커피용품" };
      recommend.innerHTML = recs.map((p) =>
        `<a href="./product-detail.html?id=${p.id}"><div class="img"><img loading="lazy" decoding="async" src="${p.image}" alt=""></div><div class="txt"><span class="cat">${CAT_LABEL[p.category] || "제품"}</span><div class="nm">${p.name}</div><span class="pr">${won(p.price)}</span></div></a>`).join("");
    }

    const count = detailPage.querySelector("[data-detail-count]");
    const total = detailPage.querySelector("[data-detail-total]");
    const refreshTotal = () => { if (total && count) total.textContent = won(product.price * Number(count.textContent)); };
    refreshTotal();
    let galleryIndex = 0;
    const showGalleryImage = (index) => {
      if (!gallery.length || !mainImg) return;
      galleryIndex = (index + gallery.length) % gallery.length;
      const item = gallery[galleryIndex];
      mainImg.src = item.src;
      mainImg.dataset.view = item.view || "front";
      detailPage.querySelectorAll("[data-detail-thumb]").forEach((button, i) => {
        button.classList.toggle("active", i === galleryIndex);
        if (i === galleryIndex && button.scrollIntoView) {
          button.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
      });
    };
    let suppressThumbClick = false;
    if (thumbs) {
      let isDragging = false;
      let didDrag = false;
      let startX = 0;
      let startScroll = 0;
      const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        thumbs.classList.remove("dragging");
        if (didDrag) {
          suppressThumbClick = true;
          window.setTimeout(() => { suppressThumbClick = false; }, 160);
        }
      };
      thumbs.addEventListener("pointerdown", (event) => {
        isDragging = true;
        didDrag = false;
        startX = event.clientX;
        startScroll = thumbs.scrollLeft;
        thumbs.classList.add("dragging");
        if (thumbs.setPointerCapture) thumbs.setPointerCapture(event.pointerId);
      });
      thumbs.addEventListener("pointermove", (event) => {
        if (!isDragging) return;
        const distance = event.clientX - startX;
        if (Math.abs(distance) > 5) didDrag = true;
        thumbs.scrollLeft = startScroll - distance;
      });
      thumbs.addEventListener("pointerup", endDrag);
      thumbs.addEventListener("pointercancel", endDrag);
      thumbs.addEventListener("pointerleave", endDrag);
    }
    detailPage.addEventListener("click", (event) => {
      const thumbBtn = event.target.closest("[data-detail-thumb]");
      if (thumbBtn && mainImg) {
        if (suppressThumbClick) {
          event.preventDefault();
          return;
        }
        const thumbButtons = Array.from(detailPage.querySelectorAll("[data-detail-thumb]"));
        showGalleryImage(Math.max(0, thumbButtons.indexOf(thumbBtn)));
      }
      if (event.target.dataset.detailNav) {
        showGalleryImage(galleryIndex + (event.target.dataset.detailNav === "next" ? 1 : -1));
      }
      if (event.target.dataset.detailQty && count) {
        const next = event.target.dataset.detailQty === "plus" ? Number(count.textContent) + 1 : Math.max(1, Number(count.textContent) - 1);
        count.textContent = next; refreshTotal();
      }
      if (event.target.matches("[data-detail-buy]")) {
        const amount = count ? Math.max(1, Number(count.textContent) || 1) : 1;
        addToCart(product.id, amount);
        window.location.href = "./order.html";
        return;
      }
      if (event.target.matches("[data-detail-cart]")) {
        if (event.target.dataset.busy === "1") return;
        const amount = count ? Math.max(1, Number(count.textContent) || 1) : 1;
        addToCart(product.id, amount);
        setCartBadge(document.querySelector(".cart-link em"), cartCount());
        showToast("장바구니에 담았어요", "장바구니 보기", "./cart.html");
        const original = event.target.dataset.label || event.target.textContent;
        event.target.dataset.label = original;
        event.target.dataset.busy = "1";
        event.target.textContent = "장바구니에 담겼습니다";
        setTimeout(() => { event.target.textContent = original; event.target.dataset.busy = "0"; }, 1600);
      }
    });

    /* ---- 새 디자인(pd2) 추가 동작 ---- */
    // 특징 칩 (제품 하이라이트 bullets)
    const chipsBox = detailPage.querySelector("[data-d-chips]");
    if (chipsBox) chipsBox.innerHTML = (product.story.bullets || []).slice(0, 4).map((b) => `<span class="pd2-chip">${b}</span>`).join("");

    // 카테고리별 FAQ
    const AS_A = "구매일로부터 1년간 무상 보증이 제공됩니다.<br>A/S는 고객센터(070-1234-5678) 또는 A/S 문의 페이지를 통해 접수하실 수 있습니다.";
    const FAQ_MAP = {
      espresso: [
        { q: "그라인더 없이 바로 사용할 수 있나요?", a: "네, 시중의 분쇄 원두로 바로 사용 가능합니다.<br>더 신선한 한 잔을 원하신다면 코지 버 그라인더와 함께 사용하시는 것을 추천드립니다." },
        { q: "설치나 별도 배관이 필요한가요?", a: "별도 배관 없이 분리형 물탱크에 물을 채워 바로 사용하는 방식입니다.<br>콘센트만 연결하면 되며, 자세한 내용은 설치 가이드를 참고해 주세요." },
        { q: "세척과 관리는 어떻게 하나요?", a: "물탱크와 물받이, 포터필터는 분리되어 흐르는 물에 세척할 수 있습니다.<br>스팀 노즐은 사용 후 가볍게 분사·닦아주시면 되고, 주기적인 석회질 제거를 권장합니다." },
        { q: "보증 기간과 A/S는 어떻게 진행되나요?", a: AS_A }
      ],
      grinder: [
        { q: "에스프레소와 드립 분쇄를 모두 할 수 있나요?", a: "네, 분쇄 단계 조절로 에스프레소부터 핸드드립까지 폭넓게 대응합니다.<br>원하는 추출 방식에 맞춰 단계를 돌려 사용하시면 됩니다." },
        { q: "작동 소음이 큰가요?", a: "저소음 설계로 일반적인 사용 환경에서 부담이 크지 않습니다.<br>이른 아침에 사용하셔도 무리가 없는 수준입니다." },
        { q: "분쇄 후 청소는 어떻게 하나요?", a: "호퍼와 가루받이가 분리되어 손쉽게 비우고 닦을 수 있습니다.<br>동봉된 청소솔로 남은 가루를 정리해 주시면 향 유지에 좋습니다." },
        { q: "보증 기간과 A/S는 어떻게 진행되나요?", a: AS_A }
      ],
      capsule: [
        { q: "어떤 캡슐을 사용할 수 있나요?", a: "호환 규격의 캡슐을 사용할 수 있습니다.<br>자세한 호환 정보는 상세 안내와 구성품 설명을 참고해 주세요." },
        { q: "예열 시간은 얼마나 걸리나요?", a: "예열이 빠른 편이라 전원을 켠 뒤 짧은 시간 안에 추출할 수 있습니다.<br>바쁜 아침에도 기다림 없이 사용하기 좋습니다." },
        { q: "세척과 관리는 어떻게 하나요?", a: "물탱크와 사용한 캡슐 트레이는 분리해 흐르는 물에 세척할 수 있습니다.<br>주기적으로 내부를 헹궈주시면 더 오래 깨끗하게 사용할 수 있습니다." },
        { q: "보증 기간과 A/S는 어떻게 진행되나요?", a: AS_A }
      ],
      goods: [
        { q: "식기세척기를 사용해도 되나요?", a: "제품 소재에 따라 다를 수 있어 손세척을 권장드립니다.<br>사용 후에는 흐르는 물에 헹군 뒤 완전히 건조해 보관해 주세요." },
        { q: "다른 브랜드 기기와도 호환되나요?", a: "범용 규격으로 제작되어 대부분의 환경에서 무리 없이 사용할 수 있습니다.<br>특정 기기와의 호환이 궁금하시면 문의해 주세요." },
        { q: "사용 후 관리는 어떻게 하나요?", a: "사용 후 흐르는 물에 세척하고 완전히 말려 보관하시면 오래 깨끗하게 쓸 수 있습니다.<br>직사광선과 습기를 피해 보관해 주세요." },
        { q: "보증 기간과 A/S는 어떻게 진행되나요?", a: AS_A }
      ]
    };
    const faqBox = detailPage.querySelector("[data-d-faq]");
    if (faqBox) {
      const fitems = FAQ_MAP[product.category] || FAQ_MAP.goods;
      faqBox.innerHTML = fitems.map((f, i) =>
        `<details${i === 0 ? " open" : ""}><summary>${f.q}</summary><div class="answer">${f.a}</div></details>`).join("");
    }

    // 합계: 수량 2개 이상일 때만 강조
    const totalWrap = detailPage.querySelector("[data-d-total-wrap]");
    const syncTotalActive = () => { if (totalWrap && count) totalWrap.classList.toggle("active", Number(count.textContent) > 1); };
    syncTotalActive();
    detailPage.addEventListener("click", (e) => { if (e.target.dataset && e.target.dataset.detailQty) syncTotalActive(); });

    // 스티키 미니 구매바
    const stickyBar = document.getElementById("pd2-sticky");
    if (stickyBar) {
      const sName = stickyBar.querySelector("[data-d-sticky-name]");
      const sPrice = stickyBar.querySelector("[data-d-sticky-price]");
      const sImg = stickyBar.querySelector("[data-d-sticky-img]");
      if (sName) sName.textContent = product.name;
      if (sPrice) sPrice.textContent = won(product.price);
      if (sImg) sImg.src = product.image;
      const heroEl = detailPage.querySelector(".pd2-hero");
      if (heroEl) {
        window.addEventListener("scroll", () => {
          stickyBar.classList.toggle("show", heroEl.getBoundingClientRect().bottom < 80);
        }, { passive: true });
      }
      const buyAmount = () => (count ? Math.max(1, Number(count.textContent) || 1) : 1);
      const sCart = stickyBar.querySelector("[data-sticky-cart]");
      const sBuy = stickyBar.querySelector("[data-sticky-buy]");
      if (sCart) sCart.addEventListener("click", () => {
        addToCart(product.id, buyAmount());
        setCartBadge(document.querySelector(".cart-link em"), cartCount());
        showToast("장바구니에 담았어요", "장바구니 보기", "./cart.html");
      });
      if (sBuy) sBuy.addEventListener("click", () => { addToCart(product.id, buyAmount()); window.location.href = "./order.html"; });
    }

    /* ---- 제품별 별점 · 리뷰 (id 기반 결정적 생성) ---- */
    (function () {
      const NAMES = ["김*은","이*호","박*진","정*아","최*우","한*리","조*현","윤*서","장*민","임*경","오*나","강*수"];
      const POOL = {
        espresso: ["크레마가 정말 풍성하게 올라와서 카페 느낌 그대로예요.","스팀이 생각보다 강해서 라떼아트 연습하기 좋습니다.","예열 시간이 조금 있지만 그만큼 추출 온도가 안정적이에요.","물탱크가 분리형이라 매일 세척하기 편합니다.","디자인이 단정해서 주방에 두니 분위기가 살아요.","조작이 직관적이라 처음 쓰는데도 헤매지 않았어요."],
        grinder: ["입자가 균일해서 추출 편차가 확 줄었어요.","원두 향이 분쇄할 때부터 확 퍼져서 기분 좋습니다.","단계 조절이 세밀해서 드립부터 에스프레소까지 다 됩니다.","생각보다 조용해서 아침에 갈아도 부담 없어요.","가루받이가 분리돼서 청소가 간편합니다.","묵직하고 견고해서 오래 쓸 것 같아요."],
        capsule: ["버튼 한 번이면 끝이라 바쁜 아침에 딱이에요.","예열이 빨라서 기다림 없이 바로 추출됩니다.","크기가 작아 좁은 주방에도 잘 들어가요.","세척이 간단해서 관리가 편합니다.","캡슐 호환이 잘 돼서 선택지가 넓어요.","디자인이 깔끔해서 어디 둬도 잘 어울려요."],
        goods: ["마감이 깔끔하고 손에 착 감겨요.","기본에 충실해서 매일 손이 가는 아이템이에요.","디자인이 군더더기 없어서 좋습니다.","생각보다 튼튼해서 오래 쓸 것 같아요.","가격 대비 만족도가 높아요.","선물용으로도 좋을 것 같아요."]
      };
      let seed = 2166136261;
      for (const ch of product.id) { seed ^= ch.charCodeAt(0); seed = Math.imul(seed, 16777619) >>> 0; }
      const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 4294967296; };
      const rating = Math.round((4.5 + rnd() * 0.45) * 10) / 10;
      const total = 90 + Math.floor(rnd() * 260);
      const five = Math.round(82 + rnd() * 12);
      const rem = 100 - five;
      const four = Math.round(rem * 0.62), three = Math.round(rem * 0.22), two = Math.round(rem * 0.10);
      const one = Math.max(0, 100 - five - four - three - two);
      const dist = [five, four, three, two, one];
      const starStr = (n) => "★".repeat(n) + "☆".repeat(5 - n);
      const pool = POOL[product.category] || POOL.goods;
      const order = pool.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = order[i]; order[i] = order[j]; order[j] = t; }
      const model = (product.spec && product.spec.model) || product.name;
      const items = order.slice(0, 4).map((pi, k) => {
        const who = NAMES[Math.floor(rnd() * NAMES.length)];
        const mo = String(3 + Math.floor(rnd() * 4)).padStart(2, "0");
        const dy = String(1 + Math.floor(rnd() * 27)).padStart(2, "0");
        const st = rnd() < 0.78 ? 5 : 4;
        const text = k === 0 ? (model + " 쓴 지 한 달째인데, " + pool[pi]) : pool[pi];
        return { who: who, date: "2026." + mo + "." + dy, star: st, text: text };
      });
      set("[data-d-rating-summary]", rating.toFixed(1) + " · 리뷰 " + total + "개");
      set("[data-d-review-num]", rating.toFixed(1));
      set("[data-d-review-total]", "총 " + total + "개 리뷰");
      const barsBox = detailPage.querySelector("[data-d-review-bars]");
      if (barsBox) barsBox.innerHTML = dist.map((p, i) =>
        `<div class="pd2-bar"><span>${5 - i}점</span><div class="track"><div class="fill" style="width:${p}%"></div></div><span>${p}%</span></div>`).join("");
      const listBox = detailPage.querySelector("[data-d-review-list]");
      if (listBox) listBox.innerHTML = items.map((r) =>
        `<div class="pd2-review"><div class="meta"><span class="who">${r.who}</span><span class="date">${r.date}</span></div><div class="stars">${starStr(r.star)}</div><p>${r.text}</p></div>`).join("");
      const sP = document.querySelector("#pd2-sticky [data-d-sticky-price]");
      if (sP) sP.innerHTML = `${won(product.price)} <span style="color:var(--muted-2);font-weight:400;font-size:13px;">★ ${rating.toFixed(1)} (${total})</span>`;
    })();
  }

  /* ============================================================
     약관 동의 (회원가입)
     ============================================================ */
  const agreeBox = document.querySelector(".agree-box");
  if (agreeBox) {
    const checks = [...agreeBox.querySelectorAll('input[type="checkbox"]')];
    const master = checks[0];
    master.addEventListener("change", () => { checks.slice(1).forEach((check) => { check.checked = master.checked; }); });
    checks.slice(1).forEach((check) => {
      check.addEventListener("change", () => {
        master.checked = checks.slice(1).every((item) => item.checked);
        master.indeterminate = checks.slice(1).some((item) => item.checked) && !master.checked;
      });
    });
  }

  /* ============================================================
     FAQ 아코디언 + 카테고리 필터
     ============================================================ */
  const faqList = document.querySelector(".faq-list");
  if (faqList) {
    const faqItems = [...faqList.querySelectorAll("details")];
    faqItems.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (item.open) faqItems.forEach((other) => { if (other !== item) other.open = false; });
      });
    });
  }

  const faqCats = document.querySelector(".faq-cats");
  if (faqCats && faqList) {
    const catButtons = [...faqCats.querySelectorAll("button")];
    const faqDetails = [...faqList.querySelectorAll("details")];
    const applyFilter = (filter) => {
      faqDetails.forEach((d) => {
        const show = !filter || filter === "all" || d.dataset.cat === filter;
        d.hidden = !show;
        if (!show) d.open = false;
      });
    };
    faqCats.addEventListener("click", (event) => {
      const btn = event.target.closest("button");
      if (!btn) return;
      const mobile = window.matchMedia("(max-width: 720px)").matches;
      if (mobile && !faqCats.classList.contains("open")) { faqCats.classList.add("open"); return; }
      catButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      faqCats.classList.remove("open");
      applyFilter(btn.dataset.filter);
    });
    document.addEventListener("click", (event) => { if (!faqCats.contains(event.target)) faqCats.classList.remove("open"); });
  }

  /* ============================================================
     공지사항 목록 + 상세 (?id) / 스토리 상세 (?id)
     ============================================================ */
  const noticeTable = document.querySelector(".notice-table[data-notice-rows]");
  if (noticeTable) {
    const headRow = '<div class="notice-row notice-head"><span>번호</span><span>제목</span><span>날짜</span><span>조회수</span></div>';
    const rowMarkup = (n) =>
      `<a class="notice-row" href="./notice-detail.html?id=${n.id}"><span>${n.no}</span><strong>${n.tag ? `<span class="tag notice-tag">${n.tag}</span>` : ""}${n.title}</strong><time>${n.date}</time><span>${n.views}</span></a>`;
    const renderNotices = (query) => {
      const q = (query || "").trim();
      const rows = NOTICES.filter((n) => !q || n.title.includes(q));
      noticeTable.innerHTML = headRow + (rows.length ? rows.map(rowMarkup).join("") : '<div class="notice-empty">검색 결과가 없습니다.</div>');
    };
    renderNotices();
    const noticeSearch = document.querySelector(".support-search");
    if (noticeSearch) {
      const input = noticeSearch.querySelector('input[type="search"]');
      noticeSearch.addEventListener("submit", (event) => { event.preventDefault(); renderNotices(input.value); });
      input.addEventListener("input", () => renderNotices(input.value));
    }
  }

  const noticeDetail = document.querySelector(".notice-detail-page");
  if (noticeDetail) {
    const params = new URLSearchParams(window.location.search);
    const found = NOTICES.findIndex((n) => n.id === params.get("id"));
    const idx = found < 0 ? 0 : found;
    const n = NOTICES[idx];
    const set = (sel, html) => { const el = noticeDetail.querySelector(sel); if (el) el.innerHTML = html; };
    document.title = `${n.title} | COZYBREW`;
    set("[data-n-crumb]", n.title);
    set("[data-n-tag]", n.tag ? `<span class="tag notice-tag">${n.tag}</span>` : "");
    set("[data-n-title]", n.title);
    set("[data-n-date]", `${n.date} · 조회 ${n.views}`);
    set("[data-n-body]", n.body);
    const prev = NOTICES[idx + 1];
    const next = NOTICES[idx - 1];
    set("[data-n-prev]", prev ? `<a href="./notice-detail.html?id=${prev.id}"><span>이전 글</span>${prev.title}</a>` : `<span class="nav-empty">이전 글이 없습니다.</span>`);
    set("[data-n-next]", next ? `<a href="./notice-detail.html?id=${next.id}"><span>다음 글</span>${next.title}</a>` : `<span class="nav-empty">다음 글이 없습니다.</span>`);
  }

  const storyDetail = document.querySelector(".story-detail-page");
  if (storyDetail) {
    const params = new URLSearchParams(window.location.search);
    const s = STORIES.find((x) => x.id === params.get("id")) || STORIES[0];
    const set = (sel, txt) => { const el = storyDetail.querySelector(sel); if (el) el.textContent = txt; };
    document.title = `${s.title} | COZYBREW`;
    set("[data-s-crumb]", s.cat);
    set("[data-s-cat]", s.cat);
    set("[data-s-title]", s.title);
    set("[data-s-lead]", s.lead);
    const hero = storyDetail.querySelector("[data-s-hero]");
    if (hero) { hero.src = s.image; hero.alt = s.title; }
    const bodyEl = storyDetail.querySelector("[data-s-body]");
    if (bodyEl) bodyEl.innerHTML = s.body;
    const related = storyDetail.querySelector("[data-s-related]");
    if (related) {
      const recs = STORIES.filter((x) => x.id !== s.id).slice(0, 3);
      related.innerHTML = recs.map((x) =>
        `<article><a href="./story-detail.html?id=${x.id}"><img loading="lazy" decoding="async" src="${x.image}" alt=""><p>${x.cat}</p><h3>${x.title}</h3></a></article>`).join("");
    }
  }

  /* ============================================================
     헤더 로그인 상태 반영 (모든 페이지 공통)
     ============================================================ */
  if (isLoggedIn()) {
    document.querySelectorAll('.header-icons a[href$="login.html"]').forEach((accountLink) => {
      accountLink.setAttribute("href", "./mypage.html");
      accountLink.setAttribute("aria-label", "마이페이지");
    });
  }

  /* ============================================================
     마이페이지 (mypage.html)
     ============================================================ */
  const mypage = document.querySelector(".mypage-page");
  if (mypage) {
    if (!isLoggedIn()) {
      window.location.replace("./login.html");
    } else {
      mypage.querySelector("[data-logout]")?.addEventListener("click", () => {
        setLogin(false);
        window.location.href = "./index.html";
      });

      // 로그인한 계정 정보로 프로필(이름·이메일) 표시 (정보가 없으면 기본값 유지)
      try {
        const user = JSON.parse(localStorage.getItem("cozybrew_user") || "null");
        if (user && user.email) {
          const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
          const nameEl = mypage.querySelector(".account-name");
          const emailEl = mypage.querySelector(".account-email");
          if (nameEl) {
            const gradeText = nameEl.querySelector(".account-grade")?.textContent || "일반 회원";
            nameEl.innerHTML = esc(user.name || "회원") + "님, 안녕하세요! <span class=\"account-grade\">" + esc(gradeText) + "</span>";
          }
          if (emailEl) emailEl.textContent = user.email;
          if (user.stats) {
            const strongs = mypage.querySelectorAll(".account-stats strong");
            if (strongs.length >= 3) {
              strongs[0].textContent = (user.stats.points || 0) + " P";
              strongs[1].textContent = (user.stats.coupons || 0) + "장";
              strongs[2].textContent = (user.stats.orders || 0) + "건";
            }
          }
        }
      } catch (e) {}

      const rv = mypage.querySelector("[data-recent-carousel]");
      if (rv) {
        const track = rv.querySelector(".rv-track");
        const slides = track ? Array.from(track.children) : [];
        if (track && slides.length > 1) {
          track.appendChild(slides[0].cloneNode(true));
          let i = 0;
          let timer = null;
          const go = () => {
            i += 1;
            track.style.transition = "transform .5s ease";
            track.style.transform = `translateX(-${i * 100}%)`;
            if (i === slides.length) {
              setTimeout(() => {
                track.style.transition = "none";
                i = 0;
                track.style.transform = "translateX(0)";
              }, 520);
            }
          };
          const start = () => { timer = setInterval(go, 3000); };
          const stop = () => { clearInterval(timer); };
          start();
          rv.addEventListener("mouseenter", stop);
          rv.addEventListener("mouseleave", start);
        }
      }
    }
  }


  /* ============================================================
     1:1 문의 내역 렌더 (mypage-inquiries.html) — localStorage
     ============================================================ */
  const inqListEl = document.querySelector("[data-inquiry-list]");
  if (inqListEl) {
    const escInq = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const readInq = () => { try { return JSON.parse(localStorage.getItem("cozybrew_inquiries") || "[]"); } catch (e) { return []; } };
    const renderInq = () => {
      const inquiries = readInq();
      if (!inquiries.length) {
        inqListEl.innerHTML = '<div class="orders-empty">아직 접수하신 1:1 문의가 없습니다.</div>';
        return;
      }
      inqListEl.innerHTML = inquiries.map((q) => {
        const cls = q.status === "답변완료" ? "done" : "paid";
        const meta = [q.category ? "제품 분류 · " + escInq(q.category) : "", q.place ? "구매처 · " + escInq(q.place) : ""].filter(Boolean).join("   |   ");
        const body = escInq(q.symptom || q.title || "");
        return `<article class="inq-card"><div class="inq-card-top"><div class="inq-card-meta"><span class="inq-date">${escInq(q.date)}</span><span class="inq-id">${escInq(q.id)}</span><em class="status ${cls}">${escInq(q.status)}</em></div><button type="button" class="inq-del" data-inq-id="${escInq(q.id)}">삭제</button></div>${meta ? `<p class="inq-cat">${meta}</p>` : ""}<p class="inq-body">${body}</p><button type="button" class="inq-toggle"><span class="inq-toggle-label">펼쳐보기</span><span class="inq-toggle-arrow" aria-hidden="true">▾</span></button></article>`;
      }).join("");
      inqListEl.querySelectorAll(".inq-card").forEach((card) => {
        const bodyEl = card.querySelector(".inq-body");
        const toggle = card.querySelector(".inq-toggle");
        if (bodyEl && toggle && bodyEl.scrollHeight - bodyEl.clientHeight > 2) toggle.classList.add("show");
      });
    };
    renderInq();
    inqListEl.addEventListener("click", (event) => {
      const toggle = event.target.closest(".inq-toggle");
      if (toggle) {
        const bodyEl = toggle.closest(".inq-card").querySelector(".inq-body");
        const open = bodyEl.classList.toggle("expanded");
        toggle.classList.toggle("open", open);
        toggle.querySelector(".inq-toggle-label").textContent = open ? "접기" : "펼쳐보기";
        return;
      }
      const del = event.target.closest(".inq-del");
      if (!del) return;
      if (!window.confirm("이 문의 접수 내역을 삭제할까요?")) return;
      const id = del.getAttribute("data-inq-id");
      const next = readInq().filter((q) => q.id !== id);
      try { localStorage.setItem("cozybrew_inquiries", JSON.stringify(next)); } catch (e) {}
      renderInq();
    });
  }

  /* ============================================================
     A/S · 1:1 문의 접수 (support-as.html) — 브라우저에 저장
     ============================================================ */
  const asForm = document.querySelector(".as-form");
  if (asForm) {
    asForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const selectEl = asForm.querySelector("select");
      const textareaEl = asForm.querySelector("textarea");
      const inputs = asForm.querySelectorAll("input");
      const category = (selectEl ? selectEl.value : "기타").trim();
      const symptom = (textareaEl ? textareaEl.value : "").trim();
      const name = inputs[0] ? inputs[0].value.trim() : "";
      const contact = inputs[1] ? inputs[1].value.trim() : "";
      let notice = asForm.querySelector(".as-success");
      const ensureNotice = () => {
        if (!notice) { notice = document.createElement("p"); notice.className = "as-success"; asForm.appendChild(notice); }
        return notice;
      };
      if (!name || !contact || !symptom) {
        ensureNotice().classList.add("is-error");
        notice.textContent = "이름, 연락처, 증상 설명을 입력해 주세요.";
        return;
      }
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const date = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`;
      const id = `AS-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${String(Math.floor(1000 + Math.random() * 9000))}`;
      const place = inputs[2] ? inputs[2].value.trim() : "";
      const inquiry = { id, date, category, place, name, contact, symptom, status: "접수완료" };
      try {
        const list = JSON.parse(localStorage.getItem("cozybrew_inquiries") || "[]");
        list.unshift(inquiry);
        localStorage.setItem("cozybrew_inquiries", JSON.stringify(list));
      } catch (e) {}
      ensureNotice().classList.remove("is-error");
      notice.innerHTML = `문의가 접수되었습니다. (접수번호 ${id})<br><a href="./mypage.html#my-inquiries">마이페이지 › 1:1 문의 내역</a>에서 확인하실 수 있어요.`;
      asForm.reset();
    });
  }

  /* ============================================================
     주문서 (order.html) — 장바구니 내용 기반 렌더링
     ============================================================ */
  const orderPage = document.querySelector(".order-page");
  if (orderPage) {
    const linesEl = orderPage.querySelector("[data-order-lines]");
    const lines = getCart()
      .map((line) => ({ p: productById(line.id), qty: Math.max(1, Number(line.qty) || 1) }))
      .filter((item) => item.p);
    if (linesEl) {
      linesEl.innerHTML = lines.length
        ? lines.map(({ p, qty }) => `<div class="order-line"><span>${p.name} × ${qty}</span><strong>${won(p.price * qty)}</strong></div>`).join("")
        : `<div class="order-line"><span>장바구니에 담긴 상품이 없습니다.</span><strong>${won(0)}</strong></div>`;
    }
    const subtotal = lines.reduce((sum, { p, qty }) => sum + p.price * qty, 0);
    const discount = isLoggedIn() ? Math.floor(subtotal * 0.1) : 0;
    const total = Math.max(0, subtotal - discount);
    const setOrderText = (sel, value) => { const el = orderPage.querySelector(sel); if (el) el.textContent = value; };
    setOrderText("[data-order-subtotal]", won(subtotal));
    setOrderText("[data-order-discount]", `- ${won(discount)}`);
    setOrderText("[data-order-total]", won(total));
    if (!lines.length) {
      const payBtn = orderPage.querySelector('button[type="submit"]');
      if (payBtn) { payBtn.disabled = true; payBtn.textContent = "장바구니가 비어 있습니다"; }
    }
  }

  /* ============================================================
     장바구니 추천 상품 — 실제 카탈로그 기반(링크 연결)
     ============================================================ */
  const cartRecommend = document.querySelector("[data-cart-recommend]");
  if (cartRecommend) {
    const recs = PRODUCTS.filter((p) => p.category === "goods").slice(0, 6);
    cartRecommend.innerHTML = recs.map((p) =>
      `<article><a href="./product-detail.html?id=${p.id}"><img loading="lazy" decoding="async" src="${p.image}" alt=""><h3>${p.name}</h3><strong>${won(p.price)}</strong></a></article>`).join("");
  }

  /* ============================================================
     회원가입 — 비밀번호 일치 검사 + 계정 저장 + 완료 안내
     ============================================================ */
  const joinForm = document.querySelector(".join-form");
  if (joinForm) {
    const pwInputs = joinForm.querySelectorAll('input[type="password"]');
    const [pw, pwConfirm] = pwInputs.length >= 2 ? pwInputs : [];
    if (pw && pwConfirm) {
      const clearMismatch = () => setFieldError(pwConfirm, "");
      pw.addEventListener("input", clearMismatch);
      pwConfirm.addEventListener("input", clearMismatch);
    }

    // 가입 완료 안내 모달 (인증번호 모달과 동일한 스타일 재사용)
    const doneBackdrop = document.createElement("div");
    doneBackdrop.className = "cb-modal-backdrop";
    doneBackdrop.innerHTML =
      '<div class="cb-modal" role="dialog" aria-modal="true" aria-labelledby="cbJoinDoneTitle">' +
        '<h3 id="cbJoinDoneTitle">회원가입이 완료되었습니다</h3>' +
        '<p class="cb-modal-desc">이제 가입하신 이메일과 비밀번호로 로그인하실 수 있어요.</p>' +
        '<div class="cb-modal-actions">' +
          '<button type="button" class="btn-confirm">로그인하러 가기</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(doneBackdrop);
    const goLogin = () => { window.location.href = "./login.html"; };
    doneBackdrop.querySelector(".btn-confirm").addEventListener("click", goLogin);
    doneBackdrop.addEventListener("click", (event) => { if (event.target === doneBackdrop) goLogin(); });

    const fieldVal = (name) => {
      const el = joinForm.querySelector(`input[name="${name}"]`);
      return el ? el.value.trim() : "";
    };

    joinForm.addEventListener("submit", (event) => {
      // 비밀번호 확인이 다르면 제출 중단
      if (pw && pwConfirm && pw.value !== pwConfirm.value) {
        event.preventDefault();
        setFieldError(pwConfirm, "비밀번호가 일치하지 않습니다.");
        pwConfirm.focus();
        return;
      }
      // 여기까지 왔다면 필수 입력·형식 검증을 모두 통과한 상태
      event.preventDefault();
      // 가입 계정 저장 (백엔드가 없는 데모라 localStorage에 보관 → 로그인에서 사용)
      try {
        localStorage.setItem("cozybrew_account", JSON.stringify({
          name: fieldVal("name"),
          email: fieldVal("email"),
          password: pw ? pw.value : "",
          phone: fieldVal("phone"),
          address: fieldVal("address"),
          addressDetail: fieldVal("addressDetail"),
        }));
      } catch (e) {}
      doneBackdrop.classList.add("open");
    });
  }

  /* ============================================================
     비밀번호 표시/숨김 토글 (로그인·회원가입·비밀번호 찾기 등)
     ============================================================ */
  const EYE_ICON =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF_ICON =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.9 5.2A9.8 9.8 0 0 1 12 5c7 0 10.5 7 10.5 7a17.3 17.3 0 0 1-3 3.9M6.2 6.3A17 17 0 0 0 1.5 12S5 19 12 19a9.7 9.7 0 0 0 4.1-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="m3 3 18 18"/></svg>';
  document.querySelectorAll('input[type="password"]').forEach((input) => {
    if (input.parentElement && input.parentElement.classList.contains("pw-field")) return;
    const wrap = document.createElement("span");
    wrap.className = "pw-field";
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pw-toggle";
    btn.setAttribute("aria-label", "비밀번호 표시");
    btn.innerHTML = EYE_ICON;
    wrap.appendChild(btn);
    btn.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.innerHTML = show ? EYE_OFF_ICON : EYE_ICON;
      btn.setAttribute("aria-label", show ? "비밀번호 숨김" : "비밀번호 표시");
    });
  });

  /* ============================================================
     맨 위로 이동 버튼 (스크롤 시 노출) — 모바일·PC 공통
     ============================================================ */
  (function initBackToTop() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "맨 위로 이동");
    btn.textContent = "↑";
    document.body.appendChild(btn);
    const onScroll = () => btn.classList.toggle("show", window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  })();
})();
