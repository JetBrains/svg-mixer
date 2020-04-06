const svgFiles = require.context('fixtures', false, /\.svg$/);
svgFiles.keys().forEach(svgFiles);

export default svgFiles('./twitter.svg');
