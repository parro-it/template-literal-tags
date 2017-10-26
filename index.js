import justified from "justified";

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

export const upper = mkTag("upper", content =>
  content
    .trim()
    .replace(/[\n\s]+/g, " ")
    .toUpperCase()
);

const justifyToWidth = (width, content, before) => {
  const flatted = content
    .replace(/\n\n+/g, "§")
    .replace(/\s+/g, " ")
    .replace(/§/g, "\n\n")
    .trim();
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

function handleTagStart({ i, value, strings, values, result }) {
  const tagName = value.tagName;
  const otherStrings = [];
  const otherValues = [];
  let j = i + 1;
  for (; j < strings.length; j++) {
    otherStrings.push(strings[j]);
    if (j < values.length) {
      const otherValue = values[j];
      if (otherValue instanceof TagEnd && otherValue.tagName === tagName) {
        break;
      }
      otherValues.push(otherValue);
    }
  }
  i = j;
  if (otherStrings.length !== 0 || otherValues.length !== 0) {
    const tagContent = interpolate(otherStrings, otherValues);
    const rendered = value.render(tagContent, result);
    return { tagValue: rendered.trim(), idx: i };
  }

  return { tagValue: value.render("", result).trim(), idx: i };
}

export function interpolate(strings, values) {
  let result = "";
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];

    if (i < values.length) {
      const value = values[i];
      if (value instanceof TagStart) {
        const { tagValue, idx } = handleTagStart({
          i,
          value,
          strings,
          values,
          result
        });
        result += tagValue;
        i = idx;
      } else {
        result += value;
      }
    }
  }
  return result;
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
