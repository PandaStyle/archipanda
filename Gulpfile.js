var gulp = require('gulp'),
    concat = require('gulp-concat'),
    nodemon = require('gulp-nodemon'),
    livereload = require('gulp-livereload'),
    sass = require('gulp-sass');

var jsFiles  = [
    'views/**/*.js',
    'views/**/*.html',

    'scripts/*.js'
];

var cssFiles = [
    'ext/views/**/*.scss',
    'ext/styles/index.scss'
]


gulp.task('reload', function() {
    livereload.reload();
});


gulp.task('watch', function() {
    livereload.listen();
    gulp.watch(jsFiles, ['reload']);
    gulp.watch(cssFiles, ['sass', 'reload']);
});

gulp.task('sass', function () {
    gulp.src(['ext/views/**/*.scss', 'ext/styles/index.scss'])
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./ext/css'))
        .pipe(concat('index.css'))
        .pipe(gulp.dest('./ext/dist/styles'));
});



gulp.task('start', function () {
    nodemon({
        script: 'app.js',
        ext: 'js'
        , env: { 'NODE_ENV': 'local' }
    })
});

gulp.task('default', ['start', 'sass', 'watch']);