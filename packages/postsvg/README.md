# PostSVG

A tiny wrapper over [posthml](https://github.com/posthtml/posthtml) with the same API optimized for working with SVG.

## Differences from PostHTML

- Parses content in XML mode.
- Properly renders SVG self-closing tags (`<path />`, `<line />` etc).