# SVG Baker

Node.js library for creating and manipulating SVG sprites. Build on top of [posthtml](https://github.com/posthtml/posthtml).

**Work in progress!**

## Prerequisites

- Node.js >= 6 for usage and Node.js >= 7 for development (some tests use async/await).
- [yarn](https://yarnpkg.com).

## Introduction

This project contain multiple packages which managed by [Lerna](https://github.com/lerna/lerna).

- [svg-baker](packages/svg-baker) - SVG Baker core.
- [svg-baker-runtime](packages/svg-baker-runtime) - SVG Baker JS runtime for working with generated symbols in 
  Node.js/browser environment.
- [posthtml-svg-mode](packages/posthtml-svg-mode) - tiny wrapper over posthtml optimized for working with SVG. 
- [posthtml-rename-id](packages/posthtml-rename-id) - posthtml plugin to rename id & references.
- [posthtml-svg-fill](packages/posthtml-svg-fill) - posthtml plugin to repaint SVG shapes.

## Scripts

- `yarn bootstrap` - init project (install all dependencies and link packages).
- `yarn test` - run mocha in every package.
- `yarn coverage` - collect coverage info.
