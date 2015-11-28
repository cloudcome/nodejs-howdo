/**
 * Howdo
 * 适应了 global 与 window
 * @author ydr.me
 * @create 2014年7月26日19:28:27
 * @update 2014年8月26日13:09:31
 * @update 2014年10月24日00:24:32
 * @update 2015年02月04日11:42:57
 * @update 2015年07月01日17:35:20
 * @update 2015年11月27日10:57:12@3.0.0
 */


'use strict';

var _global = typeof window !== 'undefined' ? window : global;
var slice = Array.prototype.slice;
var noop = function () {
    // ignore
};
/**
 * 判断是否为函数
 * @param obj
 * @returns {boolean}
 */
var isFunction = function (obj) {
    return typeof obj === 'function';
};


/**
 * 遍历
 * @param object
 * @param callback
 */
var each = function (object, callback) {
    var i;
    var j;

    if (object && object.constructor === Array) {
        for (i = 0, j = object.length; i < j; i++) {
            callback(i, object[i]);
        }
    } else if (typeof object === "object") {
        for (i in object) {
            if (object.hasOwnProperty && object.hasOwnProperty(i)) {
                callback(i, object[i]);
            } else {
                callback(i, object[i]);
            }
        }
    }
};

/**
 * 下一次
 * @param callback
 */
var nextTick = function (callback) {
    setTimeout(callback, 0);
};

module.exports = {
    task: function () {
        if (this.constructor === Howdo) {
            return this;
        }

        var args = slice.call(arguments);
        var howdo = new Howdo();

        return howdo.task.apply(howdo, args);
    },
    each: function () {
        if (this.constructor === Howdo) {
            return this;
        }

        var args = slice.call(arguments);
        var howdo = new Howdo();

        return howdo.each.apply(howdo, args);
    }
};


//////////////////////////////////////////////////////////////////////
/////////////////////////[ constructor ]//////////////////////////////
//////////////////////////////////////////////////////////////////////

// 构造函数
function Howdo() {
    var the = this;

    // 任务队列
    the.tasks = [];
    // 是否已经开始执行任务了
    the.hasStart = false;
    // 标识任务序号
    the.index = 0;
    the._tryCallbacks = [];
    the._catchCallbacks = [];
    the._allCallback = null;
    the._ignoreErr = false;
}

Howdo.prototype = {
    constructor: Howdo,

    /**
     * 单次分配任务
     * @param {Function} fn 任务函数
     * @return Howdo
     * @chainable
     */
    task: function (fn) {
        var the = this;

        if (!isFunction(fn)) {
            throw new TypeError('howdo `task` must be a function');
        }

        fn.index = the.index++;
        the.tasks.push(fn);

        return the;
    },


    /**
     * 直到 结束
     * @param fn {Function} 验证函数
     * @param [ignoreError] {Boolean} 是否忽略错误
     * @returns {Howdo}
     */
    until: function (fn, ignoreError) {
        var the = this;

        if (!isFunction(fn)) {
            throw new TypeError('until `condition` must be a function');
        }

        the._untilCondition = fn;
        the._ignoreErr = ignoreError !== false;

        return the;
    },


    /**
     * 循环分配任务
     * @param  {Object}   object   对象或者数组
     * @param  {Function} callback 回调
     * @return Howdo
     */
    each: function (object, callback) {
        var howdo = this;

        each(object, task);

        function task(key, val) {
            howdo = howdo.task(function () {
                var args = [key, val];
                args = args.concat(slice.call(arguments));
                callback.apply(val, args);
            });
        }

        return howdo;
    },


    /**
     * 跟着做，任务串行执行
     * 链式结束
     * @param [callback] {Function} 回调
     */
    follow: function (callback) {
        var the = this;

        if (the.hasStart) {
            return the;
        }

        if (!isFunction(callback)) {
            callback = noop;
        }

        the._allCallback = callback;
        the.hasStart = true;

        var current = 0;
        var tasks = the.tasks;
        var count = tasks.length;
        var args = [];

        nextTick(function () {
            if (!count) {
                the._fixCallback();
                return the;
            }

            (function _follow() {
                var fn = function () {
                    args = slice.call(arguments);

                    // has error
                    if (args[0] && !the._ignoreErr) {
                        return the._fixCallback(args[0]);
                    }

                    current++;

                    var canStop = false;

                    if (the._untilCondition) {
                        canStop = the._untilCondition.apply(_global, args.slice(1));
                        current += canStop ? 0 : -1;
                    } else {
                        canStop = current === count;
                    }

                    if (canStop) {
                        the._fixCallback.apply(the, args);
                    } else if (current < count) {
                        args.shift();
                        _follow();
                    }
                };

                args.unshift(fn);
                var task = tasks[current];
                task.apply(task, args);
            })();
        });

        return the;
    },

    /**
     * 一起做，任务并行执行
     * 链式结束
     * @param [callback] {Function} 回调
     */
    together: function (callback) {
        var the = this;

        if (the.hasStart) {
            return;
        }

        if (!isFunction(callback)) {
            callback = noop;
        }

        the._allCallback = callback;
        the.hasStart = true;

        var doneLength = 0;
        var tasks = the.tasks;
        var contxtList = [];
        var count = tasks.length;
        var taskData = [];
        var hasCallback = false;
        var i = 0;

        // 中止未完成的 task
        var abortUndoneTask = function () {
            for (i = 0; i < count; i++) {
                var context = contxtList[i];

                if (!context.done && isFunction(context.abort)) {
                    context.abort.call(context);
                    context.done = true;
                }
            }
        };

        nextTick(function () {
            if (!count) {
                hasCallback = true;
                the._fixCallback();
                return the;
            }

            for (; i < count; i++) {
                contxtList[i] = {
                    index: i,
                    done: false,
                    task: tasks[i]
                };
                _doTask(i, tasks[i]);
            }

            function _doTask(index, task) {
                var context = contxtList[index];
                var fn = function () {
                    if (hasCallback) {
                        return;
                    }

                    var args = slice.call(arguments);
                    var ret = [];
                    var j = 0;

                    context.done = true;

                    // has Error
                    if (args[0] && !the._ignoreErr) {
                        hasCallback = true;
                        abortUndoneTask();
                        return the._fixCallback(args[0]);
                    }

                    var canStop = false;
                    var value = args.slice(1);

                    if (the._untilCondition) {
                        canStop = the._untilCondition.apply(_global, value);

                        if (canStop) {
                            doneLength = count;
                        } else {
                            doneLength++;
                        }

                        if (doneLength === count) {
                            if (canStop) {
                                ret = ret.concat(value);
                            }

                            ret.unshift(null);
                            abortUndoneTask();
                            hasCallback = true;
                            the._fixCallback.apply(the, ret);
                        }
                    } else {
                        doneLength++;
                        taskData[index] = value;

                        if (doneLength === count) {
                            for (; j < taskData.length; j++) {
                                ret = ret.concat(taskData[j]);
                            }

                            ret.unshift(null);
                            abortUndoneTask();
                            hasCallback = true;
                            the._fixCallback.apply(the, ret);
                        }
                    }
                };

                task.call(context, fn);
            }
        });

        return the;
    },

    /**
     * 正常回调
     * @param callback
     */
    try: function (callback) {
        var the = this;

        if (isFunction(callback)) {
            the._tryCallbacks.push(callback);
        }

        return the;
    },

    /**
     * 异常回调
     * @param callback
     */
    catch: function (callback) {
        var the = this;

        if (isFunction(callback)) {
            the._catchCallbacks.push(callback);
        }

        return the;
    },

    /**
     * 修正回调
     * @param err
     * @private
     */
    _fixCallback: function (err/*arguments*/) {
        var the = this;
        var args = slice.call(arguments, 1);

        the._allCallback.apply(_global, arguments);

        if (err) {
            return each(the._catchCallbacks, function (i, callback) {
                callback.call(_global, err);
            });
        }

        each(the._tryCallbacks, function (i, callback) {
            callback.apply(_global, args);
        });
    }
};
