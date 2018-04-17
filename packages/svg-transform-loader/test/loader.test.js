const { compile, imageReq } = require('./utils');

it('should not modify input if no transform params', async () => {
  const { image } = await compile(`require('${imageReq}')`);
  expect(image).toMatchSnapshot();
});

it('raw option', async () => {
  let res = await compile(
    `require('${imageReq}')`,
    { raw: true }
  );
  expect(res.image).toMatchSnapshot();

  res = await compile(
    `require('${imageReq}')`,
    { raw: false }
  );
  expect(res.image).toMatchSnapshot();
});

it('should allow to configure global transformer', async () => {
  const { image } = await compile(
    `require('${imageReq}')`,
    { transform: node => node.attrs.fill = 'red' }
  );
  expect(image).toMatchSnapshot();
});

it('should allow to pass transformer params as query string', async () => {
  const { image } = await compile(
    `require('${imageReq}?fill=red path&stroke=black')`
  );
  expect(image).toMatchSnapshot();
});
