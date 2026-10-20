# Timed Cards

A responsive, single-page timed-card app built with vanilla HTML, CSS, and JavaScript. It has no build step and no external dependencies.

## Run it

1. Extract the ZIP (if you downloaded the ZIP).
2. Open `index.html` in a modern browser.
3. Click the settings gear to select a preset or custom duration.
4. Click **Start session**.

Because this uses classic scripts rather than JavaScript modules, it can run directly from `file://` without a local server.

## Change the card content

Edit `config.js`. Change `title`, `startCard`, `cards`, and `finalCard`. Each content card can have an `id`, `title`, `text`, and optional `icon`.

Example:

```js
cards: [
  { id: "one", title: "First card", text: "Your content goes here." },
  { id: "two", title: "Second card", text: "More content goes here." }
]
```

Keep at least one item in `cards`. `defaultDuration` is measured in seconds (60 = one minute).

## Timing behaviour

- The per-card duration defaults to 60 seconds.
- The session countdown is the number of content cards multiplied by the per-card duration.
- Timers use absolute timestamps, not decrementing counters, so they stay accurate when the browser throttles background tabs.
- If the tab is inactive long enough for more than one card interval to pass, the app catches up to the card matching the elapsed time.
- The final card appears when the total session time expires. Timers are hidden on the start and final screens.
- There is no pause/resume control.
- Settings apply to the next session. The duration is locked once a session starts.
- Reset returns to the start screen. The selected duration remains selected.

## Duration options

The menu includes 30 seconds, 1 minute, 2 minutes, 5 minutes, and a custom duration in minutes and seconds. Custom durations must be at least one second.

## Files

- `index.html` — page structure
- `styles.css` — responsive layout and styling
- `config.js` — editable content and default duration
- `app.js` — state, timer calculations, and interactions

## Notes

This is a front-end-only app. Session state is not saved if the page is reloaded or closed. The browser's system clock is used for timing. If you later need persistence, analytics, or content management, those can be added separately.
