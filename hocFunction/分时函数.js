/**
 * 分时函数： 限制函数被频繁调用的解决方案。如果我们需要在短时间在在页面插入大量的DOM节点，那显然是让浏览器吃不消，可能会引起浏览器的假死，所以我们需要进行分时函数，分批插入
 */
const timeChunk = (list,fn,count =5)=>{
    let insertList = [];
    let timer;
    const start = function(){
        for(let i =0; i< Math.min(list.length , count);i++){
            insertList = list.shift();
            fn(insertList);
        }
    }
    return function(){
        timer = setInterval(()=>{
            if(!list.length){
                clearInterval(timer);
            }else{
                start();
            }
        },200);
    }
}

//分时测试
const arr = []
for (let i = 0; i < 94; i++) {
    arr.push(i)
}
const renderList = timeChunk(arr,(data)=>{
    let divDom = document.createElement('div');
    divDom.innerHTML = data + 1;
    document.body.appendChild(div)
},20);