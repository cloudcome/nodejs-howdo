// 跟着做

var async = require('./async.js');
var howdo = require('../howdo.js');

howdo
// 第1步
.task(function(next) {
    console.log('###########################################################');
    console.log('正在做任务第1步...');
    async('任务第1步', function(e) {
        if (e) {
            console.log('任务第1步做错了。')
        } else {
            console.log('任务第1步做对了，上交的值为：1,2,3');
        }
        next(e, 1, 2, 3);
    });
})

// 第2步
.task(function(next, data1, data2, data3) {
    console.log('\r\n###########################################################');
    console.log('正在做任务第2步...');
    console.log('拿到任务第1步的值为：' + data1 +'，' + data2+'，'+data3);
    async('任务第2步', function(e) {
        if (e) {
            console.log('任务第2步做错了。')
        } else {
            console.log('任务第2步做对了，上交的值为：4');
        }
        next(e, 4);
    });
})

// 第3步
.follow(function(e, data4) {
    console.log('\r\n###########################################################');
    if (e) {
        console.log('follow失败：' + e.message);
    } else {
        console.log('follow成功：拿到的数据应该为：4，实际值为：' + data4);
    }
});
