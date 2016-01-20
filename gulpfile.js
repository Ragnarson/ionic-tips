var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var preprocess = require('gulp-preprocess');
var annotate = require('gulp-ng-annotate');

var paths = {
  sass: ['./scss/**/*.scss'],
  js: ['./javascript/app.js']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.js, ['annotate']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

var swallowErr = function(err) {
  console.log(err.toString());
  this.emit('end');
}

var ENV = process.env.ENV || 'DEVELOPMENT'

// 5
gulp.task('settings', function() {
  gulp.src('./settings.js').pipe(preprocess({
    context: {
      ENV: ENV
    }
  })).pipe(gulp.dest('./www/js/'));
});

// 6
gulp.task('annotate', function () {
  return gulp.src('javascript/app.js')
    .pipe(annotate())
    .on('error', swallowErr)
    .pipe(gulp.dest('www/js/'));
});