var gulp = require('gulp'),
    concat = require('gulp-concat'),
    nodemon = require('gulp-nodemon'),
    livereload = require('gulp-livereload'),
    sass = require('gulp-sass');


gulp.task('start', function () {
    nodemon({
        script: 'app.js',
        ext: 'js'
        , env: { 'NODE_ENV': 'local' }
    })
})

gulp.task('reload', function() {
    livereload.reload('index.html')
});


gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('ext/styles/*.css', ['reload']);
});

gulp.task('sass', function () {
    gulp.src(['ext/views/**/*.scss', 'ext/styles/index.scss'])
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./ext/css'))
        .pipe(concat('index.css'))
        .pipe(gulp.dest('./ext/dist/styles'));
});

gulp.task('sass:watch', function () {
    gulp.watch('ext/views/**/*.scss', ['sass']);
});

gulp.task('default', ['start', 'watch', 'sass:watch']);