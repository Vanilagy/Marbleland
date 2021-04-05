const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = [{
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
	},
	stats: 'minimal'
}, {
	mode: 'none',
	entry: path.join(__dirname, 'client/ts/index.ts'),
	output: {
		filename: 'js/bundle.js',
		path: path.join(__dirname, 'client')
	},
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: 'vue-loader'
			},
			{
				test: /\.css/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader'
				]
			},
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				options: { appendTsSuffixTo: [/\.vue$/] }
			}
		]
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	externals: {
		vue: 'Vue'
	},
	optimization: {
		minimize: false
	},
	stats: 'minimal',
	plugins: [
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
			filename: 'css/style.css'
		})
	]
}];