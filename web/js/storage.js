// Persistenza locale delle carte fedeltà (localStorage, nessun server).
const Storage = (() => {
  const KEY = "portacarte.cards.v1";

  function loadAll() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Portacarte: dati corrotti, reset.", e);
      return [];
    }
  }

  function saveAll(cards) {
    localStorage.setItem(KEY, JSON.stringify(cards));
  }

  function uid() {
    return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  return {
    getAll() {
      return loadAll().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
    get(id) {
      return loadAll().find((c) => c.id === id) || null;
    },
    add(card) {
      const cards = loadAll();
      const entry = {
        id: uid(),
        name: card.name,
        codeType: card.codeType,
        codeValue: card.codeValue,
        color: card.color,
        order: cards.length,
        createdAt: Date.now(),
      };
      cards.push(entry);
      saveAll(cards);
      return entry;
    },
    update(id, patch) {
      const cards = loadAll();
      const idx = cards.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      cards[idx] = { ...cards[idx], ...patch };
      saveAll(cards);
      return cards[idx];
    },
    remove(id) {
      const cards = loadAll().filter((c) => c.id !== id);
      saveAll(cards);
    },
    exportJSON() {
      return JSON.stringify({ version: 1, cards: loadAll() }, null, 2);
    },
    importJSON(text) {
      const data = JSON.parse(text);
      const incoming = Array.isArray(data) ? data : data.cards;
      if (!Array.isArray(incoming)) throw new Error("Formato non valido");
      const existing = loadAll();
      const existingIds = new Set(existing.map((c) => c.id));
      let added = 0;
      for (const c of incoming) {
        if (!c || !c.name || !c.codeValue) continue;
        if (existingIds.has(c.id)) continue;
        existing.push({
          id: c.id || uid(),
          name: c.name,
          codeType: c.codeType || "CODE128",
          codeValue: c.codeValue,
          color: c.color || "#4f46e5",
          order: existing.length,
          createdAt: c.createdAt || Date.now(),
        });
        added++;
      }
      saveAll(existing);
      return added;
    },
  };
})();
