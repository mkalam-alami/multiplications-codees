const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src/index.ts'),
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
    plugins: [new TsconfigPathsPlugin({ 
      configFile: path.resolve(__dirname, 'tsconfig.json')
    })]
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../static/dist'),
  },
};
