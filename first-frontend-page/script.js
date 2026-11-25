/* script.js — улучшения для твоего текущего HTML + CSS
   Ничего в HTML менять не нужно: все кнопки/элементы создаются через JS.
*/

(() => {
  // ===== 0) Быстрая проверка подключения =====
  console.log("✅ script.js подключился");

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ===== 1) Липкая подсветка активного пункта меню (по секциям) =====
  const navLinks = $$("nav a");
  const sections = $$("main section");
  const footer = $("footer");
  const header = $("header");

  function getHeaderOffset() {
    return (header?.offsetHeight ?? 0) + 20;
  }

  function setActiveLinkById(id) {
    navLinks.forEach((a) => {
      const href = a.getAttribute("href") || "";
      const isMatch = href.startsWith("#") && href.slice(1) === id;
      a.classList.toggle("is-active", isMatch);
      a.setAttribute("aria-current", isMatch ? "page" : "false");
    });
  }

  function updateActiveLink() {
    const offset = getHeaderOffset();
    const y = window.scrollY + offset;

    // Если почти внизу страницы — активируем contact
    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;
    if (nearBottom && footer) {
      setActiveLinkById("contact");
      return;
    }

    // Находим последнюю секцию, которая выше текущей позиции
    let currentId = null;
    for (const sec of sections) {
      if (sec.offsetTop <= y) currentId = sec.id || currentId;
    }

    // Если секция без id — ничего не подсвечиваем (чтобы не было “случайной” подсветки)
    if (currentId) setActiveLinkById(currentId);
    else navLinks.forEach((a) => a.classList.remove("is-active"));
  }

  window.addEventListener("scroll", updateActiveLink, { passive: true });
  window.addEventListener("load", updateActiveLink);

  // Добавляем стиль активной ссылки (без правок CSS-файла)
  const style = document.createElement("style");
  style.textContent = `
    nav a.is-active{
      background: var(--accent, #111827) !important;
      color: #fff !important;
    }
  `;
  document.head.appendChild(style);

  // ===== 2) Плавный скролл с учетом высоты header (чтобы заголовок не прятался под шапкой) =====
  navLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("#")) return;

      const id = href.slice(1);
      const target =
        document.getElementById(id) ||
        (id === "contact" ? $("footer") : null);

      if (!target) return;

      e.preventDefault();

      const offset = getHeaderOffset();
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  // ===== 3) Кнопка "Наверх" (создаётся автоматически) =====
  const topBtn = document.createElement("button");
  topBtn.type = "button";
  topBtn.textContent = "↑ Наверх";
  Object.assign(topBtn.style, {
    position: "fixed",
    right: "18px",
    bottom: "18px",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: "800",
    background: "var(--accent, #111827)",
    color: "#fff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    display: "none",
    zIndex: "9999",
  });
  document.body.appendChild(topBtn);

  function toggleTopBtn() {
    topBtn.style.display = window.scrollY > 400 ? "block" : "none";
  }
  window.addEventListener("scroll", toggleTopBtn, { passive: true });
  window.addEventListener("load", toggleTopBtn);

  topBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ===== 4) Тема: светлая/тёмная (переключатель создаётся в header, сохраняется в localStorage) =====
  const themeBtn = document.createElement("button");
  themeBtn.type = "button";
  themeBtn.textContent = "🌙 Тема";
  Object.assign(themeBtn.style, {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: "800",
    background: "var(--chip, #f3f4f6)",
    color: "var(--text, #1f2937)",
  });

  // Вставим кнопку темы в nav (в конец)
  const nav = $("nav");
  if (nav) nav.appendChild(themeBtn);

  const THEME_KEY = "site_theme_v1";

  function applyTheme(mode) {
    if (mode === "dark") {
      document.documentElement.style.setProperty("--bg", "#0b1220");
      document.documentElement.style.setProperty("--text", "#e5e7eb");
      document.documentElement.style.setProperty("--card", "#111827");
      document.documentElement.style.setProperty("--accent", "#60a5fa");
      document.documentElement.style.setProperty("--muted", "#cbd5e1");
      document.documentElement.style.setProperty("--chip", "#1f2937");
      themeBtn.textContent = "☀️ Тема";
    } else {
      document.documentElement.style.setProperty("--bg", "#f6f7fb");
      document.documentElement.style.setProperty("--text", "#1f2937");
      document.documentElement.style.setProperty("--card", "#ffffff");
      document.documentElement.style.setProperty("--accent", "#111827");
      document.documentElement.style.setProperty("--muted", "#374151");
      document.documentElement.style.setProperty("--chip", "#f3f4f6");
      themeBtn.textContent = "🌙 Тема";
    }
  }

  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(savedTheme);

  themeBtn.addEventListener("click", () => {
    const current = localStorage.getItem(THEME_KEY) || "light";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  // ===== 5) Улучшение формы: валидация + уведомление + сохранение черновика =====
  const form = $("form");
  const nameInput = $("#name");
  const emailInput = $("#email");
  const msgArea = $("#message");

  const DRAFT_KEY = "contact_draft_v1";

  function showToast(text, kind = "ok") {
    let box = $(".toast");
    if (!box) {
      box = document.createElement("div");
      box.className = "toast";
      document.body.appendChild(box);
    }
    box.textContent = text;

    Object.assign(box.style, {
      position: "fixed",
      left: "50%",
      bottom: "76px",
      transform: "translateX(-50%)",
      padding: "12px 16px",
      borderRadius: "12px",
      fontWeight: "800",
      color: "#fff",
      background: kind === "error" ? "#ef4444" : "var(--accent, #111827)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
      zIndex: "9999",
      maxWidth: "92vw",
      textAlign: "center",
    });

    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => box.remove(), 2200);
  }

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  // Подгружаем черновик
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (draft) {
      if (nameInput && draft.name) nameInput.value = draft.name;
      if (emailInput && draft.email) emailInput.value = draft.email;
      if (msgArea && draft.message) msgArea.value = draft.message;
    }
  } catch {}

  function saveDraft() {
    const draft = {
      name: nameInput?.value || "",
      email: emailInput?.value || "",
      message: msgArea?.value || "",
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }

  nameInput?.addEventListener("input", saveDraft);
  emailInput?.addEventListener("input", saveDraft);
  msgArea?.addEventListener("input", saveDraft);

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = (nameInput?.value || "").trim();
      const email = (emailInput?.value || "").trim();
      const message = (msgArea?.value || "").trim();

      if (!name) return showToast("Введите имя", "error");
      if (!email || !isValidEmail(email)) return showToast("Введите корректный email", "error");
      if (message.length > 0 && message.length < 5)
        return showToast("Сообщение слишком короткое", "error");

      // Учебная отправка (без сервера)
      showToast(`Отправлено ✅ Спасибо, ${name}!`, "ok");

      form.reset();
      localStorage.removeItem(DRAFT_KEY);
    });
  }

  // ===== 6) “Появление” секций при скролле (анимация без библиотек) =====
  // (Если ты не хочешь анимации — можно удалить этот блок.)
  const revealStyle = document.createElement("style");
  revealStyle.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(10px);
      transition: 400ms;
    }
    .reveal.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(revealStyle);

  sections.forEach((sec) => sec.classList.add("reveal"));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((ent) => {
        if (ent.isIntersecting) ent.target.classList.add("is-visible");
      });
    },
    { threshold: 0.12 }
  );

  sections.forEach((sec) => io.observe(sec));
})();
