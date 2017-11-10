import justified from "justified";
import compose from "compose-function";
import reverseArguments from "reverse-arguments";
import { replace, trim, toUpperCase } from "native-functions/strings";

const pipe = reverseArguments(compose);

class TagStart {
  constructor(tagName, render) {
    this.tagName = tagName;
    this.render = render;
  }
}

class TagEnd {
  constructor(tagName) {
    this.tagName = tagName;
  }
}

const mkTag = (name, render) => ({
  start: new TagStart(name, render),
  end: new TagEnd(name)
});

const saveMultipleNewline = replace(/\n\n+/g, "§");
const restoreMultipleNewline = replace(/§/g, "\n");
const shrinkSpaces = replace(/\s+/g, " ");

const flattenLines = pipe(
  saveMultipleNewline,
  shrinkSpaces,
  restoreMultipleNewline,
  trim
);

const upperify = pipe(trim, shrinkSpaces, toUpperCase);

export const upper = mkTag("upper", upperify);

const justifyToWidth = (width, content, before) => {
  const flatted = flattenLines(content);
  const linePosition = before.match(/\n(.+)$/) || before.match(/^(.+)$/);
  const tagIndent = linePosition[1].length;
  const indentation = new Array(tagIndent).fill(" ").join("");

  const ret = justified(flatted, {
    width,
    indent: "§"
  })
    .trim()
    .replace(/§/g, indentation);
  return ret.trim();
};

export const justify = mkTag("justify", (content, before) => {
  const firstLine = content.split("\n").filter(l => l.trim() !== "")[0];
  const width = firstLine.trim().length;
  return justifyToWidth(width, content, before);
});

export const justifyWidth = width =>
  mkTag("justify", (content, before) => {
    return justifyToWidth(width, content, before);
  });

function* contentIterator(startTag, tokens) {
  let token = tokens.next();
  while (!token.done) {
    const { value } = token;
    if (value instanceof TagEnd && value.tagName === startTag.tagName) {
      return;
    }
    yield value;
    token = tokens.next();
  }
}

function handleTagStart({ startTag, tokens, result }) {
  const tagContent = interpolateIterator(contentIterator(startTag, tokens));
  const rendered = startTag.render(tagContent, result);
  return rendered.trim();
}

function* zip(strings, values) {
  for (let i = 0; i < strings.length; i++) {
    yield strings[i];

    if (i < values.length) {
      yield values[i];
    }
  }
}

function interpolateIterator(tokens) {
  let token = tokens.next();
  let result = "";

  while (!token.done) {
    const { value } = token;
    if (value instanceof TagStart) {
      const tagValue = handleTagStart({
        startTag: value,
        tokens,
        result
      });
      result += tagValue;
    } else {
      result += value;
    }
    token = tokens.next();
  }
  return result;
}

export function interpolate(strings, values) {
  const tokens = zip(strings, values);
  return interpolateIterator(tokens);
}

export function report(strings, ...values) {
  const result = interpolate(strings, values);
  const firstLine = result.split("\n").filter(l => l.trim() !== "")[0];
  const firstLineIndentedBy = firstLine.match(/^(\s*)/)[1].length;
  return (
    result
      .replace(new RegExp(`\\n[ \\t]{${firstLineIndentedBy}}`, "g"), "\n")
      .trim() + "\n"
  );
}
