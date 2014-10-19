var gulp = require('gulp');

var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var webserver = require('gulp-webserver');
var zip = require('gulp-zip');

var zebraFiles = [
    'lib/zebra/easyoop.js',
    'lib/zebra/layout.js',
    'lib/zebra/util.js',
    'lib/zebra/io.js',
    'lib/zebra/data.js',
    'lib/zebra/canvas.js',
    'lib/zebra/ui.webstuff.js',
    'lib/zebra/ui.js',
    'lib/zebra/ui.TextField.js',
    'lib/zebra/ui.list.js',
    'lib/zebra/ui.window.js',
    'lib/zebra/ui.grid.js',
    'lib/zebra/ui.tree.js',
    'lib/zebra/ui.html.js',
    'lib/zebra/ui.designer.js'
];

var demoFiles = [
    "samples/demo/ui.demo.js",
    "samples/demo/ui.demo.layout.js",
    "samples/demo/ui.demo.basicui.js",
    "samples/demo/ui.demo.panels.js",
    "samples/demo/ui.demo.tree.js",
    "samples/demo/ui.demo.popup.js",
    "samples/demo/ui.demo.win.js",
    "samples/demo/ui.demo.grid.js",
    "samples/demo/ui.demo.designer.js"
];

gulp.task('http', function() {
    gulp.src('.')
        .pipe(webserver({
            port: 8090,
            directoryListing: true,
            open: true
        }));
});

gulp.task('lint', function() {
    return gulp.src(zebraFiles)
        .pipe(jshint({ eqnull : true }))
        .pipe(jshint.reporter('default'));
});

gulp.task('copy', function() {
    return gulp.src(["lib/zebra/zebra.json", "lib/zebra/zebra.png"]).pipe(gulp.dest("."));
});

gulp.task('zebrascript', function() {
    return gulp.src(zebraFiles)
        .pipe(concat('zebra.js'))
        .pipe(gulp.dest('.'))
        .pipe(rename('zebra.min.js'))
        .pipe(uglify({ compress: false, mangle: false }))
        .pipe(gulp.dest('.'));
});

gulp.task('runtime', function () {
    return gulp.src(['zebra.js', 'zebra.min.js', 'zebra.png', 'zebra.json'])
        .pipe(zip('zebra.runtime.zip'))
        .pipe(gulp.dest('.'));
});

gulp.task('samplescript', function() {
    return gulp.src("samples/js/uiengine.samples.js")
        .pipe(rename('uiengine.samples.min.js'))
        .pipe(uglify({ compress: false, mangle: false }))
        .pipe(gulp.dest('samples/js'));
});

gulp.task('demoscript', function() {
    return gulp.src(demoFiles)
        .pipe(concat('demo.all.js'))
        .pipe(gulp.dest('samples/demo'))
        .pipe(rename('demo.all.min.js'))
        .pipe(uglify({ compress: false, mangle: false }))
        .pipe(gulp.dest('samples/demo'));
});

gulp.task('scripts', [ "demoscript", "samplescript", "zebrascript"]);

gulp.task('default', ['scripts', 'copy', 'runtime']);
