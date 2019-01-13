
function  thunkify(fn){
    return function(){
        var args = Array.prototype.slice.call(arguments);//[]
        var ctx = this;
        return function(callback){
            var isUsed;
            // args.push(callback);//有多个输出
            // 对callback进行封装，使其只能执行一次。
            args.push(function(){
                if (isUsed) return;
                isUsed = true;
               // 这里不允许用箭头函数，箭头函数里面没有arguments的
                console.log(arguments,'argumenr-------');
                callback.apply(null, arguments);
            });

            var result;
            console.log(args,'args----------');
            try{
                console.log(args,'args22222----------');
                result =  fn.apply(ctx, args);
            }catch (e) {
                callback(e);
            }
           return result;
        }
    }
}

// var readFileThunk = thunkify(fs.readFile);
// readFileThunk('./test.txt','utf-8')((err, data) => {
//     console.log(data, 'data------------');
// });

/**
 * 测试方式一：
 */
// const fs = require('fs');
//
// function load(fn){
//     fn(null, this.name);
// }
// var user = {
//     name: 'tibi',
//     load: thunkify(load)
// };


// user.load()((err,res)=>{
//     console.log(err, res, 'res-------------');
// });

/**
 * 测试方式二：在一个函数中多次执行fn函数的时候，只执行第一次
 * @param fn
 */
function load(fn){
  fn(null, 1);
    fn(null, 2);
    fn(null, 3);
}

load = thunk(load);
load()((err, ret)=>{
    console.log(err,ret,'ret------');
});


// 默写
function thunk(fn) {
    return function(){
        let args = Array.prototype.slice.apply(this, arguments);
        const _this = this;
        return function (callback) {
           let isFirst;
           let result;
           args.push(function () {
               if (isFirst) return;
               isFirst = true;
               callback.apply(null, arguments);
           });
           try{
               result = fn.apply(_this, args);
           }catch (e) {
               callback(e);
           }
           return result
        }
    }
}
