function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
// 洗牌算法
export function shuffle(arr) {
    // 防止改变list
    let _arr = arr.slice(0);
    for (let i = 0; i < _arr.length; i++) {
        let j = getRandomInt(0, i);
        let t = _arr[j];
        _arr[j] = _arr[i];
        _arr[i] = t;
    }
    return _arr;
}

// 截流函数
export function debounce(func, delay) {
    let timer;
    return function(...args) {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}