// Portacarte — logica applicativa (nessuna dipendenza da build tool).

const COLORS = [
  "#4f46e5", "#7c3aed", "#db2777", "#dc2626",
  "#ea580c", "#d97706", "#16a34a", "#0891b2",
  "#2563eb", "#525252",
];

const el = (id) => document.getElementById(id);
const screens = ["home", "edit", "scan", "view", "settings"];

function showScreen(name) {
  for (const s of screens) {
    el("screen-" + s).classList.toggle("active", s === name);
  }
  if (name !== "view") stopWakeLock();
  if (name !== "scan") stopScanner();
}

function toast(msg) {
  const t = el("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 1800);
}

/* ---------------- Home / lista carte ---------------- */

let editingId = null; // id della carta in modifica, null se nuova

function renderHome() {
  const cards = Storage.getAll();
  const list = el("card-list");
  list.innerHTML = "";
  el("empty-state").classList.toggle("show", cards.length === 0);

  for (const card of cards) {
    const tile = document.createElement("button");
    tile.className = "card-tile";
    tile.style.background = `linear-gradient(135deg, ${card.color}, ${shade(card.color, -18)})`;
    tile.innerHTML = `
      <div class="brand-dot">${initials(card.name)}</div>
      <div>
        <div class="name">${escapeHtml(card.name)}</div>
        <div class="type">${labelForType(card.codeType)}</div>
      </div>
    `;
    tile.addEventListener("click", () => openView(card.id));
    list.appendChild(tile);
  }
}

function initials(name) {
  return (name || "?").trim().slice(0, 2).toUpperCase();
}

function shade(hex, percent) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + Math.round(2.55 * percent);
  let g = ((n >> 8) & 0xff) + Math.round(2.55 * percent);
  let b = (n & 0xff) + Math.round(2.55 * percent);
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function labelForType(type) {
  return { CODE128: "Barcode", EAN13: "Barcode EAN-13", UPC: "Barcode UPC", QR: "QR Code" }[type] || type;
}

function escapeHtml(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

/* ---------------- Form aggiungi / modifica ---------------- */

function buildColorGrid(selected) {
  const grid = el("color-grid");
  grid.innerHTML = "";
  for (const color of COLORS) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "color-swatch" + (color === selected ? " selected" : "");
    dot.style.background = color;
    dot.dataset.color = color;
    dot.addEventListener("click", () => {
      grid.querySelectorAll(".color-swatch").forEach((n) => n.classList.remove("selected"));
      dot.classList.add("selected");
    });
    grid.appendChild(dot);
  }
}

function selectedColor() {
  const sel = el("color-grid").querySelector(".color-swatch.selected");
  return sel ? sel.dataset.color : COLORS[0];
}

function openAddForm(prefill) {
  editingId = null;
  el("edit-title").textContent = "Nuova carta";
  el("btn-delete").style.display = "none";
  el("input-name").value = prefill?.name || "";
  el("input-code-type").value = prefill?.codeType || "CODE128";
  el("input-code-value").value = prefill?.codeValue || "";
  buildColorGrid(COLORS[Math.floor(Math.random() * COLORS.length)]);
  showScreen("edit");
}

function openEditForm(id) {
  const card = Storage.get(id);
  if (!card) return;
  editingId = id;
  el("edit-title").textContent = "Modifica carta";
  el("btn-delete").style.display = "block";
  el("input-name").value = card.name;
  el("input-code-type").value = card.codeType;
  el("input-code-value").value = card.codeValue;
  buildColorGrid(card.color);
  showScreen("edit");
}

function saveForm() {
  const name = el("input-name").value.trim();
  const codeValue = el("input-code-value").value.trim();
  const codeType = el("input-code-type").value;
  const color = selectedColor();

  if (!name) return toast("Inserisci un nome");
  if (!codeValue) return toast("Inserisci un codice");

  if (editingId) {
    Storage.update(editingId, { name, codeValue, codeType, color });
    toast("Carta aggiornata");
  } else {
    Storage.add({ name, codeValue, codeType, color });
    toast("Carta aggiunta");
  }
  renderHome();
  showScreen("home");
}

function deleteCurrentCard() {
  if (!editingId) return;
  if (!confirm("Eliminare questa carta?")) return;
  Storage.remove(editingId);
  renderHome();
  showScreen("home");
  toast("Carta eliminata");
}

/* ---------------- Vista a schermo intero ---------------- */

let wakeLock = null;
let viewingId = null;

async function requestWakeLock() {
  try {
    if ("wakeLock" in navigator) {
      wakeLock = await navigator.wakeLock.request("screen");
      el("wake-lock-hint").textContent = "";
    } else {
      el("wake-lock-hint").textContent = "Suggerimento: tieni il dito sullo schermo per evitare lo spegnimento.";
    }
  } catch (e) {
    el("wake-lock-hint").textContent = "";
  }
}

function stopWakeLock() {
  if (wakeLock) {
    wakeLock.release().catch(() => {});
    wakeLock = null;
  }
}

function openView(id) {
  const card = Storage.get(id);
  if (!card) return;
  viewingId = id;
  el("view-store-name").textContent = card.name;
  el("view-code-type").textContent = labelForType(card.codeType);
  el("view-code-value").textContent = card.codeValue;

  const surface = el("code-surface");
  surface.innerHTML = "";

  if (card.codeType === "QR") {
    const canvas = document.createElement("canvas");
    surface.appendChild(canvas);
    QRCode.toCanvas(canvas, card.codeValue, { width: 260, margin: 1 }, (err) => {
      if (err) surface.textContent = "Impossibile generare il QR code.";
    });
  } else {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    surface.appendChild(svg);
    try {
      JsBarcode(svg, card.codeValue, {
        format: card.codeType,
        lineColor: "#000",
        width: 3,
        height: 130,
        displayValue: false,
        margin: 10,
      });
    } catch (e) {
      surface.innerHTML = "";
      surface.textContent = "Codice non valido per questo formato.";
    }
  }

  showScreen("view");
  requestWakeLock();
}

/* ---------------- Scanner (fotocamera) ---------------- */

let html5Qr = null;
let scanTarget = "add"; // dove riportare il risultato

function startScanner() {
  if (typeof Html5Qrcode === "undefined") {
    el("scan-status").textContent = "Scanner non disponibile offline.";
    return;
  }
  html5Qr = new Html5Qrcode("scan-video-wrap", { verbose: false });
  const config = { fps: 10, qrbox: { width: 240, height: 160 } };

  Html5Qrcode.getCameras()
    .then((cameras) => {
      if (!cameras || !cameras.length) throw new Error("no camera");
      const camId = (cameras.find((c) => /back|rear|environment/i.test(c.label)) || cameras[cameras.length - 1]).id;
      return html5Qr.start(
        camId,
        config,
        (decodedText, result) => onScanSuccess(decodedText, result),
        () => {} // ignora frame senza rilevazione
      );
    })
    .catch(() => {
      el("scan-status").textContent = "Fotocamera non disponibile. Inserisci il codice manualmente.";
    });
}

function onScanSuccess(decodedText, result) {
  const format = result?.result?.format?.formatName || "";
  let codeType = "CODE128";
  if (/QR/i.test(format)) codeType = "QR";
  else if (/EAN_13/i.test(format)) codeType = "EAN13";
  else if (/UPC_A/i.test(format)) codeType = "UPC";
  else if (/CODE_128/i.test(format)) codeType = "CODE128";

  stopScanner();
  el("input-code-value").value = decodedText;
  el("input-code-type").value = codeType;
  showScreen("edit");
  toast("Codice acquisito");
}

function stopScanner() {
  if (html5Qr) {
    const instance = html5Qr;
    html5Qr = null;
    instance.stop().then(() => instance.clear()).catch(() => {});
  }
}

/* ---------------- Import / export backup ---------------- */

function exportBackup() {
  const blob = new Blob([Storage.exportJSON()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `portacarte-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const added = Storage.importJSON(reader.result);
      renderHome();
      toast(`${added} carte importate`);
    } catch (e) {
      toast("File non valido");
    }
  };
  reader.readAsText(file);
}

/* ---------------- Collegamento eventi ---------------- */

function init() {
  renderHome();

  el("btn-add").addEventListener("click", () => openAddForm());
  el("empty-add-btn").addEventListener("click", () => openAddForm());
  el("edit-cancel").addEventListener("click", () => showScreen("home"));
  el("edit-save").addEventListener("click", saveForm);
  el("btn-delete").addEventListener("click", deleteCurrentCard);

  el("btn-scan-open").addEventListener("click", () => {
    scanTarget = "add";
    el("scan-status").textContent = "Avvio fotocamera…";
    showScreen("scan");
    startScanner();
  });
  el("scan-cancel").addEventListener("click", () => showScreen("edit"));

  el("view-close").addEventListener("click", () => showScreen("home"));
  el("view-edit").addEventListener("click", () => {
    if (viewingId) openEditForm(viewingId);
  });

  el("btn-settings").addEventListener("click", () => showScreen("settings"));
  el("settings-close").addEventListener("click", () => showScreen("home"));
  el("btn-export").addEventListener("click", exportBackup);
  el("btn-import").addEventListener("click", () => el("import-file").click());
  el("import-file").addEventListener("change", (e) => {
    if (e.target.files[0]) importBackup(e.target.files[0]);
    e.target.value = "";
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", init);
