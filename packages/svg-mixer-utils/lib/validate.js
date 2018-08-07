const Ajv = require('ajv');

const PrimitiveTypes = ['String', 'Number', 'Boolean'];

const Types = {
  Array,
  Object,
  Function,
  RegExp
};

const ajv = new Ajv({
  allErrors: true,
  verbose: true
});

ajv.addKeyword('instanceof', {
  compile(schema) {
    return value => {
      const isValid = (typeof schema === 'string' ? [schema] : schema)
        .some(type => {
          const isPrimitive = PrimitiveTypes.includes(type);
          return isPrimitive
            ? typeof value === type.toLowerCase()
            : value instanceof Types[type];
        });

      return isValid;
    };
  }
});

/**
 * @param {Object} jsonSchema
 * @param {Object|Array} data
 * @return {Array<{field?: string, message: string}>}
 */
module.exports = (jsonSchema, data) => {
  const validator = ajv.compile(jsonSchema);
  validator(data);

  return (validator.errors || []).map(error => {
    const field = error.dataPath !== '' ? error.dataPath.substr(1) : null;

    let message = error.message;

    // eslint-disable-next-line default-case
    switch (error.keyword) {
      case 'instanceOf':
        message = `should be ${error.schema.join(' or ')}`;
        break;

      case 'required':
        if (!field && error.params.missingProperty) {
          message = `${error.params.missingProperty} is required`;
        }
        break;

      case 'additionalProperties':
        message = `should not have additional property ${error.params.additionalProperty}`;
        break;
    }

    return field ? `\`${field}\` ${message}` : message;
  });
};
