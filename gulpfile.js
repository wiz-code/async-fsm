var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('build', function () {
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

gulp.task('default', ['build']);
