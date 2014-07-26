// 定义1个异步函数
// 2014年7月26日22:35:00

module.exports = function(name, callback) {
    // 500 - 1000ms
    var timeout = randomNumber(500, 1000);
    setTimeout(function() {
        var e = timeout > 950 ? new Error(name + '做错了') : null;
        callback(e);
    }, timeout);
};



// ===========================================================================
// ============================[ private ]====================================
// ===========================================================================


// 随机值

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}