'use strict';

/* eslint-env node */

var path = require('path');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'easy-location.min.js',
    library: 'initEasyLocation',
    libraryTarget: 'umd'
  },
  plugins: [
    new UglifyJSPlugin()
  ]
};
