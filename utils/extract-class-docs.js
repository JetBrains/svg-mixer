/* eslint-disable */
const { parse: parseJs } = require('babylon');
const { simple: walk } = require('babylon-walk');
const doctrine = require('doctrine');
const { parse: parseJsdocType } = require('jsdoctypeparser');

const doctrineOpts = { unwrap: true, sloppy: true, range: true };

function processClassMember(node) {
  const info = {
    name: node.key.name,
    kind: node.kind,
    async: node.async,
    static: node.static,
    params: node.params
  };

  if (node.leadingComments && node.leadingComments.length) {
    info.comment = parseComment(node.leadingComments[0].value);
  }

  return info;
}

function parseComment(input) {
  const parsed = doctrine.parse(input, doctrineOpts);

  const tags = parsed.tags.map(tag => {
    const rawValue = input.substr(tag.range[0], tag.range[1] - tag.range[0]);

    const typeRange =
      (tag.type && tag.type.range) ||
      (tag.type && tag.type.expression && tag.type.expression.range) ||
      null;

    let type;
    if (typeRange) {
      const typeRawValue = input.substr(typeRange[0], typeRange[1] - typeRange[0]);
      type = parseJsdocType(typeRawValue);
      type.rawValue = typeRawValue;
    }

    return {
      name: tag.title,
      title: tag.name,
      description: tag.description,
      rawValue,
      default: tag.default,
      type
    };
  });

  return {
    description: parsed.description,
    tags
  };
}

function tag2prop(tag) {
  const { title, description, type, rawValue } = tag;
  return {
    name: title,
    description,
    type,
    rawValue
  }
}

const visitors = {
  ClassDeclaration(node, state) {
    state.name = node.id.name;

    if (node.superClass) {
      state.extends = node.superClass.name;
    }
  },

  ClassMethod(node, state) {
    state.methods.push(processClassMember(node));
  }
};

/**
 * @param {string} input
 * @return {{node: null, methods: Array}}
 */
module.exports = (input) => {
  const info = {
    name: null,
    extends: null,
    methods: []
  };

  const ast = parseJs(input);
  walk(ast, visitors, info);

  info.defaultConfig = info.methods
    .map(method => {
      const { comment } = method;
      const hasConfigMethod = method.name === 'defaultConfig';
      const typedef = comment.tags.find(({ name }) => name === 'typedef');
      const props = typedef && comment.tags
        .filter(({ name }) => name === 'property')
        .map(tag2prop);

      return hasConfigMethod && typedef ? { name: typedef.title, props } : null;
    })[0];

  return info;
};
