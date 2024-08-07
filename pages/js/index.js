import {
  _getTarget,
  copyText,
  createPaginationHTML,
  hdTitleHighlight,
  wrapInput,
} from './utils.js';

const oBox = document.querySelector('.box'),
  oHead = oBox.querySelector('.head'),
  oInp = oHead.querySelector('input'),
  oBtn = oHead.querySelectorAll('button'),
  oList = oBox.querySelector('.list');
const searchInput = wrapInput(oInp, {
  change(val) {
    if (val.trim()) {
      oBtn[0].style.display = 'block';
    } else {
      oBtn[0].style.display = 'none';
    }
    _pageNo = 1;
    getList(1);
  },
});
let _pageNo = 1;
function getList(toTop) {
  fetch(
    `/list?pageNo=${_pageNo}&pageSize=20&word=${encodeURIComponent(
      searchInput.getValue().trim()
    )}`
  )
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      if (res.code == 0) {
        render(res.data, toTop);
      }
    });
}
getList(1);
function render(obj, toTop) {
  const { pageNo, total, data, splitWord } = obj;
  _pageNo = pageNo;
  let str = ``;
  data.forEach((item) => {
    const { id, text } = item;
    str += `<div data-id="${id}" class="item">
          <span title="点击复制" class="text">${hdTitleHighlight(
            splitWord,
            text
          )}</span
          ><span class="del">&times;</span>
        </div>`;
  });
  if (data.length > 0) {
    str += `<div class="pagination">`;
    str += createPaginationHTML({
      pageNo: _pageNo,
      total,
    });
    str += '</div>';
  }
  oList.innerHTML = str;
  if (toTop) {
    oList.scrollTop = 0;
  }
}
oBtn[2].addEventListener('click', () => {
  if (confirm('确认清除所有？')) {
    delText();
  }
});
oBtn[1].addEventListener('click', () => {
  _pageNo = 1;
  getList(1);
});
oBtn[0].addEventListener('click', () => {
  searchInput.setValue('');
});
function delText(id = '') {
  fetch(`/del?id=${id}`)
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      if (res.code == 0) {
        getList();
      }
    });
}
oList.addEventListener('click', hdClick);
function hdClick(e) {
  const del = _getTarget(oList, e, '.del');
  const text = _getTarget(oList, e, '.text');
  const btn = _getTarget(oList, e, 'button');
  if (del) {
    const id = del.parentNode.dataset.id;
    delText(id);
  } else if (text) {
    copyText(text.innerText);
  } else if (btn) {
    const flag = btn.dataset.flag;
    if (flag === 'prev') {
      _pageNo--;
    } else if (flag === 'next') {
      _pageNo++;
    } else {
      _pageNo = flag;
    }
    getList(1);
  }
}
document.addEventListener('visibilitychange', function () {
  // 页面变为可见时触发
  if (document.visibilityState == 'visible' && _pageNo == 1) {
    getList(1);
  }
});
