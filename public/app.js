const state={score:0,completed:new Set(),sound:true,studentName:'Explorador',avatar:'🦊'};
const $=(s)=>document.querySelector(s);const $$=(s)=>[...document.querySelectorAll(s)];
const toast=(msg)=>{const el=$('#toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200)};
let audioCtx=null;
function ensureAudio(){
  if(!audioCtx){
    const AudioCtx=window.AudioContext||window.webkitAudioContext;
    audioCtx=new AudioCtx();
  }
  if(audioCtx.state==='suspended') audioCtx.resume();
  return audioCtx;
}
function playTone(freqs,duration,options={}){
  if(!state.sound)return;
  const ctx=ensureAudio();
  const now=ctx.currentTime;
  const gain=ctx.createGain();
  gain.gain.setValueAtTime(0.0001,now);
  gain.gain.exponentialRampToValueAtTime(options.volume||0.045,now+0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001,now+duration);
  gain.connect(ctx.destination);

  const osc=ctx.createOscillator();
  osc.type=options.type||'sine';
  osc.frequency.setValueAtTime(freqs[0],now);
  if(freqs[1]) osc.frequency.exponentialRampToValueAtTime(freqs[1],now+duration);
  osc.connect(gain);
  osc.start(now);
  osc.stop(now+duration);
}
function playCue(kind){
  if(!state.sound)return;
  if(kind==='correct'){
    playTone([660,880],0.18,{type:'triangle',volume:0.05});
    setTimeout(()=>playTone([880,1100],0.14,{type:'triangle',volume:0.04}),80);
  } else if(kind==='error'){
    playTone([220,180],0.24,{type:'sawtooth',volume:0.04});
  } else if(kind==='celebrate'){
    playTone([523,659],0.12,{type:'square',volume:0.04});
    setTimeout(()=>playTone([659,783],0.12,{type:'square',volume:0.04}),90);
    setTimeout(()=>playTone([783,1046],0.16,{type:'square',volume:0.04}),180);
  } else if(kind==='welcome'){
    playTone([392,523],0.12,{type:'sine',volume:0.04});
    setTimeout(()=>playTone([523,659],0.12,{type:'sine',volume:0.04}),90);
  }
}
const speak=(text)=>{
  if(!state.sound)return;
  const msg=text.toLowerCase();
  if(msg.includes('excelente')||msg.includes('correcta')||msg.includes('correcto')) playCue('correct');
  else if(msg.includes('inténtalo')||msg.includes('casi')||msg.includes('incorrect')) playCue('error');
  else if(msg.includes('evaluación')||msg.includes('terminada')||msg.includes('complet')) playCue('celebrate');
  else playCue('welcome');
};
function addScore(n){state.score+=n;$('#scoreValue').textContent=state.score;localStorage.setItem('vowelScore',state.score);updateStudentProfile();}
function complete(stage){if(!state.completed.has(stage)){state.completed.add(stage);updateProgress();localStorage.setItem('vowelCompleted',JSON.stringify([...state.completed]));updateStudentProfile();}}
function updateProgress(){const p=Math.round(state.completed.size/5*100);$('#progressText').textContent=p+'%';$('#progressBar').style.width=p+'%';}
function updateStudentProfile(){
  const name = state.studentName.trim() || 'Explorador';
  const completedCount = state.completed.size;
  const badge = completedCount===5 ? '🏅 Maestro' : completedCount>=3 ? '🌟 Explorador' : '🌈 Aprendiz';
  $('#studentSummary').textContent=`${name}, ya avanzaste ${completedCount} de 5 fases.`;
  $('#studentLevel').textContent=`Nivel ${Math.min(3, 1 + Math.floor(state.score / 50))}`;
  $('#studentPoints').textContent=`${state.score} ⭐`;
  $('#studentProgress').textContent=`${completedCount}/5 fases`;
  $('#studentBadge').textContent=badge;
  $('#avatarBadge').textContent=state.avatar;
  $('#studentNameInput').value=name;
  $('#avatarSelect').value=state.avatar;
}
function restore(){
  state.score=Number(localStorage.getItem('vowelScore')||0);
  state.studentName=localStorage.getItem('studentName')||'Explorador';
  state.avatar=localStorage.getItem('studentAvatar')||'🦊';
  $('#scoreValue').textContent=state.score;
  try{state.completed=new Set(JSON.parse(localStorage.getItem('vowelCompleted')||'[]'))}catch{};
  updateProgress();
  updateStudentProfile();
}
$('#menuBtn').onclick=()=>{const nav=$('#mainNav');nav.classList.toggle('open');$('#menuBtn').setAttribute('aria-expanded',nav.classList.contains('open'))};$$('.main-nav a').forEach(a=>a.onclick=()=>$('#mainNav').classList.remove('open'));
$('#soundToggle').onclick=()=>{state.sound=!state.sound;$('#soundToggle').textContent=state.sound?'🔊':'🔇';$('#soundToggle').setAttribute('aria-pressed',String(state.sound));toast(state.sound?'Sonidos activados':'Sonidos desactivados')};
$('#welcomeSpeak').onclick=()=>speak('Bienvenidos a la aventura de las vocales mágicas. Prepárate para jugar, explorar y aprender.');
$('#readContent').onclick=()=>speak('La aventura mágica de las vocales comienza con una historia, sigue con juegos, luego con explicaciones, creatividad y evaluación final.');
$('#showInstructions').onclick=()=>{$('#instructionsModal').hidden=false};$('#closeInstructions').onclick=()=>{$('#instructionsModal').hidden=true};$('#startFromInstructions').onclick=()=>{$('#instructionsModal').hidden=true;document.querySelector('#enganchar').scrollIntoView({behavior:'smooth'});speak('Comencemos la misión');};
$('#studentNameInput').addEventListener('input', (e)=>{state.studentName=e.target.value;localStorage.setItem('studentName',state.studentName);updateStudentProfile();});
$('#avatarSelect').addEventListener('change', (e)=>{state.avatar=e.target.value;localStorage.setItem('studentAvatar',state.avatar);updateStudentProfile();});

const splashScreen=$('#splashScreen');
const splashProgress=$('#splashProgress');
const startSplash=$('#startSplash');
const soundSplash=$('#soundSplash');
let splashValue=0;
function tickSplash(){if(splashValue<100){splashValue+=7; splashProgress.style.width=`${splashValue}%`; setTimeout(tickSplash,120);} else { splashScreen.classList.add('hidden'); }}
tickSplash();
startSplash.onclick=()=>{splashScreen.classList.add('hidden'); toast('¡Comenzamos!');};
soundSplash.onclick=()=>{state.sound=!state.sound; soundSplash.textContent=state.sound?'🔊 Sonido activado':'🔇 Sonido desactivado'; soundSplash.setAttribute('aria-pressed',String(state.sound)); $('#soundToggle').textContent=state.sound?'🔊':'🔇'; $('#soundToggle').setAttribute('aria-pressed',String(state.sound));};

const hookData=[{e:'✈️',w:'AVIÓN',a:'A'},{e:'🐘',w:'ELEFANTE',a:'E'},{e:'🏝️',w:'ISLA',a:'I'},{e:'🐻',w:'OSO',a:'O'},{e:'🍇',w:'UVAS',a:'U'}];let hookIndex=0,hookLocked=false;
function renderHook(){const q=hookData[hookIndex];$('#hookRound').textContent=`Reto ${hookIndex+1} de ${hookData.length}`;$('#hookEmoji').textContent=q.e;$('#hookWord').textContent=q.w;$('#hookFeedback').textContent='';$('#hookNext').classList.add('hidden');hookLocked=false;$('#hookOptions').innerHTML='';'AEIOU'.split('').forEach(v=>{const b=document.createElement('button');b.className='vowel-option';b.textContent=v;b.onclick=()=>answerHook(b,v,q.a);$('#hookOptions').appendChild(b)})}
function answerHook(btn,v,a){if(hookLocked)return;hookLocked=true;if(v===a){btn.classList.add('correct');$('#hookFeedback').textContent='¡Excelente! Esa es la vocal correcta.';speak('Excelente');addScore(10)}else{btn.classList.add('wrong');$('#hookFeedback').textContent=`Casi. La palabra comienza con ${a}.`;speak(`La palabra comienza con ${a}`);$$('.vowel-option').find(x=>x.textContent===a).classList.add('correct')}if(hookIndex===hookData.length-1)complete('enganchar');$('#hookNext').classList.remove('hidden')}
$('#hookListen').onclick=()=>speak(hookData[hookIndex].w);$('#hookNext').onclick=()=>{hookIndex=(hookIndex+1)%hookData.length;renderHook()};renderHook();

const sortWords=[{e:'🌳',w:'Árbol',v:'A'},{e:'🐘',w:'Elefante',v:'E'},{e:'🏝️',w:'Isla',v:'I'},{e:'🐻',w:'Oso',v:'O'},{e:'🍇',w:'Uvas',v:'U'}];let selectedWord=null,sorted=0;
function renderSort(){selectedWord=null;sorted=0;$('#wordCards').innerHTML='';$('#vowelBins').innerHTML='';$('#sortFeedback').textContent='';sortWords.forEach((x,i)=>{const b=document.createElement('button');b.className='word-card';b.dataset.i=i;b.textContent=`${x.e} ${x.w}`;b.onclick=()=>{$$('.word-card').forEach(c=>c.classList.remove('selected'));b.classList.add('selected');selectedWord=i;speak(x.w)};$('#wordCards').appendChild(b)});'AEIOU'.split('').forEach(v=>{const b=document.createElement('button');b.className='vowel-bin';b.textContent=v;b.onclick=()=>placeWord(v,b);$('#vowelBins').appendChild(b)})}
function placeWord(v,bin){if(selectedWord===null){toast('Primero selecciona una palabra');return}const x=sortWords[selectedWord],card=$(`.word-card[data-i="${selectedWord}"]`);if(x.v===v){bin.classList.add('done');bin.innerHTML=`${v}<small style="display:block;font:700 .75rem Nunito">${x.e}</small>`;card.disabled=true;card.style.opacity=.4;selectedWord=null;sorted++;addScore(10);$('#sortFeedback').textContent='¡Clasificación correcta!';if(sorted===sortWords.length){complete('explorar');speak('Misión completada')}}else{$('#sortFeedback').textContent='Inténtalo otra vez. Escucha con atención el primer sonido.';speak('Inténtalo otra vez')}}
$('#sortReset').onclick=renderSort;renderSort();

'AEIOU'.split('').forEach(v=>{const b=document.createElement('button');b.className='mini-vowel';b.textContent=v;b.onclick=()=>speak(`${v}. ${hookData.find(x=>x.a===v).w}`);$('#miniVowels').appendChild(b)});
$('#storyBtn').onclick=()=>{$('#storyModal').hidden=false};$('#closeStory').onclick=()=>{$('#storyModal').hidden=true};$('#readStory').onclick=()=>speak('En el bosque mágico, la A llevó un avión, la E invitó a un elefante, la I encendió una isla brillante, la O abrazó a un oso y la U compartió muchas uvas. Juntas descubrieron que cada una tenía un sonido especial.');$('#songBtn').onclick=()=>{speak('A, E, I, O, U. Las vocales aprendo yo. A, E, I, O, U. Con palmas las repites tú.');complete('explicar');addScore(10)};

$('#addCreation').onclick=()=>{const v=$('#creativeVowel').value,w=$('#creativeWord').value.trim(),e=$('#creativeEmoji').value;if(!w){$('#creativeFeedback').textContent='Escribe una palabra para continuar.';return}if(w[0].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase()!==v){$('#creativeFeedback').textContent=`La palabra debe comenzar con ${v}.`;speak(`Busca una palabra que comience con ${v}`);return}if($('.mural-empty'))$('.mural-empty').remove();const card=document.createElement('article');card.className='mural-item';card.innerHTML=`<div class="big">${e}</div><strong>${v} de ${w}</strong>`;$('#mural').appendChild(card);$('#creativeWord').value='';$('#creativeFeedback').textContent='¡Creación agregada al mural!';addScore(15);complete('elaborar')};

const quiz=[{q:'¿Con qué vocal comienza AVIÓN?',a:['A','E','O'],c:0},{q:'¿Con qué vocal comienza ELEFANTE?',a:['I','U','E'],c:2},{q:'Selecciona la vocal de ISLA.',a:['I','A','O'],c:0},{q:'¿Qué palabra comienza con O?',a:['Uvas','Oso','Árbol'],c:1},{q:'¿Qué palabra comienza con U?',a:['Elefante','Isla','Uvas'],c:2},{q:'¿Cuál de estas es una vocal?',a:['M','A','P'],c:1},{q:'¿Cuántas vocales aprendimos?',a:['3','5','8'],c:1},{q:'La palabra ÁRBOL comienza con...',a:['A','E','U'],c:0},{q:'¿Cuál secuencia contiene solo vocales?',a:['A E I O U','M P S T','A B C D'],c:0},{q:'¿Qué vocal falta? A, E, I, __, U',a:['O','M','S'],c:0}];let qi=0,qscore=0,qlocked=false;
$('#startQuiz').onclick=()=>{$('#quizIntro').classList.add('hidden');$('#quizArea').classList.remove('hidden');qi=0;qscore=0;renderQuiz()};
function renderQuiz(){qlocked=false;const q=quiz[qi];$('#quizCounter').textContent=`Pregunta ${qi+1} de ${quiz.length}`;$('#quizScore').textContent=`Puntaje: ${qscore}`;$('#quizProgressBar').style.width=`${(qi/quiz.length)*100}%`;$('#quizQuestion').textContent=q.q;$('#quizAnswers').innerHTML='';$('#quizFeedback').textContent='';$('#quizNext').classList.add('hidden');q.a.forEach((ans,i)=>{const b=document.createElement('button');b.className='quiz-answer';b.textContent=ans;b.onclick=()=>answerQuiz(b,i,q.c);$('#quizAnswers').appendChild(b)})}
function answerQuiz(btn,i,c){if(qlocked)return;qlocked=true;if(i===c){btn.classList.add('correct');qscore++;addScore(5);$('#quizFeedback').textContent='¡Respuesta correcta!'}else{btn.classList.add('wrong');$$('.quiz-answer')[c].classList.add('correct');$('#quizFeedback').textContent=`La respuesta correcta es ${quiz[qi].a[c]}.`}$('#quizNext').classList.remove('hidden')}
$('#quizNext').onclick=()=>{qi++;if(qi<quiz.length)renderQuiz();else finishQuiz()};
function finishQuiz(){complete('evaluar');$('#quizArea').classList.add('hidden');const pct=Math.round(qscore/quiz.length*100);const badge=pct>=90?'🥇':pct>=70?'🥈':'🌟';$('#quizResult').innerHTML=`<div class="result-badge">${badge}</div><h3>¡Evaluación terminada!</h3><p>Obtuviste <strong>${qscore}/${quiz.length}</strong> (${pct}%).</p><p>${pct>=70?'Reconoces muy bien las vocales.':'Sigue practicando y vuelve a intentarlo.'}</p><button class="btn primary" onclick="location.reload()">Volver a jugar</button>`;$('#quizResult').classList.remove('hidden');speak(`Obtuviste ${qscore} respuestas correctas de ${quiz.length}`); createConfetti();}
function createConfetti(){const colors=['#71c7ff','#7edcaa','#ffd95a','#ff9fbd','#bda1ff'];for(let i=0;i<25;i++){const piece=document.createElement('span');piece.className='confetti-piece';piece.style.left=Math.random()*100+'%';piece.style.background=colors[i%colors.length];piece.style.animationDelay=Math.random()*0.2+'s';piece.style.setProperty('--drift', `${(Math.random()>.5?1:-1)*(20+Math.random()*30)}px`);document.body.appendChild(piece);setTimeout(()=>piece.remove(),2200)}}
$('#resetAll').onclick=()=>{localStorage.removeItem('vowelScore');localStorage.removeItem('vowelCompleted');localStorage.removeItem('studentName');localStorage.removeItem('studentAvatar');location.reload()};restore();
