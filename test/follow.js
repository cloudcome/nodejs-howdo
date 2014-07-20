// 跟着做

var Howdo = require('../index.js');
var howdo = new Howdo();

howdo.task(function(next) {
    console.log('////////////////////////////////////////////////////////////////');
    console.log('正在做任务第1步...');
    async('任务第1步', function(e, data) {
        // do something
        if (e) {
            console.log('任务第1步做错了。')
        } else {
            console.log('任务第1步做对了，上交的值为：' + data);
        }
        // 做完了，按照格式传给下一个任务
        // 参数1：错误对象
        // 参数2：做完的结果，最大只允许接收1个结果
        next(e, data);
    });
});

howdo.task(function(next, data1) {
    console.log('\r\n////////////////////////////////////////////////////////////////');
    console.log('正在做任务第2步...');
    console.log('拿到任务第1步的值为：' + data1);
    async('任务第2步', function(e, data) {
        // do something
        if (e) {
            console.log('任务第2步做错了。')
        } else {
            console.log('任务第2步做对了，上交的值为：' + (data + data1));
        }
        // 做完了，按照格式传给下一个任务
        // 参数1：错误对象
        // 参数2：做完的结果，最大只允许接收1个结果
        next(e, data + data1);
    });
});

howdo.task(function(next, data2) {
    console.log('\r\n////////////////////////////////////////////////////////////////');
    console.log('正在做任务第3步...');
    console.log('拿到任务第2步的值为：' + data2);
    async('任务第3步', function(e, data) {
        // do something
        if (e) {
            console.log('任务第3步做错了。')
        } else {
            console.log('任务第3步做对了，上交的值为：' + (data + data2));
        }
        // 做完了，按照格式传给下一个任务
        // 参数1：错误对象
        // 参数2：做完的结果，最大只允许接收1个结果
        next(e, data + data2);
    });
});


howdo.follow(function(e, data) {
    console.log('\r\n////////////////////////////////////////////////////////////////');
    if (e) {
        console.log('follow失败：' + e.message);
    } else {
        console.log('follow成功：拿到的数据为 = ' + data);
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
