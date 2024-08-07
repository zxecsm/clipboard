// 转义正则符号
export function encodeStr(keyword) {
  return keyword.replace(
    /[\[\(\$\^\.\]\*\\\?\+\{\}\\|\)]/gi,
    (key) => `\\${key}`
  );
}
// 搜索词所在索引
export function getWordIdx(searchVal, content) {
  searchVal = searchVal.trim();
  if (!searchVal) return [];
  const idx = searchVal.lastIndexOf('-');
  let searchArr = [];
  if (idx < 0) {
    searchArr = searchVal.split(' ');
  } else {
    searchArr = searchVal.slice(0, idx).split(' ');
  }
  searchArr = unique(searchArr);
  let regStr = '(';
  searchArr.forEach((item, idx) => {
    if (idx > 0) {
      regStr += '|';
    }
    regStr += encodeStr(item);
  });
  regStr += ')';
  const reg = new RegExp(regStr, 'ig');
  const res = [];
  content.replace(reg, (...[, $1, $2]) => {
    res.push({
      word: $1,
      start: $2,
      end: $2 + $1.length - 1,
    });
  });
  return res;
}
// 提取包含搜索词的内容
export function getWordContent(searchVal, content) {
  const arr = getWordIdx(searchVal, content);
  if (arr.length < 1) return [];
  const res = [],
    oneS = arr[0].start,
    oneE = arr[0].end;
  res.push({
    type: 'text',
    value: content.slice(0, oneS),
  });
  res.push({ type: 'word', value: content.slice(oneS, oneE + 1) });
  if (arr.length > 1) {
    for (let i = 1; i < arr.length; i++) {
      const prev = arr[i - 1],
        item = arr[i];
      const prevE = prev.end,
        itemS = item.start,
        itemE = item.end;
      if (itemS <= prevE) {
        if (itemE < prevE) {
          item.end = prevE;
        } else {
          res.push({
            type: 'word',
            value: content.slice(prevE + 1, itemE + 1),
          });
        }
      } else {
        res.push({ type: 'text', value: content.slice(prevE + 1, itemS) });
        res.push({ type: 'word', value: content.slice(itemS, itemE + 1) });
      }
    }
  }
  const lastE = arr[arr.length - 1].end;
  res.push({ type: 'text', value: content.slice(lastE + 1) });
  return res;
}
// 包含搜索词数
export function getWordCount(searchVal, content) {
  searchVal = searchVal.trim();
  if (!searchVal) return 0;
  let lowerContent = content.toLowerCase(),
    searchArr = [];
  const idx = searchVal.lastIndexOf('-');
  if (idx < 0) {
    searchArr = searchVal.split(' ');
  } else {
    const o = searchVal.slice(idx + 1);
    searchArr = searchVal.slice(0, idx).split(' ');
    searchArr.push(o);
  }
  searchArr = unique(searchArr);
  return searchArr.reduce((pre, item) => {
    const lowerItem = item.toLowerCase();
    if (lowerContent.includes(lowerItem)) {
      pre++;
    }
    return pre;
  }, 0);
}
// 高亮搜索
export function hdTitleHighlight(val, content) {
  if (!val) return encodeHtml(content);
  const con = getWordContent(val, content);
  let s = '';
  con.forEach((item) => {
    const { type, value } = item;
    if (type == 'text') {
      s += encodeHtml(value);
    } else if (type == 'icon') {
      s += `···`;
    } else if (type == 'word') {
      s += `<span style="color:red;">${encodeHtml(value)}</span>`;
    }
  });
  return s || encodeHtml(content);
}
export function unique(arr, keys) {
  const obj = {};
  return arr.filter((item) => {
    if (keys) {
      keys.forEach((k) => {
        item = item[k];
      });
    }
    return obj.hasOwnProperty(typeof item + item)
      ? false
      : (obj[typeof item + item] = true);
  });
}
export function createPaginationHTML(opt = {}) {
  const defaultObj = {
    pageNo: 1,
    pageSize: 20,
    continuous: 5,
    total: 0,
  };
  opt = Object.assign(defaultObj, opt);
  opt.totalPage = Math.ceil(opt.total / opt.pageSize);
  opt.pageNo <= 0
    ? (opt.pageNo = opt.totalPage)
    : opt.pageNo >= opt.totalPage
    ? (opt.pageNo = opt.totalPage)
    : null;
  if (opt.total == 0) {
    return '';
  }
  let startPage = opt.pageNo - parseInt(opt.continuous / 2),
    endPage = opt.pageNo + parseInt(opt.continuous / 2);
  if (opt.totalPage > opt.continuous) {
    startPage < 1 ? ((startPage = 1), (endPage = opt.continuous)) : null;
    endPage > opt.totalPage
      ? ((endPage = opt.totalPage),
        (startPage = opt.totalPage - opt.continuous + 1))
      : null;
  } else {
    startPage = 1;
    endPage = opt.totalPage;
  }
  let str = ``;
  str += `${
    opt.pageNo > 1
      ? '<button data-type="paging" data-flag="prev">上一页</button>'
      : ''
  }`;
  if (opt.totalPage > opt.continuous) {
    str += `${
      startPage > 1 ? '<button data-type="paging" data-flag="1">1</button>' : ''
    }
        ${
          startPage == 3
            ? '<button data-type="paging" data-flag="2">2</button>'
            : ''
        }
        ${
          startPage > 3
            ? `<button data-type="paging" data-flag="${
                startPage - 1
              }">...</button>`
            : ''
        }`;
  }
  for (let i = startPage; i <= endPage; i++) {
    str += `<button data-type="paging" data-flag="${i}" class="${
      i == opt.pageNo ? 'active' : ''
    }">${i}</button>`;
  }
  if (opt.totalPage > opt.continuous) {
    str += `${
      endPage < opt.totalPage - 2
        ? `<button data-type="paging" data-flag="${endPage + 1}">...</button>`
        : ''
    }
        ${
          endPage == opt.totalPage - 2
            ? `<button data-type="paging" data-flag="${opt.totalPage - 1}">${
                opt.totalPage - 1
              }</button>`
            : ''
        }
        ${
          endPage < opt.totalPage
            ? `<button data-type="paging" data-flag="${opt.totalPage}">${opt.totalPage}</button>`
            : ''
        }`;
  }
  str += `${
    opt.pageNo < opt.totalPage
      ? '<button data-type="paging" cursor data-flag="next">下一页</button>'
      : ''
  }`;
  str += `<span>共 ${opt.total} 条</span>`;
  return str;
}
export function _getTarget(target, e, selector, stopPropagation) {
  return getTriggerTarget(e, { target, selector }, stopPropagation);
}
export function getTriggerTarget(e, opt, stopPropagation) {
  const { target = document, selector } = opt;
  let oTarget = e.target;
  const triggers = [...document.querySelectorAll(selector)];
  if (triggers.length === 0) return null;
  if (stopPropagation) {
    return triggers.find((item) => item === oTarget) || null;
  }
  while (oTarget && !triggers.find((item) => item === oTarget)) {
    if (oTarget === target) {
      oTarget = null;
    } else {
      oTarget = oTarget.parentNode;
    }
  }
  return oTarget;
}
export function encodeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\\/g, '&#92;')
    .replace(/\//g, '&#x2F;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;')
    .replace(/`/g, '&#96;')
    .replace(/=/g, '&#x3D;');
}
// 一键复制
export async function copyText(content, obj = {}) {
  const { success, error } = obj;
  content = content.trim();
  try {
    if (!navigator.clipboard) {
      throw new Error();
    }
    await navigator.clipboard.writeText(content);
    botMsg(success || '复制成功');
    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    if (typeof document.execCommand !== 'function') {
      botMsg(error || '复制失败');
      return;
    }
    window.getSelection().removeAllRanges();
    const div = document.createElement('div'),
      range = document.createRange();
    div.innerText = content;
    div.setAttribute(
      'style',
      'position: fixed;height: 1px;fontSize: 1px;overflow: hidden;'
    );
    document.body.appendChild(div);
    range.selectNode(div);
    window.getSelection().addRange(range);
    document.execCommand('copy');
    div.remove();
    botMsg(success || '复制成功');
  }
}
const botMsg = (function () {
  let timer = null;
  const box = document.createElement('div'),
    textbox = document.createElement('div');
  box.style.cssText = `
      width: 100%;
      position: fixed;
      top: 20px;
      padding: 0 20px;
      box-sizing: border-box;
      transform: translateY(-100%);
      font-size: 18px;
      opacity: 0;
      text-align: right;
      z-index: 99;
      pointer-events: none;`;
  textbox.style.cssText = `
      display: inline-block;
      line-height: 1.5;
      overflow: hidden;
      font-weight: bold;
      box-sizing: border-box;
      padding: 10px;
      border-radius: 10px;
      color: #0f0f0f;
      box-shadow: 0 0 5px #888;
      background-color: rgb(255 255 255/ 60%);`;
  box.appendChild(textbox);
  document.body.appendChild(box);
  function mstc(str, again) {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    if (!again) {
      box.style.transition = '0s';
      box.style.transform = 'translateY(-100%)';
      box.style.opacity = '0';
      box.clientWidth;
    }

    textbox.innerText = str;
    box.style.transition =
      'transform 0.5s ease-in-out,opacity 0.5s ease-in-out';
    box.style.transform = 'none';
    box.style.opacity = '1';

    timer = setTimeout(() => {
      clearTimeout(timer);
      timer = null;
      box.style.transition = 'transform 1s ease-in-out,opacity 1s ease-in-out';
      box.style.transform = 'translateY(-100%)';
      box.style.opacity = '0';
    }, 5000);
  }
  return mstc;
})();
export function wrapInput(target, opt) {
  const { change, focus, blur } = opt;
  target.addEventListener('input', hdInput);
  target.addEventListener('focus', hdFocus);
  target.addEventListener('blur', hdBlur);
  function unBind() {
    target.removeEventListener('input', hdInput);
    target.removeEventListener('focus', hdFocus);
    target.removeEventListener('blur', hdBlur);
  }
  function hdInput() {
    change && change(target.value);
  }
  function hdFocus() {
    focus && focus(target);
  }
  function hdBlur() {
    blur && blur(target);
  }
  function getValue() {
    return target.value;
  }
  function setValue(val) {
    target.value = val;
    hdInput();
  }
  return {
    setValue,
    getValue,
    unBind,
    target,
  };
}
