module.exports = function( grunt ){
  require('matchdep').filterDev('*').forEach(grunt.loadNpmTasks);
	var sassPaths =  [[require('node-bourbon').includePaths].concat( require('node-neat').includePaths )].concat(require('node-reset-scss').includePath);

	var options = {
		watch:{
			dev:{
				files:[ 'app/src/**/*.js', 'app/sass/**/*.scss' ],
				tasks:[ 'browserify:dev', 'sass:dev' ]
			
			}
		},
		
		bower:{
			dev:{
				dest:'public/js/vendor/',
				options:{
					keepExpandedHierarchy: false
				}
			}
		},
		
		browserify:{
			dist:{
			},
			dev:{
				files:{
					'public/js/main.js' : [ 'app/src/app.js']
				},
				transform:['browserify-shim','debowerify']
			}
		},

		sass:{
			options:{
				includePaths: sassPaths
			},
			dist:{},
			dev:{
				files:{
					'public/css/main.css': ['app/sass/main.scss']
				}
			}
		},
		
		nodemon:{
			dev:{
				options:{
					file: './app/index.js',
					ignoredFiles: ['*.md', 'node_modules/**','app/js/**', 'app/sass/**', 'public/**'],
					delayTime:0,
					cwd: __dirname
					
				}
			}
		},
		
		concurrent:{
			dev:{
				tasks:['nodemon', 'watch:dev']
			},
			options:{
				logConcurrentOutput:true
			}
		}
	};

	grunt.initConfig(options);

	grunt.registerTask('dev', [ 'browserify:dev', 'sass:dev', 'bower:dev', 'concurrent:dev']);
};
