console.log("[SteamKit Background] Service worker запущен");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[SteamKit Background] Получил сообщение:", message);

  if (message.action !== "EXEC") return;

  const run = (tabId: number) => {
    console.log("[SteamKit Background] executeScript на вкладке:", tabId);

    chrome.scripting.executeScript({
      target: { tabId },
      world:  "MAIN",
      func: (code: string) => {
        try {
          (0, eval)(code);
          const appId = (window as any).$J?.('#ConsumerAppID')?.val?.();
          const ftype = (window as any).$J?.('[name=file_type]')?.val?.();
          const vis   = (window as any).$J?.('[name=visibility]')?.val?.();
          const iw    = (window as any).$J?.('#image_width')?.val?.();
          const ih    = (window as any).$J?.('#image_height')?.val?.();
          console.log('[SteamKit] После выполнения:', { appId, ftype, vis, image_width: iw, image_height: ih });
        } catch(e) {
          console.error('[SteamKit] Ошибка:', e);
        }
      },
      args: [message.code as string],
    })
    .then(() => sendResponse({ ok: true }))
    .catch((err) => {
      console.error("[SteamKit Background] executeScript ошибка:", err);
      sendResponse({ ok: false, err: String(err) });
    });
  };

  if (sender.tab?.id) {
    run(sender.tab.id);
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab?.id) run(tab.id);
      else {
        console.error("[SteamKit Background] Не нашёл активную вкладку!");
        sendResponse({ ok: false, err: "no tab" });
      }
    });
  }

  return true; // держим канал открытым для асинхронного sendResponse
});