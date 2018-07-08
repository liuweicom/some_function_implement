### bind简单实现
### 官方定义
1. bind() 函数会创建一个新函数（称为绑定函数），新函数与被调函数（绑定函数的目标函数）具有相同的函数体（在 ECMAScript 5 规范中内置的call属性）。当目标函数被调用时 this 值绑定到 bind() 的第一个参数，该参数不能被重写。绑定函数被调用时，bind() 也接受<em>预设的参数</em>提供给原函数。
2. 一个绑定函数也能使用new操作符创建对象：这种行为就像把原函数当成构造器。提供的 this 值被忽略，同时调用时的参数被提供给模拟函数。
### 思路
1. 前提知识：由于<em>javascript中作用域</em>是由其运行时候所处的环境决定的，所以往往函数定义和实际运行的时候所处环境不一样，那么作用域也会发生相应的变化。
    ```
    var id = 'window';
    //定义一个函数，但是不立即执行
    var test = function(){
        console.log(this.id)
    }
    test() // window
    //把test作为参数传递
    var obj = {
        id:'obj',
        hehe:test
    }
    //此时test函数运行环境发生了改变
    obj.hehe() // 'obj'
    //为了避免这种情况，javascript里面有一个bind方法可以在函数运行之前就绑定其作用域，修改如下
    
    var id = 'window';
    var test = function(){
        console.log(this.id)
    }.bind(window)
    var obj = {
        id:'obj',
        hehe:test
    }
    test() // window
    obj.hehe() // window
    ```
    1.2 前提知识：new的模拟实现
    
    这里我们需要看看 new 这个方法做了哪些操作 比如说 var a = new b()
            
        1.2.1创建一个空对象 a = {}，并且this变量引用指向到这个空对象a
        1.2.2继承被实例化函数的原型 ：a.__proto__ = b.prototype
        1.2.3被实例化方法b的this对象的属性和方法将被加入到这个新的 this 引用的对象中： b的属性和方法被加入的 a里面
        1.2.4新创建的对象由 this 所引用 ：b.call(a)

2. 第一阶段目标：
bind方法不会立即执行，会生成一个绑定函数，bind（）的第一个参数将作为它运行时的this，之后的一序列参数将会传入作为需要绑定函数的参数使用。bind方法的时候可以传入一部分，在调用绑定函数的啥时候再传入一部分，那么传入的参数是bind方法中除去第一个参数加上绑定函数中参数部分。
	解析：
	
	1). bind方法要返回一个函数，可以使用闭包
	2). 作用域绑定，这里可以使用apply或者call方法，但是由于bind函数，可以分布传参，参数不固定，无法使用call这种函数（这个参数需要一个个都写出来），于是使用apply（yy,[...Array...]）
	3). 参数部分，是bind方法和绑定函数中变量组成。将两部分的变量保存在数组变量中
    ```
    Function.prototype.testBind = function(that){
        var _this = this,
            /*
            *由于参数的不确定性，统一用arguments来处理，这里的arguments只是一个类数组对象，有length属性
            *可以用数组的slice方法转化成标准格式数组，除了作用域对象that以外，
            *后面的所有参数都需要作为数组参数传递
            *Array.prototype.slice.apply(arguments,[1])/Array.prototype.slice.call(arguments,1)
            */
            slice = Array.prototype.slice,
            args = slice.apply(arguments,[1]);
        //返回函数    
        return function(){
            /**
            *这里的Array.prototype.slice.apply(arguments,[0])指的是这个返回函数执行的时候传递的一些列参数，与上面的arguments不同，所以
            *所以是从第一个参数开始[0]，之前的slice.apply(arguments,[1])指的是testBind方法执行时候传递的参数，需要排除第一个指定的上下文，所以从第二个开始[1]，两者有本质区别，不要搞混
            *只有两个合并之后才是返回函数的完整参数
            *从args.concat(Array.prototype.slice.apply(arguments,[0])也可以看出，bind函数中参数的优先于绑定函数中参数的值
            */
            return _this.apply(that,
                args.concat(Array.prototype.slice.apply(arguments,[0]))
            )
        }      
    }
    ```
3. 第二阶段目标：绑定函数被new实例化之后，需要继承原函数的原型链方法，且绑定过程中提供的this会失效（继承原函数的this对象），但是参数还是会使用
例如：
    ```
    var value = 2;
    
    var foo = {
        value: 1
    };
    
    function bar(name, age) {
        this.habit = 'shopping';
        console.log(this.value);
        console.log(name);
        console.log(age);
    }
    
    bar.prototype.friend = 'kevin';
    
    var bindFoo = bar.bind(foo, 'daisy');
    
    var obj = new bindFoo('18');
    // undefined
    // daisy
    // 18
    console.log(obj.habit);
    console.log(obj.friend);
    // shopping
    // kevin
    ```
    注意：尽管在全局和 foo 中都声明了 value 值，最后依然返回了 undefind，说明绑定的 this 失效了，如果大家了解 new 的模拟实现，就会知道这个时候的 this 已经指向了 obj。

    解析：
    1. 让绑定函数的prototype指向testBind函数中_this的原型，这样实例就可以继承原函数的原型链
    2. 当绑定函数bound作为构造函数时，绑定函数中的this指向该实例，可以让实例获得来自绑定函数的值，当绑定函数bound为普通函数时，this仍然指向指定的上下问that
    ```
    Function.prototype.testBind = function(that){
        var _this = this,
            slice = Array.prototype.slice,
            args = slice.apply(arguments,[1]),
            //所以调用官方bind方法之后 有一个name属性值为 'bound '
            bound = function(){
            //如何判断是否是构造函数:通过原型链的继承关系就可以知道
            //var after_new=new bound();(bound为绑定函数啊，after_new为bound的实例) 那么ather_new instanceof bound为true
                var isNew=this instanceof bound;
                return _this.apply(isNew ?　this : that,
                    args.concat(Array.prototype.slice.apply(arguments,[0]))
                )
            }    
        bound.prototype =  _this.prototype;
        return bound;
    }
    ```
4. 优化

    4.1  在上面的写法中，我们直接将 bound.prototype = this.prototype，我们直接修改 bound.prototype 的时候，也会直接修改绑定函数的 prototype。这个时候，我们可以通过一个空函数来进行中转：
    ```
    Function.prototype.testBind = function(that){
            var _this = this,
                slice = Array.prototype.slice,
                args = slice.apply(arguments,[1]),
                fNOP = function () {},
                bound = function(){
                    //这里的this指的是调用时候的环境
                    //如何判断是否是构造函数:通过原型链的继承关系就可以知道
                    //var after_new=new bound();(bound为绑定函数啊，after_new为bound的实例) 那么ather_new instanceof bound为true，同时bound.prototype=new FNOP();原型继承，所以FNOP也是after_new的父类，after_new instanceof FNOP为true
                    return _this.apply(this instanceof  fNOP ?　this : that||window,
                        args.concat(Array.prototype.slice.apply(arguments,[0]))
                    )
                }    
            fNOP.prototype = _this.prototype;
            //创建中转函数fNOP，用来传递原型链，同时避免bound函数在使用时改变原型链
            bound.prototype = new fNOP();
            return bound;
        }
    ```
    4.2  调用 bind 的不是函数咋办？
不行，我们要报错！
    ```
    if (typeof this !== "function") {
      throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
    }
    ```
5. 最终代码：
    ```
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
    ```
#### 参考文档
[javascript原生一步步实现bind](https://segmentfault.com/a/1190000007342882)
[javascript深入之bind的模拟实现](https://segmentfault.com/a/1190000007342882)