const get = (key) => new Promise((resolve) => chrome.storage.local.get(key, (value) => resolve(value[key])));
const set = (value) => new Promise((resolve) => chrome.storage.local.set(value, resolve));

const refresh = async () => {
  const learning = (await get("gecLearning")) || {};
  const now = Date.now();
  const cards = Object.values(learning);
  document.getElementById("savedCount").textContent = cards.length;
  document.getElementById("dueCount").textContent = cards.filter((card) => card.dueAt <= now).length;
  document.getElementById("packCount").textContent = GEC_TERMS.length;
};

const loadPreferences = async () => {
  const preferences = (await get("gecPreferences")) || {};
  const locale = document.getElementById("voiceLocale");
  const rate = document.getElementById("voiceRate");
  locale.value = preferences.voiceLocale || "en-US";
  rate.value = preferences.voiceRate || "0.85";
  document.getElementById("rateValue").textContent = `${Number(rate.value).toFixed(2)}×`;
};

const savePreferences = async () => {
  const voiceLocale = document.getElementById("voiceLocale").value;
  const voiceRate = document.getElementById("voiceRate").value;
  document.getElementById("rateValue").textContent = `${Number(voiceRate).toFixed(2)}×`;
  await set({ gecPreferences: { voiceLocale, voiceRate } });
};

document.getElementById("openReview").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "GEC_OPEN_REVIEW" });
});
document.getElementById("voiceLocale").addEventListener("change", savePreferences);
document.getElementById("voiceRate").addEventListener("input", savePreferences);

Promise.all([refresh(), loadPreferences()]);
