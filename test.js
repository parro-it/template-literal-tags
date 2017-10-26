import test from "ava";
import templateLiteralTags from ".";

test("exports a function", t => {
  t.is(typeof templateLiteralTags, "function");
});
