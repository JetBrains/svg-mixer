const { moveNodesOutsideSymbol } = require('svg-mixer/lib/transformations');

const { testPostSvgPlugin } = require('svg-mixer-test');

const t = testPostSvgPlugin(moveNodesOutsideSymbol);

it('Move all gradients, patterns, filters, clipMask & mask outside symbol', async () => {
  expect(await t(
    undefined,
    `<svg>
        <symbol>
            <defs>
                <linearGradient></linearGradient>
                <radialGradient></radialGradient>
                <pattern></pattern>
                <filter></filter>
                <clipPath></clipPath>
                <mask></mask>
              </defs>
        </symbol>
    </svg>`
  )).toMatchSnapshot();
});
