import type {
  ExtensionMessage,
  ExtensionResponse,
  PageInfo,
} from "../types";

import "./popup.css";

async function sendCommand<T = unknown>(
  message: ExtensionMessage
): Promise<ExtensionResponse<T>> {

  return chrome.runtime.sendMessage<ExtensionMessage, ExtensionResponse<T>>(message);
}

function appendLog(
  text: string,
  type: "info" | "success" | "error" = "info"
): void {

  const logEl = document.getElementById("log") as HTMLDivElement;

  const entry = document.createElement("div");

  entry.className = `log-entry log-${type}`;

  entry.textContent = `» ${text}`;

  logEl.appendChild(entry);

  logEl.scrollTop = logEl.scrollHeight;
}

function render(): void {

  const app = document.getElementById("app")!;

  app.innerHTML = `
    <!--
      header — шапка попапа с названием расширения.
      <header> — семантический тег, означает "заголовочная область".
    -->
    <header>
      <span class="badge">⚡</span>
      <h1>My Extension</h1>
    </header>

    <!--
      section.section — секция с кнопками для работы со страницей.
      class="section" — CSS класс для стилизации (отступы, разделители).
    -->
    <section class="section">
      <h2>Страница</h2>
      <!-- id="btn-ping" — уникальный идентификатор, по нему найдём кнопку в JS -->
      <button id="btn-ping">Ping content script</button>
      <button id="btn-page-info">Получить info страницы</button>
      <!--
        class="hidden" — скрыт по умолчанию (display: none в CSS).
        Покажем его когда получим данные.
      -->
      <div id="page-info" class="info-box hidden"></div>
    </section>

    <section class="section">
      <h2>DOM — Подсветить элементы</h2>
      <!--
        div.row — контейнер для элементов в одну строку (flex в CSS).
      -->
      <div class="row">
        <!--
          type="text" — текстовое поле ввода.
          placeholder — подсказка что вводить (исчезает при вводе).
          id — уникальный идентификатор для поиска через JS.
        -->
        <input
          id="input-selector"
          type="text"
          placeholder='CSS selector, например: h1, .className, #id'
        />
        <button id="btn-highlight">Подсветить</button>
      </div>
    </section>

    <section class="section">
      <h2>Консоль страницы</h2>
      <div class="row">
        <input id="input-console" type="text" placeholder="Текст сообщения" />
        <!--
          select — выпадающий список.
          option value="..." — значение которое получим в JS при выборе.
        -->
        <select id="select-level">
          <option value="CONSOLE_LOG">log</option>
          <option value="CONSOLE_WARN">warn</option>
          <option value="CONSOLE_ERROR">error</option>
        </select>
        <button id="btn-console">Отправить</button>
      </div>
      <p class="hint">Открой F12 → Console на странице чтобы увидеть результат</p>
    </section>

    <section class="section">
      <h2>Выполнить JavaScript на странице</h2>
      <!--
        textarea — многострочное поле ввода.
        rows="3" — высота в строках по умолчанию.
        placeholder — пример кода.
      -->
      <textarea
        id="input-script"
        rows="3"
        placeholder="Введи JS код. Например:&#10;return document.title&#10;или&#10;return document.querySelectorAll('a').length"
      ></textarea>
      <button id="btn-run-script">▶ Выполнить</button>
      <p class="hint">&#9888; Выполняется прямо на странице. Будь осторожен.</p>
    </section>

    <section class="section">
      <h2>Лог действий</h2>
      <!-- Сюда appendLog() будет добавлять записи -->
      <div id="log" class="log-box"></div>
      <button id="btn-clear-log" class="btn-small">Очистить лог</button>
    </section>
  `;

  bindEvents();
}

function bindEvents(): void {

  document
    .getElementById("btn-ping")! // Находим кнопку по id
    .addEventListener("click", async () => {

      appendLog("Отправляю PING...");

      const res = await sendCommand({ action: "PING" });

      if (res?.success) {
        appendLog("Pong! Content script работает ✓", "success");
      } else {
        appendLog(
          `Нет ответа. Возможно страница системная (chrome:// или about:) или content script не загружен. Ошибка: ${res?.error ?? "нет данных"}`,
          "error"
        );
      }
    });


  // ── Кнопка GET_PAGE_INFO ──────────────────────────────────────────────────
  document
    .getElementById("btn-page-info")!
    .addEventListener("click", async () => {
      appendLog("Получаю информацию о странице...");

      const res = await sendCommand<PageInfo>({ action: "GET_PAGE_INFO" });


      const box = document.getElementById("page-info")!;

      if (res?.success && res.data) {

        const { title, url, elementCount } = res.data;


        box.innerHTML = `
          <b>${title}</b><br/>
          <span class="url">${url}</span><br/>
          Элементов на странице: <b>${elementCount}</b>
        `;

        box.classList.remove("hidden");
        appendLog("Информация получена ✓", "success");

      } else {
        appendLog(`Ошибка: ${res?.error ?? "нет данных"}`, "error");
      }
    });

  document
    .getElementById("btn-highlight")!
    .addEventListener("click", async () => {

      const selector = (
        document.getElementById("input-selector") as HTMLInputElement
      ).value.trim();

      if (!selector) {
        appendLog("Введи CSS селектор!", "error");
        return;
      }

      appendLog(`Подсвечиваю "${selector}"...`);

      const res = await sendCommand({
        action: "HIGHLIGHT_ELEMENTS",
        payload: { selector },
      });

      if (res?.success) {
        appendLog(`Выделено! Посмотри на страницу — элементы подсвечены 2 сек.`, "success");
      } else {
        appendLog(`Ошибка: ${res?.error}`, "error");
      }
    });

  document
    .getElementById("btn-console")!
    .addEventListener("click", async () => {

      const message = (
        document.getElementById("input-console") as HTMLInputElement
      ).value.trim();

      if (!message) {
        appendLog("Введи текст сообщения!", "error");
        return;
      }

      const level = (
        document.getElementById("select-level") as HTMLSelectElement
      ).value as "CONSOLE_LOG" | "CONSOLE_WARN" | "CONSOLE_ERROR";

      appendLog(`Отправляю console.${level.split("_")[1].toLowerCase()}()...`);

      const res = await sendCommand({
        action:  level,
        payload: { message },
      });

      if (res?.success) {
        appendLog(
          `Отправлено! Открой F12 → Console на странице ✓`,
          "success"
        );
      } else {
        appendLog(`Ошибка: ${res?.error}`, "error");
      }
    });

  document
    .getElementById("btn-run-script")!
    .addEventListener("click", async () => {

      const code = (
        document.getElementById("input-script") as HTMLTextAreaElement
      ).value.trim();

      if (!code) {
        appendLog("Введи JavaScript код!", "error");
        return;
      }

      appendLog(`Выполняю код...`);

      const res = await sendCommand({
        action:  "RUN_SCRIPT",
        payload: { code },
      });

      if (res?.success) {

        appendLog(`Результат: ${JSON.stringify(res.data, null, 2)}`, "success");
      } else {
        appendLog(`Ошибка выполнения: ${res?.error}`, "error");
      }
    });

  document
    .getElementById("btn-clear-log")!
    .addEventListener("click", () => {
      // Просто очищаем HTML внутри блока лога
      document.getElementById("log")!.innerHTML = "";
      appendLog("Лог очищен");
    });
}

document.addEventListener("DOMContentLoaded", () => {
  render();
  appendLog("Расширение готово к работе");
});