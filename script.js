"use strict";

/* ---------- Zakładki ---------- */
const tabs = [...document.querySelectorAll('[role="tab"]')];

function selectTab(tab) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
  });
}

tabs.forEach((t, i) => {
  t.addEventListener("click", () => selectTab(t));
  t.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    selectTab(next);
    next.focus();
  });
});

/* ---------- Pomocnicze ---------- */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function plural(n, one, few, many) {
  const last2 = n % 100;
  const last = n % 10;
  if (n === 1) return one;
  if (last2 >= 12 && last2 <= 14) return many;
  if (last >= 2 && last <= 4) return few;
  return many;
}

/* ---------- Sprawdzacz linków ---------- */
const BRANDS = {
  paypal: ["paypal.com"],
  allegro: ["allegro.pl"],
  inpost: ["inpost.pl"],
  mbank: ["mbank.pl"],
  pkobp: ["pkobp.pl", "ipko.pl"],
  ipko: ["ipko.pl", "pkobp.pl"],
  google: ["google.com", "google.pl"],
  apple: ["apple.com", "icloud.com"],
  microsoft: ["microsoft.com", "live.com", "office.com"],
  facebook: ["facebook.com", "fb.com"],
  instagram: ["instagram.com"],
  netflix: ["netflix.com"],
  olx: ["olx.pl"],
  dhl: ["dhl.com", "dhl.de", "dhl.pl"],
  orange: ["orange.pl"],
  steam: ["steampowered.com", "steamcommunity.com"],
  discord: ["discord.com", "discord.gg"],
  roblox: ["roblox.com"],
  tiktok: ["tiktok.com"],
  amazon: ["amazon.com", "amazon.pl", "amazon.de"],
};
const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly", "rb.gy", "ow.ly", "shorturl.at", "tiny.pl"];
const BAD_TLDS = ["zip", "mov", "xyz", "top", "click", "tk", "ml", "gq", "cf", "ga", "work", "support", "rest", "icu", "cyou", "buzz"];
const KEYWORDS = ["login", "logowanie", "verify", "weryfikacja", "secure", "update", "aktualizacja", "konto", "account", "haslo", "password", "platnosc", "payment", "doplata", "paczka", "bonus", "prize", "wygrana", "odbierz"];

function registeredDomain(host) {
  const p = host.split(".");
  if (p.length <= 2) return host;
  const second = p[p.length - 2];
  if (p[p.length - 1].length === 2 && ["com", "co", "org", "net", "gov", "edu"].includes(second)) {
    return p.slice(-3).join(".");
  }
  return p.slice(-2).join(".");
}

function analyzeLink(raw) {
  const input = raw.trim();
  const flags = [];
  const add = (pts, text) => flags.push({ pts, text });

  if (/^(javascript|data|file|vbscript):/i.test(input)) {
    return { host: input.slice(0, 60), flags: [{ pts: 100, text: "To nie jest zwykły adres strony, tylko polecenie, które może uruchomić kod." }] };
  }

  let url;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(input) ? input : "https://" + input);
  } catch (e) {
    return null;
  }

  const host = url.hostname.toLowerCase();
  if (!host.includes(".") && !host.startsWith("[")) return null;

  const full = (host + url.pathname).toLowerCase();
  const reg = registeredDomain(host);
  const tld = host.split(".").pop();

  if (url.protocol === "http:") add(20, "Adres nie używa szyfrowania (http zamiast https).");
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith("[")) add(30, "Zamiast nazwy strony jest numer IP. Prawdziwe firmy tak nie robią.");
  if (url.username) add(25, "W adresie jest znak @. Wszystko przed nim to atrapa, strona naprawdę jest po nim.");
  if (host.includes("xn--")) add(25, "Adres zawiera obce litery, które mogą udawać zwykłe (np. rosyjskie „а” zamiast „a”).");
  if (host.split(".").length >= 5) add(10, "Bardzo dużo członów w nazwie domeny, to częsty sposób na ukrycie prawdziwego adresu.");
  if ((host.match(/-/g) || []).length >= 3) add(10, "Dużo myślników w nazwie domeny.");
  if (input.length > 75) add(10, "Bardzo długi adres.");
  if (SHORTENERS.includes(reg)) add(20, "To skracacz linków, więc nie widać, dokąd naprawdę prowadzi.");
  if (BAD_TLDS.includes(tld)) add(15, "Końcówka ." + tld + " jest często używana w oszustwach, bo jest tania.");

  const normalized = host.replace(/0/g, "o").replace(/1/g, "l").replace(/3/g, "e").replace(/5/g, "s").replace(/\./g, "");
  for (const brand of Object.keys(BRANDS)) {
    if (normalized.includes(brand) && !BRANDS[brand].includes(reg)) {
      add(35, "Nazwa przypomina markę „" + brand + "”, ale prawdziwa domena to " + BRANDS[brand][0] + ", a ten adres to " + reg + ".");
      break;
    }
  }

  const found = KEYWORDS.filter((k) => full.includes(k)).slice(0, 3);
  if (found.length) add(10, "Są w nim słowa, których używają oszuści: " + found.join(", ") + ".");

  return { host, flags };
}

function renderLink(result) {
  const box = document.getElementById("link-result");
  box.replaceChildren();

  if (!result) {
    const bad = el("div", "result mid");
    bad.append(el("p", "verdict", "Nie rozumiem tego adresu"), el("p", "advice", "Wklej cały link, np. https://przyklad.pl/strona."));
    box.append(bad);
    return;
  }

  const score = Math.min(100, result.flags.reduce((s, f) => s + f.pts, 0));
  const level = score < 25 ? "low" : score < 55 ? "mid" : "high";
  const verdicts = { low: "Wygląda w porządku", mid: "Uważaj", high: "Bardzo podejrzany" };

  const card = el("div", "result " + level);
  card.append(el("p", "verdict", verdicts[level] + " (" + score + "/100)"));

  const meter = el("div", "meter");
  const bar = el("span");
  bar.style.width = Math.max(score, 4) + "%";
  meter.append(bar);
  card.append(meter, el("p", "host", "Domena: " + result.host));

  if (result.flags.length) {
    const list = el("ul");
    result.flags.forEach((f) => list.append(el("li", null, f.text)));
    card.append(list);
  } else {
    card.append(el("p", null, "Nie znalazłem typowych sztuczek oszustów w samym adresie."));
  }

  card.append(el("p", "advice", level === "low"
    ? "To nie gwarancja: sprawdzam tylko wygląd adresu, nie to, co jest na stronie."
    : "Nie klikaj i nie podawaj tam żadnych danych. Wejdź na stronę ręcznie, wpisując adres, który znasz."));
  box.append(card);
}

const urlInput = document.getElementById("url");
document.getElementById("check").addEventListener("click", () => {
  if (urlInput.value.trim()) renderLink(analyzeLink(urlInput.value));
});
urlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("check").click();
});

/* ---------- Kalkulator hasła ---------- */
const COMMON = ["123456", "password", "qwerty", "haslo", "hasło", "haslo123", "admin", "12345678", "111111", "abc123", "zaq12wsx", "qwerty123", "polska", "kocham", "iloveyou", "123456789", "1q2w3e4r", "dragon", "letmein", "monkey", "roblox", "minecraft"];
const SEQUENCES = ["0123456789", "9876543210", "abcdefghijklmnopqrstuvwxyz", "qwertyuiop", "asdfghjkl", "zxcvbnm"];

const SCENARIOS = [
  { name: "Atak przez formularz logowania", rate: 100 },
  { name: "Wyciek bazy, wolny hash (bcrypt)", rate: 1e5 },
  { name: "Wyciek bazy, szybki hash (MD5)", rate: 1e10 },
];

function formatTime(sec) {
  if (sec < 1) return "natychmiast";
  const units = [
    [60, "sekunda", "sekundy", "sekund", 1],
    [3600, "minuta", "minuty", "minut", 60],
    [86400, "godzina", "godziny", "godzin", 3600],
    [31557600, "dzień", "dni", "dni", 86400],
  ];
  for (const [limit, one, few, many, size] of units) {
    if (sec < limit) {
      const n = Math.max(1, Math.round(sec / size));
      return "ok. " + n + " " + plural(n, one, few, many);
    }
  }
  const years = sec / 31557600;
  if (years < 1000) {
    const n = Math.round(years);
    return "ok. " + n + " " + plural(n, "rok", "lata", "lat");
  }
  if (years < 1e6) return "ok. " + Math.round(years / 1e3) + " tys. lat";
  if (years < 1e9) return "ok. " + Math.round(years / 1e6) + " mln lat";
  if (years < 1e12) return "ok. " + Math.round(years / 1e9) + " mld lat";
  return "ponad bilion lat";
}

function analyzePassword(pw) {
  const lower = pw.toLowerCase();
  const tips = [];

  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/\d/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(pw)) pool += 33;
  if (/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(pw)) pool += 18;

  let entropy = pw.length * Math.log2(pool || 1);
  let pattern = null;

  if (COMMON.includes(lower)) {
    entropy = 1;
    pattern = "To jedno z najczęściej używanych haseł, atakujący sprawdzają je jako pierwsze.";
  } else if (/^(.)\1+$/.test(pw)) {
    entropy = Math.min(entropy, 4);
    pattern = "Samo powtarzanie jednego znaku.";
  } else if (pw.length >= 4 && SEQUENCES.some((s) => s.includes(lower))) {
    entropy = Math.min(entropy, 10);
    pattern = "To ciąg znaków z klawiatury lub alfabetu, który łatwo zgadnąć.";
  } else if (/^[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]+\d{1,4}!?$/.test(pw)) {
    entropy -= 12;
    tips.push("Słowo z cyframi na końcu to bardzo częsty wzór, więc atakujący go uwzględniają.");
  }

  if (pattern) tips.unshift(pattern);
  if (pw.length < 12) tips.push("Dłuższe jest lepsze: spróbuj frazy z 4 losowych słów, np. kilkanaście liter w sumie.");
  if (pool <= 36 && pw.length >= 12) tips.push("Dobrą długość masz. Dodanie wielkich liter lub znaków specjalnych jeszcze pomoże.");

  entropy = Math.max(entropy, 1);
  const guesses = Math.pow(2, entropy - 1);
  const level = entropy < 40 ? "weak" : entropy < 60 ? "mid" : "good";
  const label = entropy < 40 ? "Słabe" : entropy < 60 ? "Średnie" : entropy < 80 ? "Dobre" : "Bardzo mocne";

  return { entropy, guesses, level, label, tips };
}

function renderPassword(pw) {
  const box = document.getElementById("pass-result");
  box.replaceChildren();
  if (!pw) return;

  const r = analyzePassword(pw);
  const card = el("div", "result " + r.level);
  card.append(el("p", "verdict", r.label + " (" + pw.length + " " + plural(pw.length, "znak", "znaki", "znaków") + ")"));

  const meter = el("div", "meter");
  const bar = el("span");
  bar.style.width = Math.min(100, Math.max(4, (r.entropy / 90) * 100)) + "%";
  meter.append(bar);
  card.append(meter);

  const table = el("table");
  const head = el("tr");
  head.append(el("th", null, "Sposób ataku"), el("th", null, "Czas złamania"));
  table.append(head);
  SCENARIOS.forEach((s) => {
    const row = el("tr");
    row.append(el("th", null, s.name), el("td", null, formatTime(r.guesses / s.rate)));
    table.append(row);
  });
  card.append(table);

  if (r.tips.length) {
    const list = el("ul");
    r.tips.forEach((t) => list.append(el("li", null, t)));
    card.append(list);
  }

  card.append(el("p", "advice", "To szacunek zakładający zgadywanie na ślepo. Najważniejsze: każde konto powinno mieć inne hasło."));
  box.append(card);
}

const pwInput = document.getElementById("pw");
pwInput.addEventListener("input", () => renderPassword(pwInput.value));
document.getElementById("show").addEventListener("change", (e) => {
  pwInput.type = e.target.checked ? "text" : "password";
});
