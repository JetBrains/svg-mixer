const SpritePlugin = require('extract-svg-sprite-webpack-plugin');

const {
  compile,
  createConfig: createBaseConfig,
  exec
} = require('./utils');

describe('plugin', () => {
  it('css-loader', async () => {
    const input = '.a {background: url(~fixtures/twitter.svg)}';
    const expected = '.a {background: url(sprite.svg) no-repeat 0 0;background-size: 100% 104.50%}';

    const assets = await compile({
      files: { 'main.css': input },
      config: createBaseConfig({
        entry: './main.css',
        module: {
          rules: [
            {
              test: /\.svg$/,
              loader: SpritePlugin.loader
            },
            {
              test: /\.css$/,
              use: [
                'css-loader',
                SpritePlugin.cssLoader
              ]
            }
          ]
        },
        plugins: [new SpritePlugin()]
      })
    });

    const result = exec(assets['main.js']).toString();
    expect(result).equal(expected);
  });

});
