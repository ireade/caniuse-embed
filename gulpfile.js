var gulp = require('gulp'),
    sass = require('gulp-sass'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    connect = require('gulp-connect');

var caniuseEmbed = "development/caniuse-embed.js";
var embedStyle = "development/embed/style.scss"
var embedScript = "development/embed/script.js";
var embedHTML = "development/embed/index.html";

gulp.task('script', function() {
    gulp.src(caniuseEmbed)
        .pipe(uglify())
        .pipe(gulp.dest(''));
    gulp.src(embedScript)
        .pipe(uglify())
        .pipe(gulp.dest('embed'));
});

gulp.task('sass', function() {
    gulp.src(embedStyle)
        .pipe(sass({
            outputStyle: 'compressed'
        })
            .on('error', gutil.log))
        .pipe(gulp.dest('embed'));
});

gulp.task('minify-html', function() {
  return gulp.src(embedHTML)
    .pipe(minifyHTML({ empty: true }))
    .pipe(gulp.dest('embed'));
});

gulp.task('connect', function() {
  connect.server({
    port: 8000
  });
});

gulp.task('watch', function() {
    gulp.watch(caniuseEmbed,['script']); 
    gulp.watch(embedScript,['script']); 
    gulp.watch(embedStyle,['sass']); 
    gulp.watch(embedHTML,['minify-html']); 
});

gulp.task('default', ['connect', 'script', 'sass', 'minify-html', 'watch']);