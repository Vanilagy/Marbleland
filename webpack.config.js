const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
	mode: 'none',
	entry: path.join(__dirname, 'server/ts/index.ts'),
	output: {
		filename: 'bundle.js',
		path: path.join(__dirname, 'server')
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	target: 'node',
	externals: [nodeExternals()],
	module: {
		rules: [
			{
				test: /\.ts?$/,
				use: 'ts-loader'
			}
		]
	},
	optimization: {
		minimize: false
	}
};