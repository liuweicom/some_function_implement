/**
1.bind方法不会立即执行函数，需要返回一个待执行的函数，这里考虑用闭包，可以返回一个函数return function(){}
2.作用域绑定，这里可以使用apply或者call方法，但是由于bind函数，可以分布传参，参数不固定，无法使用call这种函数（这个参数需要一个个都写出来），于是使用apply（yy,[...Array...]）
3.绑定过后的函数被new实例化之后，需要继承原函数的原型链方法，且绑定过程中提供的this被忽略，但是参数还是会使用
*/
Function.prototype.testBind=function(that){
	if(typeof this !== "function"){
		throw new Error("Function.prototype.bind --what is trying to be bound is not callable");
	}
	var _this=this;
	//创建中转函数，用来传递原型链，同时避免bound函数在使用时改变原型链
	var FNOP=function(){};
	FNOP.prototype=_this.prototype;

	/*
	*由于参数的不确定，统一用arguments来处理，这里的arguments只是一个类数组对象，有length属性
	*可以用数组的slice方法转换成标准格式数组，除去that
	*后面的所有参数都需要作为数组参数传递
	*/
	var slice=Array.prototype.slice;
	var args=slice.apply(arguments,[1]);
	var bound=function(){
		//apply绑定作用域，进行参数传递
		//当作为构造函数时，this指向new出来的实例，此时结果为true，将绑定函数的this指向该实例，可以让实例获得来自绑定函数的值
		//当作为普通函数时，this指向windows，此时结果为false，将绑定函数的this指向that，自己指定的上下文
		//如何判断是否是构造函数:通过原型链的继承关系就可以知道
		//var after_new=new bound();(bound为绑定函数啊，after_new为bound的实例) 那么ather_new instanceof bound为true，同时bound.prototype=new FNOP();原型继承，所以FNOP也是after_new的父类，after_new instanceof FNOP为true

	
		// 这里的Array.prototype.slice.apply(arguments,[0])指的是这个返回函数执行的时候传递的一些列参数，与上面的arguments不同，所以
		//所以是从第一个参数开始[0]，之前的slice.apply(arguments,[1])指的是testBind方法执行时候传递的参数，需要排除第一个指定的上下文，所以从第二个开始[1]，两者有本质区别，不要搞混
		//只有两个合并之后才是返回函数的完整参数
		// 从args.concat(Array.prototype.slice.apply(arguments,[0])也可以看出，bind函数中参数的优先于绑定函数中参数的值
		return _this.apply(this instanceof FNOP?this:that,args.concat(Array.prototype.slice.apply(arguments,[0])));
	};
	bound.prototype=new FNOP();

	//返回函数
	return bound;
}

var test=function(a,b){
	console.log("作用域绑定"+this.value);
	console.log("testBaind参数传递"+a.value2);
	console.log("调用参数传递"+b);
}

var obj={
	value:"ok"
};
var fun_new=test.testBind(obj,{value2:'also ok'});
fun_new("hello bind");
