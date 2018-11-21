/**
 * 函数节流和函数防抖
 * 函数节流：指定时间间隔内只会执行一次
 * 函数防抖： 任务频繁触发的情况下，只有任务触发的间隔超过指定间隔，任务才会执行
 */
/**
 * 函数节流
 * @param fn
 * @param waitTime
 * @returns {Function}
 */
export function throttle(fn, waitTime ){
    var lastTime = null;
    var _this = this;
    return function () {
        var startTime = + new Date();
        if(startTime - lastTime >waitTime || !lastTime){
            fn.apply(this, arguments);
            lastTime = startTime;
        }
    }
}

export function throttle2(fn, waitTime ){
    var statTime = 0;
    return function(...args){
        var curTime = new Date();
        if(curTime - statTime > waitTime){
            fn.apply(this, args);
            statTime = curTime;
        }
    }
}

/**
 * 函数防抖
 */
export function debounce(fn, delay = 50){
    let timer = null;
    return function(){
        clearTimeout(timer);
        timer = setTimeout(()=>{
            fn.apply(this, arguments);
        },delay);
    }
}

let debounce = (fn, time = 50) => {
    let timer;
    return function(...args){
        let that = this;
        clearTimeout(timer);
        timer = setTimeout(fn.bind(that, ...args),time)
    }
}

