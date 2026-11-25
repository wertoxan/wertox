import {CATEGORIES, parseOpportunity, selectJobs, money, draftReply} from './engine.mjs';
const el = id => document.getElementById(id);
const samples = [
  'Ищем разработчика. Нужен лендинг для вымышленной студии керамики. Удалённо. Бюджет 35 000 руб.',
  'Ищем исполнителя. Нужен бот для автоматизации заявок вымышленного клуба. Удалённо. Бюджет 55 000 руб.',
  'Нужен дизайнер для оформления карточек вымышленной выставки. Бюджет 20 000 руб.'
];
const jobs = samples.map((sample, id) => {
  const result = parseOpportunity(sample, {sourceName:'Вымышленный пример', createdAt:id+1});
  return result.accepted ? {...result.job, id, demo:true} : null;
}).filter(Boolean);
for (const [key, title] of Object.entries(CATEGORIES)) el('category').append(new Option(title,key));
function make(tag, value) {
  const node = document.createElement(tag);
  node.textContent = value;
  return node;
}
function render() {
  const category = el('category').value;
  const matched = selectJobs(jobs,{
    categories:category ? [category] : [],
    minPay:Number(el('pay').value),
    remoteOnly:el('remote').checked
  },el('query').value);
  el('results').replaceChildren(make('p',`Найдено: ${matched.length}`));
  for (const job of matched) {
    const card = document.createElement('article');
    card.className = 'job';
    const draft = document.createElement('details');
    draft.append(make('summary','Черновик отклика'),make('pre',draftReply(job)));
    card.append(make('h2',job.title),make('small',`${CATEGORIES[job.category] || 'Другое'} · ${money(job)} · ${job.remote ? 'Удалённо' : 'Формат не указан'}`),make('p',job.text),draft);
    el('results').append(card);
  }
}
for (const id of ['category','pay','remote','query']) el(id).addEventListener('input',render);
render();
