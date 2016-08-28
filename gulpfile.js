var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    gutil = require('gulp-util'),
    plumber = require('gulp-plumber'),
    size = require('gulp-size'),
    gzip = require('gulp-gzip'),
    notify = require("gulp-notify"),
    uncss = require('gulp-uncss'),
    sourcemaps = require('gulp-sourcemaps'),
    include = require('gulp-include'),
    clean = require('gulp-clean'),
    imageop = require('gulp-image-optimization');


// Server
gulp.task('express', function() {
	var express = require('express');
	var app = express();
	app.use(require('connect-livereload')({port: 4002}));
	app.use(express.static(__dirname));
	app.listen(4000);
});

// Livereload
var tinylr;
gulp.task('livereload', function() {
	tinylr = require('tiny-lr')();
	tinylr.listen(4002);
});

function notifyLiveReload(event) {
  var fileName = require('path').relative(__dirname, event.path);

  tinylr.changed({
    body: {
      files: [fileName]
    }
  });
}

// JS
gulp.task('compress', function() {
	return gulp.src('src/js/main.js')
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(sourcemaps.init())
    .pipe(include())
    .pipe(uglify({
        preserveComments: 'some'
    }))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('dist/js/min/'))
});

// SCSS
gulp.task('styles', function() {
	return gulp.src('src/scss/app.scss')
	// error handling
	.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
	.pipe(sass({ style: 'expanded' }))
	.pipe(autoprefixer('last 2 version', 'ie 8', 'ie 9', 'opera 12.1'))
	.pipe(rename({suffix: '.min'}))
	.pipe(minifycss())
	.pipe(gulp.dest('dist/css'))

	.pipe(notify("SCSS minified"));
});

// Watch
gulp.task('watch', function() {
	gulp.watch('src/scss/**/*.scss', ['styles']);
	gulp.watch('src/js/*.js', ['compress']);
  gulp.watch('src/images/*', ['images']);
  gulp.watch('src/fonts/*.*', ['fonts']);
  gulp.watch('*.html', notifyLiveReload);
  gulp.watch('dist/css/*.css', notifyLiveReload);
});

gulp.task('images', function(cb){
  gulp.src(['src/images/*']).pipe(imageop({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true
    })).pipe(gulp.dest('dist/images')).on('end', cb).on('error', cb);
});


gulp.task('fonts', function(){
  return gulp.src(['src/fonts/*.*'])
       .pipe(gulp.dest('dist/fonts'));
});

gulp.task('clean', function () {
    return gulp.src('dist/*', {read: false})
        .pipe(clean());
});

// generate new artifacts
gulp.task('regen', ['clean', 'images', 'fonts', 'styles', 'compress'], function() {});

// default
gulp.task('default', ['watch', 'express', 'livereload'], function() {});
