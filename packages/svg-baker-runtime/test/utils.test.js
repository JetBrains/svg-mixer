import { strictEqual, ok } from 'assert';
import * as u from '../src/utils';

describe('svg-baker-runtime/utils', () => {
  describe('objectToAttrString()', () => {
    it('should properly serialize object to attributes string', () => {
      strictEqual(
        u.objectToAttrsString({ fill: '#f0f', styles: 'color: red' }),
        'fill="#f0f" styles="color: red"'
      );
    });
  });
});
