const floatRegexp = '[-+]?[0-9]*.?[0-9]+';

const types = [
  {
    name: 'px',
    regexp: new RegExp(`^${floatRegexp}px$`),
  },
  {
    name: '%',
    regexp: new RegExp(`^${floatRegexp}%$`),
  },
  /**
   * Fallback optopn
   * If no suffix specified, assigning "px"
   */
  {
    name: 'px',
    regexp: new RegExp(`^${floatRegexp}$`),
  },
];

const getType = (value: any) => {
  if (value === 'auto') {
    return {
      type: value,
      value: 0,
    };
  }

  // tslint:disable-next-line: prefer-for-of
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    if (type.regexp.test(value)) {
      return {
        type: type.name,
        value: parseFloat(value),
      };
    }
  }

  return {
    type: '',
    value,
  };
};

export const parse = (value: any) => {
  switch (typeof value) {
    case 'number':
      return { type: 'px', value };
    case 'string':
      return getType(value);
    default:
      return { type: '', value };
  }
};

export default parse;
