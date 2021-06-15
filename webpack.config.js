
const path = require('path');
const glob = require('glob');
module.exports = {
    entry:   "./Yoga/yoga.ts"  ,
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                        plugins: ["@babel/plugin-transform-runtime"]
                    }
                },
            }

        ]
    },
    resolve: {
        extensions: [".ts", ]
    },
    optimization: {
        minimize: true,
    },
    stats: {
        colors: true
    },
}
