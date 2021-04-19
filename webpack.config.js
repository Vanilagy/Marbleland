const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = [{
	mode: 'none',
	entry: path.join(__dirname, 'server/ts/index.ts'),
	output: {
		filename: 'server_bundle.js',
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
				test: /\.vue$/,
				loader: 'vue-loader'
			},
			{
				test: /\.css/,
				use: [
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
	optimization: {
		minimize: false
	},
	stats: 'minimal',
	plugins: [
		new VueLoaderPlugin()
	]
}, {
	mode: 'none',
	entry: path.join(__dirname, 'client/ts/index.ts'),
	output: {
		filename: 'js/client_bundle.js',
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
	externals: [
		{
			vue: 'Vue',
		},
		({ context, request }, callback) => {
			if (/server\/ts/.test(request)) {
				return callback(null, 'null');
			}
			callback();
		}
	],
	optimization: {
		minimize: false
	},
	stats: 'minimal',
	plugins: [
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
			filename: 'css/style.css'
		}),
		new webpack.DefinePlugin({
			'process.env': {}
		})
	]
}];