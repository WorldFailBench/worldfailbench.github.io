'use strict';
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const tasks = {
 reason: {kicker:'FAILURE REASON',title:'Does the model reproduce the same error?',description:'Distinguish task planning failures—wrong targets, subgoals, or ordering—from action execution failures, such as a missed grasp or dropped object. Compare type frequencies and differences across policies.',metrics:['TFE ↓ Type Frequency Error','TPC ↑ Type-specific Policy Correlation'],visual:'<div class="comparison-row"><small>REFERENCE</small><strong>Grasps the cloth, then drops it</strong><span class="outcome-tag">Failure</span></div><div class="comparison-row"><small>WORLD MODEL</small><strong>Grasps the basket instead</strong><span class="outcome-tag">Failure</span></div><p class="illustration-caption">Paper example · Same outcome, different observable failure types: execution vs. planning.</p>'},
 stage: {kicker:'FAILURE STAGE',title:'Does failure occur at the same stage?',description:'Decompose each task into ordered semantic stages. Identify the earliest decisive event preventing completion, then compare stage-specific failure frequencies and cross-policy correlations.',metrics:['SFE ↓ Stage Frequency Error','SPC ↑ Stage-specific Policy Correlation'],visual:'<span class="stage-label">REFERENCE · FAILURE AT PLACEMENT</span><div class="stage-track"><span>Grasp</span>→<span>Transport</span>→<span class="failed">Place ×</span></div><span class="stage-label">WORLD MODEL · FAILURE AT TRANSPORT</span><div class="stage-track"><span>Grasp</span>→<span class="failed">Transport ×</span>→<span>Place</span></div><p class="illustration-caption">Paper example · An outcome label alone cannot locate the failure.</p>'},
 boundary: {kicker:'FAILURE BOUNDARY',title:'Does the model capture the transition?',description:'Change object position, orientation, or size in controlled simulation. Compare paired nearby conditions to test whether the world model reproduces the direction and magnitude of a reference success-rate drop.',metrics:['OA ↑ Order Accuracy','GE ↓ Gap Error'],visual:'<div class="boundary-illustration"><div class="boundary-scene"><div><b>↔</b>Condition A<br>Higher reference success</div><div><b>↔</b>Condition B<br>Lower reference success</div></div><p class="illustration-caption">Controlled intervention · The scene changes. The policy stays fixed.</p></div><p class="illustration-caption">120 pairs across two simulation environments. Position, orientation, and size are evaluated separately.</p>'}
};
function showTask(key){const t=tasks[key];$$('[data-task]').forEach(b=>{const yes=b.dataset.task===key;b.setAttribute('aria-selected',yes);b.tabIndex=yes?0:-1});$('#task-panel').setAttribute('aria-labelledby','tab-'+key);$('#task-kicker').textContent=t.kicker;$('#task-title').textContent=t.title;$('#task-description').textContent=t.description;$('#task-metrics').innerHTML=t.metrics.map(m=>'<span>'+m+'</span>').join('');$('#task-illustration').innerHTML=t.visual;}
$$('[data-task]').forEach((b,i,buttons)=>{b.addEventListener('click',()=>showTask(b.dataset.task));b.addEventListener('keydown',e=>{let j;if(e.key==='ArrowRight')j=(i+1)%buttons.length;else if(e.key==='ArrowLeft')j=(i+buttons.length-1)%buttons.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=buttons.length-1;else return;e.preventDefault();buttons[j].focus();showTask(buttons[j].dataset.task)})});showTask('reason');
const definitions={tfe:{label:'Type Frequency Error',lower:true,description:'TFE (Table 3): mean absolute discrepancy in planning- and execution-failure frequencies. Tasks are weighted equally within each policy, then the five policies are weighted equally. Values are fractions; 0.159 corresponds to 15.9 percentage points. Lower is better.'},sfe:{label:'Stage Frequency Error',lower:true,description:'SFE (Table 4): summed absolute differences between stage-specific failure frequencies, averaged across policies and tasks. Range 0–2. Lower is better.'},spc:{label:'Stage-specific Policy Correlation',lower:false,description:'SPC (Table 5): Pearson correlation across five policies for each stage, averaged over defined stage correlations within each task, then equally over eligible tasks. Range −1 to 1. Higher is better. Ref–Ref is 0.903.'},oa:{label:'Boundary Order Accuracy',lower:false,description:'OA (Table 6): direction agreement between signed reference and world-model success-rate changes. Ties score zero. Pairs are averaged within each setting, then settings are weighted equally for the selected intervention. Range 0–1; higher is better.'},ge:{label:'Boundary Gap Error',lower:true,description:'GE (Table 6): absolute error between signed reference and world-model success-rate changes. Pairs are averaged within each setting, then settings are weighted equally for the selected intervention. Lower is better.'}};
function getValue(row,key){const [m,f]=key.split('-');return f?row.boundary[f][m.toUpperCase()]:row[m.toUpperCase()]}
function renderResults(){const key=$('#metric-select').value,[m,f]=key.split('-'),def=definitions[m];const rows=BENCHMARK_RESULTS.rows.filter(r=>!r.isBaseline).slice().sort((a,b)=>def.lower?getValue(a,key)-getValue(b,key):getValue(b,key)-getValue(a,key));const max=m==='spc'?1:Math.max(...rows.map(r=>getValue(r,key)),.001);$('#results-chart').innerHTML=rows.map(row=>{const v=getValue(row,key),negative=m==='spc',left=negative?Math.min(50,50+v*50):0,width=negative?Math.abs(v)*50:v/max*100;return '<div class="chart-row"><span class="chart-label">'+row.fullName+'</span><div class="bar-track" '+(negative?'style="background:linear-gradient(90deg,#f7f2ec 49.8%,#b6c5b8 49.8%,#b6c5b8 50.2%,#f0f3ed 50.2%)"':'')+'><span class="bar-fill" style="width:'+width+'%;'+(negative?'position:absolute;left:'+left+'%;background:'+(v<0?'#bd896d':'#6d957d'):'')+'"></span></div><span class="chart-value">'+v.toFixed(3)+'</span></div>'}).join('');$('#metric-explanation').textContent=def.description+(f?' Factor: '+f+'. No overall boundary average is implied.':'');$('#results-subtitle').textContent='RoboTwin · '+def.label+(f?' · '+f:'')+' · '+(def.lower?'Lower is better':'Higher is better');}
$('#metric-select').addEventListener('change',renderResults);renderResults();
const tableKeys=['tfe','sfe','spc','oa-position','ge-position'];const modelRows=BENCHMARK_RESULTS.rows.filter(r=>!r.isBaseline);const best=tableKeys.map(k=>{const vals=modelRows.map(r=>getValue(r,k));return definitions[k.split('-')[0]].lower?Math.min(...vals):Math.max(...vals)});$('#results-table tbody').innerHTML=BENCHMARK_RESULTS.rows.map(r=>'<tr><td>'+r.fullName+(r.isBaseline?' <small>(reference baseline)</small>':'')+'</td>'+tableKeys.map((k,i)=>'<td'+(!r.isBaseline&&getValue(r,k)===best[i]?' class="best"':'')+'>'+getValue(r,k).toFixed(3)+'</td>').join('')+'</tr>').join('');
function renderSamples(filter='all'){const samples=DATASET_SAMPLES.filter(s=>filter==='all'||s.outcome===filter);$('#sample-grid').innerHTML=samples.map(s=>'<article class="sample-card"><button class="figure-button" data-figure="assets/'+s.file+'" data-caption="'+s.title+' · '+s.environment+' · initial observation" aria-label="Enlarge '+s.title+' initial observation"><img loading="lazy" src="assets/'+s.file+'" alt="Initial observation for '+s.title+' in '+s.environment+'"><span class="zoom-label">↗ Expand</span></button><div class="sample-content"><div class="sample-meta"><span>'+s.environment+' · '+(s.episode||'INITIAL FRAME')+'</span>'+(s.outcome?'<span class="'+s.outcome.toLowerCase()+'">'+s.outcome+'</span>':'')+'</div><h3>'+s.title+'</h3><p>'+s.instruction+'</p>'+(s.stages?.length?'<div class="sample-stage-list">'+s.stages.slice(0,4).join(' → ')+(s.stages.length>4?' → …':'')+'</div>':'')+'</div></article>').join('');if(!samples.length)$('#sample-grid').innerHTML='<p class="sample-note">No examples available for this selection.</p>';}
$$('[data-filter]').forEach(b=>b.addEventListener('click',()=>{$$('[data-filter]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b)});renderSamples(b.dataset.filter)}));renderSamples();
const dialog=$('#figure-dialog');document.addEventListener('click',e=>{const b=e.target.closest('[data-figure]');if(!b)return;$('#dialog-image').src=b.dataset.figure;$('#dialog-image').alt=b.dataset.caption;$('#dialog-caption').textContent=b.dataset.caption;dialog.showModal();});$('#close-dialog').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
const toggle=$('.menu-toggle');toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',open);$('#nav-links').classList.toggle('open',open)});$$('#nav-links a').forEach(a=>a.addEventListener('click',()=>{toggle.setAttribute('aria-expanded',false);$('#nav-links').classList.remove('open')}));
function updateProgress(){const max=document.documentElement.scrollHeight-innerHeight;$('.reading-progress').style.width=(max>0?scrollY/max*100:0)+'%'}addEventListener('scroll',updateProgress,{passive:true});addEventListener('resize',updateProgress);updateProgress();
const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){$$('#nav-links a').forEach(a=>a.classList.toggle('active',a.hash==='#'+e.target.id))}})},{rootMargin:'-15% 0px -65% 0px'});$$('section[id]').forEach(s=>observer.observe(s));

// Paired reference rollouts: condition labels and episode outcomes are separate.
(function setupBoundaryVideos(){
 const examples=window.BOUNDARY_EXAMPLES;
 if(!examples?.length)return;
 const panel=$('#boundary-videos'),videos=[$('#boundary-success-video'),$('#boundary-failure-video')];
 const playButton=$('#boundary-play'),status=$('#boundary-playback-status');
 let environment='RoboTwin',factor='orientation',generation=0;
 const isPlaying=()=>videos.some(v=>!v.paused&&!v.ended);
 function updatePlayButton(){playButton.textContent=isPlaying()?'Pause both':'Play both';}
 function selectBoundary(){
  generation++;
  const example=examples.find(e=>e.environment===environment&&e.factor===factor);
  videos.forEach(v=>v.pause());
  panel.dataset.environment=environment;
  $$('[data-boundary-env]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.boundaryEnv===environment));
  $$('[data-boundary-factor]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.boundaryFactor===factor));
  $('#boundary-pair').textContent=environment.toUpperCase()+' / '+factor.toUpperCase()+' / '+example.pair;
  $('#boundary-task').textContent=example.title;
  $('#boundary-intervention').textContent=example.intervention;
  $('#boundary-policy').textContent=example.policy;
  ['success','failure'].forEach((outcome,i)=>{
   const clip=example[outcome],video=videos[i];
   video.src='assets/boundary/'+clip.file;
   video.poster='assets/boundary/'+clip.poster;
   video.setAttribute('aria-label',environment+' '+example.title+' - '+outcome+' at '+clip.condition);
   $('#boundary-'+outcome+'-condition').textContent=clip.condition;
   $('#boundary-'+outcome+'-caption').textContent=clip.caption;
   video.load();
  });
  status.textContent='Use the controls to compare the two rollouts.';
  updatePlayButton();
 }
 async function playBoth(restart=false){
  const current=++generation;
  if(restart||videos.every(v=>v.ended))videos.forEach(v=>{v.currentTime=0;});
  status.textContent='Loading the paired rollouts...';
  const outcomes=await Promise.allSettled(videos.filter(v=>!v.ended).map(v=>v.play()));
  if(current!==generation)return;
  status.textContent=outcomes.some(r=>r.status==='rejected')?'Use each video\'s play control to start playback.':'Playing paired reference rollouts.';
  updatePlayButton();
 }
 $$('[data-boundary-env]').forEach(b=>b.addEventListener('click',()=>{if(environment!==b.dataset.boundaryEnv){environment=b.dataset.boundaryEnv;selectBoundary();}}));
 $$('[data-boundary-factor]').forEach(b=>b.addEventListener('click',()=>{if(factor!==b.dataset.boundaryFactor){factor=b.dataset.boundaryFactor;selectBoundary();}}));
 playButton.addEventListener('click',()=>{if(isPlaying()){generation++;videos.forEach(v=>v.pause());status.textContent='Playback paused.';}else playBoth();});
 $('#boundary-restart').addEventListener('click',()=>playBoth(true));
 videos.forEach(v=>{
  ['play','pause'].forEach(event=>v.addEventListener(event,updatePlayButton));
  v.addEventListener('ended',()=>{updatePlayButton();status.textContent=videos.every(x=>x.ended)?'Both rollouts finished. Restart to compare again.':isPlaying()?'One rollout has finished; the other continues.':'One rollout has finished. Play to continue the comparison.';});
  v.addEventListener('error',()=>{status.textContent='This video could not load. Select another pair or try again.';});
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden){generation++;videos.forEach(v=>v.pause());status.textContent='Playback paused.';updatePlayButton();}});
 selectBoundary();
})();
