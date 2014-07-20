// 如何做，一个简易的异步流程控制
// 示例参考 ./test 下的文件





// 构造函数
var Howdo = function() {
    this.queue = [];
};


// 分配任务
Howdo.prototype.task = function(task) {
    this.queue.push(task);
    return this;
};



// 一起做
Howdo.prototype.together = function(callback) {
    var _this = this;
    var count = this.queue.length;
    var hasCallback = false;
    var datas = new Array(count)
    this.queue.forEach(function(task, index) {
        var fn = function(e, data) {
            datas[index] = data;
            if (!hasCallback) {
                if (e) {
                    hasCallback = true;
                    datas.unshift(e);
                    callback.apply(_this, datas);
                } else {
                    count--;
                    if (count === 0) {
                        hasCallback = true;
                        datas.unshift(e);
                        callback.apply(_this, datas);
                    }
                }
            }
        };
        task.call(_this, fn.bind(_this));
    });
};



// 跟着做
Howdo.prototype.follow = function(callback) {
    var _this = this;
    var current = 0;
    var count = this.queue.length;
    var prevData;
    (function _follow() {
        var task = _this.queue[current];
        var fn = function(e, data) {
            // 出错即终止
            if (e) {
                callback.call(_this, e, data);
            }
            // 正确执行下一个
            else {
                // 上一步的结果，即为传入下一步的参数
                prevData = data;
                current++;
                if (current === count) {
                    callback.call(_this, e, data);
                } else {
                    _follow();
                }
            }
        };

        task.call(_this, fn.bind(_this), prevData);
    })();
};



module.exports = Howdo;
