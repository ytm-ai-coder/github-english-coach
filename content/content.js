(() => {
  const trigger = document.createElement("button");
  trigger.id = "gec-selection-trigger";
  trigger.type = "button";
  trigger.textContent = "解释";
  trigger.title = "解释所选的 GitHub 英语";
  document.documentElement.append(trigger);

  let selectedText = "";
  let popoverHost;

  const normalise = (text) => text
    .toLowerCase()
    .replace(/[“”"'`]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^[^a-z0-9.]+|[^a-z0-9.]+$/g, "")
    .trim();

  const selectedRange = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const text = selection.toString().replace(/\s+/g, " ").trim();
    if (!text || text.length > 120 || !/[a-zA-Z]/.test(text)) return null;
    return { text, rect: selection.getRangeAt(0).getBoundingClientRect() };
  };

  const locateTrigger = (rect) => {
    trigger.style.display = "block";
    const top = Math.min(Math.max(8, rect.bottom + 8), window.innerHeight - 40);
    const left = Math.min(Math.max(8, rect.right - 42), window.innerWidth - 76);
    trigger.style.top = `${top}px`;
    trigger.style.left = `${left}px`;
  };

  const hideTrigger = () => { trigger.style.display = "none"; };

  const matchTerm = (rawText) => {
    const text = normalise(rawText);
    const terms = [...GEC_TERMS].sort((a, b) => b.term.length - a.term.length);
    const exact = terms.find((item) => normalise(item.term) === text);
    if (exact) return exact;

    const singular = text.replace(/ies$/, "y").replace(/(ches|shes|xes|ses|zes)$/, (suffix) => suffix.slice(0, -2)).replace(/s$/, "");
    return terms.find((item) => normalise(item.term) === singular) || null;
  };

  const storageGet = (key) => new Promise((resolve) => chrome.storage.local.get(key, (value) => resolve(value[key])));
  const storageSet = (value) => new Promise((resolve) => chrome.storage.local.set(value, resolve));

  const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
  }[char]));

  const closePopover = () => {
    if (popoverHost) {
      popoverHost.remove();
      popoverHost = null;
    }
  };

  const speak = async (term) => {
    const preferences = (await storageGet("gecPreferences")) || {};
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(term);
    utterance.lang = preferences.voiceLocale || "en-US";
    utterance.rate = Number(preferences.voiceRate || 0.85);
    window.speechSynthesis.speak(utterance);
  };

  const addToLearning = async (term) => {
    const learning = (await storageGet("gecLearning")) || {};
    const existing = learning[term.id];
    learning[term.id] = existing || {
      termId: term.id,
      entry: term,
      addedAt: Date.now(),
      dueAt: Date.now(),
      repetitions: 0,
      lapses: 0,
      lastReviewedAt: null
    };
    await storageSet({ gecLearning: learning });
    return !existing;
  };

  const showPopover = async (rawText, position) => {
    closePopover();
    hideTrigger();
    const term = matchTerm(rawText);
    const entry = term || {
      id: `custom:${normalise(rawText)}`,
      term: rawText,
      ipa: "",
      literal: "未收录的自定义词",
      basic: "A selected English word or phrase.",
      github: "该词组暂未收录为 GitHub 专有术语。你仍可把它加入生词本，并在看到完整句子时再结合上下文理解。",
      mnemonic: "把它和当前 GitHub 页面上的位置、按钮或讨论场景一起记住。",
      example: "在 GitHub 页面中再次遇到它时，试着先回忆含义。",
      category: "自定义生词",
      source: ""
    };

    popoverHost = document.createElement("div");
    popoverHost.id = "gec-popover-host";
    popoverHost.style.cssText = `position:fixed;z-index:2147483647;top:${Math.min(Math.max(12, position.top), window.innerHeight - 390)}px;left:${Math.min(Math.max(12, position.left), window.innerWidth - 400)}px;`;
    const shadow = popoverHost.attachShadow({ mode: "closed" });
    shadow.innerHTML = `
      <style>
        :host { all: initial; }
        * { box-sizing: border-box; }
        .card { position:relative; width:min(392px,calc(100vw - 24px)); max-height:min(540px,calc(100vh - 24px)); overflow:auto; border:1px solid #d9cce0; border-radius:14px 14px 6px 6px; padding:18px; background:#fbf9fd; color:#281a30; box-shadow:0 14px 32px rgba(73,41,103,.18); font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
        .card::after { position:absolute; right:0; bottom:0; width:38px; height:38px; border-top:1px solid #d8a0af; border-left:1px solid #d8a0af; background:#f8eaf0; clip-path:polygon(100% 0,100% 100%,0 100%); content:""; pointer-events:none; }
        .top { display:flex; gap:10px; align-items:flex-start; justify-content:space-between; padding-bottom:12px; border-bottom:1px solid #d9cce0; }
        h2 { margin:0; color:#492967; font-family:Georgia,"Times New Roman",serif; font-size:28px; font-weight:700; letter-spacing:-.035em; line-height:1; overflow-wrap:anywhere; }
        .ipa, .category { color:#6e5d75; font-size:12px; }
        .category { margin-top:9px; color:#d96874; font:700 9px/1 ui-monospace,SFMono-Regular,Consolas,monospace; letter-spacing:.07em; }
        .literal { display:flex; gap:7px; align-items:baseline; margin-top:6px; color:#6e5d75; font-size:12px; }
        .literal span { color:#d96874; font-weight:800; }
        .literal strong { color:#281a30; font-size:14px; }
        .icon, .close { border:1px solid #d8a0af; background:#f8eaf0; border-radius:7px; padding:6px 8px; cursor:pointer; color:#492967; font:700 13px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
        .icon:hover, .close:hover { background:#f2dce7; }
        section { margin-top:14px; }
        h3 { margin:0 0 5px; color:#492967; font-family:Georgia,"Times New Roman",serif; font-size:14px; }
        p { margin:0; overflow-wrap:anywhere; }
        .github { border-left:3px solid #492967; padding-left:10px; }
        .memory { border-left:3px solid #d96874; background:#f8eef5; padding:9px 10px; }
        .actions { display:flex; gap:8px; margin-top:16px; }
        .primary { flex:1; border:1px solid #e4a62e; border-radius:8px; padding:10px; background:#e4a62e; color:#492967; cursor:pointer; font:750 12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; letter-spacing:.035em; }
        .primary:hover { background:#d6961e; }
        a { color:#492967; font-size:12px; font-weight:700; }
      </style>
      <article class="card" role="dialog" aria-label="GitHub 英语词卡">
        <div class="top">
          <div><h2>${escapeHtml(entry.term)}</h2><div class="ipa">${escapeHtml(entry.ipa || "点击扬声器听发音")}</div><div class="literal"><span>词面义</span><strong>${escapeHtml(entry.literal || "常用英语或技术词")}</strong></div></div>
          <div><button class="icon" id="speak" aria-label="朗读 ${escapeHtml(entry.term)}">🔊</button> <button class="close" id="close" aria-label="关闭">×</button></div>
        </div>
        <div class="category">${escapeHtml(entry.category)}</div>
        <section><h3>普通英文义</h3><p>${escapeHtml(entry.basic)}</p></section>
        <section><h3>GitHub / 代码中的意思</h3><p class="github">${escapeHtml(entry.github)}</p></section>
        <section><h3>记忆钩子</h3><p class="memory">${escapeHtml(entry.mnemonic)}</p></section>
        <section><h3>场景</h3><p>${escapeHtml(entry.example)}</p></section>
        <div class="actions"><button class="primary" id="add">加入生词本</button></div>
        ${entry.source ? `<section><a href="${escapeHtml(entry.source)}" target="_blank" rel="noreferrer">查看官方术语来源</a></section>` : ""}
      </article>`;

    document.documentElement.append(popoverHost);
    shadow.getElementById("close").addEventListener("click", closePopover);
    shadow.getElementById("speak").addEventListener("click", () => speak(entry.term));
    shadow.getElementById("add").addEventListener("click", async (event) => {
      const added = await addToLearning(entry);
      event.currentTarget.textContent = added ? "已加入，去复习" : "已在生词本中";
      event.currentTarget.disabled = true;
    });
  };

  document.addEventListener("mouseup", () => {
    window.setTimeout(() => {
      if (popoverHost?.contains(document.activeElement)) return;
      const selected = selectedRange();
      if (!selected) return hideTrigger();
      selectedText = selected.text;
      locateTrigger(selected.rect);
    }, 0);
  });

  document.addEventListener("mousedown", (event) => {
    if (event.target !== trigger && !popoverHost?.contains(event.target)) hideTrigger();
  });

  trigger.addEventListener("click", () => {
    if (!selectedText) return;
    const rect = trigger.getBoundingClientRect();
    showPopover(selectedText, { top: rect.bottom + 8, left: rect.left - 310 });
  });

  document.addEventListener("keydown", (event) => {
    if (event.altKey && event.key.toLowerCase() === "g") {
      const selected = selectedRange();
      if (!selected) return;
      event.preventDefault();
      showPopover(selected.text, { top: selected.rect.bottom + 8, left: selected.rect.left });
    }
    if (event.key === "Escape") {
      hideTrigger();
      closePopover();
    }
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== "GEC_EXPLAIN_TEXT") return;
    const selection = selectedRange();
    const position = selection ? { top: selection.rect.bottom + 8, left: selection.rect.left } : { top: 88, left: window.innerWidth - 405 };
    showPopover(message.text, position);
  });
})();
