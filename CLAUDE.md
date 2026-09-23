# Wheelis · Alvarez wedding site

**Read `Wedding website planning/HANDOFF.md` first.** It says what the project is, where
everything lives, how to run it, how to test changes, and what is still to do.
`Wedding website planning/PROCESS.md` holds the creative reasoning.

The live build is `Wedding website planning/The Gallery 3D.html` + `gallery3d.js`
(a three.js walk-through gallery). The `*.dc.html` files are earlier prototypes, kept for reference.

## Working rules the owner has asked for
- Change ONLY what is asked. No unrequested improvements, moves, or removals.
- Verify before claiming: check the file or the rendered result, never assert a change applied
  without confirming it. Use the screenshot harness in `Wedding website planning/tools/harness/`.
- If an instruction is ambiguous, ask one short question rather than guessing.
- Prefer small targeted edits; bulk scripted edits have corrupted a file before.
- The owner is not a developer: explain in plain language, and say honestly what was not verified.
- Do NOT commit a change until the owner has looked at it in her browser and approved it. Make the
  change, verify it, report it, and leave it uncommitted; commit only on her explicit yes. If she
  rejects it, undo the edit rather than making a revert commit. The repo is a private GitHub repo (origin, SSH); push after each approved commit.

## Locked
- `The Gallery.dc.html` — the entrance overlay is LOCKED (see `Wedding website planning/CLAUDE.md`).
- `The Gallery 3D.html` — the entry doors may be restyled, but the names, the "and", the
  "Open the doors" and "skip to the details" buttons and their positions must stay exactly as they are.
