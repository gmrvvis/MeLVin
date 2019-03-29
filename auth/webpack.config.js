module.exports = {
    context: __dirname,
    entry: './js/src/index.jsx',
    output: {
        path: __dirname + '/js/',
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.jsx$/, loader: 'jsx-loader?harmony'
            }
        ]
    },
    externals: {
        'react': 'React',
        'd3': 'd3',
        'jquery': "jQuery",
        'lodash': "_"
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    }
};
