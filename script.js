/* ===== Theme toggle (your original behavior) ===== */
const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
const currentTheme = localStorage.getItem("theme");
if (currentTheme) {
  document.documentElement.setAttribute("data-theme", currentTheme);
  if (currentTheme === "dark") toggleSwitch.checked = true;
}
toggleSwitch.addEventListener("change", (e) => {
  const theme = e.target.checked ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
});

/* ===== Sticky navbar effects + mobile menu ===== */
const topbar = document.getElementById("topbar");
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

// glass visibility on scroll
const onScroll = () => {
  if (window.scrollY > 10) topbar.classList.add("scrolled");
  else topbar.classList.remove("scrolled");
};
onScroll();
window.addEventListener("scroll", onScroll);

// mobile menu toggle
hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

// smooth scrolling with offset so content isn't hidden behind navbar
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length > 1) {
      e.preventDefault();
      navLinks.classList.remove("open");
      const el = document.querySelector(id);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.pageYOffset - 72;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  });
});

/* ===== Password Generation ===== */
// Random generators
function getRandomLower(){ return String.fromCharCode(Math.floor(Math.random()*26)+97); }
function getRandomUpper(){ return String.fromCharCode(Math.floor(Math.random()*26)+65); }
function getRandomNumber(){ return String.fromCharCode(Math.floor(Math.random()*10)+48); }
function getRandomSymbol(){ const s="!@#$%^&*(){}[]=<>/,.";
  return s[Math.floor(Math.random()*s.length)]; }
function getRandomAmbiguous(){ const a='~|_[]:;"\''+"`\\"+"/"; return a[Math.floor(Math.random()*a.length)]; }

const randomFunc = { lower:getRandomLower, upper:getRandomUpper, number:getRandomNumber, symbol:getRandomSymbol, ambiguous:getRandomAmbiguous };

// UI refs
const txt = document.getElementById("PasswordResult");
const lengthNumber = document.getElementById("Passwordlength");
const lengthRange = document.getElementById("lengthRange");
const uppercase = document.getElementById("uppercase");
const lowercase = document.getElementById("lowercase");
const numbers = document.getElementById("numbers");
const symbols = document.getElementById("symbols");
const avoidSimilar = document.getElementById("avoidSimilar");
const ambiguous = document.getElementById("ambiguous");
const generateBtn = document.getElementById("generateBtn");
const clipboardBtn = document.getElementById("clipboardBtn");
const regenBtn = document.getElementById("regenBtn");
const strengthBar = document.getElementById("strengthBar");
const strengthLabel = document.getElementById("strengthLabel");

// mode radios
const modeRadios = document.getElementsByName("mode");

// sync slider & number
const syncLen = (val) => {
  const v = Math.max(4, Math.min(40, parseInt(val || 0, 10)));
  lengthNumber.value = v;
  lengthRange.value = v;
};
lengthRange.addEventListener("input", e => syncLen(e.target.value));
lengthNumber.addEventListener("input", e => syncLen(e.target.value));

// generate password based on selected options
function generatePassword() {
  const length = parseInt(lengthNumber.value, 10) || 12;
  const mode = [...modeRadios].find(r => r.checked)?.value || "all";

  let pool = "";

  if (mode === "say") {
    pool = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  } else if (mode === "read") {
    pool = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no O0 Il 1
  } else {
    if (lowercase.checked) pool += "abcdefghijklmnopqrstuvwxyz";
    if (uppercase.checked) pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (numbers.checked)  pool += "0123456789";
    if (symbols.checked)  pool += "!@#$%^&*(){}[]=<>/,.";
    if (ambiguous.checked) pool += "~|_[]:;\"'`\\/";
  }

  if (!pool) { txt.value = ""; updateStrength(""); return; }

  let out = "";
  for (let i=0; i<length; i++){
    out += pool[Math.floor(Math.random()*pool.length)];
  }

  if (avoidSimilar.checked) {
    // replace confusing chars with random symbols
    out = out.replace(/[0OIl]/g, () => getRandomSymbol());
  }

  txt.value = out;
  updateStrength(out);
}

// strength meter & label
function updateStrength(p) {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  const pct = (score/4)*100;
  strengthBar.style.width = pct + "%";
  const label = score >= 3 && p.length >= 14 ? "Strong"
              : score >= 2 ? "Medium"
              : p.length ? "Weak" : "—";
  strengthLabel.textContent = "Strength: " + label;
}

// actions
generateBtn.addEventListener("click", generatePassword);
regenBtn.addEventListener("click", generatePassword);

// copy (Clipboard API with fallback for iOS/old Android)
clipboardBtn.addEventListener("click", async () => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(txt.value);
    } else {
      txt.select(); document.execCommand("copy");
    }
    alert("Copied to clipboard!");
  } catch (e) {
    alert("Failed to copy: " + e);
  }
});

// initial
syncLen(12);
generatePassword();
