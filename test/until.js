/**
 * 文件描述
 * @author ydr.me
 * @create 2015-11-27 10:23
 */


'use strict';

var assert = require('assert');
var howdo = require('../howdo.js');

var utils = require('./_utils.js');


describe('until', function () {
    it('no each', function (done) {
        howdo
            .task(function (next) {
                utils.async(null, Math.random())(next, 0);
            })
            .until(function (value) {
                return value > 0.8;
            })
            .follow(function (err, value) {
                console.log('follow', '=', value);
                assert.equal(value > 0.8, true);
            });
    });
});


