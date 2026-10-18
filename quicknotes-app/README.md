# QuickNotes

QuickNotes is a small note-taking web app built with plain HTML, CSS and JavaScript. You type a short note, pick a category (Personal, Work or Study), and the app shows it as a colour-coded card with the date and time it was created. Notes are saved in your browser, so they are still there after you refresh the page.

## Features

- Add notes with a category: Personal, Work or Study
- Each note card shows the text, category label, date and a Delete button
- Colour-coded left border for each category
- Validation: empty notes and notes over 200 characters show an error message
- Delete any single note
- Live count: "You have no notes yet.", "You have 1 note." or "You have N notes."
- Search notes as you type (not case-sensitive), with a "No notes match your search." message
- Notes saved to localStorage and restored when the page opens
- "Clear all" button with a confirmation prompt (bonus)
- Responsive layout: the form stacks vertically on screens 600px wide or narrower

## How to run locally

1. Clone the repository: `git clone https://github.com/gatimooo/web-foundations/blob/main/quicknotes-app`
2. Open the `quicknotes-app` folder.
3. Double-click `index.html` to open it in your browser. No installation or build step is needed.

## Files

- `index.html` - page structure
- `style.css` - layout, cards, category colours and responsive rules
- `script.js` - add, delete, search, validation, count and localStorage
- `README.md` - this file

## What I learned

- How to build a page with semantic tags (`header`, `main`, `section`, `footer`) and link every `<input>` to a `<label>`.
- How to build the UI from an array of objects with a `render()` function, using `createElement` and `textContent` instead of `innerHTML` so user text is never treated as HTML.
- How to save and load data with `localStorage`, `JSON.stringify` and `JSON.parse`, and why loading should be wrapped in `try/catch`.
- How to use Flexbox for the form and a `@media (max-width: 600px)` rule to make it responsive.
- How to make small, clear Git commits, one for each task.
