const path = require('path');
const nodeExternals = require('webpack-node-externals');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackBar = require('webpackbar');

module.exports = env => [{
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
	externals: [
		({ context, request }, callback) => {
			// Ignore CodeJar on the server
			if (/codejar/i.test(request)) {
				return callback(null, 'null');
			}
			callback();
		},
		nodeExternals()
	],
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
		minimize: false // Can stay unminified always
	},
	stats: 'minimal',
	plugins: [
		new VueLoaderPlugin(),
		new WebpackBar({
			name: 'Server',
			color: 'gold'
		})
	]
}, {
	mode: 'none',
	entry: path.join(__dirname, 'client/ts/index.ts'),
	output: {
		filename: 'js/[name]_[contenthash]_client_bundle.js',
		path: path.join(__dirname, 'dist'),
		clean: true
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
		extensions: ['.ts', '.js'],
		alias: {
			vue: (env.production && false)? 'vue/dist/vue.esm-browser.prod.js': 'vue/dist/vue.esm-browser.js' // Always use the dev build because the prod build has bugs!
		}
	},
	externals: [
		({ context, request }, callback) => {
			if (/server\/ts/.test(request)) {
				return callback(null, 'null');
			}
			callback();
		}
	],
	optimization: {
		minimize: env.production,
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendor',
					chunks: 'all',
				}
			}
		}
	},
	stats: 'minimal',
	plugins: [
		new VueLoaderPlugin(),
		new MiniCssExtractPlugin({
			filename: 'css/style_[contenthash].css'
		}),
		new webpack.DefinePlugin({
			'process.env': {}
		}),
		new HtmlWebpackPlugin({
			template: './client/index.html',
			inject: 'body',
			publicPath: '/'
		}),
		new CopyWebpackPlugin({
			patterns: [
				{ from: 'client/assets', to: 'assets' }
			]
		}),
		new WebpackBar({
			name: 'Client'
		})
	]
}];