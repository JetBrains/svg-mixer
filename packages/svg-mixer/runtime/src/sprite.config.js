import namespaces from 'svg-mixer/namespaces';

const { svg, xlink } = namespaces;

export default {
  attrs: {
    [svg.name]: svg.uri,
    [xlink.name]: xlink.uri,
    style: ['position: absolute', 'width: 0', 'height: 0'].join('; ')
  }
};
