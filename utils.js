import os from 'os';
// 转义正则符号
export function encodeStr(keyword) {
  return keyword.replace(
    /[\[\(\$\^\.\]\*\\\?\+\{\}\\|\)]/gi,
    (key) => `\\${key}`
  );
}
export function splitWord(str) {
  str = str.trim();
  if (!str) return '';
  try {
    const intl = new Intl.Segmenter('cn', { granularity: 'word' });
    const obj = {};
    return (
      [...intl.segment(str)]
        .reduce((pre, item) => {
          const word = item.segment.trim();
          if (word && !obj.hasOwnProperty(typeof word + word)) {
            obj[typeof word + word] = true;
            pre.push(word);
          }
          return pre;
        }, [])
        .join(' ') + `-${str}`
    );
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    return str.split(' ') + `-${str}`;
  }
}
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
    let lowerItem = item.toLowerCase();
    if (lowerContent.includes(lowerItem)) {
      pre++;
    }
    return pre;
  }, 0);
}
export function createPagingData(list, pageSize, pageNo) {
  const totalPage = Math.ceil(list.length / pageSize) || 1;
  pageNo > totalPage ? (pageNo = totalPage) : pageNo <= 0 ? (pageNo = 1) : null;
  const data = list.slice(pageSize * (pageNo - 1), pageSize * pageNo);
  return {
    total: list.length,
    totalPage,
    pageNo,
    data,
  };
}
export function getLocahost() {
  const obj = os.networkInterfaces();
  let arr = [];
  Object.keys(obj).forEach((item) => {
    let value = obj[item];
    if (Object.prototype.toString.call(value).slice(8, -1) === 'Array') {
      arr = [
        ...arr,
        ...value
          .filter((item) => item.family == 'IPv4')
          .map((item) => item.address),
      ];
    }
  });
  return arr;
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
