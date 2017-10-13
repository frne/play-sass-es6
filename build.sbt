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
