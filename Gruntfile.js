'use strict';

module.exports = function(grunt) {
    var MEDIA_ROOT = 'resources/public/',
        CSS_ROOT = MEDIA_ROOT + 'css/',
        JS_ROOT = MEDIA_ROOT + 'js/',
        PARTIALS_ROOT = MEDIA_ROOT + 'partials/';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: [
                'Gruntfile.js',
                JS_ROOT + '/src/*.js',
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        browserify: {
            compile: {
                options: {
                    bundleOptions: {
                        debug: true
                    }
                },
                src: [JS_ROOT + 'src/main.js'],
                dest: JS_ROOT + 'main.js'
            }
        },
        ngtemplates: {
            compile: {
                src: PARTIALS_ROOT + '*.html',
                dest: JS_ROOT + 'partials.js',
                options: {
                    htmlmin: {
                        collapseBooleanAttributes: false,
                        collapseWhitespace: true,
                        removeAttributeQuotes: false,
                        removeComments: true,
                        removeEmptyAttributes: false,
                        removeRedundantAttributes: false,
                        removeScriptTypeAttributes: false,
                        removeStyleLinkTypeAttributes: false
                    },
                    module: 'dotdeploy',
                    url: function(path) {
                        return path.split('/').pop();
                    }
                }
            }
        },
        sass: {
            compile: {
                options: {
                    style: 'expanded'
                },
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: './',
                    src: [CSS_ROOT + 'src/*.scss'],
                    dest: CSS_ROOT,
                    ext: '.css'
                }]
            }
        },
        watch: {
            files: [
                '<%= jshint.files %>',
                CSS_ROOT + 'src/*.scss',
                MEDIA_ROOT + '**/*.html'
            ],
            tasks: ['default']
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-angular-templates');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', [
        'jshint',
        'browserify:compile',
        'ngtemplates:compile',
        'sass:compile'
    ]);

};