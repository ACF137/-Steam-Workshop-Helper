const panel = document.createElement("div");
panel.id = "steam-helper-panel";

panel.innerHTML = `
  <div class="shp-header">
    <span class="shp-title">SteamKit</span>
    <button class="shp-toggle" id="shp-toggle-btn" title=>−</button>
  </div>
  <div class="shp-body" id="shp-body">
    <button class="shp-btn" data-action="illustrations" data-num="01">
      ARTWORK
    </button>
    <div class="shp-divider"></div>
    <button class="shp-btn" data-action="workshop" data-num="02">
      WORKSHOP
    </button>
    <div class="shp-status" id="shp-status"></div>
  </div>
`;

document.body.appendChild(panel);

function runOnPage(code: string): void {
  console.log("[SteamKit] Отправляю в background:", code);

  chrome.runtime.sendMessage({ action: "EXEC", code }, (response) => {

    if (chrome.runtime.lastError) {
      console.error("[SteamKit] sendMessage ошибка:", chrome.runtime.lastError.message);
    } else {
      console.log("[SteamKit] Background ответил:", response);
    }
  });
}

function showStatus(message: string, isError = false): void {
  const el = document.getElementById("shp-status")!;
  el.textContent = message;
  el.className = "shp-status " + (isError ? "shp-status--error" : "shp-status--ok");
  setTimeout(() => {
    el.textContent = "";
    el.className = "shp-status";
  }, 2500);
}

panel.addEventListener("click", (event: MouseEvent) => {
  const target = event.target as HTMLElement;

  if (target.closest("#shp-toggle-btn")) {
    const body = document.getElementById("shp-body")!;
    const btn  = document.getElementById("shp-toggle-btn")!;
    const isHidden = body.style.display === "none";
    body.style.display = isHidden ? "flex" : "none";
    btn.textContent    = isHidden ? "−" : "+";
    return;
  }

  const btn = target.closest<HTMLButtonElement>(".shp-btn");
  if (!btn) return;

  if (btn.dataset.action === "illustrations") {
    runOnPage(`$J('#image_width').val('1000');$J('#image_height').val('1');`);
    showStatus("// DONE: image size set");
  } else if (btn.dataset.action === "workshop") {
    runOnPage(`$J('#ConsumerAppID').val(480),$J('[name=file_type]').val(0),$J('[name=visibility]').val(0);`);
    showStatus("// DONE: workshop params set");
  }
});

console.log("[SteamKit] Panel injected ✓");