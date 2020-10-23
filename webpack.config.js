
const path = require('path');
const glob = require('glob');
module.exports = {
    entry: glob.sync("./Algorithms/**/app.js").reduce((acc, item) => {
        const path = item.split("/");
        path.pop();
        const name = path.join('/');
        acc[name] = item;
        return acc;
    }, {}),
    output: {
        filename: "[name]/build/bundle.js",
        path: path.resolve(__dirname, "")
    },

    module: {
        rules: [
            {
                test: /\.m?js$/,
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
    optimization: {
        minimize: true,
    },
    stats: {
        colors: true
    },
}
