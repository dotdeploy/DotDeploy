'use strict';

module.exports = function(grunt) {
    var MEDIA_ROOT = 'resources/public/',
        CSS_ROOT = MEDIA_ROOT + 'css/';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: [
                'Gruntfile.js',
                'resources/public/js/*.js',
            ],
            options: {
                jshintrc: '.jshintrc'
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
                MEDIA_ROOT + 'static/*.html'
            ],
            tasks: ['default']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', [
        'jshint',
        'sass'
    ]);

};