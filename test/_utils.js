/**
 * 文件描述
 * @author ydr.me
 * @create 2015-11-27 10:21
 */


'use strict';


exports.random = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

exports.async = function (value) {
    return function (callback) {
        var timeout = exports.random(300, 500);
        setTimeout(function () {
            console.log('[' + timeout + ']', value);
            callback(null, value);
        }, timeout);
    };
}
