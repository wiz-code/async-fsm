var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('dev-build', function () {
    browserify({
        entries: ['./src/async-fsm.js'],
        debug: true,
    }).
    bundle().
    pipe(source('async-fsm.min.js')).
    pipe(buffer()).
    pipe(sourcemaps.init({loadMaps: true})).
    pipe(
        uglify({
            mangle: {
                keep_fnames: true,
            },
        })
    ).
    pipe(sourcemaps.write()).
    pipe(gulp.dest('./dev'));
});

gulp.task('build', function () {
    browserify({
        entries: ['./src/async-fsm.js'],
    }).
    bundle().
    pipe(source('async-fsm.js')).
    pipe(gulp.dest('./dist')).
    pipe(
        rename({
            extname: '.min.js',
        })
    ).
    pipe(buffer()).
    pipe(
        uglify({
            mangle: {
                keep_fnames: true,
            },
        })
    ).
    pipe(gulp.dest('./dist'));
});

gulp.task('default', ['build']);


