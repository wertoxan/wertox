import {EXAMPLES, TONES, makeDemo, packText} from './engine.mjs';
const el = id => document.getElementById(id);
for (const sample of EXAMPLES) el('example').append(new Option(sample.name, sample.id));
for (const [key, title] of Object.entries(TONES)) el('tone').append(new Option(title,key));
function render(resetTone = false) {
  const sample = EXAMPLES.find(item => item.id === el('example').value);
  if (resetTone) el('tone').value = sample.tone;
  el('topic').textContent = sample.topic;
  el('result').textContent = packText(makeDemo({...sample, tone:el('tone').value, language:'ru'}));
}
el('example').addEventListener('change', () => render(true));
el('tone').addEventListener('change', () => render());
el('download').addEventListener('click', () => {
  const localFile = URL.createObjectURL(new Blob([el('result').textContent],{type:'text/plain;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = localFile;
  link.download = 'content-pack.txt';
  link.click();
  setTimeout(() => URL.revokeObjectURL(localFile),1000);
});
render(true);
