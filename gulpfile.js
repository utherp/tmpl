'use strict';

var gulp = require('gulp');

//////////////////////////////////////////////////
// Configuration Variables
//////////////////////////////////////////////////

// environment mode
var env = 'dev',
  sourceDir = 'src',
  destDir = 'build',
  bowerDir  = './bower_components',
  bx_componentsDir = bowerDir + '/bluemix-components/consumables',

  // autoprefixer configuration
  autoprefixer = {
    browsers: ['> 1%', 'last 2 versions'],
    cascade: true,
    remove: true
  },

  // source directories (source files defined below)
  srcs = [
    bx_componentsDir + '/js/es2015/index.js',
    bowerDir + '/jquery/js/**/*.js',
    sourceDir + '/**/*.js',
    '!' + sourceDir + '/.*'
  ];


//////////////////////////////////////////////////
// Module Requirements
//////////////////////////////////////////////////

//////////////////////////////////////////////////
// a simple on-demand loader... 
// because gulp is so f*%$*% slow
//////////////////////////////////////////////////
var __req_ondemand = (function () {
  var load_all = function(list) {
    for (var n in list) {
      if (list[n] instanceof Function) continue;
      if (!this[list[n]])
        this[list[n]] = require(list[n]);

      list[n] = this[list[n]];
    }
    return list;
  }.bind({});

  return function (__req, cb) {
    var req = {}, hook = cb;

    if (!(__req instanceof Object) && __req) req[__req] = __req;
    else if (__req instanceof Array) __req.forEach((n) => (req[n] = n));
    else req = __req;

    return function () { return hook(load_all(req), ...arguments); }
  };
})();

var __del = __req_ondemand({ del: 'del' }, (r, paths) => (r.del(paths)));


//////////////////////////////////////////////////
// Tasks
//////////////////////////////////////////////////

/**** Default Task ********************/
gulp.task('default', ['build']);

gulp.task('build', [ 'build:scripts' ], (cb) => (cb()));
gulp.task('clean', [ 'clean:scripts' ], (cb) => (cb()));

/**** Clean Scripts *******************/
gulp.task('clean:scripts', __del.bind(null, [destDir]));

/**** Minify Scripts *******************/
gulp.task('build:scripts', ['clean:scripts', 'fetch:bower'], __req_ondemand(
  {
    webpack: 'webpack-stream',
    webpackConfig: './webpack.config.js',
    gulpif: 'gulp-if',
  },
  (r) => (
    gulp.src(srcs)
    .pipe(r.webpack(r.webpackConfig))
    .pipe(gulp.dest(destDir))
  )
));

/**** Retrieve Bower Assets ************/
gulp.task('fetch:bower', __req_ondemand({bower: 'gulp-bower'}, function(r) { return r.bower.apply(this, [...arguments]); }));


