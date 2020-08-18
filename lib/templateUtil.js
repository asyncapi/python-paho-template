// This contains functions taht are common to both the all.js filter and the post-process.js hook.
var _ = require('lodash');

class TemplateUtil {

	// This returns a valid Python class name.
	getClassName(name) {
		let ret = this.getIdentifierName(name);
		return _.upperFirst(ret);
	}

	// This returns a valid Python identifier name.
	getIdentifierName(name) {
		let ret = _.camelCase(name);

		if (TemplateUtil.reservedWords.has(ret)) {
			ret = '_' + ret;
		}

		return ret;
	}

	// This returns the value of a param, or specification extention if the param isn't set. 
	// If neither is set and the required flag is true, it throws an error.
	getParamOrExtension(info, params, paramName, extensionName, description, example, required) {
		let ret = '';
		if (params[paramName]) {
			ret = params[paramName];
		} else if (info.extensions()[extensionName]) {
			ret = info.extensions()[extensionName];
		} else if (required) {
			throw new Error(`Can't determine the ${description}. Please set the param ${paramName} or info.${extensionName}. Example: ${example}`);
		}
		return ret;
	}

	// This returns the value of a param, or specification extention if the param isn't set. 
	// If neither is set it returns defaultValue.
	getParamOrDefault(info, params, paramName, extensionName, defaultValue) {
		let ret = '';
		if (params[paramName]) {
			ret = params[paramName];
		} else if (info.extensions()[extensionName]) {
			ret = info.extensions()[extensionName];
		} else {
			ret = defaultValue;
		}
		return ret;
	}

	/*
	By default, the 'view' is 'client', which means that when the doc says subscribe, we publish.
	By setting the view to 'provider', when the doc says subscribe, we subscribe.
	*/
	isProvidererView(info, params) {
    let view = this.getParamOrDefault(info, params, 'view', 'x-view', 'client');
		return view === 'provider';
	}

	getRealPublisher(info, params, channel) {
		let isProvider = this.isProvidererView(info, params);
		return isProvider ? channel.publish() : channel.subscribe();
	}

	getRealSubscriber(info, params, channel) {
		let isProvider = this.isProvidererView(info, params);
		return isProvider ? channel.subscribe() : channel.publish();
	}

	// This returns the first mqtt server we can find in the document.
	getServer(asyncapi) {
		let ret = 'None';
		let servers = asyncapi.servers();
		for (const name in servers) {
			let server = asyncapi.server(name);
			if (server.protocol() === 'mqtt') {
				let url = server.url();
				let i = url.lastIndexOf('/');
				ret = url.substring(i + 1);
				//console.log("getServer: " + url + " " + i + " " + ret);
				break;
			}
		}
		return ret;
	}

}

// This is the set of Python reserved words, to ensure that we don't generate reserved words.
TemplateUtil.reservedWords = new Set();
TemplateUtil.reservedWords.add('and');
TemplateUtil.reservedWords.add('as');
TemplateUtil.reservedWords.add('assert');
TemplateUtil.reservedWords.add('break');
TemplateUtil.reservedWords.add('class');
TemplateUtil.reservedWords.add('const');
TemplateUtil.reservedWords.add('continue');
TemplateUtil.reservedWords.add('def');
TemplateUtil.reservedWords.add('del');
TemplateUtil.reservedWords.add('elif');
TemplateUtil.reservedWords.add('else');
TemplateUtil.reservedWords.add('except');
TemplateUtil.reservedWords.add('exec');
TemplateUtil.reservedWords.add('finally');
TemplateUtil.reservedWords.add('for');
TemplateUtil.reservedWords.add('from');
TemplateUtil.reservedWords.add('global');
TemplateUtil.reservedWords.add('if');
TemplateUtil.reservedWords.add('import');
TemplateUtil.reservedWords.add('in');
TemplateUtil.reservedWords.add('is');
TemplateUtil.reservedWords.add('lamda');
TemplateUtil.reservedWords.add('not');
TemplateUtil.reservedWords.add('or');
TemplateUtil.reservedWords.add('pass');
TemplateUtil.reservedWords.add('print');
TemplateUtil.reservedWords.add('raise');
TemplateUtil.reservedWords.add('return');
TemplateUtil.reservedWords.add('try');
TemplateUtil.reservedWords.add('while');
TemplateUtil.reservedWords.add('with');
TemplateUtil.reservedWords.add('yield');

module.exports = TemplateUtil;
