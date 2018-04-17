var path = require('path');
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var jshint = require('gulp-jshint');
var nodeunit = require('gulp-nodeunit');
var espower = require('gulp-espower');
var Server = require('karma').Server;

gulp.task('jslint', function () {
    gulp.src(['./src/**/*.js']).
        pipe(jshint()).
        pipe(jshint.reporter('jshint-stylish')).
        pipe(jshint.reporter('fail'));
});

gulp.task('build', ['jslint'], function () {
    gulp.src(['./src/index']).
    pipe(jshint()).
    pipe(jshint.reporter('jshint-stylish')).
    pipe(jshint.reporter('fail'));

    browserify().
    require('./src/index', {
        expose: 'async-fsm',
    }).
    bundle().
    pipe(source('async-fsm.js')).
    pipe(
        rename({
            extname: '.min.js',
        })
    ).
    pipe(buffer()).
    pipe(sourcemaps.init({loadMaps: true})).
    pipe(uglify()).
    pipe(sourcemaps.write('./')).
    pipe(gulp.dest('./dist'));
});

gulp.task('nodeunit-test', function () {
    return gulp.src(['./test/nodeunit/*.js']).
        pipe(nodeunit());
});

gulp.task('bundle-test', function () {
    return gulp.src(['./test/src/*.js']).
        pipe(concat('bundle.js')).
        pipe(gulp.dest('./test/dest'));
});

gulp.task('power-assert', ['bundle-test'], function () {
    return gulp.src(['./test/dest/bundle.js']).
        pipe(espower()).
        pipe(gulp.dest('./test/dest'));
});

gulp.task('browserify-test', ['power-assert'], function () {
    return browserify({
            entries: ['./test/dest/bundle.js']
        }).bundle().
        pipe(source('bundle.js')).
        pipe(gulp.dest('./test/dest'));
});

gulp.task('test', ['nodeunit-test', 'bundle-test', 'power-assert', 'browserify-test'], function (done) {
    new Server({
        configFile: path.join(__dirname, './karma.conf.js'),
        singleRun: true
    }, done).start();
});

gulp.task('default', ['build']);
