const { compile, imageReq } = require('./utils');

it('should not modify input if no transform params', async () => {
  let res = await compile(`require('${imageReq}')`);
  expect(res.image).toMatchSnapshot();

  res = await compile(`require('${imageReq}')`, {
    transformQuery: query => query.stroke = 'black'
  });
  expect(res.image).toMatchSnapshot();
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

it('should allow to transform query', async () => {
  const { image } = await compile(
    `require('${imageReq}?fill=red')`,
    {
      transformQuery: query => query.stroke = 'black'
    }
  );
  expect(image).toMatchSnapshot();
});

it('should allow to pass transformer params as query string', async () => {
  const { image } = await compile(
    `require('${imageReq}?fill=red path&stroke=black')`
  );
  expect(image).toMatchSnapshot();
});

it('should allow to convert colors with alpha channel', async () => {
  const { image } = await compile(
    `require('${imageReq}?fill=rgba%28255%2C%200%2C%200%2C%200.5%29')`
  );
  expect(image).toMatchSnapshot();
});
