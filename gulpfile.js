"use strict";

let  gulp = require("gulp"),
     sass = require("gulp-sass"),
     plumber = require("gulp-plumber"),
     postcss = require("gulp-postcss"),
     autoprefixer = require("autoprefixer"),
     server = require("browser-sync"),
     mqpacker = require("css-mqpacker"),
     rename = require("gulp-rename"),
     minify = require("gulp-minify"),
     imagemin = require("gulp-imagemin"),
     svgmin = require("gulp-svgmin"),
     svgstore = require("gulp-svgstore"),
     run = require("run-sequence"),
     del = require("del"),
     ghPages = require("gulp-gh-pages");

gulp.task("style", function() {
  gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 1 version",
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Edge versions"
      ]}),
      mqpacker({
        sort: true
      })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.reload({stream: true}));
});

gulp.task("images", function() {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLever: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest("build/img"));
});

gulp.task("minifyJS", function() {
  gulp.src("js/*.js")
    .pipe(minify({
      ext: {
        min: ".min.js"
      }
    }))
    .pipe(gulp.dest("build/js"))
});

gulp.task("symbols", function() {
  return gulp.src("build/img/icons/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("serve", function() {
  server.init({
    server: "build",
    notify: false,
    open: true,
    ui: false
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("build/*.html").on("change", server.reload);
  gulp.watch("build/js/*.js").on("change", server.reload);
});

gulp.task("copy", function() {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/**",
    "js/**",
    "*.html"
  ], {
    base: "."
  })
    .pipe(gulp.dest("build"));
});

gulp.task("clean", function() {
  return del("build");
});

gulp.task("build", function(fn) {
  run(
    "clean",
    "copy",
    "style",
    "minifyJS",
    "images",
    "symbols",
    fn);
});

gulp.task("deploy", function() {
  return gulp.src("./build/**/*")
    .pipe(ghPages());
});
