var gulp = require('gulp');

var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var webserver = require('gulp-webserver');
var zip = require('gulp-zip');


var uiFiles = [
    'src/layout.js',
    'src/util.js',
    'src/io.js',
    'src/data.js',
    'src/web.js',
    'src/ui.webstuff.js',
    'src/ui.webpointer.js',
    'src/ui.webkey.js',
    'src/ui.core.js',
    'src/ui.views.js',
    'src/ui.js',
    'src/ui.TextField.js',
    'src/ui.list.js',
    'src/ui.window.js',
    'src/ui.grid.js',
    'src/ui.tree.js',
    'src/ui.html.js',
    'src/ui.designer.js'
];

var zebkitFiles = [
    'src/easyoop.js',
].concat(uiFiles);

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
            port: 8080,
            host: "localhost",
            directoryListing: true,
            open: false
        }));
});

gulp.task('lint', function() {
    return gulp.src(zebkitFiles)
        .pipe(jshint({ eqnull : true }))
        .pipe(jshint.reporter('default'));
});

gulp.task('copy', function() {
    return gulp.src(["src/zebkit.json", "src/zebkit.png"]).pipe(gulp.dest("."));
});

gulp.task('easyoopscript', function() {
    return gulp.src("src/easyoop.js")
        .pipe(gulp.dest('.'))
        .pipe(rename('easyoop.min.js'))
        .pipe(uglify({ compress: false, mangle: false }))
        .pipe(gulp.dest('.'));
});

gulp.task('uiscript', function() {
    return gulp.src(uiFiles)
        .pipe(concat('zebkit.ui.js'))
        .pipe(gulp.dest('.'))
        .pipe(rename('zebkit.ui.min.js'))
        .pipe(uglify({ compress: false, mangle: false }))
        .pipe(gulp.dest('.'));
});

gulp.task('zebkitscript', function() {
    return gulp.src(zebkitFiles)
        .pipe(concat('zebkit.js'))
        .pipe(gulp.dest('.'))
        .pipe(rename('zebkit.min.js'))
        .pipe(uglify({ compress: false, mangle: false }))
        .pipe(gulp.dest('.'));
});

gulp.task('runtime', function () {
    return gulp.src(['zebkit.js', 'zebkit.min.js', 'zebkit.png', 'zebkit.json'])
        .pipe(zip('zebkit.runtime.zip'))
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


gulp.task('watch', function() {
    gulp.watch(zebkitFiles, ['zebkitscript']);
    gulp.watch(demoFiles, ['demoscript']);
    gulp.watch("samples/js/uiengine.samples.js", ['samplescript']);
});

gulp.task('scripts', [ "demoscript", "samplescript", "zebkitscript"]);

gulp.task('default', ['scripts', 'copy', 'runtime']);
