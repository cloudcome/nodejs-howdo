# howdo

[![Build Status][travis-img]][travis-url] 
[![howdo][shields-img]][shields-url]

[travis-img]: https://travis-ci.org/cloudcome/nodejs-howdo.svg?branch=master
[travis-url]: https://travis-ci.org/cloudcome/nodejs-howdo
[shields-img]: https://img.shields.io/npm/v/howdo.svg
[shields-url]: https://www.npmjs.com/package/howdo

任务流程控制。

入门指引：<http://FrontEndDev.org/column/howdo-introduction/>


# FEATURES
- node、浏览器通用
- 任务流程控制，支持同步、异步任务
- 支持串行、并行任务
- 支持捕获任务的错误
- 支持中止任务
- 支持回退任务
- 支持无限任务


# INSTALL

## nodejs
```cmd
npm install -S howdo
```

```js
var howdow = require('howdo');
```

## browser
### CMD
```
defined(function(require, exports, module){
    var howdo = require('./path/to/howdo.js');
});
```

### 全局
```html
<script src="/path/to/howdo.js"></script>
<script>
// howdo挂载在window对象上
// do sth...
</script>
```


# API
遵守这个约定，回调的第一个参数为错误对象。
```
// err 为 null 或 undefined 时表示回调成功
// 否则为回调失败
callback(err, ...);
```

## `#task` 分配单个任务，链式
```js
// 分配顺序串行任务
howdo
    // 分配单次任务 1
    .task(function (next) {
        // 第一个参数必须是Error对象的实例，如果没有错误，传null
        // 可以传多个结果给下一个任务接收
        next(null, 1, 2, 3);
    })
    // 分配单次任务 2
    .task(function (next, data1, data2, data3) {
        // data1 = 1
        // data2 = 2
        // data3 = 3
        next(null, data1 + data2 + data3);
    })
    .follow()
    .try(function(data){
        // data = 6
    })
    .catch(function (err) {
        // err = null
    });


// 分配顺序并行任务
howdo
    // 分配单次任务 1
    .task(function (done) {
        // 第一个参数必须是Error对象的实例，如果没有错误，传null
        // 可以传多个结果给结果接收
        done(null, 1, 2, 3);
    })
    // 分配单次任务 2
    .task(function (done) {
        done(null, 4);
    })
    .follow()
    .try(function(data1, data2, data3, data4){
        // data1 = 1
        // data2 = 2
        // data3 = 3
        // data4 = 4
    })
    .catch(function(err){
        // err = null
    });
```

## `#each` 循环分配任务，链式
```js
// task是用来分配单个次序任务，而如果是批量次序任务的话，就需要用each来操作了

var list = [1, 2, 3, 4];

// 批量分配顺序串行任务
howdo
    .each(list, function (key, val, next, data) {
        // 第1次： data = undefined
        // 第2次： data = 1
        // 第3次： data = 2
        // 第4次： data = 3
        next(null, val);
    })
    .follow()
    .try(function(data){
        // data = 4
    })
    .catch(function(err){
        // err = null
    });


// 批量分配顺序并行任务
howdo
    .each(list, function (key, val, done) {
        done(null, val);
    })
    .together()
    .try(function(data1, data2, data3, data4){
        // data1 = 1
        // data2 = 2
        // data3 = 3
        // data4 = 4
    })
    .catch(function(err){
        // err = null
    });
```


## `#follow` 顺序串行任务，链式

`follow`用来收集任务结果，如其字面意思，表示多个任务是顺序串行执行的。


## `#together` 顺序并行任务，链式

`together`也是用来收集任务结果，如其字面意思，表示多个任务是顺序并行执行的。


## `try` 任务成功回调，链式
```
.try(function(arg0, arg1, ...){
    // ...
})
```


## `catch` 任务失败回调，链式
```
.try(function(err){
    // 任务失败的回调
})
```


## `until`直到条件达成，否则一直继续
```
howdo
    .task(function(next){
        setTimeout(function(){
            next(null, Math.random());
        }, 500);
    })
    .until(function(value){
        return value > 0.8;
    })
    .follow()
    .try(function(value){
        value > 0.8 === true;
    });
```


## `rollback`回滚任务
```
var a = 1;

howdo
    .task(function(next){
        a++;
        setTimeout(function(){
            next(new Error('任务出错'));
        });
    })
    .rollback(function(){
        a--;
    })
    .follow(function(){
        a === 1;
    });
```


## `abort`中止任务
```
var a = 1;

howdo
    .task(function(next){
        this.timeid = setTimeout(function(){
            a++;
            next(new Error('任务1出错'));
        }, 100);
    })
    .rollback(function(){
        a--;
    })
    .task(function(next){
        this.timeid = setTimeout(function(){
            a++;
            next(new Error('任务2出错'));
        }, 200);
    })
    .abort(function(){
        clearTimeout(this.timeid);
    })
    .together(function(){
        a === 1;
    });
```



# VERSION
## 3.3.x
- 增加了`until`接口，支持多任务串行和并行
- 增加了`rollback`接口，回滚任务
- 增加了`abort`接口，中止任务


## 2.x
- 增加了`try`、`catch`两个接口


## v1.x
- 增加了`.task`任务接口
- 增加了`.each`循环接口
- 增加了`.follow`串行接口
- 增加了`.together`并行接口

