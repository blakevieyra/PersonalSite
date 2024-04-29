const path = require('path');

module.exports = {
    mode: 'development', // or 'production' depending on your needs
    entry: './src/home.js', // Adjust this line to point to the correct file
    output: {
        filename: 'bundle.js', // Output file
        path: path.resolve(__dirname, 'dist'), // Output directory
    },
    module: {
        rules: [
            {
                test: /\.js$/, // Transpile .js files using Babel
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'] // Preset used for older browser compatibility
                    }
                }
            }
        ]
    }
};
