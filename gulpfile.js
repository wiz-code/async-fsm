var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('build', function () {
    browserify().
    require('bluebird').
    require('underscore').
    require('uuid/v4').
    bundle().
    pipe(source('require.js')).
    pipe(buffer()).
    pipe(
        uglify({
            mangle: {
                keep_fnames: true,
            },
        })
    ).
    pipe(gulp.dest('./dist'));
    
    gulp.src('./src/async-fsm.js').
    pipe(
        rename({
            extname: '.min.js',
        })
    ).
    pipe(buffer()).
    pipe(sourcemaps.init({loadMaps: true})).
    pipe(
        uglify({
            mangle: {
                keep_fnames: true,
            },
        })
    ).
    pipe(sourcemaps.write('./')).
    pipe(gulp.dest('./dist'));
});

gulp.task('default', ['build']);


