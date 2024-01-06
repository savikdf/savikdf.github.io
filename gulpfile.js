const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
// var uglify = require('gulp-uglify');
// var concat = require('gulp-concat');

gulp.task('sass', function(done){

    gulp.src('src/sass/**/*.scss')
      .pipe(sass({outputStyle: 'compressed'}))
      .on('error', swallowError)
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
function swallowError (error) {

  // If you want details of the error in the console
  console.log(error.toString())

  this.emit('end')
}

gulp.task('default', function(done){
    gulp.watch('src/sass/**/*.scss', gulp.series('sass') )
    // gulp.watch('public/javascripts/**/*.js', gulp.series('scripts') )
    done();
})