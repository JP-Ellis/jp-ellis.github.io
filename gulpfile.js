var gulp         = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var compass      = require('gulp-compass');
var del          = require('del');
var minifyCss    = require('gulp-cssnano');
var minifyJs     = require('gulp-minify');
var rename       = require('gulp-rename');
var vinylPaths   = require('vinyl-paths');
var livereload   = require('gulp-livereload');
var wait         = require('gulp-wait');

var paths = {
    compass: ['css/*.scss'],
    fonts: ['fonts/*.woff2', 'fonts/*.woff', 'fonts/*.ttf'],
    gulp: ['gulpfile.js'],
    images: ['images/**/*.png', 'images/**/*.jpg', 'images/**/*.jpeg', 'images/**/*.svg']
};

gulp.task('css', function() {
    gulp.src(paths.compass)
        .pipe(compass({sass: 'css',
                       css: 'static/css',
                       image: 'static/img',
                       js: 'static/js',
                       font: 'static/font',
                       import_path: ['./submodules'],
                       bundle_exec: true,
                       comments: true}))
        .pipe(autoprefixer({browsers: ['> 5%']}))
        .pipe(minifyCss())
        .pipe(vinylPaths(del))
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest('static/css'))
        .pipe(wait(1000))
        .pipe(livereload());
});

gulp.task('fonts', function() {
    gulp.src(paths.fonts)
        .pipe(gulp.dest('static/fonts'));
});

gulp.task('images', function() {
    gulp.src(paths.images)
        .pipe(gulp.dest('static/images'))
        .pipe(livereload());
});

gulp.task('submodules', ['share-button']);

gulp.task('share-button', function() {
    gulp.src('submodules/share-button/dist/*.min.css')
        .pipe(gulp.dest('static/css'));
    gulp.src('submodules/share-button/dist/*.min.js')
        .pipe(gulp.dest('static/js'));
});

gulp.task('dist', ['css', 'fonts', 'images', 'submodules']);

gulp.task('watch', function() {
    livereload.listen();
    gulp.watch(paths.compass, ['css']);
    gulp.watch(paths.images, ['images']);
});

gulp.task('default', ['dist', 'watch']);