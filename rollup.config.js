let ts = require('rollup-plugin-typescript2');

export default [
  {
    input: './index.ts',
    plugins: [ts({clean: true, abortOnError: false})],
    output: {
      file: './dist/index.js',
      format: 'cjs'
    }
  },
  {
    input: './index.ts',
    plugins: [ts({clean: true, abortOnError: false})],
    output: {
      file: './dist/index.amd.js',
      format: 'amd'
    }
  },
  {
    input: './index.ts',
    plugins: [ts({clean: true, abortOnError: false})],
    output: {
      file: './dist/index.es6.js',
      format: 'esm'
    }
  }
];
