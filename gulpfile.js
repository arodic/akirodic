'use strict';

// Include Gulp & tools we'll use
var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;


// Watch Files For Changes & Reload
gulp.task('serve', function () {
  browserSync({
    port: 3000,
    notify: false,
    open: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function (snippet) {
          return snippet;
        }
      }
    },
    server: {
      baseDir: ['app']
    }
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/**/*.css'], reload);
  gulp.watch(['app/**/*.js'], reload);
  gulp.watch(['app/**/*.dae'], reload);
});

// Build production files, the default task
gulp.task('default', ['serve']);
