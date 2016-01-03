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
            if (callback(i, object[i]) === false) {
                break;
            }
        }
    } else if (typeof object === "object") {
        for (i in object) {
            if (object.hasOwnProperty && object.hasOwnProperty(i)) {
                if (callback(i, object[i]) === false) {
                    break;
                }
            } else {
                if (callback(i, object[i]) === false) {
                    break;
                }
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

    the._executed = false;
    the._ignoreErr = false;
    the._taskIndex = -1;
    the._taskList = [];
    the._tryCallbackList = [];
    the._catchCallbackList = [];
    the._contextList = [];
    the._allCallback = null;
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

        the._taskIndex++;
        the._taskList.push(fn);
        the._contextList.push({
            index: the._taskIndex,
            task: fn
        });

        return the;
    },


    /**
     * 添加任务回退方法
     * @param rollback {Function} 回退、中止方法
     * @returns {Howdo}
     */
    rollback: function (rollback) {
        var the = this;

        if (the._taskIndex > -1 && isFunction(rollback)) {
            the._contextList[the._taskIndex].rollback = rollback;
        }

        return the;
    },


    /**
     * 添加任务回退方法
     * @param abort {Function} 回退、中止方法
     * @returns {Howdo}
     */
    abort: function (abort) {
        var the = this;

        if (the._taskIndex > -1 && isFunction(abort)) {
            the._contextList[the._taskIndex].abort = abort;
        }

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

        if (the._executed) {
            return the;
        }

        if (!isFunction(callback)) {
            callback = noop;
        }

        the._allCallback = callback;
        the._executed = true;

        var current = 0;
        var count = the._taskList.length;
        var args = [];
        // 串行回退已成功的任务
        var rollbackTask = function () {
            each(the._contextList, function (index, context) {
                if (!context) {
                    return false;
                }

                if (!context.error && isFunction(context.rollback)) {
                    context.rollback.call(context);
                    context.error = null;
                }
            });
        };

        nextTick(function () {
            if (!count) {
                the._fixCallback();
                return the;
            }

            (function _follow() {
                var fn = function () {
                    args = slice.call(arguments);
                    var error = args[0];

                    // has error
                    if (error && !the._ignoreErr) {
                        context.error = error;
                        rollbackTask();
                        return the._fixCallback(error);
                    }

                    current++;

                    var canStop = false;

                    if (the._untilCondition) {
                        // 一轮任务完成
                        if (current === count) {
                            canStop = the._untilCondition.apply(_global, args.slice(1));
                            current += canStop ? 0 : -count;
                        }
                    } else {
                        canStop = current === count;
                    }

                    if (canStop) {
                        rollbackTask();
                        the._fixCallback.apply(the, args);
                    } else if (current < count) {
                        args.shift();
                        _follow();
                    }
                };

                args.unshift(fn);
                var task = the._taskList[current];
                var context = the._contextList[current];
                task.apply(context, args);
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

        if (the._executed) {
            return;
        }

        if (!isFunction(callback)) {
            callback = noop;
        }

        the._allCallback = callback;
        the._executed = true;

        var doneLength = 0;
        var count = the._taskList.length;
        var taskData = [];
        var hasCallback = false;
        var i = 0;

        // 中止未完成的 task
        var abortTask = function () {
            hasCallback = true;
            each(the._contextList, function (index, context) {
                if (!context.done && isFunction(context.abort)) {
                    context.abort.call(context);
                }
            });
        };

        // 回退已经完成的 task
        var rollbackTask = function () {
            each(the._contextList, function (index, context) {
                if (context.done && isFunction(context.rollback)) {
                    context.rollback.call(context);
                }
            });
        };

        nextTick(function () {
            if (!count) {
                hasCallback = true;
                the._fixCallback();
                return the;
            }

            for (; i < count; i++) {
                _doTask(i, the._taskList[i]);
            }

            function _doTask(index, task) {
                var context = the._contextList[index];
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
                        abortTask();
                        rollbackTask();
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
                            abortTask();
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
                            abortTask();
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
            the._tryCallbackList.push(callback);
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
            the._catchCallbackList.push(callback);
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
            return each(the._catchCallbackList, function (i, callback) {
                callback.call(_global, err);
            });
        }

        each(the._tryCallbackList, function (i, callback) {
            callback.apply(_global, args);
        });
    }
};

//Howdo.prototype.serial = Howdo.prototype.follow;
//Howdo.prototype.parallel = Howdo.prototype.together;
