function promise(executor){
    var self=this;
    // promise当前的状态
    self.status='pending';
    self.data=undefined;
    // promise resolve时的回调函数集，因为在promise结束之前有可能有多个回调添加到他的上面
    self.onResolverCallback=[];
    // promise reject时的回调函数集，因为在promise结束之前有可能有多个回调添加到它的上面。then里面关于报错时的回调
    self.onRejectedCallback=[];

    function resolve(value){
       if(self.status === 'pending'){
           /**
            * 当状态为pending之后把状态改为相应的值，并把相应的value和er
            */
           self.status='resolved';
           self.data=value;
           for(var i=0;i<self.onResolverCallback.length;i++){
               self.onResolverCallback[i](value);
           }
       }
    }

    function reject(reason){
        if(self.status === 'pending'){
            self.status='rejected';
            self.data=reason;
            for(var i=0;i<self.onRejectedCallback.length;i++){
                self.onRejectedCallback[i](value);
            }
        }
    }
    try{
    //如果executor在执行过程中抛出异常时，会把错误的值reject出去
    executor(resolve,reject);//执行executor并传入相应的参数
    } catch(e){
        reject(e);
    }
}
//then 方法接受两个参数，onResolved，onRejected，分别为promise成功或失败后的回调
promise.prototype.then=function(onResolved,onRejected){
    var self=this;
    var promise2;

    //更据标准，如果then的参数不是function你，则我们需要忽略它，此处以如下方式处理
    onResolved=typeof onResolved === 'function' ? onRejected:function(v){};
    onRejected=typeof onRejected === 'function'? onRejected:function(r){};

    if(self.status === 'resolved'){
        return promise2=new Promise(function(resolve,reject){

        });
    }

    if(self.status === 'rejected'){
        return promise2=new Promise(function(resolve,reject){

        });
    }

    if(self.status === 'pending'){
        return promise2=new Promise(function(resolve,reject){
            
         });
    }
;}