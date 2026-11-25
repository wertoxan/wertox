export const CATEGORIES = {web:'Сайты и разработка',bots:'Боты и автоматизация',design:'Дизайн и контент',sales:'Продажи'};
export const DEFAULT_FILTERS = {categories:[],remoteOnly:false,minPay:0,include:[],exclude:[]};
const TERMS={bots:['бот','telegram bot','телеграм','автоматизац','интеграц','ai agent','n8n'],web:['frontend','front-end','backend','fullstack','react','next.js','разработчик','лендинг','сайт','верстальщик','веб'],design:['дизайн','designer','figma','иллюстратор','айдентик','инфографик','моушн','брендбук'],sales:['продаж','sales','роп','лидогенерац','аккаунт-менеджер']};
export function normalise(text){return String(text||'').toLowerCase().replace(/ё/g,'е').replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');}
export function words(value){return String(value||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean).slice(0,12).map(v=>v.slice(0,50));}
export function cleanFilters(input={}){
 return {categories:[...new Set(Array.isArray(input.categories)?input.categories:[])].filter(v=>Object.hasOwn(CATEGORIES,v)),remoteOnly:input.remoteOnly===true,minPay:Math.min(10000000,Math.max(0,Number(input.minPay)||0)),include:(Array.isArray(input.include)?input.include:[]).filter(v=>typeof v==='string'&&v.trim()).slice(0,12).map(v=>v.toLowerCase().slice(0,50)),exclude:(Array.isArray(input.exclude)?input.exclude:[]).filter(v=>typeof v==='string'&&v.trim()).slice(0,12).map(v=>v.toLowerCase().slice(0,50))};
}
export function categoryFor(text){const low=String(text).toLowerCase();let best='other',score=0;for(const [key,terms] of Object.entries(TERMS)){const n=terms.reduce((a,v)=>a+(low.includes(v)?1:0),0);if(n>score){best=key;score=n;}}return best;}
export function parsePay(text){
 const low=String(text).toLowerCase().replace(/\u00a0/g,' ');
 // A monetary marker is required, so years, phones and deadlines never become a salary.
 const hits=[...low.matchAll(/(\d{1,3}(?:[ \u202f]\d{3})+|\d{1,9}(?:[.,]\d{1,2})?)(?:\s*[-–—]\s*(\d{1,3}(?:[ \u202f]\d{3})+|\d{1,9}(?:[.,]\d{1,2})?))?\s*(тыс\.?|[кk])?\s*(₽|руб(?:лей|ля|ль|\.)?|rub|\$|usd|€|eur)(?!\p{L})/gu)];
 if(!hits.length)return {pay:0,currency:'RUB'};
 const h=hits[0],mult=h[3]?1000:1;
 return {pay:Math.min(100000000,Number(h[1].replace(/\s/g,'').replace(',','.'))*mult),currency:/\$|usd/.test(h[4])?'USD':/€|eur/.test(h[4])?'EUR':'RUB'};
}
export function parseOpportunity(text,{sourceId='manual',sourceName='Ручной импорт',createdAt=Date.now()}={}){
 const body=String(text||'').replace(/\r/g,'').trim().slice(0,12000);
 if(body.length<25)return {accepted:false,reason:'Слишком короткое сообщение: нужно хотя бы 25 символов.'};
 const low=body.toLowerCase();
 const intent=/(ищем|ищу|нужен|нужна|нужно|требуется|требуются|ваканси|hiring|looking for|ищется)/i.test(low);
 const selfPromo=/(ищу работу|ищу заказ|ищу проект|предлагаю (свои )?услуги|возьму (заказ|проект)|открыт к предложениям|резюме)/i.test(low);
 if(!intent||selfPromo)return {accepted:false,reason:selfPromo?'Похоже на резюме или предложение услуг, а не на заказ.':'Не найден признак вакансии или запроса исполнителя.'};
 const category=categoryFor(body);
 if(category==='other')return {accepted:false,reason:'Тема не относится к четырём направлениям SIGNAL.'};
 const title=body.split('\n').find(v=>v.trim())?.replace(/^#+\s*/,'').trim().slice(0,130)||'Новая возможность';
 const remote=/(удал[её]н|remote|из любой точки|дистанцион)/i.test(body)&&!/(не удал[её]н|без удал[её]н|no remote)/i.test(body);
 return {accepted:true,reason:'Есть запрос исполнителя и подходящее направление.',job:{title,text:body,category,remote,...parsePay(body),sourceId:String(sourceId),sourceName:String(sourceName).slice(0,120),createdAt:Number(createdAt)||Date.now(),demo:false}};
}
export function matchJob(job,filters={}){
 const f=cleanFilters(filters),hay=(job.title+' '+job.text).toLowerCase();
 if(f.categories.length&&!f.categories.includes(job.category))return {matched:false,score:0,reasons:[]};
 if(f.remoteOnly&&!job.remote)return {matched:false,score:0,reasons:[]};
 // Never compare USD/EUR against a RUB threshold without a currency conversion source.
 if(f.minPay>0&&(job.currency!=='RUB'||!job.pay||job.pay<f.minPay))return {matched:false,score:0,reasons:[]};
 if(f.include.length&&!f.include.some(v=>hay.includes(v)))return {matched:false,score:0,reasons:[]};
 if(f.exclude.some(v=>hay.includes(v)))return {matched:false,score:0,reasons:[]};
 const reasons=[CATEGORIES[job.category]||job.category];
 if(job.remote)reasons.push('Удалённо');
 if(f.minPay)reasons.push('Подходит по бюджету');
 if(f.include.length)reasons.push('Есть ключевое слово');
 return {matched:true,score:Math.min(99,65+(f.categories.length?12:0)+(job.remote?7:0)+(job.pay?5:0)+(f.include.length?8:0)),reasons};
}
export function selectJobs(jobs,filters={},query=''){
 const q=String(query||'').trim().toLowerCase();
 return jobs.map(job=>({...job,match:matchJob(job,filters)})).filter(job=>job.match.matched&&(!q||(job.title+' '+job.text).toLowerCase().includes(q))).sort((a,b)=>b.match.score-a.match.score||b.createdAt-a.createdAt||b.id-a.id);
}
export function money(job){return job.pay?new Intl.NumberFormat('ru-RU').format(job.pay)+' '+({RUB:'₽',USD:'$',EUR:'€'}[job.currency]||job.currency):'Бюджет обсуждается';}
export function draftReply(job){return `Здравствуйте! Заинтересовал ваш запрос «${job.title}».\n\nГотов обсудить задачу. Пришлите, пожалуйста, подробности, примеры желаемого результата и ориентир по срокам. После уточнения объёма смогу предложить план работы и стоимость.`;}
export function digestText(jobs){return jobs.length?`SIGNAL / подборка по вашим фильтрам\n\n${jobs.slice(0,5).map((j,i)=>`${i+1}. ${j.title}\n${money(j)} · ${j.remote?'Удалённо':'Формат уточняется'}\n${j.sourceName}${j.demo?' / пример':''}`).join('\n\n')}`:'SIGNAL / по текущим фильтрам пока нет новых возможностей.';}
