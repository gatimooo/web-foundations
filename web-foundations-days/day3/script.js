let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

const validCategories = ["personal", "work", "study"];

function searchNotes(word) {
  const search = String(word).toLowerCase();
  return notes.filter(function (note) {
    return note.text.toLowerCase().includes(search);
  });
}

function longestNote() {
  if (notes.length === 0) {
    return null;
  }

  let longest = notes[0];
  for (let i = 1; i < notes.length; i++) {
    if (notes[i].text.length > longest.text.length) {
      longest = notes[i];
    }
  }
  return longest;
}

function countByCategory() {
  const counts = {};

  for (let i = 0; i < notes.length; i++) {
    const category = notes[i].category;
    if (counts[category] === undefined) {
      counts[category] = 1;
    } else {
      counts[category] = counts[category] + 1;
    }
  }
  return counts;
}

function getSummary() {
  const total = notes.length;
  const noun = total === 1 ? "note" : "notes";

  if (total === 0) {
    return `0 ${noun}.`;
  }

  const counts = countByCategory();
  const parts = [];

  for (let i = 0; i < validCategories.length; i++) {
    const category = validCategories[i];
    if (counts[category] !== undefined) {
      parts.push(`${counts[category]} ${category}`);
    }
  }

  return `${total} ${noun}: ${parts.join(", ")}.`;
}

function isDuplicate(text) {
  const cleaned = String(text).trim().toLowerCase();
  return notes.some(function (note) {
    return note.text.trim().toLowerCase() === cleaned;
  });
}

function addNote(text, category) {
  if (typeof text !== "string") {
    console.log("Not added: text must be a string.");
    return false;
  }

  const cleaned = text.trim();

  if (cleaned.length < 1 || cleaned.length > 200) {
    console.log("Not added: text must be between 1 and 200 characters.");
    return false;
  }

  if (isDuplicate(cleaned)) {
    console.log("Not added: a note with this text already exists.");
    return false;
  }

  if (!validCategories.includes(category)) {
    console.log("Not added: category must be personal, work or study.");
    return false;
  }

  let maxId = 0;
  for (let i = 0; i < notes.length; i++) {
    if (notes[i].id > maxId) {
      maxId = notes[i].id;
    }
  }

  notes.push({ id: maxId + 1, text: cleaned, category: category });
  console.log("Added: " + cleaned);
  return true;
}

console.log("--- searchNotes ---");
console.log(searchNotes("MILK"));
// Expected: [ { id: 1, text: "Buy milk and bread", category: "personal" } ]
console.log(searchNotes("xyz"));
// Expected: [] (no results)

console.log("--- longestNote ---");
console.log(longestNote());
// Expected: { id: 3, text: "Email the project report to Grace", category: "work" }
const savedNotes = notes;
notes = [];
console.log(longestNote());
// Expected: null (empty array)
notes = savedNotes;

console.log("--- countByCategory ---");
console.log(countByCategory());
// Expected: { personal: 2, study: 2, work: 1 }
notes = [];
console.log(countByCategory());
// Expected: {} (empty array)
notes = savedNotes;

console.log("--- getSummary ---");
console.log(getSummary());
// Expected: "5 notes: 2 personal, 1 work, 2 study."
notes = [{ id: 1, text: "Only one", category: "work" }];
console.log(getSummary());
// Expected: "1 note: 1 work." (singular)
notes = [];
console.log(getSummary());
// Expected: "0 notes." (empty array)
notes = savedNotes;

console.log("--- isDuplicate ---");
console.log(isDuplicate("  BUY MILK AND BREAD  "));
// Expected: true (case and surrounding spaces ignored)
console.log(isDuplicate("Walk the dog"));
// Expected: false (not in the list)

console.log("--- addNote ---");
console.log(addNote("Plan weekend trip", "personal"));
// Expected: logs "Added: Plan weekend trip", then true
console.log(addNote("  call MUM ", "personal"));
// Expected: logs "Not added: a note with this text already exists.", then false
console.log(addNote("", "work"));
// Expected: logs "Not added: text must be between 1 and 200 characters.", then false
console.log(addNote("a".repeat(201), "work"));
// Expected: logs "Not added: text must be between 1 and 200 characters.", then false
console.log(addNote("Read a book", "hobby"));
// Expected: logs "Not added: category must be personal, work or study.", then false

console.log("--- summary after adding ---");
console.log(getSummary());
// Expected: "6 notes: 3 personal, 1 work, 2 study."