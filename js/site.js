(() => {
  const won = (value) => `₩ ${value.toLocaleString("ko-KR")}`;

  const searchForm = document.querySelector("[data-search-form]");
  if (searchForm) {
    const input = searchForm.querySelector('input[type="search"]');
    const clearButton = searchForm.querySelector(".search-clear");
    const resultSection = document.querySelector(".product-results");
    const resultText = document.querySelector(".page-title-row p");
    const resultCount = document.querySelector(".sort-box span");
    const cards = [...document.querySelectorAll(".catalog-card")];
    const recentList = document.querySelector(".keyword-list");
    let currentFilter = "all";
    const emptyRecent = document.createElement("p");
    emptyRecent.className = "empty-inline";
    emptyRecent.textContent = "최근 검색어가 없습니다.";

    const setQuery = (query) => {
      input.value = query;
      resultText.textContent = query ? `'${query}'에 대한 검색 결과입니다.` : "검색어를 입력하면 관련 제품이 표시됩니다.";
      input.focus();
    };

    const syncClear = () => {
      clearButton.hidden = !input.value.trim();
    };

    const filterCards = () => {
      const query = input.value.trim().replace(/^\d+\s*/, "");
      let visible = 0;
      const hasQuery = Boolean(query);
      if (resultSection) {
        resultSection.hidden = !hasQuery;
      }
      cards.forEach((card) => {
        const matchesFilter = currentFilter === "all" || card.dataset.category === currentFilter;
        const matchesQuery = hasQuery && (card.dataset.name.includes(query) || card.textContent.includes(query));
        const show = matchesFilter && matchesQuery;
        card.hidden = !show;
        if (show) visible += 1;
      });
      resultCount.textContent = `총 ${visible}개의 결과`;
      resultText.textContent = hasQuery ? `'${query}'에 대한 검색 결과입니다.` : "검색어를 입력하면 관련 제품이 표시됩니다.";
    };

    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      setQuery(input.value.trim());
      filterCards();
      syncClear();
    });

    input.addEventListener("input", () => {
      syncClear();
      filterCards();
    });
    clearButton.addEventListener("click", () => {
      setQuery("");
      filterCards();
      syncClear();
    });

    document.querySelectorAll("[data-keyword]").forEach((button) => {
      button.addEventListener("click", (event) => {
        if (event.target.tagName === "SPAN") {
          button.remove();
          if (recentList && !recentList.querySelector("button")) recentList.append(emptyRecent);
          return;
        }
        setQuery(button.dataset.keyword);
        filterCards();
        syncClear();
      });
    });

    document.querySelector("[data-clear-keywords]")?.addEventListener("click", () => {
      recentList.innerHTML = "";
      recentList.append(emptyRecent);
    });

    document.querySelectorAll(".filter-tabs button").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".filter-tabs button").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        currentFilter = button.dataset.filter;
        filterCards();
      });
    });

    document.querySelector(".sort-box select")?.addEventListener("change", (event) => {
      const grid = document.querySelector(".catalog-grid");
      const sorted = [...cards].sort((a, b) => {
        const aPrice = Number(a.querySelector("strong").textContent.replace(/[^\d]/g, ""));
        const bPrice = Number(b.querySelector("strong").textContent.replace(/[^\d]/g, ""));
        if (event.target.value === "낮은 가격순") return aPrice - bPrice;
        if (event.target.value === "인기순") return a.dataset.name.localeCompare(b.dataset.name, "ko-KR");
        return 0;
      });
      sorted.forEach((card) => grid.append(card));
    });

    syncClear();
    setQuery("");
    filterCards();
  }

  const cartMain = document.querySelector(".cart-main");
  if (cartMain) {
    const discount = 30000;
    const summary = document.querySelector(".order-summary");
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

    const refreshBorders = () => {
      items().forEach((item) => {
        item.classList.remove("is-first", "is-last");
        item.style.borderRadius = "";
      });
      items()[0]?.classList.add("is-first");
      items().at(-1)?.classList.add("is-last");
    };

    const refreshCart = () => {
      const allItems = items();
      const selected = checkedItems();
      const itemCount = allItems.length;
      const selectedQty = selected.reduce((sum, item) => sum + qty(item), 0);
      const subtotal = selected.reduce((sum, item) => sum + price(item) * qty(item), 0);
      const appliedDiscount = selectedQty > 0 ? Math.min(discount, subtotal) : 0;
      const total = Math.max(0, subtotal - appliedDiscount);

      titleCount.textContent = `${itemCount}개`;
      cartBadge && (cartBadge.textContent = String(itemCount));
      if (selectAll) {
        selectAll.checked = itemCount > 0 && selected.length === itemCount;
        selectAll.indeterminate = selected.length > 0 && selected.length < itemCount;
      }
      summary.querySelector("dt").textContent = `상품 금액 (${selectedQty}개)`;
      summary.querySelector("dd").textContent = won(subtotal);
      summary.querySelector(".sale").textContent = `- ${won(appliedDiscount)}`;
      summary.querySelector(".total strong").textContent = won(total);

      document.querySelectorAll("[data-delete-selected], [data-empty-cart]").forEach((button) => {
        button.disabled = itemCount === 0;
      });
      if (itemCount === 0 && !cartMain.contains(emptyMessage)) {
        cartMain.querySelector(".cart-actions").before(emptyMessage);
      }
      if (itemCount > 0 && cartMain.contains(emptyMessage)) {
        emptyMessage.remove();
      }
      refreshBorders();
    };

    cartMain.addEventListener("click", (event) => {
      const item = event.target.closest(".cart-item");
      if (event.target.closest(".cart-remove")) {
        item.remove();
        refreshCart();
      }
      if (event.target.dataset.qty && item) {
        const count = item.querySelector(".qty span");
        const next = event.target.dataset.qty === "plus" ? qty(item) + 1 : Math.max(1, qty(item) - 1);
        count.textContent = next;
        refreshCart();
      }
      if (event.target.matches("[data-delete-selected]")) {
        checkedItems().forEach((selected) => selected.remove());
        refreshCart();
      }
      if (event.target.matches("[data-empty-cart]")) {
        items().forEach((cartItem) => cartItem.remove());
        refreshCart();
      }
    });

    cartMain.addEventListener("change", (event) => {
      if (event.target === selectAll) {
        items().forEach((item) => {
          item.querySelector('input[type="checkbox"]').checked = selectAll.checked;
        });
      }
      refreshCart();
    });

    refreshCart();
  }

  const productsPage = document.querySelector(".products-page");
  if (productsPage) {
    const categories = {
      all: {
        title: "좋은 커피의 시작,\nCOZYBREW 제품",
        kicker: "ALL PRODUCTS",
        desc: "원하는 커피 경험에 맞춰 COZYBREW의 다양한 제품을 만나보세요.",
        hero: "./image/category_products_hero.png",
        section: "베스트 제품",
      },
      espresso: {
        title: "에스프레소 머신",
        kicker: "ESPRESSO MACHINE",
        desc: "완벽한 한 잔을 위한 COZYBREW의 기술력, 섬세한 온도 제어와 안정적인 추출을 경험하세요.",
        hero: "./image/category_espresso_hero.png",
        section: "에스프레소 머신",
      },
      grinder: {
        title: "그라인더",
        kicker: "COFFEE GRINDER",
        desc: "원두의 풍미를 극대화하는 정밀함, 균일한 분쇄로 매일의 추출을 안정적으로 완성합니다.",
        hero: "./image/category_grinder_hero.png",
        section: "그라인더",
      },
      capsule: {
        title: "캡슐머신",
        kicker: "CAPSULE MACHINE",
        desc: "간편함 속에 담긴 완성도 높은 맛, 부담 없이 즐기는 풍부한 아로마를 만나보세요.",
        hero: "./image/category_capsule_hero.png",
        section: "캡슐머신",
      },
      goods: {
        title: "커피용품",
        kicker: "COFFEE GOODS",
        desc: "더 나은 커피 라이프를 위한 선택, 추출 도구부터 관리 용품까지 감각적으로 제안합니다.",
        hero: "./image/category_goods_hero.png",
        section: "커피용품",
      },
    };

    const products = [
      { category: "espresso", badge: "BEST", name: "시그니처 에스프레소 머신 BEX-300", desc: "풍부한 크레마와 스팀 성능을 모두 갖춘 프리미엄 머신", price: 549000, image: "./image/sec01_1.png" },
      { category: "espresso", name: "에스프레소 머신 BEX-200", desc: "작은 공간에도 잘 어울리는 컴팩트 홈카페 머신", price: 349000, image: "./image/product_espresso_black.png" },
      { category: "espresso", name: "컴팩트 에스프레소 머신 BEX-150", desc: "처음 홈카페를 시작하는 분을 위한 입문형 머신", price: 299000, image: "./image/product_espresso_black.png" },
      { category: "espresso", name: "바리스타 에스프레소 머신 BEU-100", desc: "섬세한 스팀과 압력 조절을 갖춘 고급형 머신", price: 399000, image: "./image/sec01_1.png" },
      { category: "grinder", badge: "BEST", name: "코지 버 그라인더 CO-200", desc: "원두의 향을 살리는 균일한 입도 분쇄", price: 389000, image: "./image/product_grinder_black.png" },
      { category: "grinder", name: "클래식 버 그라인더 FG-100", desc: "홈카페에 어울리는 정밀 분쇄 그라인더", price: 290000, image: "./image/product_grinder_silver.png" },
      { category: "grinder", name: "홈 그라인더 HG-80", desc: "작은 공간에 어울리는 데일리 그라인더", price: 179000, image: "./image/product_grinder_black.png" },
      { category: "grinder", name: "수동 그라인더 MG-01", desc: "가볍게 즐기는 핸드밀 타입 그라인더", price: 89000, image: "./image/product_grinder_silver.png" },
      { category: "capsule", badge: "BEST", name: "컴팩트 캡슐머신 CC-10", desc: "간편하게 즐기는 풍부한 커피 아로마", price: 190000, image: "./image/product_capsule_cream.png" },
      { category: "capsule", name: "슬림 캡슐머신 CC-S10", desc: "좁은 공간에도 편리한 슬림 타입 머신", price: 150000, image: "./image/product_capsule_cream.png" },
      { category: "capsule", name: "미니 캡슐머신 CC-Mini", desc: "혼자 쓰기 좋은 미니 캡슐 커피 머신", price: 129000, image: "./image/category_capsule_hero.png" },
      { category: "capsule", name: "캡슐머신 보관함 CC-Box", desc: "캡슐과 액세서리를 깔끔하게 정리하는 보관함", price: 39000, image: "./image/product_filter_box.png" },
      { category: "goods", badge: "BEST", name: "드립 포트 900ml", desc: "정밀한 물줄기로 안정적인 드립 추출", price: 79000, image: "./image/product_drip_kettle.png" },
      { category: "goods", name: "드리퍼 세트", desc: "필터와 서버가 함께 구성된 핸드드립 세트", price: 49000, image: "./image/product_server_glass.png" },
      { category: "goods", name: "스테인리스 서버 600ml", desc: "라떼아트와 추출 보조에 좋은 스테인리스 피처", price: 42000, image: "./image/product_steam_pitcher.png" },
      { category: "goods", name: "스케일 타이머 ST-01", desc: "추출 시간과 무게를 동시에 관리하는 스마트 스케일", price: 38000, image: "./image/product_scale_black.png" },
    ];

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

    const cardMarkup = (product) => `
      <article class="catalog-card" data-category="${product.category}" data-name="${product.name}" data-price="${product.price}">
        ${product.badge ? `<span class="badge">${product.badge}</span>` : ""}
        ${product.image ? `<img src="${product.image}" alt="">` : '<div class="placeholder"></div>'}
        <h3>${product.name}</h3>
        <p>${product.desc}</p>
        <strong>${won(product.price)}</strong>
        <a href="./product-detail.html">자세히 보기</a>
      </article>
    `;

    const renderProducts = () => {
      const query = input.value.trim();
      const filtered = products
        .filter((product) => currentCategory === "all" || product.category === currentCategory)
        .filter((product) => !query || product.name.includes(query) || product.desc.includes(query));
      const sorted = [...filtered].sort((a, b) => {
        if (sort.value === "낮은 가격순") return a.price - b.price;
        if (sort.value === "인기순") return a.name.localeCompare(b.name, "ko-KR");
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
      kicker.textContent = data.kicker;
      title.innerHTML = data.title.replace("\n", "<br>");
      desc.textContent = data.desc;
      sectionTitle.textContent = currentCategory === "all" ? "베스트 제품" : data.section;
      select.value = currentCategory;
      renderProducts();
    };

    select.addEventListener("change", () => {
      const next = select.value;
      const url = next === "all" ? "./products.html" : `./products.html?category=${next}`;
      history.replaceState(null, "", url);
      applyCategory(next);
    });

    search.addEventListener("submit", (event) => {
      event.preventDefault();
      renderProducts();
    });

    input.addEventListener("input", renderProducts);
    sort.addEventListener("change", renderProducts);
    applyCategory(currentCategory);
  }

  const agreeBox = document.querySelector(".agree-box");
  if (agreeBox) {
    const checks = [...agreeBox.querySelectorAll('input[type="checkbox"]')];
    const master = checks[0];
    master.addEventListener("change", () => {
      checks.slice(1).forEach((check) => {
        check.checked = master.checked;
      });
    });
    checks.slice(1).forEach((check) => {
      check.addEventListener("change", () => {
        master.checked = checks.slice(1).every((item) => item.checked);
        master.indeterminate = checks.slice(1).some((item) => item.checked) && !master.checked;
      });
    });
  }

  const faqList = document.querySelector(".faq-list");
  if (faqList) {
    const faqItems = [...faqList.querySelectorAll("details")];
    faqItems.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (item.open) {
          faqItems.forEach((other) => {
            if (other !== item) other.open = false;
          });
          return;
        }
        if (!faqItems.some((other) => other.open)) {
          requestAnimationFrame(() => {
            item.open = true;
          });
        }
      });
    });
  }

  const detailPage = document.querySelector(".product-detail-page");
  if (detailPage) {
    const price = 549000;
    const count = detailPage.querySelector("[data-detail-count]");
    const total = detailPage.querySelector("[data-detail-total]");
    const mainImage = detailPage.querySelector("[data-detail-main]");

    const refreshDetailTotal = () => {
      total.textContent = won(price * Number(count.textContent));
    };

    detailPage.querySelectorAll("[data-detail-thumb]").forEach((button) => {
      button.addEventListener("click", () => {
        detailPage.querySelectorAll("[data-detail-thumb]").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        mainImage.src = button.dataset.detailThumb;
      });
    });

    detailPage.addEventListener("click", (event) => {
      if (event.target.dataset.detailQty) {
        const next = event.target.dataset.detailQty === "plus"
          ? Number(count.textContent) + 1
          : Math.max(1, Number(count.textContent) - 1);
        count.textContent = next;
        refreshDetailTotal();
      }
      if (event.target.matches("[data-detail-cart]")) {
        const original = event.target.textContent;
        event.target.textContent = "장바구니에 담겼습니다";
        setTimeout(() => {
          event.target.textContent = original;
        }, 1600);
      }
    });

    refreshDetailTotal();
  }

  document.querySelectorAll("form").forEach((form) => {
    if (form.matches("[data-search-form]")) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const button = form.querySelector('button[type="submit"]');
      if (!button) return;
      const original = button.textContent;
      button.textContent = original.includes("완료") ? original : `${original.replace(" →", "")} 완료`;
      setTimeout(() => {
        button.textContent = original;
      }, 1600);
    });
  });
})();
