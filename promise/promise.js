function Pormise(fn){
    // 调用then方法，将想要在promise异步操作成功时执行的回调放入deferreds队列
    var value=null,deferreds=[],state='pending';

    //对原本要处理的方法在promise中处理
    function handle(deferred){
        console.log(deferred,'deferred---------');
        if(state === 'pending'){
            deferreds.push(deferred);
            return;
        }
        var cb=state === 'fullfilled'?deferred.onFullfilled:deferred.onRejected,ret;
        if(cb === null){
            cb=state==='fullfilled'?deferred.resolve:deferred.reject;
            cb(value);
            return;       
        }

        // 当执行成功回调，失败回调是代码出错，对于这类异常，将bridge promise设置为rejected
        try{
             // 在then中回调的函数可以有返回值，如果有返回值，那么作为下一个then中onFullfilled函数中的参数值
       ret=cb(value,deferred.resolve);
       // 用于提醒new promise的异步操作执行完毕，提醒then中的回调函数开始执行
       deferred.resolve(ret);
        }catch(e){
            deferred.reject(e);
        }
    }
    // 串行Promise，是指当前promise达到fullfilled状态之后，即开始进入下一个promise
    this.then=function(onFullfilled, onRejected){
        // then方法中，创建了一个新的promise实例，这类promise，是串行promise的基础。另外，因为返回类型一致，之前的链式执行任然被支持
        return new Promise(function(resolve){
            handle({
                onFullfilled: onFullfilled || null,
                onRejected: onRejected || null,
                reject: reject,
                resolve: resolve
            });
        });
       
    }

    // 创建promise时传入函数被赋予一个函数类型的参数resolve，用在合适的时机触发异步操作成功，
    //真正执行的操作是将deffered
    // resolve接受一个参数，即异步操作返回的结果，用于回调函数使用作为参数
    
    function resolve(newValue){
        //这是为了判断onFullfilled函数的返回值，是否是promise
        if(newValue && (typeof newValue === 'object' || typeof newValue === 'function')){
            var then=newValue.then;
            //如果为promise
            if(typeof then === 'function'){
                // 将得到的promise里面的then中的onFullfilled函数绑定的为bride promise里的定义的resolve，reject
                then.call(newValue, resolve, reject);
                return ;
            }
        }
        state='fullfilled';
        value=newValue;
        finale();
    }

    function reject(reason){
        state='rejected';
        value=reason;
        finale();
    }

    function finale(){
        // 如果promise是同步代理，resolve会优先于then执行，此时的deferred为空，后续的then将回调函数注入deferred，但是此时resolve函数已经执行完毕，不可能再执行
        //解决办法，利用seTimeout的异步特性，一定会晚于同步执行代码，也就会晚于then方法
        setTimeout(function(){
            deferreds.forEach(function(deferred){
                handle(deferred);
            });
        },0);
    }
    fn(resolve, reject);
}


   function a() {
    return new Pormise(function(resolve) {
    console.log("get...");
    setTimeout(function() {
    console.log("get 1");
    resolve(1);
    }, 1000)
    });
   }
   a().then(function(value, resolve) {
    console.log("get...");
    setTimeout(function() {
    console.log("get 2");
    resolve(2);
    }, 1000)
   }).then(function(value, resolve) {
    console.log(value)
   })

//get... 

// get 1

// get...

// get 2
// 2

//真实验证
// get...
// promise.js:7 Object {onRejected: null}onFullfilled: (value, resolve)onRejected: nullreject: reject(reason)resolve: y()arguments: (...)caller: (...)length: 1name: "y"__proto__: ()[[FunctionLocation]]: <unknown>__proto__: Object "deferred---------"
// promise.js:86 get 1
// promise.js:7 Object {onRejected: null} "deferred---------"
// promise.js:92 get...
// promise.js:98 undefined
// promise.js:94 get 2