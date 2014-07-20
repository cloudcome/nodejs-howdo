// 一起做

var Howdo = require('../index.js');
var howdo = new Howdo();

howdo.task(function(done) {
    console.log('任务1正在做...');
    async('任务1', function(e, data) {
        // do something else
        if (e) {
            console.log('任务1做错了');
        } else {
            console.log('任务1做对了，给的值是' + data);
        }
        // 做完了，按照格式上交
        // 参数1：错误对象
        // 参数2：做完的结果，最大只允许接收1个结果
        done(e, data);
    });
});

howdo.task(function(done) {
    console.log('任务2正在做...');
    async('任务2', function(e, data) {
        // do something else
        if (e) {
            console.log('任务2做错了');
        } else {
            console.log('任务2做对了，给的值是' + data);
        }
        // 做完了，按照格式上交
        // 参数1：错误对象
        // 参数2：做完的结果，最大只允许接收1个结果
        done(e, data);
    });
});

howdo.task(function(done) {
    console.log('任务3正在做...');
    async('任务3', function(e, data) {
        // do something else
        if (e) {
            console.log('任务3做错了');
        } else {
            console.log('任务3做对了，给的值是' + data);
        }
        // 做完了，按照格式上交
        // 参数1：错误对象
        // 参数2：做完的结果，最大只允许接收1个结果
        done(e, data);
    });
});


howdo.together(function(e, data1, data2, data3) {
    console.log('\r\n////////////////////////////////////////////////////////////////');
    if (e) {
        console.log('together失败：' + e.message);
    } else {
        console.log('together成功：拿到的数据分别为 = ' + [data1, data2, data3].join(','));
    }
});








// ===========================================================================
// ============================[ private ]====================================
// ===========================================================================


// 定义一个异步函数

function async(name, callback) {
    // 500 - 1000ms
    var timeout = randomNumber(500, 1000);
    setTimeout(function() {
        var e = timeout > 900 ? new Error(name + '做错了') : null;
        // var e = null;
        // var e = new Error(name + '做错了');
        callback(e, timeout);
    }, timeout);
}

// 随机值

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
