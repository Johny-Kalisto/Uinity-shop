"use strict";

var gulp = require('gulp'),
    mainBowerFiles = require('main-bower-files'),
    pug = require('gulp-pug'),
    browserSync = require('browser-sync'),
    cleanCss = require('gulp-clean-css'),
    watch = require('gulp-watch'),
    gulpLess = require('gulp-less'),
    autoprefix = require('gulp-autoprefixer'),
    reload = browserSync.reload,
    notify = require('gulp-notify'),
    rimraf = require('rimraf'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    wiredep = require('wiredep').stream;

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/'
    },
    source: {
        pug: 'src/pug/pages/*.pug',
        img: 'src/image/*.png',
        js: 'src/js/**/*.js',
        less: 'src/styles/**/*.less'
    },
    watch: {
        pug: 'src/**/*.pug',
        img: 'src/image/*.png',
        js: 'src/js/**/*.js',
        less: 'src/styles/**/*.less'
    },
    clean: {
        build: './build'
    }
};

//pug templater
gulp.task('pug', function () {
    gulp.src(path.source.pug)
        .pipe(sourcemaps.init())
        .pipe(pug({
            pretty: true
        }).on('error', function (error) {
            console.log(error);
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({
            stream: true
        }));

});

//less compiler & autoprefixer
gulp.task('less', function () {
    gulp.src(path.source.less)
        .pipe(sourcemaps.init())
        .pipe(gulpLess()
            .on('error', notify.onError({
                message: "<% #{error.message} %>",
                title: "Less error!"
            })))
        .pipe(cleanCss({
            compatibility: '*',
            level: 2
        }))
        .pipe(autoprefix('last 5 versions', 'firefox', '> 1%', 'ie 9'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({
            stream: true
        }));
});

//image & png minify
gulp.task('image', function () {
   gulp.src(path.source.img)
       .pipe((imagemin({ //Сожмем их
           progressive: true,
           svgoPlugins: [{ removeViewBox: false }],
           use: [pngquant()],
           interlaced: true
       })
    ))
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({stream: true})); 
});

//Run all build tasks
gulp.task('build', ['pug', 'less', 'normalize', 'js', 'image', 'bootstrap:css', 'bootstrap:jquery-js']);

//webserver browserSync
gulp.task('browserSync', function () {
    browserSync({
        server: {
            baseDir: './build'
        },
        tunnel: false,
        port: 8888,
        logPrefix: 'w3schools',
        host: 'localhost'
    });
});

//normalize for development
gulp.task('normalize', function () {
    gulp.src(mainBowerFiles('**/*.css'))
        .pipe(gulp.dest('src/styles'))
        .pipe(reload({
            stream: true
        }));
});


//js uglify task
gulp.task('js', function () {
    gulp.src(path.source.js)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.js))
    .pipe(reload({
        stream: true
    }));
});



//watching
gulp.task('watch', function () {
    watch([path.watch.pug], function (event, cb) {
        gulp.start('pug');
    });
    watch([path.watch.less], function (event, cb) {
        gulp.start('less');
    });
    watch([path.watch.img], function (event, cb) {
        gulp.start('image');
    });
    watch([path.watch.js], function (event, cb) {
       gulp.start('js'); 
    });
});
//bootstrap:css
gulp.task('bootstrap:css', function () {
    gulp.src(mainBowerFiles('**/*.css',{
        "overrides": {
            "bootstrap":{
                "main": [
                    "./dist/css/bootstrap-grid.css",
                    "./dist/css/bootstrap-grid.min.css",
                    "./dist/css/bootstrap.css",
                    "./dist/css/bootstrap.min.css",
                    "./dist/css/bootstrap-reboot.css",
                    "./dist/css/bootstrap-reboot.min.css"
                ]
            }
        }
    }))
    .pipe(gulp.dest(path.build.css))
    .pipe(reload({
        stream: true
    }));
});
//bootstrap:js
gulp.task('bootstrap:jquery-js', function () {
    gulp.src(mainBowerFiles('**/*.js', {
        "overrides": {
            "bootstrap": {
                "main": [
                    "./dist/js/bootstrap.bundle.js",
                    "./dist/js/bootstrap.bundle.min.js",
                    "./dist/js/bootstrap.js",
                    "./dist/js/bootstrap.min.js"
                ]
            }
        }
    }))
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({
            stream: true
        }));
});
//default
gulp.task('default', ['build', 'browserSync', 'watch']);

//clean
gulp.task('clean', function (cb) {
    rimraf(path.clean.build, cb);

});
