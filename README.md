A Modern Frontend-Setup for Play with SASS and ES6
==================================================

**This example provides a pretty straight forward way to integrate a contemporary frontend-technology stack 
([Yarn](https://yarnpkg.com), [Gulp](https://gulpjs.com/), [SASS](http://sass-lang.com/) and
[Webpack2](https://webpack.js.org/) with [ScmaScript 6](https://www.ecma-international.org/ecma-262/6.0/)) together with a 
[Play Framework](https://www.playframework.com) web application.**

TL;DR
-----

If you are already familiar with the technologies above, feel free to just checkout the project:

```bahs
git clone git@github.com:frne/play-sass-es6.git
cd play-sass-es6

# build assets
cd static && gulp && cd -

# run play application
sbt frontend/run
```

The repo contains an SBT multi-project build with a standard Play 2.6 (Scala) web application in module 
[webapp/](webapp/). The [static/](static/) directory contains the SASS and JavaScript (ES6) sources and a Gulp / Webpack 
build pipeline writing the assets into Play's `public/managed` asset directory. The Play application uses 
[sbt-web](https://github.com/sbt/sbt-web) for caching and delivery of the assets.

*Note: If errors occure during execution of the above commands, keep reading...*

Prerequisites
-------------

### Environment

To build the application and frontend assets, 
[JDK 8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html), 
[SBT](http://www.scala-sbt.org/) and [NodeJs](https://nodejs.org/en/) are needed. Please refer to the installation 
instructions on the webpages to get them running.

*Note: This example was built and tested on `Ubuntu Linux 16.4` with `OpenJDK 1.8.0_131`, `SBT 1.0.2` on `Scala 2.12.3` 
and `NodeJs v6.11.4`.*

### Frontend Tools

First of all, we need to install the Yarn package manager. Detailed instructions can be found 
[here](https://yarnpkg.com/en/docs/install). Run `yarn -v`, to check if the installation was successful.

Next, the `gulp` and `webpack` CLI tools need to be installed globally:

```bash
sudo yarn global add gulp-cli webpack
```

The above command will add the commands `gulp` and `webpack` to your path. Run `sudo yarn global bin` to get the 
install location.

Project Setup
-------------

### Play Framework

To start off, a new Play project needs to be created. The 
[documentation](https://www.playframework.com/documentation/2.6.x/NewApplication#Creating-a-new-application) 
provides an easy way to do that using [giter8 templates](). In this example, the `Play Scala Seed 2.6.x`  is used:

```bash
sbt new playframework/play-scala-seed.g8
```

*Note: This example is based on the Scala seed, but should work for Java as well.*

As an optional step, I would recommend to setup Play as an SBT 
[multi-project build](http://www.scala-sbt.org/0.13/docs/Multi-Project.html). This helps to keep the project structure 
clean and allow module-wise builds.

Basically, create a subdirectory called `webapp` and move the directories `app/`, `conf/`, `public/` and `test/` into 
it:

```bash
mkdir webapp
mv -v app webapp/
mv -v conf webapp/
mv -v public webapp/
mv -v test webapp/
```

The play application lives now in the subirectory `webapp/` so the build needs to be changed accordingly. Update 
`build.sbt` like this:

```scala
import sbt.Keys._

// settings for all modules
val commonSettings = Seq(
  organization := "io.github.frne",
  version := "1.0-SNAPSHOT",
  scalaVersion := "2.12.3"
)

// global module definition
// this just aggregates all submodules
lazy val playScssEs6 = (project in file(".")).
  settings(
    name := "play-scss-es6"
  ).
  aggregate(webapp)

// webapp module definition (Play Framework)
lazy val webapp = (project in file("webapp")).
  settings(
    commonSettings,
    libraryDependencies ++= Seq(
      guice,
      "org.scalatestplus.play" %% "scalatestplus-play" % "3.1.2" % Test
    )
  ).
  enablePlugins(PlayScala)
```

After that, refresh the project in your IDE. You should now be able to start the Play application:

```bash
sbt webapp/run
```

### Yarn dependencies

For the frontend build, create another subdirectory called `static`, naviagte into it and initialize Yarn:

```bash
mkdir static
cd static
yarn init
```

Complete the setup. It should look like the following:

```bash
yarn init v1.2.1
question name (static): play-scss-es6
question version (1.0.0): 
question description: The frontend setup for the Play SASS ES6 example
question entry point (index.js): js/main.js
question repository url: https://github.com/frne/play-sass-es6
question author: Frank Neff
question license (MIT): 
question private: false
success Saved package.json
Done in 91.65s.
```

Once yarn is initialized, dependencies for the frontend build can be added:

```bash
yarn add --dev gulp gulp-clean gulp-sass gulp-postcss gulp-uglify autoprefixer cssnano webpack webpack-stream \
  babel-core babel-loader babel-preset-es2015 babel-plugin-transform-es2015-modules-strip vinyl-named gulp-rename \
  gulp-image
yarn add bootstrap@4 popper.js font-awesome jquery
```

The tools installed with `--dev` are used to build the assets. The other libs on the second line are frontend 
dependencies used in the example. Yarn can install every nodejs package, so feel free to add / remove some. Also a file 
called `yarn.lock` has beed added. This is used to keep track of installed libs / versions and should never be changed 
manually.

### Gulp / Webpack Build

To get compiled JS- and CSS-files, a Gulp build pipeline is used. Create a file called `Gulpfile.js` in the `static` 
directory and add the following contents:

```javascript
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
```
The first block imports the required node modules. After that, the destination directories are configured. The config 
above will write the compiled JavaScript and CSS into the `public` asset directory of the play application.

The main task `default` defines the action whis is executed when `gulp` (without arguments) is executed.

The `js` task loads all JavaScript files directly residing in `js/` (put dependencies in subdirectories), compiles the 
EcmaScript 6 modules and writes the final `main.js` into the target dir.

The `sass` task loads all SASS files directly residing in `sass/` compiles them and writes the final CSS-files into the 
target dir.

Extended Gulp Setup
-------------------

The above gulp pipeline produces valid assets, but is pretty straight forward and not production-ready. The following 
additional configuration should be made for production use and development convenience.

### JavaScript

For prod, minified (`*.min.js`) files should be produced. Add the following to the Gulp build:

```javascript
// add dependencies
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');

// add task
gulp.task('jsProd', ['js'], function () {
    return gulp.src(destJs + '*.js')
        .pipe(named())
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(gulp.dest(destJs));
});
```
### SASS

The generated CSS files should also be compressed and for better browser-support autoprefixed. The 
[PostCss](https://github.com/postcss/postcss#postcss---) library is used to make general CSS optimizations after 
compile. Add / modify the following in Gulp build:

```javascript
// add dependencies
const postCss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');

// add task
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
```

### Copy Static Assets

Web Fonts (i.e. needed by the Font-Awesome icon library), but also other static assets like images, should be copied 
to Play's asset directory so they can be delivered.

Add the following task to copy fonts:

```javascript
gulp.task('fonts', function () {
    return gulp.src(['./node_modules/font-awesome/fonts/*'])
        .pipe(named())
        .pipe(gulp.dest(destRoot + 'fonts/'));
});
```

### Optimize Images

Images can be optimized (filesize) and copied to Play's assets using the following task:

```javascript
gulp.task('images', function () {
    return gulp.src('./images/**/*')
        .pipe(named())
        .pipe(image())
        .pipe(gulp.dest(destRoot + 'images/'));
});
```

*Note: This is an expensive task and can (according to number and size of images) take minutes.*

### Main Tasks

For convenience, the main tasks should be extended with the following:

```javascript
// main tasks ##################################

gulp.task('default', ['sass', 'js', 'fonts', 'images']);

gulp.task('dist', ['sassProd', 'jsProd', 'fonts', 'images']);

gulp.task('watch', function () {
    gulp.watch(['./js/**', './sass/**'], ['sass', 'js']);
});

gulp.task('clean', function () {
    return gulp.src(destRoot, {read: false})
        .pipe(clean({force: true}));
});
```

This provides a `gulp dist` task, which is used to build all production assets, and a `gulp watch` task, which will 
recompile assets when they are changed. The latter is very convenient for development.

The `gulp-clean` task removes generated files from dist directory.

Play Application Setup
----------------------

Play already delivers the JS/CSS files, if they are included in a template:

```html
@(title: String)(content: Html)

<!DOCTYPE html>
<html lang="en">
    <head>
        @* Here's where we render the page title `String`. *@
        <title>@title</title>
        <link rel="stylesheet" media="screen" href="@routes.Assets.versioned("managed/css/main.css")">
        <link rel="shortcut icon" type="image/png" href="@routes.Assets.versioned("images/favicon.png")">

    </head>
    <body>
        @content

      <script src="@routes.Assets.versioned("managed/js/main.js")" type="text/javascript"></script>
    </body>
</html>
```

For production setups, caching and delivery should be further optimized. Play can "fingerprint" (hash) assets to 
improve caching and deliver gzipped assets, if the browser supports that. To enable it, an SBT-Web pipeline is used.

Add the following SBT plugins to `project/plugins.sbt`:

```scala
addSbtPlugin("com.typesafe.sbt" % "sbt-digest" % "1.1.3")

addSbtPlugin("com.typesafe.sbt" % "sbt-gzip" % "1.0.2")
```

In `build.sbt`, the asset pipeline stages must be defined:

```scala
// webapp module definition (Play Framework)
lazy val webapp = (project in file("webapp")).
  settings(
    commonSettings,
    pipelineStages := Seq(digest, gzip), // add digest (fingerprinting) and gzip compression
    libraryDependencies ++= Seq(
      guice,
      "org.scalatestplus.play" %% "scalatestplus-play" % "3.1.2" % Test
    )
  ).
  enablePlugins(PlayScala)
```

*Note: These features only show full effect when play runs in prod mode (`sbt stage` or `sbt dist`)*

The improvements above configure play for the following asset delivery behavior:

* In prod-mode, Play will automatically pick the minified version of an asset by its filename. E.g. 
  `main.min.js` will be delivered instead of `main.js` if it exists.
* An asset fingerprint (hash) will be added to the filename (e.g. `main.min.js` will become 
  `2ea61a7c328152d9a7e01e76db3e8b81-main.min.js`). The hash changes when the file is changed.
* Because of the fingerprinting, play will serve the assets with aggressive caching instructions to a browser
* If the browser allows gzip compression, a gzipped variant of the asset will be delivered

This is a production HTTP request / response delivering `main.min.js` with fully optimized asset and caching:

``` text
GET /assets/managed/js/2ea61a7c328152d9a7e01e76db3e8b81-main.min.js HTTP/1.1
Host: localhost:9000
Connection: keep-alive
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36
Accept: */*
Referer: http://localhost:9000/
Accept-Encoding: gzip, deflate, br
Accept-Language: en-US,en;q=0.8,de;q=0.6
```

```text
HTTP/1.1 200 OK
ETag: "2ea61a7c328152d9a7e01e76db3e8b81"
Vary: Accept-Encoding
Accept-Ranges: bytes
Cache-Control: public, max-age=31536000, immutable
Last-Modified: Fri, 13 Oct 2017 10:34:12 GMT
Referrer-Policy: origin-when-cross-origin, strict-origin-when-cross-origin
X-Frame-Options: DENY
Content-Encoding: gzip
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Content-Security-Policy: default-src 'self'
X-Permitted-Cross-Domain-Policies: master-only
Date: Fri, 13 Oct 2017 14:49:45 GMT
Content-Type: application/javascript; charset=UTF-8
Content-Length: 49756
```

Further Reading / Sources
-------------------------

**Play**

* https://www.playframework.com/documentation/2.6.x/AssetsOverview
* https://github.com/sbt/sbt-web
* https://github.com/sbt/sbt-digest#sbt-digest
* https://github.com/sbt/sbt-gzip#sbt-gzip
* https://www.jamesward.com/2014/04/29/optimizing-static-asset-loading-with-play-framework

**Gulp**

* https://gulpjs.com/
* https://www.npmjs.com/package/gulp-sass
* https://www.npmjs.com/package/webpack-stream
* https://www.npmjs.com/package/gulp-image

**Webpack**

* https://webpack.js.org/guides/getting-started/
* http://ccoenraets.github.io/es6-tutorial/setup-webpack/
* http://2ality.com/2015/04/webpack-es6.html


Misc
----

If you finds bugs or have improvements, feel free to open a pull request.

### License

Copyright 2017 Frank Neff

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the 
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit 
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the 
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE 
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.