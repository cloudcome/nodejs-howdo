/**
 * 文件描述
 * @author ydr.me
 * @create 2015-11-27 10:23
 */


'use strict';

var assert = require('assert');
var howdo = require('../howdo.js');

var utils = require('./_utils.js');


describe('together', function () {
    it('no each', function (done) {
        howdo
            .task(utils.async(null, 1))
            .task(utils.async(null, 2))
            .task(utils.async(null, 3))
            .task(utils.async(null, 4))
            .together(function () {
                var value = utils.togetherValue(arguments);
                assert.equal(value, 10);
                done();
            });
    });
    it('each', function (done) {
        howdo
            .each(new Array(4), function (index, value, next) {
                utils.async(null, index)(next);
            })
            .together(function () {
                var value = utils.togetherValue(arguments);
                assert.equal(value, 6);
                done();
            });
    });
});


