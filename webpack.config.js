module.exports = {
    entry: {
        bundle: "./src/index.ts", 
    },
    output: {
        path: `${__dirname}/dist`,
        filename: "[name].js",

    },
    mode: "development",
    resolve: {
        extensions: [".ts", ".js"],
    },
    devServer: {
        static: {
            directory: `${__dirname}/dist`,
        },
        open: true,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader",
            }
        ],
    }
};

