import { t, translateMarkup } from './i18n.js';
import { note, geometry } from './staff-engine.js';
const letters = 'CDEFGAB';
export function writtenPitch(midi) {
  const names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const written = midi + 12;
  return note(names[written % 12] + (Math.floor(written / 12) - 1));
}
export function staffAnswer(root, submit) {
  root.innerHTML = `<h3>Place the note on the staff</h3><p class="small-copy">Tap or use ↑ / ↓ to place a note. Enter to check.</p><div class="staff-result" role="status" hidden><strong></strong><p></p></div><svg class="answer-staff" viewBox="0 0 400 290" tabindex="0" role="slider" aria-label="Written guitar note" aria-valuemin="23" aria-valuemax="44"></svg><div class="staff-answer-controls"><label>Accidental <select aria-label="Accidental"><option value="">Natural</option><option value="#">Sharp ♯</option><option value="b">Flat ♭</option></select></label><button type="button" class="primary">Check staff answer</button></div><p class="small-copy staff-selection" role="status"></p>`;
  translateMarkup(root);
  const svg = root.querySelector('svg'), accidental = root.querySelector('select'), check = root.querySelector('button'), status = root.querySelector('.staff-selection');
  let step = 34, placed = false, locked = false, result = null;
  const resultBox = root.querySelector('.staff-result');
  const pretty = n => n.id.replace('#', '♯').replace('b', '♭');
  const selection = () => note(letters[step % 7] + accidental.value + Math.floor(step / 7));
  function add(tag, attrs, text) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key,value] of Object.entries(attrs)) el.setAttribute(key,value);
    if (text) el.textContent = text;
    svg.append(el);
  }
  function draw() {
    svg.replaceChildren();
    for (let y=80;y<=160;y+=20) add('line',{x1:30,x2:370,y1:y,y2:y,class:'staff-line'});
    add('text',{x:48,y:140,class:'music-symbol'},'\uE050');
    add('text',{x:65,y:204,class:'octave-mark'},'8');
    svg.setAttribute('aria-valuenow',step);
    svg.setAttribute('aria-valuetext',placed ? selection().id : t('No note placed; press an arrow key or tap the staff'));
    svg.setAttribute('aria-disabled',String(locked)); svg.tabIndex=locked?-1:0;
    accidental.disabled=locked; check.disabled=locked||!placed;
    if (!placed) return;
    function drawNote(n, x, kind, label) {
      const g=geometry(n);
      for(const y of g.ledger) add('line',{x1:x-19,x2:x+19,y1:y,y2:y,class:'ledger-line'});
      if(n.accidental) add('text',{x:x-39,y:g.y,class:'music-symbol'},n.accidental==='#'?'\uE262':'\uE260');
      add('ellipse',{cx:x,cy:g.y,rx:12,ry:8,transform:`rotate(-15 ${x} ${g.y})`,class:`note-head ${kind}`});
      const stemX=g.stemDown?x-11:x+11;
      add('line',{x1:stemX,x2:stemX,y1:g.y,y2:g.y+(g.stemDown?60:-60),class:'note-stem'});
      if(label) add('text',{x,y:275,'text-anchor':'middle',class:'staff-note-label'},label);
    }
    if (result?.kind === 'incorrect') {
      drawNote(result.chosen,170,'chosen-note',t('Your answer'));
      drawNote(result.expected,295,'correct-note',t('Correct note'));
    } else drawNote(selection(),231,result ? 'correct-note' : '',result ? t('Correct note') : '');
  }

  function place(value) { if(locked)return;step=Math.max(23,Math.min(44,value));placed=true;status.textContent='';draw(); }
  svg.addEventListener('click',event=>{
    const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM().inverse());
    place(Math.round(30+(160-point.y)/10)); svg.focus();
  });
  svg.addEventListener('keydown',event=>{
    if(locked)return;
    if(['ArrowUp','ArrowDown','Home','End'].includes(event.key)) {
      event.preventDefault();place(event.key==='Home'?23:event.key==='End'?44:step+(event.key==='ArrowUp'?1:-1));
    } else if(event.key==='Enter'&&!event.repeat) {event.preventDefault();if(placed)submit(selection());}
  });
  accidental.addEventListener('change',()=>{if(!locked){placed=true;draw();}});
  check.addEventListener('click',()=>{if(placed&&!locked)submit(selection());});
  draw();
  return {
    reset(){step=34;placed=false;locked=false;result=null;resultBox.hidden=true;root.querySelector('.staff-answer-controls').hidden=false;accidental.value='';status.textContent='';draw();},
    focus(){svg.focus();},
    reveal(midi, assisted = false){
      if (locked) return;
      const chosen = placed ? selection() : null, correct = !assisted && chosen?.midi === midi;
      const n = correct ? chosen : writtenPitch(midi);
      result = { kind: assisted ? 'revealed' : correct ? 'correct' : 'incorrect', chosen, expected: n };
      resultBox.hidden=false;resultBox.dataset.result=result.kind;
      resultBox.querySelector('strong').textContent=assisted ? t('Answer revealed') : correct ? t("Correct!") : t('Not quite');
      resultBox.querySelector('p').textContent=assisted ? t`Answer: ${pretty(n)}. No progress earned.` : correct ? t`${pretty(n)} is correct, including the octave.` : t`You placed ${pretty(chosen)}. The correct note is ${pretty(n)}.`;
      root.querySelector('.staff-answer-controls').hidden=true;
      step=n.step;accidental.value=n.accidental;placed=true;locked=true;
      status.textContent=t`Correct position: written ${pretty(n)}. Press Enter for the next question.`;draw();
      svg.setAttribute('aria-valuetext', resultBox.textContent);
    }
  };
}
