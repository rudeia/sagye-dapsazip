(() => {
  const buttons = [...document.querySelectorAll("[data-pwa-install-button]")];
  const statuses = [...document.querySelectorAll("[data-pwa-install-status]")];
  const scriptUrl = new URL(document.currentScript?.src || "./pwa-install.js", window.location.href);
  const appRootUrl = new URL("./", scriptUrl);
  const iconUrl = new URL("icons/app-icon-192.png", appRootUrl).href;
  let deferredPrompt = null;
  let guide = null;

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isFileProtocol = window.location.protocol === "file:";
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone === true;

  function setStatus(message) {
    statuses.forEach((status) => { status.textContent = message; });
  }

  function closeGuide() {
    if (!guide) return;
    guide.hidden = true;
    document.body.classList.remove("pwa-guide-open");
    buttons[0]?.focus();
  }

  function ensureGuide() {
    if (guide) return guide;
    guide = document.createElement("div");
    guide.className = "pwa-guide";
    guide.hidden = true;
    guide.innerHTML = `
      <div class="pwa-guide-backdrop" data-pwa-guide-close></div>
      <section class="pwa-guide-dialog" role="dialog" aria-modal="true" aria-labelledby="pwaGuideTitle">
        <button class="pwa-guide-close" type="button" aria-label="닫기" data-pwa-guide-close>×</button>
        <div class="pwa-guide-app">
          <img src="${iconUrl}" alt="" />
          <div><strong>사계 답사집</strong><span>신안·제주 디지털 답사지</span></div>
        </div>
        <h2 id="pwaGuideTitle">홈 화면에 설치하기</h2>
        <div data-pwa-guide-content></div>
      </section>
    `;
    guide.querySelectorAll("[data-pwa-guide-close]").forEach((target) => {
      target.addEventListener("click", closeGuide);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !guide.hidden) closeGuide();
    });
    document.body.append(guide);
    return guide;
  }

  function openGuide() {
    const target = ensureGuide();
    const content = target.querySelector("[data-pwa-guide-content]");
    content.innerHTML = isFileProtocol
      ? `
        <p>파일을 직접 연 화면에서는 앱을 설치할 수 없습니다.</p>
        <ol>
          <li>배포된 사계 답사집 웹 주소로 접속합니다.</li>
          <li>화면의 <b>앱 설치</b> 버튼을 다시 누릅니다.</li>
        </ol>
      `
      : isIos
        ? `
          <p>iPhone과 iPad에서는 Safari의 공유 메뉴를 이용합니다.</p>
          <ol>
            <li>Safari 하단 또는 상단의 <b>공유</b> 버튼을 누릅니다.</li>
            <li><b>홈 화면에 추가</b>를 선택합니다.</li>
            <li>이름과 아이콘을 확인한 뒤 <b>추가</b>를 누릅니다.</li>
          </ol>
        `
        : `
          <p>현재 브라우저에서 자동 설치창을 열 수 없습니다.</p>
          <ol>
            <li>주소창의 설치 아이콘 또는 브라우저 메뉴를 엽니다.</li>
            <li><b>앱 설치</b> 또는 <b>홈 화면에 추가</b>를 선택합니다.</li>
            <li>메뉴가 보이지 않으면 Chrome이나 Edge에서 다시 열어주세요.</li>
          </ol>
        `;
    target.hidden = false;
    document.body.classList.add("pwa-guide-open");
    target.querySelector(".pwa-guide-close")?.focus();
  }

  async function installApp() {
    if (!deferredPrompt) {
      openGuide();
      return;
    }

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    setStatus(choice.outcome === "accepted" ? "설치를 진행하고 있습니다." : "원할 때 다시 설치할 수 있습니다.");
  }

  if (isStandalone) {
    buttons.forEach((button) => { button.hidden = true; });
  } else {
    buttons.forEach((button) => button.addEventListener("click", installApp));
    setStatus(isIos ? "iPhone·iPad 설치 안내" : "이 기기에 앱으로 설치할 수 있습니다.");
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    buttons.forEach((button) => { button.hidden = false; });
    setStatus("설치할 준비가 되었습니다.");
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    buttons.forEach((button) => { button.hidden = true; });
    setStatus("설치되었습니다.");
  });

  if ("serviceWorker" in navigator && !isFileProtocol) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(new URL("service-worker.js", appRootUrl).href, { scope: appRootUrl.pathname })
        .catch((error) => console.warn("서비스 워커 등록 실패", error));
    }, { once: true });
  }
})();
