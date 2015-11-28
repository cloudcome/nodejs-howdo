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
            .task(utils.async(1))
            .task(utils.async(2))
            .task(utils.async(3))
            .task(utils.async(4))
            .together()
            .try(function (val1, val2, val3, val4) {
                assert.equal(val1, 1);
                assert.equal(val2, 2);
                assert.equal(val3, 3);
                assert.equal(val4, 4);
                done();
            });
    });
    it('each', function (done) {
        howdo
            .each(new Array(4), function (index, value, next) {
                utils.async(index + 1)(next);
            })
            .together()
            .try(function (val1, val2, val3, val4) {
                assert.equal(val1, 1);
                assert.equal(val2, 2);
                assert.equal(val3, 3);
                assert.equal(val4, 4);
                done();
            });
    });
});


