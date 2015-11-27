/**
 * 文件描述
 * @author ydr.me
 * @create 2015-11-27 10:21
 */


'use strict';


/**
 * 模拟异步
 * @param err
 * @param value
 * @returns {Function}
 */
exports.async = function (err, value) {
    return function (callback, prevValue) {
        var timeout = Math.round(300 + Math.random() * 300);

        prevValue = prevValue === undefined ? 0 : prevValue;
        setTimeout(function () {
            console.log('[' + timeout + 'ms]',
                'prevValue', '=', prevValue, ',',
                'value', '=', value, ',',
                'nextValue', '=', prevValue, '+', value, '=', prevValue + value);
            callback(err ? new Error('async error') : null, value + prevValue);
        }, timeout);
    };
};


/**
 * 合并取值
 * @param args
 * @returns {number}
 */
exports.togetherValue = function (args) {
    args = [].slice.call(args).slice(0);
    var ret = 0;

    args.forEach(function (value) {
        ret += value;
    });

    return ret;
};

