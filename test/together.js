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

    it('rollback', function (done) {
        var a = 1;
        howdo
            .task(function (done) {
                this.timeid = setTimeout(function () {
                    a += 1;
                    console.log('任务1失败');
                    done(new Error(''), 1);
                }, 100);
            })
            .rollback(function () {
                console.log('回退任务1');
                a -= 1;
            })
            .abort(function () {
                console.log('中止任务1');
                clearTimeout(this.timeid);
            })
            .task(function (done) {
                this.timeid = setTimeout(function () {
                    a += 2;
                    done(null, 2);
                }, 200);
            })
            .rollback(function () {
                console.log('回退任务2');
                a -= 2;
            })
            .abort(function () {
                console.log('中止任务2');
                clearTimeout(this.timeid);
            })
            .task(function (done) {
                this.timeid = setTimeout(function () {
                    a += 3;
                    done(null, 3);
                }, 300);
            })
            .rollback(function () {
                console.log('回退任务3');
                a -= 3;
            })
            .abort(function () {
                console.log('中止任务3');
                clearTimeout(this.timeid);
            })
            .together(function () {
                setTimeout(function () {
                    assert.equal(a, 1);
                    done();
                }, 1000);
            });
    });
});



var a = 1;

howdo
    .task(function(next){
        this.timeid = setTimeout(function(){
            a++;
            next(new Error('任务1出错'));
        }, 100);
    })
    .rollback(function(){
        a--;
    })
    .task(function(next){
        this.timeid = setTimeout(function(){
            a++;
            next(new Error('任务2出错'));
        }, 200);
    })
    .abort(function(){
        clearTimeout(this.timeid);
    })
    .together(function(){
        console.log(a === 1);
    });