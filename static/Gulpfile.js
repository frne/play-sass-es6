'use strict';

// libs ##################################
const gulp = require('gulp');
const named = require('vinyl-named')
const sass = require('gulp-sass');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const clean = require('gulp-clean');

// config ##################################
const destRoot = "../webapp/public/managed/";
const destCss = destRoot + "css/";
const destJs = destRoot + "js/";

// main tasks ##################################

gulp.task('default', ['sass', 'js']);

// helper tasks ##################################
gulp.task('sass', ['clean'], function () {
    return gulp.src('./sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(destCss));
});

gulp.task('js', ['clean'], function () {

    const webpackConfig = {
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    query: {
                        presets: ['es2015']
                    }
                }
            ]
        },
        plugins: [
            new webpack.ProvidePlugin({ // inject ES5 modules as global vars
                $: 'jquery',
                jQuery: 'jquery',
                'window.jQuery': 'jquery',
                Tether: 'tether'
            })
        ],
        stats: {
            colors: true
        },
        devtool: 'source-map'
    };

    return gulp.src('./js/*.js')
        .pipe(named())
        .pipe(webpackStream(webpackConfig))
        .pipe(gulp.dest(destJs));
});

gulp.task('clean', function () {
    return gulp.src(destRoot, {read: false})
        .pipe(clean({force: true}));
});