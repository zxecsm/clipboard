import fs from 'fs';
const clipboardData = {
  tem: '',
  data: fs.existsSync('./data.json')
    ? JSON.parse(fs.readFileSync('./data.json'))
    : [],
  add(val) {
    val = val.trim();
    if (!val || val === this.tem) return;
    if (!this.tem) {
      const lastText = this.data.slice(-1)[0];
      if (lastText && lastText.text === val) return;
    }
    this.tem = val;
    this.data.push({ id: nanoid(), text: val });
    this.save();
  },
  del(arr) {
    this.data = this.data.filter((item) => !arr.some((y) => y == item.id));
    this.save();
  },
  clear() {
    this.data = [];
    this.save();
  },
  save() {
    fs.writeFileSync('./data.json', JSON.stringify(this.data));
  },
};
function nanoid() {
  return (
    'h' +
    Date.now().toString(36) +
    '_' +
    Number(String(Math.random()).slice(2)).toString(36)
  );
}
export default clipboardData;
