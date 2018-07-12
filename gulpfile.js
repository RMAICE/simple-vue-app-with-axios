// вопрос по return
var gulp = require('gulp');
var sassmixins = require('gulp-sass-to-postcss-mixins');
var sugarss = require('sugarss');
var postcssNested = require('postcss-nested-props');
var precss = require('precss');
var postcss = require('gulp-postcss');
var rename  = require('gulp-rename');
var pug = require('gulp-pug');
var gulpConcat = require('gulp-concat');
var sync = require('browser-sync').create();
var pugBeautify = require('gulp-pug-beautify');

gulp.task('default', function() {
	gulp.start('styles');
	gulp.start('pug');
	gulp.start('scripts:libs');
	gulp.start('scripts:custom');
	gulp.start('images');
	gulp.start('fonts');
	gulp.start('serve');
	gulp.start('watch');
});

gulp.task('watch', function() {
	gulp.watch('src/style/*.css', ['styles']);
	gulp.watch('src/views/**/*.pug', ['pug', reloader]);
	gulp.watch('src/images/*.*', ['images', reloader]);
	gulp.watch('src/scripts/docs/*.js', ['scripts:custom', reloader]);
	gulp.watch('src/scripts/lib/*.js', ['scripts:libs', reloader]);
});

gulp.task('scripts:custom', function () {
	return gulp.src('src/scripts/docs/*.js')
		.pipe(gulpConcat('build.js'))
		.pipe(gulp.dest('build/js/'));
});

gulp.task('scripts:libs', function () {
	return gulp.src('src/scripts/lib/*.js')
		.pipe(gulpConcat('libs.js'))
		.pipe(gulp.dest('build/js/'));
})

gulp.task('styles', function () {
	return gulp.src('src/style/*.css')
		.pipe(gulpConcat('build.css'))
		.pipe(sassmixins())
		.pipe(postcss([postcssNested, precss() ], { parser: sugarss }))
		.pipe(rename({ extname: '.css' }))
		.pipe(gulp.dest('build/css/'))
		.pipe(sync.stream());
});

gulp.task('pug', function buildHTML() {
	return gulp.src('src/views/**/*.pug')
		.pipe(pug())
		.pipe(pugBeautify({
			omit_empty: true,
			fill_tab: true,
			tab_size: 4
		}))
		.pipe(gulp.dest('build/'));
});

gulp.task('images', function () {
	return gulp.src('src/images/*.*')
		.pipe(gulp.dest('build/images/'));
});

gulp.task('fonts', function () {
	return gulp.src('src/fonts/**/*.*')
		.pipe(gulp.dest('build/fonts/'));
});

gulp.task('serve', function() {
	sync.init({
		host: '127.0.0.1',
		server: "./build",
		port: 3333,
		open: 'external'
	});
});

function reloader(done) {
	sync.reload();
}