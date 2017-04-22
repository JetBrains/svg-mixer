/* eslint-disable import/no-extraneous-dependencies */
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import buble from 'rollup-plugin-buble';

export default {
  format: 'umd',
  plugins: [
    resolve(),
    commonjs({
      namedExports: {
        '../svg-baker/namespaces.js': ['xlink']
      }
    }),
    buble()
  ]
};
