'use strict';

// Declare imports
const _ = require('lodash');
const PostmenError = require('./error/error');
const ErrorEnum = require('./error/error_enum');

// Global variable
const methods = ['GET', 'POST', 'DELETE', 'PUT'];

// Payload class
class Payload {
	/**
     * Function to create the request_object and other information
     *
	 * @param postmen {postmen} - the postmen object
	 * @param method {string} - get, post, put or delete
     * @param path {string} - pathname for URL
	 * @param options {object}
     *	body {object} - POST body
     *	query {object} - query object
	 *	retry {boolean} - Retry if fail? override this.retry if set
	 *	raw {boolean} - if true, return string, else return object, default false
	 * @return the payload object with properities below
	 * 	{
	 *		request_object {object} - object to create request
	 *		retry {boolean} - retry flag
	 *		raw {boolean} - response with string or not
 	 *	}
     */
	constructor(postmen, method, path, options) {
		this._errorHandling(method, path, options);

		options = options || {};
		// Request object
		let request_object = {
			headers: {
				'postmen-api-key': postmen.api_key,
				'Content-Type': 'application/json',
				'x-postmen-agent': 'LANGUAGE-sdk-VERSION'
			},
			url: postmen.endpoint + path,
			method: method,
			body: options.body,
			qs: options.query,
			proxy: postmen.proxy,
			json: true
		};

		// Remove all null or undefined
		for (let key in request_object) {
			if (request_object[key] === null || request_object[key] === undefined) {
				delete request_object[key];
			}
		}

		// Payload
		let payload = {
			request_object: request_object,
			retry: _.isBoolean(options.retry) ? options.retry : postmen.retry,
			raw: _.isBoolean(options.raw) ? options.raw : false
		};

		// Add retry count if needed
		if (payload.retry) {
			payload.retry_count = 0;
		}

		return payload;
	}

	/**
     * Error Handling function
	 * Throw error if the input param contain incorrect type
     *
     * @param method {string}
	 * @param path {path}
     * @param options {object}
     */
	_errorHandling(method, path, options) {
		// body, query, retry, raw
		if (!_.isString(method)) {
			// Verify method
			throw PostmenError.getSdkError(ErrorEnum.HandlerInvalidMethod, method);
		} else if (methods.indexOf(method.toUpperCase()) === -1) {
			// Verify method
			throw PostmenError.getSdkError(ErrorEnum.HandlerInvalidMethod, method);
		} else if (!_.isString(path)) {
			// Verify path
			throw PostmenError.getSdkError(ErrorEnum.HandlerInvalidPath, path);
		} else if (!_.isNull(options) && !_.isUndefined(options) && !_.isPlainObject(options)) {
			// Verify options
			throw PostmenError.getSdkError(ErrorEnum.HandlerInvalidOptions, options);
		}

		// Verify options value
		if (options) {
			if (!_.isNull(options.body) && !_.isUndefined(options.body) && !_.isPlainObject(options.body)) {
				// Verify body
				throw PostmenError.getSdkError(ErrorEnum.HandlerInvalidBody, options.body);
			} else if (!_.isNull(options.query) && !_.isUndefined(options.query) && !_.isPlainObject(options.query)) {
				// Verify query
				throw PostmenError.getSdkError(ErrorEnum.HandlerInvalidQuery, options.query);
			} else if (!_.isNull(options.retry) && !_.isUndefined(options.retry) && !_.isBoolean(options.retry)) {
				// Verify retry
				throw PostmenError.getSdkError(ErrorEnum.HandlerInvalidRetry, options.retry);
			} else if (!_.isNull(options.raw) && !_.isUndefined(options.raw) && !_.isBoolean(options.raw)) {
				// Verify raw
				throw PostmenError.getSdkError(ErrorEnum.HandlerInvalidRaw, options.raw);
			}
		}
	}
}

// Exports the constructor
module.exports = function (api_key, endpoint, proxy, retry) {
	return new Payload(api_key, endpoint, proxy, retry);
};
