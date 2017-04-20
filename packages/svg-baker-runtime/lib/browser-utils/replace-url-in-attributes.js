const URL_FUNCTION_PATTERN = /url\(#?([^)]+?)\)/g;

/**
 * @param {Attr[]} attributes
 * @param {string} startsWith
 * @param {string} replaceWith
 * @return {Attr[]}
 */
export default function (attributes, startsWith, replaceWith) {
  attributes.forEach((attr) => {
    const value = attr.nodeValue;
    const match = URL_FUNCTION_PATTERN.exec(value);
    const url = match !== null && match[1] ? match[1] : null;

    URL_FUNCTION_PATTERN.lastIndex = 0;

    if (url === null) {
      return;
    }

    attr.nodeValue = attr.nodeValue.replace(startsWith, replaceWith);
  });

  return attributes;
}
