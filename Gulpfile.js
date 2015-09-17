var gulp = require('gulp')
    , nodemon = require('gulp-nodemon'),
    livereload = require('gulp-livereload');


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



gulp.task('default', ['start', 'watch']);