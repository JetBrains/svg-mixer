import { getRoot } from '../utils';

describe('getRoot()', () => {
  const root = {
    tag: 'svg',
    attrs: { id: 'qwe' },
    content: [
      '\n',
      { tag: 'path', attrs: {} }
    ]
  };

  const tree = [
    '\n',
    root,
    '\n'
  ];
  it('should work properly', () => {
    expect(getRoot(tree)).to.equal(root);
  });
});
