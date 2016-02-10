var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-cssnano');
var rename = require('gulp-rename');
var sh = require('shelljs');
var rimraf = require('gulp-rimraf');
var runSequence = require('run-sequence');
var inject = require('gulp-inject');
var series = require('stream-series');



var paths = {
    sass: ['./aribaweb/sass/**/*.scss'],
    sdk_lib_root: ['./tools/templates/sdk/index.html' , './aribaweb/resources/**/*' ],
    sdk_lib_js: [ 'aribaweb/**' ],
    sdk_lib_clean: ['./www/js/resources/', './www/js/sass/']
};

gulp.task('default', function (done) {
    runSequence('sass',
        'prepare-sdk',
        'sdk-index',
        'clean-sdk-internal',
        done);
});

gulp.task('sass', function (done) {
    gulp.src('./aribaweb/sass/aw.app.scss')
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(gulp.dest('./www/css/'))
        .pipe(minifyCss())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./www/css/'))
        .on('end', done);
});


gulp.task('watch', function () {
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.sdk_lib_root, ['sdk_lib_root']);
    gulp.watch(paths.sdk_lib_js, ['sdk_lib_js']);
});

gulp.task('prepare-sdk', function (done) {
    gulp.src(paths.sdk_lib_root).pipe(gulp.dest('./www'))
    gulp.src(paths.sdk_lib_js).pipe(gulp.dest('./www/js'))
        .on('end', done);


});

gulp.task('clean-sdk-internal', function (done) {
     return gulp.src(paths.sdk_lib_clean)
        .pipe(rimraf({ force: true }))


});

gulp.task('sdk-index', function () {

    var vendorStream = gulp.src(['./bower_components/*.js'], {read: false});
    var appStream = gulp.src(['./www/js/*.js'], {read: false});
    var css = gulp.src(['./www/css/aw.app.css'], {read: false});

    return gulp.src('./www/index.html')
        .pipe(inject(series(css, vendorStream, appStream))) // This will always inject vendor files before app files
        .pipe(gulp.dest('./www'));
});


gulp.task('install', ['git-check'], function () {
    return bower.commands.install()
        .on('log', function (data) {
            gutil.log('bower', gutil.colors.cyan(data.id), data.message);
        });
});

gulp.task('git-check', function (done) {
    if (!sh.which('git')) {
        console.log(
                '  ' + gutil.colors.red('Git is not installed.'),
            '\n  Git, the version control system, is required to download aribaweb.',
            '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
                '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
        );
        process.exit(1);
    }
    done();
});
