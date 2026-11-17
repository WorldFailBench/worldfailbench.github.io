'use strict';
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const tasks = {
 reason: {title:'Does the model reproduce the same error?',description:'Distinguish task planning failures—wrong targets, subgoals, or ordering—from action execution failures, such as a missed grasp or dropped object. Compare type frequencies and differences across policies.',metrics:['TFE ↓ Type Frequency Error','TPC ↑ Type-specific Policy Correlation'],visual:'<div class="task-example-grid"><figure class="task-example-card"><figcaption><span>Reference execution</span><strong>Action execution failure</strong></figcaption><button class="figure-button" data-figure="assets/task-type-example.png" data-caption="Same outcome, different failure types: reference execution vs. world-model rollout." aria-label="Expand the failure-type comparison"><img src="assets/task-type-reference.png" alt="Three reference frames show a cloth grasp attempt followed by the cloth falling; red circles mark the object."><span class="zoom-label">↗ Expand comparison</span></button><p>Grasp attempt followed by a fall.</p></figure><figure class="task-example-card task-example-model"><figcaption><span>World-model rollout</span><strong>Task planning failure</strong></figcaption><button class="figure-button" data-figure="assets/task-type-example.png" data-caption="Same outcome, different failure types: reference execution vs. world-model rollout." aria-label="Expand the failure-type comparison"><img src="assets/task-type-world-model.png" alt="Three world-model frames show the robot attempting to grasp the basket instead of collecting the cloth; red circles mark the targets."><span class="zoom-label">↗ Expand comparison</span></button><p>Grasp attempt for the basket.</p></figure></div>'},
 stage: {title:'Does failure occur at the same stage?',description:'Decompose each task into ordered semantic stages. Identify the earliest decisive event preventing completion, then compare stage-specific failure frequencies and cross-policy correlations.',metrics:['SFE ↓ Stage Frequency Error','SPC ↑ Stage-specific Policy Correlation'],visual:'<div class="task-example-grid"><figure class="task-example-card"><figcaption><span>Reference execution</span><strong>Failure during placement</strong></figcaption><div class="example-stage-track" aria-label="Acquisition, transport, then failure at placement"><span>Acquisition</span><span>Transport</span><span class="failed">Placement ×</span></div><button class="figure-button" data-figure="assets/task-stage-example.png" data-caption="Same outcome, different failure stages: placement in reference execution, transport in the world-model rollout." aria-label="Expand the failure-stage comparison"><img src="assets/task-stage-reference.png" alt="Reference frames show cloth acquisition, transport, and failure during placement; original red circles highlight the cloth."><span class="zoom-label">↗ Expand comparison</span></button></figure><figure class="task-example-card task-example-model"><figcaption><span>World-model rollout</span><strong>Failure during transport</strong></figcaption><div class="example-stage-track" aria-label="Acquisition, then failure at transport before placement"><span>Acquisition</span><span class="failed">Transport ×</span><span class="unreached">Placement</span></div><button class="figure-button" data-figure="assets/task-stage-example.png" data-caption="Same outcome, different failure stages: placement in reference execution, transport in the world-model rollout." aria-label="Expand the failure-stage comparison"><img src="assets/task-stage-world-model.png" alt="World-model frames show cloth acquisition followed by failure during transport, before the placement stage; original red circles mark the decisive region."><span class="zoom-label">↗ Expand comparison</span></button></figure></div>'},
 boundary: {title:'Does the model capture the transition?',description:'Change object position, orientation, or size in controlled simulation. Compare paired nearby conditions to test whether the world model reproduces the direction and magnitude of a reference success-rate drop.',metrics:['OA ↑ Order Accuracy','GE ↓ Gap Error'],visual:'<p class="task-example-context">RoboTwin · FastWAM · Place burger and fries on the tray</p><div class="task-example-grid"><figure class="task-example-card"><figcaption><span>Fries carton yaw −20°</span><strong>100% reference success</strong><span class="example-rate">10 / 10 rollouts</span></figcaption><div class="example-frame-labels"><span>Initial scene</span><span>Final frame</span></div><button class="figure-button" data-figure="assets/task-boundary-success.png" data-caption="RoboTwin · FastWAM · fries carton yaw −20°. Initial and final frames of one successful reference rollout; the condition succeeds in 10/10 rollouts." aria-label="Expand the successful boundary example"><img src="assets/task-boundary-success.png" alt="At minus 20 degrees fries carton yaw, the initial scene and final frame show a successful reference rollout with the burger and fries on the tray."><span class="zoom-label">↗ Expand example</span></button><p>Shown rollout: success. Both items reach the tray.</p></figure><figure class="task-example-card task-example-model"><figcaption><span>Fries carton yaw −40°</span><strong>10% reference success</strong><span class="example-rate">1 / 10 rollouts</span></figcaption><div class="example-frame-labels"><span>Initial scene</span><span>Final frame</span></div><button class="figure-button" data-figure="assets/task-boundary-failure.png" data-caption="RoboTwin · FastWAM · fries carton yaw −40°. Initial and final frames of one failed reference rollout; the condition succeeds in 1/10 rollouts." aria-label="Expand the failed boundary example"><img src="assets/task-boundary-failure.png" alt="At minus 40 degrees fries carton yaw, the initial scene and final frame show a failed reference rollout: the burger reaches the tray while the fries remain outside."><span class="zoom-label">↗ Expand example</span></button><p>Shown rollout: failure. The fries remain outside the tray.</p></figure></div><p class="task-example-scope">Only the fries carton orientation changes. Rates cover 10 reference rollouts per condition; images show one rollout from each.</p>'}
};
function showTask(key){const t=tasks[key];$$('[data-task]').forEach(b=>{const yes=b.dataset.task===key;b.setAttribute('aria-selected',yes);b.tabIndex=yes?0:-1});$('#task-panel').setAttribute('aria-labelledby','tab-'+key);$('#task-panel').dataset.dimension=key;$('#task-title').textContent=t.title;$('#task-description').textContent=t.description;$('#task-metrics').innerHTML=t.metrics.map(m=>'<span>'+m+'</span>').join('');$('#task-illustration').innerHTML=t.visual;}
$$('[data-task]').forEach((b,i,buttons)=>{b.addEventListener('click',()=>showTask(b.dataset.task));b.addEventListener('keydown',e=>{let j;if(e.key==='ArrowRight')j=(i+1)%buttons.length;else if(e.key==='ArrowLeft')j=(i+buttons.length-1)%buttons.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=buttons.length-1;else return;e.preventDefault();buttons[j].focus();showTask(buttons[j].dataset.task)})});showTask('reason');
const definitions={tfe:{label:'Type Frequency Error',lower:true,description:'TFE: mean absolute discrepancy in planning- and execution-failure frequencies. Tasks are weighted equally within each policy, then the five policies are weighted equally. Values are fractions; 0.159 corresponds to 15.9 percentage points. Lower is better.'},tpc:{label:'Type-specific Policy Correlation',lower:false,description:'TPC: Pearson correlation across five policies for each failure type, averaged over defined type correlations within each task, then equally over tasks. Range −1 to 1. Higher is better.'},sfe:{label:'Stage Frequency Error',lower:true,description:'SFE: summed absolute differences between stage-specific failure frequencies, averaged across policies and tasks. Range 0–2. Lower is better.'},spc:{label:'Stage-specific Policy Correlation',lower:false,description:'SPC: Pearson correlation across five policies for each stage, averaged over defined stage correlations within each task, then equally over eligible tasks. Range −1 to 1. Higher is better.'},oa:{label:'Boundary Order Accuracy',lower:false,description:'OA: direction agreement between signed reference and world-model success-rate changes. Ties score zero. Pairs are averaged within each setting, then settings are weighted equally for the selected intervention. Range 0–1; higher is better.'},ge:{label:'Boundary Gap Error',lower:true,description:'GE: absolute error between signed reference and world-model success-rate changes. Pairs are averaged within each setting, then settings are weighted equally for the selected intervention. Lower is better.'}};
function getValue(row,key){const [metric,factor]=key.split('-');return factor?row.boundary[factor][metric.toUpperCase()]:row[metric.toUpperCase()];}
const modelRows=BENCHMARK_RESULTS.rows.filter(r=>!r.isBaseline);
function renderResults(group){
 const key=group.querySelector('.task-metric-select').value,[metric,factor]=key.split('-'),def=definitions[metric];
 const rows=modelRows.slice().sort((a,b)=>def.lower?getValue(a,key)-getValue(b,key):getValue(b,key)-getValue(a,key));
 const correlation=metric==='tpc'||metric==='spc',max=correlation?1:Math.max(...rows.map(r=>getValue(r,key)),.001);
 group.querySelector('.results-chart').innerHTML=rows.map(row=>{const value=getValue(row,key),left=correlation?Math.min(50,50+value*50):0,width=correlation?Math.abs(value)*50:value/max*100;return '<div class="chart-row"><span class="chart-label">'+row.fullName+'</span><div class="bar-track" '+(correlation?'style="background:linear-gradient(90deg,#f7f2ec 49.8%,#b6c5b8 49.8%,#b6c5b8 50.2%,#f0f3ed 50.2%)"':'')+'><span class="bar-fill" style="width:'+width+'%;'+(correlation?'position:absolute;left:'+left+'%;background:'+(value<0?'#bd896d':'#6d957d'):'')+'"></span></div><span class="chart-value">'+value.toFixed(3)+'</span></div>';}).join('');
 const baseline=BENCHMARK_RESULTS.rows.find(r=>r.isBaseline);
 group.querySelector('.metric-explanation').textContent=def.description+' Reference repeatability (Ref–Ref): '+getValue(baseline,key).toFixed(3)+'.';
 group.querySelector('.results-subtitle').textContent='RoboTwin · '+def.label+(factor?' · '+factor:'')+' · '+(def.lower?'Lower is better':'Higher is better');
}
$$('[data-results-group]').forEach(group=>{
 const keys=group.dataset.tableKeys.split(',');
 const best=keys.map(k=>{const values=modelRows.map(r=>getValue(r,k));return definitions[k.split('-')[0]].lower?Math.min(...values):Math.max(...values);});
 group.querySelector('tbody').innerHTML=BENCHMARK_RESULTS.rows.map(r=>'<tr><td>'+r.fullName+(r.isBaseline?' <small>(reference baseline)</small>':'')+'</td>'+keys.map((k,i)=>'<td'+(!r.isBaseline&&getValue(r,k)===best[i]?' class="best"':'')+'>'+getValue(r,k).toFixed(3)+'</td>').join('')+'</tr>').join('');
 group.querySelector('.task-metric-select').addEventListener('change',()=>renderResults(group));renderResults(group);
});

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
  status.textContent='';
  updatePlayButton();
 }
 async function playBoth(restart=false){
  const current=++generation;
  if(restart||videos.every(v=>v.ended))videos.forEach(v=>{v.currentTime=0;});
  status.textContent='Loading…';
  const outcomes=await Promise.allSettled(videos.filter(v=>!v.ended).map(v=>v.play()));
  if(current!==generation)return;
  status.textContent=outcomes.some(r=>r.status==='rejected')?'Use each video\'s play control to start playback.':'Playing.';
  updatePlayButton();
 }
 $$('[data-boundary-env]').forEach(b=>b.addEventListener('click',()=>{if(environment!==b.dataset.boundaryEnv){environment=b.dataset.boundaryEnv;selectBoundary();}}));
 $$('[data-boundary-factor]').forEach(b=>b.addEventListener('click',()=>{if(factor!==b.dataset.boundaryFactor){factor=b.dataset.boundaryFactor;selectBoundary();}}));
 playButton.addEventListener('click',()=>{if(isPlaying()){generation++;videos.forEach(v=>v.pause());status.textContent='Paused.';}else playBoth();});
 $('#boundary-restart').addEventListener('click',()=>playBoth(true));
 videos.forEach(v=>{
  ['play','pause'].forEach(event=>v.addEventListener(event,updatePlayButton));
  v.addEventListener('ended',()=>{updatePlayButton();status.textContent=videos.every(x=>x.ended)?'Both rollouts finished.':isPlaying()?'One rollout finished; the other continues.':'One rollout finished. Play to continue.';});
  v.addEventListener('error',()=>{status.textContent='This video could not load. Select another pair or try again.';});
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden){generation++;videos.forEach(v=>v.pause());status.textContent='Paused.';updatePlayButton();}});
 selectBoundary();
})();
