import clipboardy from 'clipboardy';
import express from 'express';
import clipboardData from './data.js';
import configData from './config.js';
import {
  createPagingData,
  getLocahost,
  getWordCount,
  splitWord,
} from './utils.js';
const app = express();
setInterval(() => {
  // 读取剪切板内容
  clipboardy
    .read()
    .then((content) => {
      clipboardData.add(content);
    })
    .catch(() => {
      console.error('读取剪切板内容时出错');
    });
}, 2000);
app.use(express.static('pages'));
app.listen(
  configData.port,
  configData.onlyLocal ? '127.0.0.1' : '0.0.0.0',
  () => {
    const arr = getLocahost().map(
      (item) =>
        `http://${item}${configData.port == 80 ? '' : `:${configData.port}`}`
    );
    console.log(`服务开启成功，访问地址为：\n${arr.join('\n')}`);
  }
);

app.get('/list', (req, res) => {
  let { pageNo = 1, pageSize = 20, word } = req.query;
  pageNo = parseInt(pageNo);
  pageSize = parseInt(pageSize);
  if (
    isNaN(pageNo) ||
    isNaN(pageSize) ||
    pageNo < 1 ||
    pageSize < 1 ||
    pageSize > 100
  ) {
    res.json({ code: 1, codeText: '参数错误' });
    return;
  }
  let list = clipboardData.data.slice(0);
  list.reverse();
  if (word) {
    word = splitWord(word);
    let arr = [];
    list.forEach((item) => {
      const sNum = getWordCount(word, item.text);
      if (sNum > 0) {
        arr.push({ ...item, sNum });
      }
    });
    if (arr.length > 0) {
      arr.sort((a, b) => {
        return b.sNum - a.sNum;
      });
    }
    list = arr;
  }
  res.json({
    code: 0,
    codeText: 'ok',
    data: {
      ...createPagingData(list, pageSize, pageNo),
      splitWord: word,
    },
  });
});
app.get('/del', (req, res) => {
  const { id } = req.query;
  if (id) {
    clipboardData.del([id]);
  } else {
    clipboardData.clear();
  }
  res.json({ code: 0, codeText: 'ok' });
});
