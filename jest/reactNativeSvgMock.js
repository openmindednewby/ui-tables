const React = require('react');

const tagFor = (name) => (name === 'default' || name === 'Svg' ? 'svg' : name.charAt(0).toLowerCase() + name.slice(1));

const component = (name) => {
  const Mock = ({ children, testID, ...rest }) =>
    React.createElement(tagFor(name), { 'data-testid': testID, 'data-props': Object.keys(rest).join(' ') }, children);
  Mock.displayName = `Mock${name}`;
  return Mock;
};

module.exports = new Proxy(
  { __esModule: true },
  {
    get: (target, name) => {
      if (name in target || typeof name !== 'string') return target[name];
      target[name] = component(name);
      return target[name];
    },
  },
);
