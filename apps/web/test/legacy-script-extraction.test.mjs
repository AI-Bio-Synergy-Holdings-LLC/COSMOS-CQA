import assert from "node:assert/strict";
import { test } from "node:test";

import { extractScripts } from "../scripts/check-legacy-syntax.mjs";

test("extractScripts accepts forgiving script end tags without a filtering regexp", () => {
  const html = [
    "<main>",
    "<script>const one = 1;</script >",
    "<script type=\"module\">const two = 2;</script foo=\"bar\">",
    "</main>",
  ].join("");

  assert.equal(extractScripts(html), "const one = 1;\nconst two = 2;");
});

test("extractScripts ignores non-script tag-name prefixes", () => {
  const html = "<scripture>not javascript</scripture><script>const ok = true;</script>";

  assert.equal(extractScripts(html), "const ok = true;");
});

test("extractScripts handles greater-than characters inside quoted start-tag attributes", () => {
  const html = "<script data-note=\"1 > 0\">const ok = true;</script>";

  assert.equal(extractScripts(html), "const ok = true;");
});
