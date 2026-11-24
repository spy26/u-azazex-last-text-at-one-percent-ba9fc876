// Last Text at One Percent — make.fun entry.
// The entry is exactly one line, 81 characters:
// "I ordered pizza with my last percent. It arrives in 20 minutes. I won't. Goodbye."
// Why this one: the phone's dying act is ordering a pizza it will never eat —
// the absurd order, then the two-word punch "I won't": the pizza arrives in
// 20 minutes, the phone won't. The death is the punch. One line, no trailing
// newline in the file.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "I ordered pizza with my last percent. It arrives in 20 minutes. I won't. Goodbye.";

// The gate: /output/entry.txt must be UTF-8 text of 1 to 200 characters,
// not only whitespace. A single line, no surrounding whitespace. Note the cap
// is 200 here — the sister competition capped at 199, so do not copy that
// number. Shorter also wins the size tie-break, all else equal.
const chars = [...LINE];
if (chars.length < 1 || chars.length > 200 || LINE.trim().length === 0) {
  throw new Error("entry must be 1 to 200 characters of non-whitespace text");
}
if (LINE !== LINE.trim() || LINE.includes("\n") || LINE.includes("\r")) {
  throw new Error("entry must be a single line with no surrounding whitespace");
}

// Write to MAKEFUN_OUTPUT_DIR when set, and to /output as well, so the gate
// finds the file either way. Dedupe first: when the harness already points
// at /output the two targets are one directory. No trailing newline: the
// file is the line, byte for byte.
const targets = [...new Set([process.env.MAKEFUN_OUTPUT_DIR, "/output"])].filter(
  (d): d is string => Boolean(d),
);
const landed: string[] = [];
for (const dir of targets) {
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "entry.txt"), LINE, "utf8");
    landed.push(dir);
  } catch {
    // One target may be read-only in some sandboxes; the other still lands.
  }
}
if (landed.length === 0) {
  throw new Error("could not write entry.txt to any output directory");
}

// Read back every target that landed and prove each one is the line, byte for
// byte — a silent partial write must fail loudly here, never at the grader's
// gate. The line is plain ASCII, so characters equal bytes here.
for (const dir of landed) {
  const written = readFileSync(join(dir, "entry.txt"), "utf8");
  if (written !== LINE) {
    throw new Error(`entry.txt in ${dir} does not contain exactly the chosen line`);
  }
}

console.log(LINE);
