# howdo[![NPM version](https://img.shields.io/npm/v/howdo.svg?style=flat)](https://npmjs.org/package/howdo)
如何做，一个简易的异步流程控制

# 相关文章
[http://qianduanblog.com/post/nodejs-learning-17-howdo-a-simple-workflow-solutions.html](http://qianduanblog.com/post/nodejs-learning-17-howdo-a-simple-workflow-solutions.html)

* 这是一个简易的异步流程控制，API风格与NodeJs约定一致。
* API目前只有3个：`task`（分配任务）、 `together`（一起做）、`follow`（跟着做）。
* 无论任务多复杂，都可以解耦成单个独立的任务来**一起做**或**跟着做**。



# 安装
```
npm install howdo
```


# 示例

可以在模块的 `./test/` 文件下参考完整示例，并测试。每做一件事之前都必须实例化一次，可以链式操作，也可以断开操作。




## 一起做

多个同步或异步的任务可以一起做，没有顺序和依赖关系，任何一个任务失败都会退出。
together结果的参数按照任务分配的顺序给出。

```
var Howdo = require('howdo');
var howdo = new Howdo();

// 任务1
howdo.task(function(done){
    done(error, result1);
})
// 任务2
.task(function(done){
    done(error, result2);
})
// 任务3
.task(function(done){
    done(error, result3);
})
// 一起做
.together(function(error, result1, result2, result3){
    // ...
});

```


# 循环批量做

```
var Howdo = require('howdo');
var howdo = new Howdo();

// 循环批量做
[1,2,3].forEach(function(){
    howdo.task(function(done){
        done(error, result);
    });
});

// 一起做
hodo.together(function(error, result1, result2, result3){
    // ...
});

```


## 跟着做

多个同步或异步的任务按照既定顺序依赖做下去，任何一个任务失败都会退出。

```
var Howdo = require('howdo');
var howdo = new Howdo();

// 任务1
howdo.task(function(next){
    next(error, result1);
})
// 任务2
.task(function(next, result1){
    next(error, result2);
})
// 任务3
.task(function(next, result2){
    next(error, result3);
})
// 跟着做
.follow(function(error, result4){
    // ...
});
```
