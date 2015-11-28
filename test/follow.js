/**
 * 文件描述
 * @author ydr.me
 * @create 2015-11-27 10:23
 */


'use strict';

var assert = require('assert');
var howdo = require('../howdo.js');

var utils = require('./_utils.js');


describe('follow', function () {
    it('no each', function (done) {
        howdo
            .task(utils.async(1))
            .task(utils.async(2))
            .task(utils.async(3))
            .task(utils.async(4))
            .follow()
            .try(function (value) {
                assert.equal(value, 4);
                done();
            });
    });

    it('each', function (done) {
        howdo
            .each(new Array(4), function (index, value, next) {
                utils.async(index + 1)(next);
            })
            .follow()
            .try(function (value) {
                assert.equal(value, 4);
                done();
            });
    });

    it('rollback', function (done) {
        var a = 1;

        howdo
            .task(function (next) {
                a++;
                next();
            })
            .rollback(function () {
                console.log('rollback', 1);
                a--;
            })
            .task(function (next) {
                setTimeout(function () {
                    next(new Error(''));
                }, 1000);
            })
            .follow(function () {
                setTimeout(function () {
                    assert.equal(a, 1);
                    done();
                });
            });
    });
});


