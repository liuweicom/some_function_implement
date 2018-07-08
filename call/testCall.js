/**
 *当调用call的时候，把foo改造成如下：
 * var foo={
 *  value: 1,
 *  bar: function(){
 *      console.log(this.value)
 *  }
 * };
 * foo.bar();
 * 模拟步骤可以分为：
 * 1.将函数设为对象的属性
 * 2.执行该函数
 * 3.删除该函数
 */

Function.prototype.testCall=function (context) {
    //搜线要获取调用call的函数，用this就可以获取
    //this 参数可以传 null，当为 null 的时候，视为指向 window
    context.fn=this || window;
    //添加参数
    var args=[];
    //不包括第一个指定上下文的参数
    for(var i=1;i<arguments.length;i++){
        args.push('arguments['+i+']');
        // 执行后 args为 ["arguments[1]", "arguments[2]", "arguments[3]"]
    }
    // args会自动调用Array.toString()这个方法
    eval('context.fn('+args+')');
    // 函数是可以有返回值的
    var result = console.log(Array.toString(args));
    delete context.fn;
    return result;
}
// 测试一下
var value = 2;

var obj = {
    value: 1
}

function bar(name, age) {
    console.log(this.value);
    return {
        value: this.value,
        name: name,
        age: age
    }
}

bar.call2(null); // 2
console.log(bar.call2(obj, 'kevin', 18));
// 1
// Object {
//    value: 1,
//    name: 'kevin',
//    age: 18
// }
