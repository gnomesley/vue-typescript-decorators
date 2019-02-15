var ts = require('rollup-plugin-typescript2');

module.exports = {
  input: './index.ts',
  plugins: [ts({clean: true, abortOnError: false})],
  output: {
    file: './dist/index.js',
    format: 'cjs'
  }
};
