Function.prototype.testApply=function (context,arr) {
    //与call唯一的区别就是，apply中的参数全部包在一个数组中arr
    var context=Object(context) || window;
    context.fn=this;
    var result;
    if(!arr){
        result=context.fn();
    }else{
        var args=[];
        for(var i=0;i<arr.length;i++){
            args.push('arr['+i+']');
        }
        var result = eval("context.fn("+args+")");
    }
    delete context.fn;
    return result;
}