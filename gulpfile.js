var gulp = require('gulp');


// Build tree:
// ----------
//     [ 'easyoop', 'misc', 'ui', 'ui.grid', 'ui.tree', 'ui.design', 'web', 'ui.web' ]
//                                    *
//                                    |
//                                [ zebkit ]        [ 'resource', 'ui.vk', 'ui.calendar' ]
//                                    *                            *
//                                    |                            |
//                                    +----------------------------+
//                                    |
//                                [ buildJS ]
//                                    *-------------------+
//                                    |                   |
//      [ 'apidoc' ]             [ 'runtime' ]      [ genWebsite ]
//                                                        *
//                                                        |
//                                                   [ website ]
//
//


var jshint    = require('gulp-jshint'),
    concat    = require('gulp-concat'),
    copy      = require('gulp-copy'),
    wrap      = require("gulp-wrap"),
    uglify    = require('gulp-uglify'),
    rename    = require('gulp-rename'),
    webserver = require('gulp-webserver'),
    rm        = require('gulp-rm'),
    expect    = require('gulp-expect-file'),
    zip       = require('gulp-zip'),
    insert    = require('gulp-insert');


var useStrictMode = true;

var miscFiles = [
    'src/js/util.js',
    'src/js/io.js',
    'src/js/data.js',
    'src/js/layout.js'
];

var uiCoreFiles = [
    "src/js/ui/ui.core.event.js",
    "src/js/ui/ui.core.js",
    "src/js/ui/ui.views.js",
    "src/js/ui/ui.FocusManager.js",
    "src/js/ui/ui.ShortcutManager.js"
];

var uiFiles = [
    "src/js/ui/ui.common.js",
    "src/js/ui/ui.state.js",
    "src/js/ui/ui.buttons.js",
    "src/js/ui/ui.panels.js",
    "src/js/ui/ui.scroll.js",
    "src/js/ui/ui.Slider.js",
    "src/js/ui/ui.Tabs.js",
    "src/js/ui/ui.field.js",
    "src/js/ui/ui.list.js",
    "src/js/ui/ui.Combo.js",
    "src/js/ui/ui.menu.js",
    "src/js/ui/ui.window.js",
    "src/js/ui/ui.tooltip.js",
    "src/js/ui/ui.bootstrap.js"
];

var uiDesignFiles = [ "src/js/ui/design/ui.design.js" ];

var uiTreeFiles = [
    "src/js/ui/tree/ui.tree.common.js",
    "src/js/ui/tree/ui.tree.Tree.js",
    "src/js/ui/tree/ui.tree.CompTree.js",
    "src/js/ui/tree/ui.tree.bootstrap.js"
];

var uiGridFiles = [
    "src/js/ui/grid/ui.grid.common.js",
    "src/js/ui/grid/ui.grid.GridCaption.js",
    "src/js/ui/grid/ui.grid.CompGridCaption.js",
    "src/js/ui/grid/ui.grid.Grid.js",
    "src/js/ui/grid/ui.grid.GridStretchPan.js",
    "src/js/ui/grid/ui.grid.bootstrap.js"
];

var webFiles = [
    "src/js/web/web.common.js",
    "src/js/web/web.clipboard.js",
    "src/js/web/web.event.pointer.js",
    "src/js/web/web.event.wheel.js",
    "src/js/web/web.event.key.js"
];

var uiWebFiles = [
    "src/js/ui/web/ui.web.CursorManager.js",
    "src/js/ui/web/ui.web.core.js",
    "src/js/ui/web/ui.web.elements.js",
    "src/js/ui/web/ui.web.layers.js",
    "src/js/ui/web/ui.web.canvas.js",
    "src/js/ui/web/ui.web.VideoPan.js",
    "src/js/ui/web/ui.web.bootstrap.js"
];

var zebkitFiles = [ 'build/easyoop.js',
                    'build/misc.js',
                    'build/ui.js',
                    'build/ui.tree.js',
                    'build/ui.grid.js',
                    'build/ui.design.js',
                    'build/web.js',
                    'build/ui.web.js' ];

var demoFiles = [
    "samples/demo/ui.demo.js",
    "samples/demo/ui.demo.layout.js",
    "samples/demo/ui.demo.basicui.js",
    "samples/demo/ui.demo.panels.js",
    "samples/demo/ui.demo.tree.js",
    "samples/demo/ui.demo.popup.js",
    "samples/demo/ui.demo.win.js",
    "samples/demo/ui.demo.grid.js",
    "samples/demo/ui.demo.design.js"
];


function packageTask(name, files, wrap, pkg) {
    gulp.task(name, function() {
        var t = gulp.src(files).pipe(expect(files));

        if (typeof pkg === 'undefined') {
            pkg = name;
        }

        if (wrap !== false) {
            t = t.pipe(insert.transform(function(content, file) {
                var i = content.indexOf("{");
                var j = content.lastIndexOf("}");
                return content.substring(i + 1, j);
            }));
        }

        t = t.pipe(concat('build/' + name + '.js')).pipe(gulp.dest("."));

        if (wrap !== false) {
            t = t.pipe(insert.wrap("zebkit.package(\"" + pkg + "\", function(pkg, Class) {" + (useStrictMode ? "\n    'use strict';":"")
                                    ,"});"))
                 .pipe(gulp.dest("."));
        }

        return t.pipe(rename(name + '.min.js'))
                .pipe(uglify({ compress: false, mangle: false }))
                .pipe(gulp.dest("build"));
    });
}


gulp.task('http', function() {
    gulp.src('.')
        .pipe(webserver({
            port: 8090,
            host: "localhost",
            directoryListing: true,
            open: false
        }));
});

gulp.task('lint', function() {
    return gulp.src(webFiles)
         // .pipe(expect(uiGridFiles))
          .pipe(jshint({ eqnull : true }))
          .pipe(jshint.reporter('default'));
});

gulp.task('resources', function() {
    return gulp.src([
        "src/js/rs/**/*"
    ]).pipe(gulp.dest("build/rs"));
});

//
packageTask("easyoop", [   "src/js/web/web.environment.js", "src/js/easyoop.js" ], false);
packageTask("misc", miscFiles, false);
packageTask("ui", uiCoreFiles.concat(uiFiles));
packageTask("ui.grid", uiGridFiles);
packageTask("ui.tree", uiTreeFiles);
packageTask("ui.design", uiDesignFiles, false);
packageTask("web", webFiles);
packageTask("ui.web", uiWebFiles);

// extra packages
packageTask("ui.calendar", [ "src/js/ui/date/ui.date.js" ], false);
packageTask("ui.vk", [ "src/js/ui/vk/ui.vk.js" ], false);


gulp.task('genZebkit',  ['easyoop', 'misc',  'ui', 'ui.grid', 'ui.tree', 'ui.design', 'web', 'ui.web'], function() {
    return gulp.src(zebkitFiles)
          .pipe(expect(zebkitFiles))
          .pipe(concat('build/zebkit.js'))
          .pipe(gulp.dest("."))
          .pipe(rename('zebkit.min.js'))
          .pipe(uglify({ compress: false, mangle: false }))
          .pipe(gulp.dest("build"));
});

gulp.task('zebkit',  ['genZebkit' ], function() {
    return gulp.src([ "build/misc.js",
                      "build/misc.min.js",
                      "build/easyoop.js",
                      "build/easyoop.min.js",
                      "build/web.js",
                      "build/web.min.js",
                      "build/ui.design.js",
                      "build/ui.design.min.js",
                      "build/ui.tree.js",
                      "build/ui.tree.min.js",
                      "build/ui.grid.js",
                      "build/ui.grid.min.js",
                      "build/ui.web.js",
                      "build/ui.web.min.js",
                      "build/ui.min.js",
                      "build/ui.js"])
          .pipe(rm());
});

gulp.task('buildJS', [ "zebkit", "resources", "ui.calendar", "ui.vk" ]);

gulp.task('runtime', [ "buildJS" ], function () {
    return  gulp.src([
                "build/rs/**/*",
                "build/zebkit.js",
                "build/zebkit.min.js"
            ], { base: "build" })
            .pipe(zip('zebkit.runtime.zip'))
            .pipe(gulp.dest("build"));
});

// generate WEB site
gulp.task('genWebsite', [ 'buildJS' ], function (gulpCallBack){
    var spawn  = require('child_process').spawn;
    var jekyll = spawn('jekyll', ['build', '-d', 'website', '-s', 'src/jekyll/' ], { stdio: 'inherit' });

    jekyll.on('exit', function(code) {
        gulpCallBack(code === 0 ? null : 'ERROR: Jekyll process exited with code: ' + code);
    });
});

gulp.task('website', [ "genWebsite" ],  function() {
    return  gulp.src([
                "build/rs/**/*",
                "build/zebkit.js",
                "build/zebkit.min.js"
            ], { base: "build" }).
            pipe(gulp.dest('website/public/js'));
});

// generate APIDOC
gulp.task('apidoc', function (gulpCallBack){
    var spawn  = require('child_process').spawn;
    var yuidoc = spawn('yuidoc', ['-t', 'node_modules/yuidoc-zebkit-theme',
                                  '-H', 'node_modules/yuidoc-zebkit-theme/helpers/helpers.js',
                                  "-o", "build/apidoc",
                                  "-n",
                                  'build/.' ], { stdio: 'inherit' });

    yuidoc.on('exit', function(code) {
        gulpCallBack(code === 0 ? null : 'ERROR: yuidoc process exited with code: ' + code);
    });
});

// clean build
gulp.task('clean', function() {
    return gulp.src([ 'build/**/*', 'website/**/*' ], { read: false }).pipe(rm());
});

gulp.task('default', ['website']);

gulp.task('watch', function() {
    gulp.watch("src/**/*.js", ['zebkit']);
});

