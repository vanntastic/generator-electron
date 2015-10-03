'use strict';
var superb = require('superb');
var normalizeUrl = require('normalize-url');
var humanizeUrl = require('humanize-url');
var yeoman = require('yeoman-generator');
var _s = require('underscore.string');
var mkdirp = require('mkdirp');

module.exports = yeoman.generators.Base.extend({
    init: function() {
        var cb = this.async();

        this.prompt([
	        {
	            name: 'appName',
	            message: 'What do you want to name your app?',
	            default: this.appname.replace(/\s/g, '-'),
	            filter: function(val) {
	                return _s.slugify(val);
	            }
	        },
	        {
	            name: 'githubUsername',
	            message: 'What is your GitHub username?',
	            store: true,
	            validate: function(val) {
	                return val.length > 0 ? true : 'You have to provide a username';
	            }
	        },
	        {
	            name: 'website',
	            message: 'What is the URL of your website?',
	            store: true,
	            validate: function(val) {
	                return val.length > 0 ? true : 'You have to provide a website URL';
	            },
	            filter: function(val) {
	                return normalizeUrl(val);
	            }
	        },
	        {
	        	name: 'includeExtras',
	        	message: 'Would you like to use sass, babel, webpack, and browsersync (y/N)?',
	        	type: 'confirm',
	        	default: false
	        }
        ], function(props) {
            var tpl = {
                appName: props.appName,
                classifiedAppName: _s.classify(props.appName),
                githubUsername: props.githubUsername,
                name: this.user.git.name(),
                email: this.user.git.email(),
                website: props.website,
                humanizedWebsite: humanizeUrl(props.website),
                includeExtras: props.includeExtras,
                superb: superb()
            };

            var mv = function(from, to) {
                this.fs.move(this.destinationPath(from), this.destinationPath(to));
            }.bind(this);

            this.fs.copyTpl(this.templatePath() + '/**', this.destinationPath(), tpl);
            mv('editorconfig', '.editorconfig');
            mv('gitattributes', '.gitattributes');
            mv('gitignore', '.gitignore');
            mv('_package.json', 'package.json');
            if (props.includeExtras) {
            	var newPaths = this.destinationPath() + "/src/styles";
            	mkdirp.sync(newPaths);
            	mv('_webpack.config.js', 'webpack.config.js');
            	mv("main.js", this.destinationPath() + "/src/main.js");
            	mv("index.scss", this.destinationPath() + "/src/styles/index.scss");
            };

            cb();
        }.bind(this));
    },
    install: function() {
        this.installDependencies({
            bower: false
        });
    }
});
