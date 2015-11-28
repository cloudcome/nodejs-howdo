/**
 * 文件描述
 * @author ydr.me
 * @create 2015-11-27 10:23
 */


'use strict';

var assert = require('assert');
var howdo = require('../howdo.js');

var utils = require('./_utils.js');

var async = function (callback) {
    var index = this.index;
    var timeout = utils.random(300, 900);

    this.timeId = setTimeout(function () {
        var value = Math.random();
        console.log('[' + index + ']', value);
        callback(null, value);
    }, timeout);
};

var abort = function () {
    console.log('中止任务', this.index);
    clearTimeout(this.timeId);
};

describe('until', function () {
    it('follow', function (done) {
        howdo
            .task(async)
            .until(function (value) {
                return value > 0.8;
            })
            .follow()
            .try(function (value) {
                console.log('follow', '=', value);
                assert.equal(value > 0.8, true);
                done();
            });
    });

    it('together', function (done) {
        howdo
            .task(async)
            .abort(abort)
            .task(async)
            .abort(abort)
            .task(async)
            .abort(abort)
            .task(async)
            .abort(abort)
            .task(async)
            .abort(abort)
            .task(async)
            .abort(abort)
            .task(async)
            .abort(abort)
            .task(async)
            .abort(abort)
            .task(async)
            .abort(abort)
            .task(async)
            .abort(abort)
            .task(async)
            .until(function (value) {
                return value > 0.8;
            })
            .together()
            .try(function (value) {
                if (value) {
                    console.log('together', '=', value);
                    assert.equal(value > 0.8, true);
                } else {
                    console.log('together fail');
                }

                setTimeout(function () {
                    done();
                }, 1000);
            });
    });
});


