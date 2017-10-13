'use strict';

// libs ##################################
const gulp = require('gulp');
const named = require('vinyl-named')
const sass = require('gulp-sass');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const clean = require('gulp-clean');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const postCss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const image = require('gulp-image');

// config ##################################
const destRoot = "../webapp/public/managed/";
const destCss = destRoot + "css/";
const destJs = destRoot + "js/";

// main tasks ##################################

gulp.task('default', ['sass', 'js', 'fonts', 'images']);

gulp.task('dist', ['sassProd', 'jsProd', 'fonts', 'images']);

gulp.task('watch', ['default'], function () {
    gulp.watch(['./js/**/*.js', './sass/**/*.sass'], ['sass', 'js']);
});

gulp.task('clean', function () {
    return gulp.src(destRoot, {read: false})
        .pipe(clean({force: true}));
});

// helper tasks ##################################
gulp.task('sass', function () {
    return gulp.src('./sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(destCss));
});

gulp.task('js', function () {

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
                Tether: 'tether',
                Popper: 'popper.js'
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

gulp.task('jsProd', ['js'], function () {
    return gulp.src(destJs + '*.js')
        .pipe(named())
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest(destJs));
});

gulp.task('sassProd', ['sass'], function () {
    return gulp.src(destCss + '*.css')
        .pipe(named())
        .pipe(postCss([
            autoprefixer({browsers: ['last 2 versions']}),
            cssnano()
        ]))
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest(destCss));
});

gulp.task('fonts', function () {
    return gulp.src(['./node_modules/font-awesome/fonts/*'])
        .pipe(named())
        .pipe(gulp.dest(destRoot + 'fonts/'));
});

gulp.task('images', function () {
    return gulp.src('./images/**/*')
        .pipe(named())
        .pipe(image())
        .pipe(gulp.dest(destRoot + 'images/'));
});