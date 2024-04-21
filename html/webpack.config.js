const path = require('path');

module.exports = {
    entry: './html/home.js', // Corrected entry point
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
