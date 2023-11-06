const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
// var uglify = require('gulp-uglify');
// var concat = require('gulp-concat');

gulp.task('sass', function(done){

    gulp.src('src/sass/**/*.scss')
      .pipe(sass({outputStyle: 'compressed'}))
      .pipe(gulp.dest('src/dist'))

      done();
  });

// gulp.task('scripts', function(done){

//     gulp.src('public/javascripts/**/*.js')
//         .pipe(concat('scripts.js'))
//         .pipe(uglify())
//         .pipe(gulp.dest('public/javascripts'))

//         done();
// });


gulp.task('watch', function(done){
    gulp.watch('src/sass/**/*.scss', gulp.series('sass') )
    // gulp.watch('public/javascripts/**/*.js', gulp.series('scripts') )
    done();
})