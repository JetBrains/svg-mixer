# SVG Baker

Tool for creating and manipulating SVG sprites. Build on top of [posthtml](https://github.com/posthtml/posthtml).

**Work in progress!**

## Prerequisites

- NodeJS >= 7 (some tests use async/await).
- NPM 3 for installing yarn globally.
- [yarn](https://yarnpkg.com).

## Getting started

This project contain multiple packages which managed by [Lerna](https://github.com/lerna/lerna).

- [svg-baker](packages/svg-baker) - SVG Baker core.
- [svg-baker-runtime](packages/svg-baker-runtime) - SVG Baker JS runtime for working with generated symbols.
- [posthtml-svg-mode](packages/posthtml-svg-mode) - tiny wrapper over posthml optimized for working with SVG. 
- [posthtml-rename-id](packages/posthtml-rename-id) - posthtml plugin to rename id & references.
- [posthtml-svg-fill](packages/posthtml-svg-fill) - posthtml plugin to repaint SVG shapes.

## Scripts

- `yarn bootstrap` - init project (install all dependencies and link packages).
- `yarn test` - run mocha in every package.
- `yarn coverage` - collect coverage info.
