//
//                   [ 'easyoop','misc','draw','ui.event','ui',    ['resources']
//  ['demo.zfs']       'ui.grid','ui.tree','ui.design','web',        /   |
//       |            'ui.web','ui.vk.js','ui.date.js' ]            /    |
//       |                              |                          /     |
//    ['demo']                          +-------------------------+   ['zfs']
//                                      |
//                                      |
// ['apidoc-light','apidoc-dark']   ['zebkit']    ['apidoc-light','apidoc-dark']
//                |                     |                    |
//                |                     |                    |
//            ['apidoc']           ['runtime']          ['website']
//

var gulp   = require('gulp'), fs   = require('fs'), spawn = require('cross-spawn'),
    path   = require('path'), argv = require('yargs').argv,
    jshint = require('gulp-jshint'), copy      = require('gulp-copy'),
    concat = require('gulp-concat'), wrap      = require("gulp-wrap"),
    gulpif = require('gulp-if'),     uglify    = require('gulp-uglify'),
    rename = require('gulp-rename'), webserver = require('gulp-webserver'),
    rm     = require('gulp-rm'),     expect    = require('gulp-expect-file'),
    zip    = require('gulp-zip'),    insert    = require('gulp-insert'),
    file   = require('gulp-file'),   jsonmin   = require('gulp-jsonminify'),
    morgan = require('morgan');

var profile = {
    useStrictMode: true,
    artifacts : {
        jsons: {
            files: [ "build/rs/**/*.json" ],
            deps:  [ "resources" ],
            dest:  "build/rs",
            type: 'json'
        },

        zfs: {
            files: [ "build/rs" ],
            deps : [ "jsons" ],
            type :  "zfs",
            dest :  "build"
        },

        "demo.zfs": {
            files: [ "samples/demo/rs" ],
            type: "zfs",
            dest: "samples/demo",
            pkg : "zebkit.ui.demo"
        },

        "easyoop": {
            files : [
                "src/js/web/web.environment.js",
                "src/js/dthen.js",
                "src/js/misc.js",
                "src/js/oop.js",
                "src/js/zson.js",
                "src/js/path.js",
                "src/js/event.js",
                "src/js/font.js",
                "src/js/pkg.js",
                "src/js/bootstrap.js"
            ],
            type: "js",
            wrap: [ "function" ],
            minimize: true
        },

        "misc" : {
            files: [
                'src/js/util/util.js',
                'src/js/data/data.js',
                'src/js/io/io.js',
                'src/js/layout/layout.js'
            ],
            type: "js"
        },

        "web" : {
            files :[
                "src/js/web/web.common.js",
                "src/js/web/web.clipboard.js",
                "src/js/web/web.event.pointer.js",
                "src/js/web/web.event.wheel.js",
                "src/js/web/web.event.key.js"
            ],
            type: "js",
            wrap: [ "cut", "package" ]
        },

        "draw" : {
            files: [
                "src/js/draw/draw.common.js",
                "src/js/draw/draw.border.js",
                "src/js/draw/draw.text.js",
                "src/js/draw/draw.views.js"
            ],
            type: "js",
            wrap: [ "cut", "package" ]
        },

        "ui": {
            files : [
                "src/js/ui/ui.core.js",
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
                "src/js/ui/spin/ui.spin.js"
            ],
            type   : "js",
            wrap   : [ "cut", "package" ],
            config : true
        },

        "ui.event" : {
            files: [
                "src/js/ui/event/ui.event.core.js",
                "src/js/ui/event/ui.event.FocusManager.js",
                "src/js/ui/event/ui.event.ShortcutManager.js"
            ],
            type : "js",
            wrap : [ "cut", "package" ],
        },

        "ui.design" : {
            files: [ "src/js/ui/design/ui.design.js" ],
            type: "js"
        },

        "ui.tree" : {
            files: [
                "src/js/ui/tree/ui.tree.common.js",
                "src/js/ui/tree/ui.tree.Tree.js",
                "src/js/ui/tree/ui.tree.CompTree.js"
            ],
            type   : "js",
            wrap   : [ "cut", "package" ],
            config : true
        },

        "ui.grid" : {
            files: [
                "src/js/ui/grid/ui.grid.common.js",
                "src/js/ui/grid/ui.grid.GridCaption.js",
                "src/js/ui/grid/ui.grid.CompGridCaption.js",
                "src/js/ui/grid/ui.grid.Grid.js",
                "src/js/ui/grid/ui.grid.GridStretchPan.js"
            ],
            type   : "js",
            wrap   : [ "cut", "package" ],
            config : true
        },

        "ui.web" : {
            files: [
                "src/js/ui/web/ui.web.CursorManager.js",
                "src/js/ui/web/ui.web.core.js",
                "src/js/ui/web/ui.web.elements.js",
                "src/js/ui/web/ui.web.layers.js",
                "src/js/ui/web/ui.web.canvas.js",
                "src/js/ui/web/ui.web.VideoPan.js"
            ],
            type   : "js",
            wrap   : [ "cut", "package" ],
            config : true
        },

        "demo" : {
            files : [
                 (argv.bundle ? 'samples/demo/demo.zfs.js' : ''),
                "samples/demo/ui.demo.js",
                "samples/demo/ui.demo.layout.js",
                "samples/demo/ui.demo.basicui.js",
                "samples/demo/ui.demo.panels.js",
                "samples/demo/ui.demo.tree.js",
                "samples/demo/ui.demo.popup.js",
                "samples/demo/ui.demo.win.js",
                "samples/demo/ui.demo.grid.js",
                "samples/demo/ui.demo.design.js",
                "samples/demo/ui.demo.exp.js"
            ],
            deps  : [ argv.bundle ? 'demo.zfs' : '' ],
            wrap    : [ "cut", "package" ],
            type    : "js",
            minimize: true,
            dest    : "samples/demo",
            config  : false,
            useStrictMode: false,
            pkg     : "ui.demo"
        },

        "ui.vk" : {
            files: [ "src/js/ui/vk/ui.vk.js" ],
            type: "js",
            minimize: true
        },

        "ui.date" : {
            files: [ "src/js/ui/date/ui.date.js" ],
            type: "js",
            minimize: true
        },

        "zebkit" : {
            files: [
                'build/easyoop.js',
                 argv.bundle ? 'build/zfs.js' : '',
                'build/misc.js',
                'build/draw.js',
                'build/ui.event.js',
                'build/ui.js',
                'build/ui.tree.js',
                'build/ui.grid.js',
                'build/ui.design.js',
                'build/web.js',
                'build/ui.web.js'
            ],
            deps: [
                'resources',
                'easyoop',
                 argv.bundle ? 'zfs' : '',
                'misc',
                'draw',
                'ui.event',
                'ui',
                'ui.grid',
                'ui.tree',
                'ui.design',
                'web',
                'ui.web',
                'ui.vk',
                'ui.date'
            ],
            type: "js",
            minimize: true,
            clean : {
                exclude : [ 'build/easyoop.js' ]
            }
        },

        "runtime" : {
            files: [
                "build/rs/**/*",
                "build/zebkit.js",
                "build/zebkit.min.js",
                "build/ui.vk.js",
                "build/ui.vk.min.js",
                "build/ui.date.js",
                "build/ui.date.min.js"
            ],
            dest: "build/zebkit.runtime.zip",
            deps: [ "zebkit" ],
            type: "zip"
        },

        "apidoc" : {
            deps: [ "apidoc-light", "apidoc-dark"],
        },

        "apidoc-light": {
            name     : "yuidoc",
            arguments:  [
                '-t', 'node_modules/yuidoc-zebkit-theme/themes/light',
                '-c', 'src/yuidoc/yuidoc.json',
                "-o", "apidoc/light",
                "-n",
                './build'
            ],
            type: "process"
        },

        "apidoc-dark": {
            name     : "yuidoc",
            arguments:  [
                '-t', 'node_modules/yuidoc-zebkit-theme/themes/dark',
                '-c', 'src/yuidoc/yuidoc.json',
                "-o", "apidoc/dark",
                "-n",
                './build'
            ],
            type: "process"
        },

        "website" : {
            deps: [ "website-light", "website-dark"],
        },

        "json" : {
            files : [
                'build/rs/themes/light/ui.json'
            ],
            type: "json"
        },

        "website-dark": {
            name     : "jekyll",
            arguments:  [
              'build',
               '--config', 'src/jekyll/_config-dark.yml',
               '-d', 'website/dark',
               '-s', 'src/jekyll/'
            ],
            type: "process"
        },

        "website-light": {
            name     : "jekyll",
            arguments:  [
                'build',
                 '--config', 'src/jekyll/_config-light.yml',
                 '-d', 'website/light',
                 '-s', 'src/jekyll/'
            ],
            type: "process"
        },

        "clean" : {
            files: [ 'build/**/*' ],
            type: "clean"
        },

        "resources" : {
            files: [ "src/js/rs/**/*" ],
            dest: "build/rs",
            type: "cp"
        },

        "default" : {
            deps: [ "runtime" ]
        }
    }
}

gulp.task('http', function() {
    gulp.src('.')
        .pipe(webserver({
            port: 8090,
            host: "192.168.178.15",
            host: "localhost",
            directoryListing: true,
            open: false
            //middleware: morgan(':method :url :status :req[opentunnel.party.alternateid] :req[Content-Type]')
        }));
});

gulp.task('lint', function() {
    return gulp.src("src/js/**/*.js")
          .pipe(jshint({ eqnull : true }))
          .pipe(jshint.reporter('default'));
});

gulp.task('watch', function() {
    gulp.watch("src/**/*.js", ['zebkit']);
});


// build set of tasks
for(var name in profile.artifacts) {
    var artifact = profile.artifacts[name],
        deps     = typeof artifact.deps   !== 'undefined' ? artifact.deps : [],
        mm       = null;

    if (deps) {
        deps = deps.filter(v => v !== '');
    }

    if (artifact.files) {
        artifact.files = artifact.files.filter(v => v !== '');
    }

    if (artifact.name === 'default') {
        gulp.task('default', deps);
    } else if (artifact.type === 'js') {
        (function(name, artifact, deps) {
            var config  = typeof artifact.config !== 'undefined' ? artifact.config
                                                                 : false,
                tname = name;

            if (artifact.clean) {
                tname = "clean" + name;

                var cleanFiles = [];
                if (artifact.clean.exclude) {
                    for (var i = 0; i < artifact.files.length; i++) {
                        if (artifact.clean.exclude.indexOf(artifact.files[i]) < 0) {
                            cleanFiles.push(artifact.files[i]);
                        }
                    }
                } else {
                    cleanFiles = artifact.files;
                }

                gulp.task(name, [ tname ], function() {
                    return gulp.src(cleanFiles).pipe(rm());
                });
            }

            gulp.task(tname, deps, function() {
                var t = gulp.src(artifact.files).pipe(expect(artifact.files));

                if (artifact.wrap && artifact.wrap.indexOf("cut") >= 0) {
                    // cut function wrapper
                    t = t.pipe(insert.transform(function(content, f) {
                        // TODO: weired implementation, has to be re-done
                        var l = content.indexOf("zebkit.package");
                        if (l >= 0) {
                            var i = content.indexOf("{");
                            var j = content.lastIndexOf("}");
                            return content.substring(i + 1, j);
                        } else {
                            return content;
                        }
                    }));
                }

                var fn  = artifact.dest ? path.join(artifact.dest, name + '.js')
                                        : path.join("build", name + '.js'),
                    us  = (typeof artifact.useStrictMode !== 'undefined' ? artifact.useStrictMode
                                                                         : profile.useStrictMode );

                t = t.pipe(concat(fn)).pipe(gulp.dest("."));

                if (artifact.wrap && (artifact.wrap === "package" || artifact.wrap.indexOf("package") >= 0)) {
                    var pkg = artifact.pkg ? artifact.pkg : name;
                    t = t.pipe(insert.wrap("zebkit.package(\"" +
                                        pkg +
                                        "\", function(pkg, Class) {" +
                                        (us ? "\n    'use strict';" : ""),

                                        "}" + (typeof config !== 'undefined' &&
                                               config !== null                   ? "," + config + ");"
                                                                                 : ");") ))
                     .pipe(gulp.dest("."));
                } else if (artifact.wrap && (artifact.wrap === "function" || artifact.wrap.indexOf("function") >= 0)) {
                    t = t.pipe(insert.wrap("(function(){\n"  + (us ? "\n'use strict';":"") + "\n\n"
                                            ,"})();"))
                         .pipe(gulp.dest("."));
                }

                if (artifact.minimize === true) {
                    var mfn  = artifact.dest ? path.join(artifact.dest, name + '.min.js')
                                             : path.join("build", name + '.min.js');

                    t = t.pipe(rename(mfn))
                         .pipe(uglify({ compress: false, mangle: false }))
                         .pipe(gulp.dest("."));
                }

                return t;
            });
        })(name, artifact, deps);
    } else if (artifact.type === "zip") {
        (function(name, artifact, deps) {
            gulp.task(name, deps,  function() {
                var fn = name + ".zip";
                if (artifact.dest) {
                    fn = artifact.dest;
                }
                return gulp.src(artifact.files, { base: "build" })
                           .pipe(zip(fn))
                           .pipe(gulp.dest("."));
            });
        })(name, artifact, deps);
    } else if (artifact.type === 'process') {
        (function(name, artifact, deps) {
            gulp.task(name, deps, function (gulpCallBack){
                spawn(artifact.name, artifact.arguments, { stdio: 'inherit' })
                .on('exit', function(code) {
                    gulpCallBack(code === 0 ? null : "ERROR: '" + artifact.name + "' process exited with code: " + code);
                });
            });
        })(name, artifact, deps);
    } else if (artifact.type === 'json') {
        (function(name, artifact, deps) {
            var dest = artifact.dest ? artifact.dest : "build";
            gulp.task(name, deps, function() {
                return gulp.src(artifact.files)
                           .pipe(jsonmin())
                           .pipe(gulp.dest(dest));
            });
        })(name, artifact, deps);
    } else if (artifact.type === "zfs") {
        (function(name, artifact, deps) {
            gulp.task(name, deps,  function(cb) {
                var dest = "build", pkg = "zebkit";
                if (artifact.dest) {
                    dest = artifact.dest;
                }

                if (artifact.pkg) {
                    pkg = artifact.pkg
                }

                fs.writeFile(path.join(dest, name + ".js"),
                             "\n\n// ZFS\nzebkit.ZFS.load('" + pkg + "'," + JSON.stringify(buildFS(artifact.files, dest)) + ");\n\n", cb);
            });
        })(name, artifact, deps);
    } else if (artifact.type === 'clean') {
        (function(name, artifact, deps) {
            gulp.task(name, deps, function(cb) {
                return gulp.src(artifact.files, { read: false }).pipe(rm());
            });
        })(name, artifact, deps);
    } else if (artifact.type === "cp") {
        (function(name, artifact, deps) {
            gulp.task(name, deps,  function(cb) {
                var d = artifact.dest ? artifact.dest : "build";
                return gulp.src(artifact.files).pipe(gulp.dest(d));
            });
        })(name, artifact, deps);
    } else {
        (function(name, artifact, deps) {
            gulp.task(name, deps);
        })(name, artifact, deps);
    }
}


function buildFS(files, base) {
    function walk(root, callback) {
        fs.readdirSync(root).forEach((f) => {
            let fp   = path.join(root, f),
                stat = fs.statSync(fp);
            if (stat.isDirectory()) {
                walk(fp, callback);
            } else {
                callback(null, fp);
            }
        });
    }

    var data = {},
        binaries = [ ".jpg", ".jpeg", ".tiff", ".gif", ".png", ".ico", ".pdf" ],
        txt      = [ ".txt", ".md", ".json", ".html", ".htm", ".properties", ".conf", ".xml", ".crt" ];
    for(var i = 0; i < files.length; i++) {
        walk(path.join(__dirname, files[i]), (err, p) => {
            let pp  = path.relative(path.join(__dirname, base), p),
                ext = path.extname(p).toLowerCase();
            if (binaries.indexOf(ext) >= 0) {
                data[pp] = {
                    ext : ext,
                    path: pp,
                    data: fs.readFileSync(p).toString('base64')
                };
            } else if (txt.indexOf(ext) >= 0) {
                data[pp] = {
                    ext : ext,
                    path: pp,
                    data: fs.readFileSync(p).toString()
                };
            } else {
                console.err("Unknown file type '" + ext + "'")
            }
        });
    }
    return data;
}
