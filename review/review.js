const getValue = (key) => new Promise((resolve) => chrome.storage.local.get(key, (value) => resolve(value[key])));
const setValue = (value) => new Promise((resolve) => chrome.storage.local.set(value, resolve));
const DAY = 24 * 60 * 60 * 1000;
const MINUTE = 60 * 1000;
const intervals = [1, 3, 7, 14, 30, 60, 120];

let learning = {};
let queue = [];
let currentId = null;
const termsById = new Map(GEC_TERMS.map((term) => [term.id, term]));

const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
}[char]));

const termFor = (record) => termsById.get(record.termId) || record.entry;
const dueLabel = (record) => {
  const diff = record.dueAt - Date.now();
  if (diff <= 0) return "现在可复习";
  const days = Math.ceil(diff / DAY);
  return days === 1 ? "明天复习" : `${days} 天后复习`;
};

const updateOverview = () => {
  const records = Object.values(learning);
  const now = Date.now();
  document.getElementById("dueCount").textContent = records.filter((item) => item.dueAt <= now).length;
  document.getElementById("totalCount").textContent = records.length;
  document.getElementById("masteredCount").textContent = records.filter((item) => item.repetitions >= 4).length;
};

const renderList = () => {
  const query = document.getElementById("search").value.trim().toLowerCase();
  const records = Object.values(learning)
    .map((record) => ({ record, term: termFor(record) }))
    .filter(({ term }) => term)
    .filter(({ term }) => !query || `${term.term} ${term.github} ${term.category}`.toLowerCase().includes(query))
    .sort((a, b) => a.record.dueAt - b.record.dueAt);
  const list = document.getElementById("termList");
  if (!records.length) {
    list.innerHTML = '<p class="empty-list">还没有词卡。请在 GitHub 页面选中术语后加入生词本。</p>';
    return;
  }
  list.innerHTML = records.map(({ record, term }) => `
    <article class="term-item"><h3>${escapeHtml(term.term)}</h3><p>${escapeHtml(term.category || "自定义生词")}</p><p class="due">${dueLabel(record)}</p><button data-remove="${escapeHtml(record.termId)}" aria-label="删除 ${escapeHtml(term.term)}">移除</button></article>`).join("");
  list.querySelectorAll("[data-remove]").forEach((button) => button.addEventListener("click", async () => {
    delete learning[button.dataset.remove];
    await setValue({ gecLearning: learning });
    rebuildQueue();
  }));
};

const showCurrent = () => {
  const card = document.getElementById("card");
  const empty = document.getElementById("emptyState");
  const record = currentId ? learning[currentId] : null;
  const term = record && termFor(record);
  if (!term) {
    card.hidden = true;
    empty.hidden = false;
    document.getElementById("queueLabel").textContent = "复习完成";
    return;
  }
  empty.hidden = true;
  card.hidden = false;
  document.getElementById("queueLabel").textContent = `还剩 ${queue.length} 张待复习词卡`;
  document.getElementById("term").textContent = term.term;
  document.getElementById("ipa").textContent = term.ipa || "点击扬声器听发音";
  document.getElementById("literal").textContent = term.literal || "未收录的自定义词";
  document.getElementById("basic").textContent = term.basic;
  document.getElementById("github").textContent = term.github;
  document.getElementById("mnemonic").textContent = term.mnemonic;
  document.getElementById("example").textContent = term.example;
  document.getElementById("answer").hidden = true;
  document.getElementById("grading").hidden = true;
  document.getElementById("reveal").hidden = false;
};

const rebuildQueue = () => {
  queue = Object.values(learning).filter((record) => record.dueAt <= Date.now()).sort((a, b) => a.dueAt - b.dueAt).map((record) => record.termId);
  currentId = queue.shift() || null;
  updateOverview();
  renderList();
  showCurrent();
};

const speak = async () => {
  const record = learning[currentId];
  const term = record && termFor(record);
  if (!term || !window.speechSynthesis) return;
  const preferences = (await getValue("gecPreferences")) || {};
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(term.term);
  utterance.lang = preferences.voiceLocale || "en-US";
  utterance.rate = Number(preferences.voiceRate || 0.85);
  window.speechSynthesis.speak(utterance);
};

const grade = async (gradeName) => {
  const record = learning[currentId];
  if (!record) return;
  const now = Date.now();
  const previous = record.repetitions || 0;
  if (gradeName === "again") {
    record.repetitions = 0;
    record.lapses = (record.lapses || 0) + 1;
    record.dueAt = now + 10 * MINUTE;
  } else if (gradeName === "hard") {
    record.repetitions = Math.max(1, previous);
    record.dueAt = now + (previous < 1 ? DAY : intervals[Math.min(previous - 1, intervals.length - 1)] * DAY);
  } else if (gradeName === "good") {
    record.repetitions = previous + 1;
    record.dueAt = now + intervals[Math.min(record.repetitions - 1, intervals.length - 1)] * DAY;
  } else {
    record.repetitions = previous + 2;
    record.dueAt = now + intervals[Math.min(record.repetitions, intervals.length - 1)] * DAY;
  }
  record.lastReviewedAt = now;
  await setValue({ gecLearning: learning });
  currentId = queue.shift() || null;
  updateOverview();
  renderList();
  showCurrent();
};

document.getElementById("reveal").addEventListener("click", () => {
  document.getElementById("answer").hidden = false;
  document.getElementById("grading").hidden = false;
  document.getElementById("reveal").hidden = true;
});
document.getElementById("speak").addEventListener("click", speak);
document.querySelectorAll("[data-grade]").forEach((button) => button.addEventListener("click", () => grade(button.dataset.grade)));
document.getElementById("search").addEventListener("input", renderList);

(async () => {
  learning = (await getValue("gecLearning")) || {};
  rebuildQueue();
})();
