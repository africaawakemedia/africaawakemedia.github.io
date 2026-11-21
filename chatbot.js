(() => {
  const WORKER_URL = "PASTE_CLOUDFLARE_WORKER_URL_HERE";
  const history = [];
  const lang = () => (localStorage.getItem("aam-language") || document.documentElement.lang || "en");
  const welcome = () => lang() === "ha"
    ? "Sannu! Ni ne AFRICA AWAKE AI. Wace tambaya kake da ita?"
    : "Hello! I'm AFRICA AWAKE AI. What would you like to learn today?";
  const labels = () => lang() === "ha"
    ? {open:"Tambayi AI",title:"AFRICA AWAKE AI",sub:"Mataimakin ilimi da tarihi",placeholder:"Rubuta tambayarka...",send:"Aika",note:"AI na iya yin kuskure. Ka tabbatar da muhimman bayanai."}
    : {open:"Ask AI",title:"AFRICA AWAKE AI",sub:"Your African history and knowledge assistant",placeholder:"Type your question...",send:"Send",note:"AI can make mistakes. Verify important information."};

  const launcher = document.createElement("button");
  launcher.id = "aam-chat-launcher";
  launcher.type = "button";
  const panel = document.createElement("section");
  panel.id = "aam-chat-panel";
  panel.setAttribute("aria-label", "Africa Awake AI chat");
  panel.innerHTML = `
    <div id="aam-chat-head"><div><strong id="aam-chat-title"></strong><small id="aam-chat-sub"></small></div><button id="aam-chat-close" type="button" aria-label="Close chat">×</button></div>
    <div id="aam-chat-messages" aria-live="polite"></div>
    <form id="aam-chat-form"><textarea id="aam-chat-input" rows="1" maxlength="2000"></textarea><button id="aam-chat-send" type="submit"></button></form>
    <div id="aam-chat-note"></div>`;
  document.body.append(launcher, panel);

  const messagesEl = panel.querySelector("#aam-chat-messages");
  const input = panel.querySelector("#aam-chat-input");
  const send = panel.querySelector("#aam-chat-send");
  const form = panel.querySelector("#aam-chat-form");

  function addMessage(text, who, extra = "") {
    const el = document.createElement("div");
    el.className = "aam-chat-msg " + (who === "user" ? "aam-user" : "aam-bot") + (extra ? " " + extra : "");
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }

  function refreshLabels() {
    const t = labels();
    launcher.textContent = t.open;
    panel.querySelector("#aam-chat-title").textContent = t.title;
    panel.querySelector("#aam-chat-sub").textContent = t.sub;
    input.placeholder = t.placeholder;
    send.textContent = t.send;
    panel.querySelector("#aam-chat-note").textContent = t.note;
    if (!messagesEl.children.length) addMessage(welcome(), "assistant");
  }

  launcher.addEventListener("click", () => {
    panel.classList.add("aam-open");
    refreshLabels();
    input.focus();
  });
  panel.querySelector("#aam-chat-close").addEventListener("click", () => panel.classList.remove("aam-open"));

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || send.disabled) return;
    if (WORKER_URL.includes("PASTE_CLOUDFLARE")) {
      addMessage("The AI service is being configured. Please try again soon.", "assistant", "aam-error");
      return;
    }
    addMessage(question, "user");
    history.push({ role: "user", content: question });
    while (history.length > 10) history.shift();
    input.value = "";
    send.disabled = true;
    const pending = addMessage(lang() === "ha" ? "Ina tunani..." : "Thinking...", "assistant");
    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history })
      });
      const data = await response.json();
      if (!response.ok || !data.answer) throw new Error(data.error || "Request failed");
      pending.textContent = data.answer;
      history.push({ role: "assistant", content: data.answer });
      while (history.length > 10) history.shift();
    } catch (error) {
      pending.textContent = lang() === "ha"
        ? "An samu matsala wajen haɗuwa da AI. Ka sake gwadawa nan gaba."
        : "I couldn't reach the AI service. Please try again.";
      pending.classList.add("aam-error");
    } finally {
      send.disabled = false;
      messagesEl.scrollTop = messagesEl.scrollHeight;
      input.focus();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") panel.classList.remove("aam-open");
  });
  refreshLabels();
})();
