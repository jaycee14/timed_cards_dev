
(() => {
  "use strict";

  const config = window.TIMED_CARDS_CONFIG;

  if (!config || !Array.isArray(config.cards) || config.cards.length === 0) {
    document.body.innerHTML =
      "<p>Configuration error: add at least one content card in config.js.</p>";
    return;
  }

  const $ = (id) => document.getElementById(id);

  const els = {
    appTitle: $("app-title"),
    settingsToggle: $("settings-toggle"),
    settingsPanel: $("settings-panel"),
    settingsClose: $("settings-close"),
    durationPreset: $("duration-preset"),
    customFields: $("custom-duration-fields"),
    customMinutes: $("custom-minutes"),
    customSeconds: $("custom-seconds"),
    settingsNote: $("settings-note"),
    settingsError: $("settings-error"),
    applySettings: $("apply-settings"),
    statusLabel: $("status-label"),
    cardCounter: $("card-counter"),
    cardIcon: $("card-icon"),
    cardTitle: $("card-title"),
    cardText: $("card-text"),
    timerArea: $("timer-area"),
    cardTimer: $("card-timer"),
    sessionTimer: $("session-timer"),
    progressTrack: $("progress-track"),
    progressFill: $("progress-fill"),
    progressPercent: $("progress-percent"),
    primaryAction: $("primary-action"),
    durationSummary: $("duration-summary"),
    card: $("card"),
  };

  const state = {
    screen: "start",
    duration: Number(config.defaultDuration) || 60,
    currentIndex: 0,
    sessionStartedAt: null,
    intervalId: null
  };

  // Format seconds as MM:SS or HH:MM:SS.
  function formatTime(totalSeconds) {
    const seconds = Math.max(0, Math.ceil(totalSeconds));
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(
        minutes % 60
      ).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(
      remainder
    ).padStart(2, "0")}`;
  }

  function formatDuration(seconds) {
    if (seconds % 60 === 0) {
      const minutes = seconds / 60;
      return `${minutes} ${minutes === 1 ? "min" : "mins"}`;
    }

    if (seconds < 60) return `${seconds} sec`;

    return `${Math.floor(seconds / 60)} min ${seconds % 60} sec`;
  }

  // Total duration is the number of cards multiplied by
  // the duration allocated to each card.
  function sessionDuration() {
    return state.duration * config.cards.length;
  }

  function setSettingsOpen(open) {
    els.settingsPanel.hidden = !open;

    els.settingsToggle.setAttribute(
      "aria-expanded",
      String(open)
    );

    els.settingsToggle.setAttribute(
      "aria-label",
      open ? "Close settings" : "Open settings"
    );
  }

  function updateDurationSummary() {
    els.durationSummary.textContent =
      `${formatDuration(state.duration)} per card`;

    els.settingsNote.textContent =
      `Each card will display for ${formatDuration(state.duration)}. ` +
      `Total session: ${formatDuration(sessionDuration())}.`;
  }

  function showSettingsError(message) {
    els.settingsError.textContent = message;
    els.settingsError.hidden = !message;
  }

  // Read and validate the duration selected in the settings menu.
  function readSelectedDuration() {
    if (els.durationPreset.value !== "custom") {
      return Number(els.durationPreset.value);
    }

    const minutes = Number(els.customMinutes.value);
    const seconds = Number(els.customSeconds.value);

    if (!Number.isInteger(minutes) || minutes < 0 || minutes > 999) {
      throw new Error(
        "Minutes must be a whole number between 0 and 999."
      );
    }

    if (!Number.isInteger(seconds) || seconds < 0 || seconds > 59) {
      throw new Error(
        "Seconds must be a whole number between 0 and 59."
      );
    }

    const total = minutes * 60 + seconds;

    if (total < 1) {
      throw new Error("Choose a duration of at least one second.");
    }

    return total;
  }

  function renderStart() {
    state.screen = "start";
    state.currentIndex = 0;

    stopTicker();

    const card = config.startCard;

    els.statusLabel.textContent =
      card.eyebrow || "READY WHEN YOU ARE";

    els.cardCounter.textContent =
      card.counter || "Introduction";

    els.cardIcon.textContent = card.icon || "✦";
    els.cardTitle.textContent = card.title || "Ready to begin?";
    els.cardText.textContent = card.text || "";

    // No countdown on the starting screen.
    els.timerArea.hidden = true;

    els.primaryAction.hidden = false;
    els.primaryAction.innerHTML =
      `${escapeText(card.buttonText || "Start session")} ` +
      `<span aria-hidden="true">→</span>`;

    els.primaryAction.disabled = false;

    els.card.classList.remove("is-complete");
    els.card.classList.add("is-start");

    els.progressFill.style.width = "0%";
    els.progressTrack.setAttribute("aria-valuenow", "0");
    els.progressPercent.textContent = "0%";

    setSettingsOpen(false);
    updateDurationSummary();
  }

  // Encode configurable button text before inserting it alongside
  // the decorative arrow. Card content itself uses textContent.
  function escapeText(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderContentCard(index) {
    const card = config.cards[index];

    state.screen = "running";
    state.currentIndex = index;

    els.statusLabel.textContent = "SESSION IN PROGRESS";

    els.cardCounter.textContent =
      `Card ${index + 1} of ${config.cards.length}`;

    els.cardIcon.textContent =
      card.icon || String(index + 1).padStart(2, "0");

    els.cardTitle.textContent = card.title || `Card ${index + 1}`;
    els.cardText.textContent = card.text || "";

    // Show both countdowns during timed cards.
    els.timerArea.hidden = false;

    // Start/reset controls are hidden while the session is running.
    els.primaryAction.hidden = true;

    els.card.classList.remove("is-start", "is-complete");

    els.cardTimer.textContent = formatTime(state.duration);
    els.sessionTimer.textContent = formatTime(sessionDuration());
  }

  function renderComplete() {
    state.screen = "complete";

    stopTicker();

    const card = config.finalCard || {};

    els.statusLabel.textContent =
      card.eyebrow || "SESSION FINISHED";

    els.cardCounter.textContent = card.counter || "Complete";
    els.cardIcon.textContent = card.icon || "✓";
    els.cardTitle.textContent = card.title || "Session complete";

    els.cardText.textContent =
      card.text || "You have reached the end of the session.";

    // No countdown on the final screen.
    els.timerArea.hidden = true;

    els.primaryAction.hidden = false;
    els.primaryAction.innerHTML =
      `${escapeText(card.buttonText || "Start again")} ` +
      `<span aria-hidden="true">↻</span>`;

    els.primaryAction.disabled = false;

    els.card.classList.remove("is-start");
    els.card.classList.add("is-complete");

    els.progressFill.style.width = "100%";
    els.progressTrack.setAttribute("aria-valuenow", "100");
    els.progressPercent.textContent = "100%";

    setSettingsOpen(false);
  }

  function startSession() {
    stopTicker();

    // Lock the selected duration for this session.
    state.duration = readSelectedDuration();

    state.currentIndex = 0;
    state.sessionStartedAt = Date.now();

    renderContentCard(0);
    setSettingsOpen(false);

    tick();

    // This interval refreshes the UI. Absolute timestamps determine
    // actual timing, avoiding accumulated interval drift.
    state.intervalId = window.setInterval(tick, 200);
  }

  function tick() {
    if (
      state.screen !== "running" ||
      state.sessionStartedAt === null
    ) {
      return;
    }

    const now = Date.now();

    const elapsed = Math.max(
      0,
      now - state.sessionStartedAt
    );

    const durationMs = state.duration * 1000;
    const totalMs = durationMs * config.cards.length;

    // End the session once its full duration has elapsed.
    if (elapsed >= totalMs) {
      renderComplete();
      return;
    }

    // Calculate which card should currently be visible.
    // This also catches up if the browser tab was inactive.
    const nextIndex = Math.min(
      config.cards.length - 1,
      Math.floor(elapsed / durationMs)
    );

    if (nextIndex !== state.currentIndex) {
      renderContentCard(nextIndex);
    }

    const currentCardEnd =
      (state.currentIndex + 1) * durationMs;

    const cardRemaining = Math.max(
      0,
      (currentCardEnd - elapsed) / 1000
    );

    const sessionRemaining = Math.max(
      0,
      (totalMs - elapsed) / 1000
    );

    const progress = Math.min(
      100,
      (elapsed / totalMs) * 100
    );

    els.cardTimer.textContent = formatTime(cardRemaining);
    els.sessionTimer.textContent = formatTime(sessionRemaining);

    els.progressFill.style.width = `${progress}%`;

    els.progressTrack.setAttribute(
      "aria-valuenow",
      String(Math.floor(progress))
    );

    els.progressPercent.textContent =
      `${Math.floor(progress)}%`;
  }

  function stopTicker() {
    if (state.intervalId !== null) {
      window.clearInterval(state.intervalId);
      state.intervalId = null;
    }
  }

  // Settings menu open/close.
  els.settingsToggle.addEventListener("click", () => {
    setSettingsOpen(els.settingsPanel.hidden);
  });

  els.settingsClose.addEventListener("click", () => {
    setSettingsOpen(false);
  });

  // Show custom duration inputs when required.
  els.durationPreset.addEventListener("change", () => {
    els.customFields.hidden =
      els.durationPreset.value !== "custom";

    showSettingsError("");
  });

  // Apply settings for the next session.
  els.applySettings.addEventListener("click", () => {
    try {
      state.duration = readSelectedDuration();

      updateDurationSummary();
      showSettingsError("");
      setSettingsOpen(false);
    } catch (error) {
      showSettingsError(error.message);
    }
  });

  // The same button starts the session or resets after completion.
  els.primaryAction.addEventListener("click", () => {
    if (state.screen === "start") {
      try {
        startSession();
      } catch (error) {
        setSettingsOpen(true);
        showSettingsError(error.message);
      }
    } else if (state.screen === "complete") {
      renderStart();
    }
  });

  // Initialise duration controls to match the configuration.
  const presets = Array.from(
    els.durationPreset.options
  ).map(option => option.value);

  if (presets.includes(String(state.duration))) {
    els.durationPreset.value = String(state.duration);
  } else {
    els.durationPreset.value = "custom";
    els.customFields.hidden = false;

    els.customMinutes.value =
      String(Math.floor(state.duration / 60));

    els.customSeconds.value =
      String(state.duration % 60);
  }

  els.appTitle.textContent = config.title || "Timed Cards";
  document.title = config.title || "Timed Cards";

  updateDurationSummary();
  renderStart();

  // Clear the interval when the page is unloaded.
  window.addEventListener("pagehide", stopTicker);
})();
