// Conservative product guardrails, shared by the UI and server. Not a complete classifier.
export class ContentSafetyError extends Error{constructor(){super('Этот запрос не поддерживается. Выберите безопасную тему для контента о бренде, услуге или полезном опыте.');this.name='ContentSafetyError';this.code='CONTENT_BLOCKED';}}
export function normaliseSafety(value){return String(value??'').normalize('NFKC').toLowerCase().replace(/[\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g,'').replace(/ё/g,'е').replace(/[@]/g,'а').replace(/[_*~|]+/g,' ').replace(/\s+/g,' ').trim();}
export function checkContent(value){const t=normaliseSafety(value),tight=t.replace(/[^\p{L}\p{N}]/gu,'');
 const sexual=/(секс|эроти|порно|обнажен|раздев|sexual|erotic|porn|nude|incest|инцест)/i.test(t);
 const minor=/(несовершеннолет|малолет|ребен|дет[ьи]|школьни|подрост|underage|minor|child|teen)/i.test(t)||/(?:^|[^\d])(?:[1-9]|1[0-7])\s*(?:лет|года?|years? old|yo)(?!\p{L})/iu.test(t);
 const incest=/(инцест|incest)/i.test(tight)||sexual&&/(сестр|брат|мам[ауы]|матер|отец|отц|доч|сын|sister|brother|mother|father|daughter|son\b)/i.test(t);
 if(incest||sexual&&minor)return {allowed:false,category:'sexual-exploitation'};
 // This business-content product does not create explicit sexual material.
 if(/(порно|pornograph|hardcore sex|explicit sex|эротическ|эротичн)/i.test(t)||/(порн[о0]|инц[еe]ст)/i.test(tight))return {allowed:false,category:'explicit-sexual'};
 const drugs=/(наркот|мефедрон|метамфет|амфетамин|кокаин|героин|марихуан|каннабис|мдма|\bлсд\b|cocaine|heroin|methamphetamine|\bmdma\b|\blsd\b|cannabis|marijuana|illicit drugs)/i.test(t);
 const actionable=/(изготов|производ|синтез|варить|сварить|рецепт|инструкц|пошаг|купить|покупк|продаж|продаю|сбыт|доставк|закладк|заказать|магазин|реклам|продвиг|распростран|how to (?:make|cook|buy|sell|grow)|synthesi|manufactur|sell|selling|buy|dealer|advertis|promot|step.by.step)/i.test(t);
 if(drugs&&actionable)return {allowed:false,category:'drug-facilitation'};
 const harm=/(убить|убийств|пытк|теракт|бомб|взрывчат|суицид|самоубийств|murder|torture|bomb|explosive|suicide)/i.test(t);
 if(harm&&/(инструкц|пошаг|как (?:сделать|изготовить|совершить|убить)|рецепт|how to|step.by.step|instructions)/i.test(t))return {allowed:false,category:'harmful-instructions'};
 return {allowed:true};}
function collect(value,depth=0){if(depth>8)return '';if(typeof value==='string')return value;if(Array.isArray(value))return value.map(x=>collect(x,depth+1)).join('\n');if(value&&typeof value==='object')return Object.values(value).map(x=>collect(x,depth+1)).join('\n');return '';}
export function assertSafeContent(value){const text=collect(value);if(text.length>200000||!checkContent(text).allowed)throw new ContentSafetyError();return value;}
