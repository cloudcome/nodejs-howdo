// 新版本
// 2014年7月26日19:28:27



function Howdo() {
    // 任务队列
    this.tasks = [];
    // 是否已经开始执行任务了
    this.hasStart = false;
}





/**
 * 单次分配任务
 * @return this
 */
Howdo.prototype.task = function(fn) {
    this.tasks.push(fn);
    return this;
};






/**
 * 循环分配任务
 * @param  {Object}   object   对象或者数组
 * @param  {Function} callback 回调
 * @return this
 */
Howdo.prototype.each = function(object, callback) {
    var howdo = this;

    if (Array.isArray(object)) {
        object.forEach(function(val, key) {
            task(key, val);
        });
    } else {
        for(var i in object){
            if(object.hasOwnProperty(i)){
                task(i, object[i]);
            }
        }
    }

    function task(key, val){
        howdo = howdo.task(function(){
            var args = [key, val];
            args = args.concat([].slice.call(arguments));
            callback.apply(val, args);
        });
    }

    return howdo;
};







/**
 * 跟着做
 * 链式结束
 */
Howdo.prototype.follow = function(callback) {
    if (this.hasStart) return;
    this.hasStart = true;

    var current = 0;
    var tasks = this.tasks;
    var count = tasks.length;
    var args = [];
    _follow();

    function _follow() {
        var fn = function() {
            args = [].slice.call(arguments);

            if (args[0] !== null && args[0] !== undefined && args[0].constructor === Error) {
                return callback.call(global, args[0]);
            }

            current++;

            if (current === count) {
                callback.apply(global, args);
            } else {
                args.shift();
                _follow();
            }
        };

        args.unshift(fn);
        tasks[current].apply(global, args);
    }
};








/**
 * 一起做
 * 链式结束
 */
Howdo.prototype.together = function(callback) {
    if (this.hasStart) return;
    this.hasStart = true;

    var done = 0;
    var tasks = this.tasks;
    var count = tasks.length;
    var data = {};
    var hasCallback = false;

    tasks.forEach(function(task, index) {
        var fn = function() {
            if (hasCallback) return;

            var args = [].slice.call(arguments);

            if (args[0] !== null && args[0] !== undefined && args[0].constructor === Error) {
                hasCallback = true;
                return callback.call(global, args[0]);
            }

            data[index] = args.slice(1);
            done++;

            if (done === count) {
                var ret = [];
                for (var i in data) {
                    ret = ret.concat(data[i]);
                }
                ret.unshift(null);
                callback.apply(global, ret);
            }
        };

        task(fn);
    });
};







module.exports.task = function() {
    if(this.constructor === Howdo) return this;

    var args = [].slice.call(arguments);
    var howdo = new Howdo();

    return howdo.task.apply(howdo, args);
};

module.exports.each = function() {
    if(this.constructor === Howdo) return this;

    var args = [].slice.call(arguments);
    var howdo = new Howdo();

    return howdo.each.apply(howdo, args);
};
