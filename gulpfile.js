const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const gutil = require('gulp-util');
const uglify = require('gulp-uglifyjs');
const minifyHTML = require('gulp-minify-html');
const connect = require('gulp-connect');

const paths = {
    caniuseEmbed: "src/caniuse-embed.js",
    embedStyle: "src/embed/scss/style.scss",
    embedScript: "src/embed/script.js",
    embedHTML: "src/embed/index.html"
};

function script() {
    return gulp.src(paths.caniuseEmbed)
        .pipe(uglify('caniuse-embed.min.js'))
        .pipe(gulp.dest('public'))
        .pipe(gulp.src(paths.embedScript))
        .pipe(uglify())
        .pipe(gulp.dest('public/embed'));
}

function sassTask() {
    return gulp.src(paths.embedStyle)
        .pipe(sass({
            outputStyle: 'compressed'
        })
        .on('error', gutil.log))
        .pipe(gulp.dest('public/embed'));
}

function minifyHtml() {
    return gulp.src(paths.embedHTML)
        .pipe(minifyHTML({ empty: true }))
        .pipe(gulp.dest('public/embed'));
}

function connectServer() {
    return connect.server({
        port: 8000
    });
}

function watch() {
    gulp.watch(paths.caniuseEmbed, script); 
    gulp.watch(paths.embedScript, script); 
    gulp.watch("src/embed/scss/*.scss", sassTask); 
    gulp.watch(paths.embedHTML, minifyHtml); 
}

exports.default = gulp.series(script, sassTask, minifyHtml, watch);
exports.full = gulp.series(connectServer, script, sassTask, minifyHtml, watch);
