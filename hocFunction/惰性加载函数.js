// 常用的事件兼容
const addEvent = function(el, type, handler) {
    if (window.addEventListener) {
        return el.addEventListener(type, handler, false)
    }
    // for IE
    if (window.attachEvent) {
        return el.attachEvent(`on${type}`, handler)
    }
}
// 复制代码这个函数存在一个缺点，它每次执行的时候都会去执行if条件分支。虽然开销不大，但是这明显是多余的，下面我们优化一下， 提前一下嗅探的过程：
const addEventOptimization = (function() {
    if (window.addEventListener) {
        return (el, type, handler) => {
            el.addEventListener(type, handler, false)
        }
    }
    // for IE
    if (window.attachEvent) {
        return (el, type, handler) => {
            el.attachEvent(`on${type}`, handler)
        }
    }
})()
// 复制代码这样我们就可以在代码加载之前进行一次嗅探，然后返回一个函数。但是如果我们把它放在公共库中不去使用，这就有点多余了。下面我们使用惰性函数去解决这个问题：
// 惰性加载函数
let addEventLazy = function(el, type, handler) {
    if (window.addEventListener) {
        // 一旦进入分支，便在函数内部修改函数的实现
        addEventLazy = function(el, type, handler) {
            el.addEventListener(type, handler, false)
        }
    } else if (window.attachEvent) {
        addEventLazy = function(el, type, handler) {
            el.attachEvent(`on${type}`, handler)
        }
    }
    addEventLazy(el, type, handler)
}
addEventLazy(document.getElementById('eventLazy'), 'click', function() {
    console.log('lazy ')
})
// 复制代码一旦进入分支，便在函数内部修改函数的实现，重写之后函数就是我们期望的函数，在下一次进入函数的时候就不再存在条件分支语句。

//没看出这几个的区别和优势。。。。。？？？