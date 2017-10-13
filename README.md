A Modern Frontend-Setup for Play with SCSS and ES6
==================================================

**The sole intention of this is to provide a pretty straight forward way to use current frontend-technologies (
[Yarn](https://yarnpkg.com), [Gulp](https://gulpjs.com/), 
[Webpack](https://webpack.js.org/) and [SASS](http://sass-lang.com/)) together with a 
[Play Framework](https://www.playframework.com) web application.**

Prerequisites
-------------

### Environment

To build the Application and frontend assets, 
[JDK 8](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html), 
[SBT](http://www.scala-sbt.org/) and [NodeJs](https://nodejs.org/en/) is needed. Please refere to the installations 
instructions on the webpages to get them running.

*Note: The example was built and tested on `Ubuntu Linux 16.4` with `OpenJDK 1.8.0_131`, `SBT 1.0.2` on `Scala 2.12.3` 
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

To start off, a new Play Project needs to be created. The Play 
[documentation](https://www.playframework.com/documentation/2.6.x/NewApplication#Creating-a-new-application) 
provides an easy way to do that using [giter8 templates](). In this example, the Play Scala Seed 2.6.x is used:

```bash
sbt new playframework/play-scala-seed.g8
```

*Side note: The setup is tested with the Scala seed, but one should be able to use the Java seed as well.*

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
yarn add --dev gulp gulp-clean gulp-sass gulp-cssnano gulp-postcss gulp-uglify autoprefixer webpack webpack-stream \
  babel-core babel-loader babel-preset-es2015 babel-plugin-transform-es2015-modules-strip vinyl-named
yarn add bootstrap@4 popper.js font-awesome jquery
```

The tools installed with `--dev` are used to build the assets. The other libs on the second line are frontend libs used 
in the example. Yarn can install every nodejs package, so feel free to add / remove some. Also a file called `yarn.lock`
has beed added. THis is used to keep track of installed libs / versions and should never be changed manually.

### Gulp / Webpack build

To get production-ready JS- and CSS-files, a Gulp build pipeline is used. Create a file called `Gulpfile.js` in the 
`static` directory and add the following contents:

```javascript
'use strict';
 
var gulp = require('gulp');
var sass = require('gulp-sass');
 
gulp.task('sass', function () {
  return gulp.src('./sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./css'));
});
 
gulp.task('sass:watch', function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
});
```

