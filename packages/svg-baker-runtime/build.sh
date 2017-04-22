#!/usr/bin/env bash

build() {
  local filename=$1
  local exportName=$2

  ./node_modules/.bin/rollup \
    --config rollup.config.js \
    --output dist/$filename \
    --name $exportName \
      ./lib/$filename
}

build sprite.js Sprite
build symbol.js SpriteSymbol
build browser-sprite.js BrowserSprite
