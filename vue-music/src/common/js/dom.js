// 利用正则判断dom中是否包含某个className
export function hasClass(el, className) {
  let reg = new RegExp('(^|\\s)' + className + '(\\s|$)');
  return reg.test(el.className);
}

// 为dom添加某个类
export function addClass(el, className) {
  if (hasClass(el, className)) {
    return;
  }
  let newClass = el.className.split(' ');
  newClass.push(className);
  el.className = newClass.join(' ');
}

// 获取自定义属性或者设置自定义属性
export function getData(el, name, val) {
  const prefix = 'data-';
  name = prefix + name;
  if (val) {
    return el.setAttribute(name, val);
  } else {
    return el.getAttribute(name);
  }
}

let elementStyle = document.createElement('div').style;

// 处理不同浏览器css样式的前缀
let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  };

  // 放回可以不同浏览器的前缀
  for (let key in transformNames) {
    if (elementStyle[transformNames[key]] !== undefined) {
      return key;
    }
  }

  return false;
})();

export function prefixStyle(style) {
  if (vendor === false) {
    return false;
  }

  if (vendor === 'standard') {
    return style;
  }

  // reuturn 一个浏览器前缀加style的首字符大写加后面的字符
  return vendor + style.charAt(0).toUpperCase() + style.substr(1);
}
