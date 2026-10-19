import {CATALOG,UNAVAILABLE,template,makePart,simulate,validate,type Circuit,type Kind,type Part} from './engine.js';
import {REGIONS,MISSIONS,SIDE_ACTIVITIES,STARTER_TEMPLATES,startingCircuit,practiceQuestion,type Mission} from './missions.js';

type RecordProgress={completed:boolean;independent:boolean;attempts:number;assisted:boolean};
type Profile={name:string;suit:string;progress:Record<string,RecordProgress>;saved:Record<string,Circuit>;minutes:number;startedAt:number;settings:{diagram:boolean;big:boolean;contrast:boolean;reduce:boolean};side:string[]};
type Store={version:1;active:string;profiles:Record<string,Profile>};
const KEY='hero-academy-circuitquest-v1';
const app=document.getElementById('app')!;
const escapeHtml=(s:unknown)=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]!));
const clone=<T>(v:T):T=>JSON.parse(JSON.stringify(v)) as T;
const fresh=(name='Hero')=>({name,suit:'#ec7540',progress:{},saved:{},minutes:0,startedAt:Date.now(),settings:{diagram:false,big:false,contrast:false,reduce:false},side:[]} as Profile);
function loadStore():Store{try{const data=JSON.parse(localStorage.getItem(KEY)||'null');if(data?.version===1&&data?.profiles&&typeof data.active==='string'&&data.profiles[data.active])return data;}catch{}return {version:1,active:'Hero',profiles:{Hero:fresh()}}}
let store=loadStore();
let player=store.profiles[store.active];
let screen:'map'|'workshop'|'mission'|'grownups'='map';
let mission:Mission|null=null,phase=0,practice=0,assisted=false,tries=0,passed=false;
let circuit:Circuit=template('torch'),selected='load',terminal='',history:Circuit[]=[],future:Circuit[]=[];
let last=simulate(circuit),feedback='',zoom=1,showReference=false,showWires=true;
function persist(){try{localStorage.setItem(KEY,JSON.stringify(store))}catch{feedback='Device storage is full; export a backup.'}}
function mutate(action:()=>void){history.push(clone(circuit));if(history.length>60)history.shift();future=[];action();last=simulate(circuit);persist();render();}
function toNumber(v:unknown,fallback:number){const n=Number(v);return Number.isFinite(n)?n:fallback}
function pickMission(code:string){const next=MISSIONS.find(x=>x.id.toUpperCase()===code.toUpperCase());if(!next)return;mission=next;phase=0;practice=0;assisted=false;tries=0;passed=false;circuit=startingCircuit(next);last=simulate(circuit);selected=circuit.parts[0]?.id||'';history=[];future=[];feedback='';screen='mission';render();}
function checkGoal(m:Mission):boolean{
 const r=simulate(circuit);if(r.status==='invalid'||r.status==='short'||r.status==='off')return false;
 const part=(kind:Kind)=>circuit.parts.filter(p=>p.kind===kind);
 const loads=circuit.parts.filter(p=>['lamp','motor','buzzer','led','electromagnet'].includes(p.kind));
 const working=loads.filter(p=>r.readings[p.id]?.active);
 const meter=part('voltmeter').some(p=>Math.abs(r.readings[p.id]?.voltage||0)>.2)||part('ammeter').some(p=>Math.abs(r.readings[p.id]?.current||0)>.005);
 switch(m.goal){
  case 'on':return working.length>0;
  case 'switch':return working.length>0&&part('switch').some(p=>p.closed);
  case 'two':case 'series':return working.length>=2&&m.goal==='two'||(m.goal==='series'&&working.length>=2&&!circuit.wires.some(w=>/load2:a/.test(w.to)&&/switch:b/.test(w.from)));
  case 'parallel':return working.length>=2&&circuit.wires.some(w=>w.from==='switch:b'&&w.to==='load2:a');
  case 'meter':return working.length>0&&meter;
  case 'voltage':return working.length>0&&part('cell').some(p=>(p.value??0)>=3);
  case 'resistor':return working.length>0&&part('resistor').length>0;
  case 'led':return part('led').some(p=>r.readings[p.id]?.active);
  case 'shortsafe':return working.length>0&&!r.warnings.some(w=>w.toLowerCase().includes('overcurrent'));
  case 'off':return circuit.parts.some(p=>p.kind==='switch'&&!p.closed)&&r.status==='open';
  case 'calculations':return true;
 }
}
function finish(){if(!mission)return;const old=player.progress[mission.id];player.progress[mission.id]={completed:true,independent:!assisted,assisted,attempts:tries+(old?.attempts||0)};persist();phase=7;render();}
function say(text:string,slow=false){
 if(!('speechSynthesis'in window))return;window.speechSynthesis.cancel();
 const speech=new SpeechSynthesisUtterance(text);
 const voices=window.speechSynthesis.getVoices().filter(v=>v.lang.toLowerCase().startsWith('en-gb'));
 speech.voice=voices.find(v=>/female|susan|serena|kate|libby|siri/i.test(v.name))||voices[0]||null;
 speech.rate=slow?.68:.85;window.speechSynthesis.speak(speech);
}
function banner(){return `<section class="hero-banner"><div class="hero-illustration"><svg viewBox="0 0 300 130" aria-hidden="true"><path d="M0 112Q90 20 190 98T300 88V130H0" fill="#cbdcc0"/><circle cx="72" cy="50" r="28" fill="${player.suit}"/><rect x="54" y="74" width="36" height="40" rx="14" fill="${player.suit}"/><ellipse cx="72" cy="48" rx="25" ry="11" fill="#14353b"/><circle cx="63" cy="49" r="4" fill="#f6d46c"/><circle cx="81" cy="49" r="4" fill="#f6d46c"/><path d="M168 40h56v65h-56z" rx="14" fill="#f6d46c"/><rect x="160" y="40" width="72" height="62" rx="18" fill="#f6d46c" stroke="#14353b" stroke-width="4"/><rect x="170" y="50" width="52" height="25" rx="8" fill="#14353b"/><circle cx="185" cy="62" r="5" fill="#d9eee1"/><circle cx="208" cy="62" r="5" fill="#d9eee1"/><path d="M188 85q12 9 24 0" stroke="#14353b" stroke-width="3" fill="none"/><path d="M194 25v15" stroke="#14353b" stroke-width="4"/><circle cx="194" cy="22" r="6" fill="#ef733e"/></svg></div><div><span class="eyebrow">THE SPARK ISLES</span><h1>Build it. Test it. Light up the world.</h1><p>Join Pip and bring power back to the islands.</p><button class="primary" data-action="start-next">⚡ Continue adventure</button></div></section>`}
function progressCount(){return Object.values(player.progress).filter(v=>v.completed).length}
function mapScreen(){return `${banner()}<section class="panel"><div class="panel-title"><h2>🗺️ Choose an island</h2><span>${progressCount()} / 80 mission records</span></div><div class="region-grid">${REGIONS.map((r,i)=>`<article class="region"><div class="region-image" aria-hidden="true"><span>${['🏮','🛠️','🏙️','⛰️','🧲','🔬','⚡','🌟'][i]}</span><span class="stars">${MISSIONS.filter(m=>m.year===r.year&&player.progress[m.id]?.completed).length}/10 ⭐</span></div><h3>Year ${r.year} · ${escapeHtml(r.name)}</h3><p>${r.year===5?'Consolidation and enrichment':r.year>=10?'GCSE and revision':r.year>=7?'Key Stage 3 exploration':'National Curriculum science'}</p><div class="missions">${MISSIONS.filter(m=>m.year===r.year).map(m=>`<button data-action="mission" data-code="${m.id}" title="${escapeHtml(m.concept)}"><span>${player.progress[m.id]?.completed?'✓':'⚡'}</span><span><strong>${escapeHtml(m.title)}</strong><small>${m.id} · ${m.tag==='core'?'Curriculum':m.tag==='enrichment'?'Enrichment':m.tag==='separate'?'Separate Physics':'Higher'}</small></span></button>`).join('')}</div></article>`).join('')}</div></section><section class="panel"><h2>🔎 Explore for fun</h2><p>Optional discoveries — no timers, scores or pressure.</p><div class="side-grid">${SIDE_ACTIVITIES.filter(x=>x.year===4||x.year===5).map(a=>`<button class="side-button" data-action="side" data-code="${a.id}">${player.side.includes(a.id)?'⭐':'🧭'} ${escapeHtml(a.name)}</button>`).join('')}</div></section>`}
const stages=['Discover','Learn','Try','Practise','Build','Test','Explain','Reward'];
function missionScreen(){
 if(!mission)return mapScreen();
 const m=mission,pr=player.progress[m.id];
 const header=`<section class="panel"><div class="panel-title"><div><span class="eyebrow">${m.id} · YEAR ${m.year} · ${escapeHtml(m.tag.toUpperCase())}</span><h1>${escapeHtml(m.title)}</h1></div><button data-screen="map">← Map</button></div><div class="stage-progress" aria-label="Learning journey">${stages.map((s,i)=>`<span class="${i===phase?'current':i<phase?'done':''}">${i<phase?'✓':i+1}. ${s}</span>`).join('')}</div></section>`;
 let inner='';
 if(phase===0)inner=`<div class="story-scene">⚡ <span>🌴</span> 🔌 <span>🏡</span> ✨</div><h2>Pip needs your help!</h2><p class="big-message">${escapeHtml(m.mission)}</p><button class="primary" data-action="next-stage">Let's go →</button>`;
 if(phase===1)inner=`<h2>💡 ${escapeHtml(m.concept)}</h2><p class="big-message">${escapeHtml(m.lesson)}</p><div class="button-row"><button data-action="speak" data-text="lesson">🔊 Hear</button><button data-action="slow" data-text="lesson">🐢 Slow</button><button class="primary" data-action="next-stage">Show me →</button></div>`;
 if(phase===2)inner=`<h2>🤖 Pip shows you</h2><p>Try the working example. See the current and the light!</p><div class="demo">${miniDisplay(template(m.starter))}</div><p class="fine">The example is separate from your own invention.</p><button class="primary" data-action="next-stage">My turn →</button>`;
 if(phase===3)inner=`<h2>🔍 Investigate</h2><p>Try two quick experiments before building.</p><div class="two-checks"><div class="mini-check"><strong>1. Open the switch</strong><p>Does a lamp in this single-loop circuit stay lit?</p><button data-action="practice" data-answer="no" data-idx="0">○ No</button><button data-action="practice" data-answer="yes" data-idx="0">● Yes</button></div><div class="mini-check"><strong>2. Connect the loop</strong><p>Will a correctly connected battery and lamp work?</p><button data-action="practice" data-answer="yes" data-idx="1">● Yes</button><button data-action="practice" data-answer="no" data-idx="1">○ No</button></div></div><p role="status">${escapeHtml(feedback)}</p><p>${practice}/2 experiments complete</p>${practice>=2?'<button class="primary" data-action="next-stage">Build it →</button>':''}`;
 if(phase===4||phase===5)inner=`<h2>🛠️ Build the invention</h2><p class="big-message">${escapeHtml(m.mission)}</p>${buildPanel()}<div class="button-row"><button data-action="hint">💡 Help</button><button class="primary" data-action="test-mission">⚡ Test my circuit</button></div>`;
 if(phase===6)inner=`<h2>${passed?'✨ It works!':'🧭 Investigate again'}</h2><p class="big-message">${passed?'Your design supplied energy through a complete circuit. The island responds!':escapeHtml(feedback)}</p><p class="fine">${escapeHtml(m.lesson)}</p><div class="button-row"><button data-action="speak" data-text="lesson">🔊 Explain</button><button class="primary" data-action="${passed?'finish':'back-build'}">${passed?'Restore this place →':'Back to the lab →'}</button></div>`;
 if(phase===7)inner=`<div class="story-scene">🌟 <span>🏘️</span> 💡 <span>🎉</span></div><h2>⭐ Power restored!</h2><p>You helped the Spark Isles. ${escapeHtml(m.title)} is recorded as ${assisted?'completed with help':'completed independently'}.</p><button class="primary" data-screen="map">Explore more islands →</button>`;
 return header+`<section class="panel mission-panel">${inner}</section>`+(pr?.completed?'<p class="fine">This mission has a previous completion record; replay is welcome.</p>':'');
}
function miniDisplay(c:Circuit){const result=simulate(c);return `<div class="mini-diagram"><span>🔋 Cell</span><span>→</span><span>🔘 Switch</span><span>→</span><span>${c.parts.some(p=>p.kind==='buzzer')?'🔔':c.parts.some(p=>p.kind==='motor')?'⚙️':'💡'} ${result.status==='ok'?'ON':'OFF'}</span><span>↩ Complete loop</span></div><small>${result.status==='ok'?'The circuit supplies a load.':result.warnings.join(' ')}</small>`}
function editingTools(){return `<div class="toolbar"><div class="catalogue" aria-label="Add a component">${CATALOG.map(e=>`<button data-action="add" data-kind="${e.kind}" title="${escapeHtml(e.model)}"><span aria-hidden="true">${e.emoji}</span> ${escapeHtml(e.label)}</button>`).join('')}</div><div class="button-row"><button data-action="undo" ${!history.length?'disabled':''}>↶ Undo</button><button data-action="redo" ${!future.length?'disabled':''}>↷ Redo</button><button data-action="zoom-in">Zoom +</button><button data-action="zoom-out">Zoom −</button></div></div>`}
function partSvg(p:Part){
 const current=last.readings[p.id]?.active,selectedHere=p.id===selected;
 const label=CATALOG.find(x=>x.kind===p.kind)?.emoji||'?';
 return `<g class="component ${selectedHere?'selected':''} ${current?'lit':''}" transform="translate(${p.x} ${p.y})">
 <rect x="-43" y="-28" width="86" height="56" rx="14" fill="${current?'#d9eee1':'#fffdf7'}" stroke="${selectedHere?'#ef733e':'#126b62'}" stroke-width="${selectedHere?'4':'2'}" data-action="select-part" data-id="${p.id}" role="button" tabindex="0" aria-label="Select ${p.kind}"></rect>
 <text x="0" y="2" text-anchor="middle" font-size="20" pointer-events="none">${player.settings.diagram?symbol(p.kind):label}</text><text x="0" y="18" text-anchor="middle" font-size="10" pointer-events="none">${escapeHtml(p.kind)}</text>
 <circle class="terminal" cx="-58" cy="0" r="14" data-action="terminal" data-terminal="${p.id}:a" role="button" tabindex="0" aria-label="Connect left terminal of ${p.kind}" fill="${terminal===p.id+':a'?'#ef733e':'#f6d46c'}"></circle><circle class="terminal" cx="58" cy="0" r="14" data-action="terminal" data-terminal="${p.id}:b" role="button" tabindex="0" aria-label="Connect right terminal of ${p.kind}" fill="${terminal===p.id+':b'?'#ef733e':'#f6d46c'}"></circle></g>`;
}
function symbol(k:Kind){return ({cell:'┃│',lamp:'⊗',switch:'╱',buzzer:'◖))',motor:'Ⓜ',resistor:'▭',ammeter:'Ⓐ',voltmeter:'Ⓥ',led:'⇥',diode:'▷|',electromagnet:'∿'} as Partial<Record<Kind,string>>)[k]||'◇'}
function terminalPos(end:string){const [id,t]=end.split(':');const p=circuit.parts.find(x=>x.id===id);return p?{x:p.x+(t==='a'?-58:58),y:p.y}:{x:0,y:0}}
function drawing(){const w=`<g class="wires">${circuit.wires.map((x,i)=>{const a=terminalPos(x.from),b=terminalPos(x.to);const midpoint=(a.x+b.x)/2;return `<path d="M${a.x},${a.y} L${midpoint},${a.y} L${midpoint},${b.y} L${b.x},${b.y}" stroke="#126b62" fill="none" stroke-width="5" stroke-linejoin="round"/><circle cx="${midpoint}" cy="${(a.y+b.y)/2}" r="9" data-action="delete-wire" data-index="${i}" fill="#f6d46c" stroke="#14353b"><title>Tap to remove wire ${i+1}</title></circle>`}).join('')}</g>`;
 return `<svg class="circuit-svg" viewBox="0 0 ${Math.round(600/zoom)} ${Math.round(420/zoom)}" aria-label="Circuit canvas with ${circuit.parts.length} components and ${circuit.wires.length} wires" role="group"><defs><pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2" fill="#c9d9d1"/></pattern></defs><rect width="100%" height="100%" fill="url(#dots)"/>${showWires?w:''}${circuit.parts.map(partSvg).join('')}</svg>`;
}
function properties(){
 const p=circuit.parts.find(x=>x.id===selected);if(!p)return '<p>Select a component to inspect it.</p>';
 const r=last.readings[p.id];
 return `<div class="inspector"><h3>🔧 ${escapeHtml(CATALOG.find(x=>x.kind===p.kind)?.label||p.kind)}</h3>
 <p>${escapeHtml(CATALOG.find(x=>x.kind===p.kind)?.model||'')}</p>
 ${p.kind==='switch'?`<button class="primary" data-action="toggle" data-id="${p.id}">${p.closed?'Open switch':'Close switch'}</button>`:''}
 ${['cell','lamp','resistor','motor','buzzer','variable','thermistor','ldr','electromagnet'].includes(p.kind)?`<label>Value (${p.kind==='cell'?'V':'Ω'}) <input id="component-value" inputmode="decimal" type="number" min="0.01" max="1000000" step="0.1" value="${p.value??10}"></label><button data-action="change-value">Apply</button>`:''}
 <p><b>Voltage:</b> ${r?Math.abs(r.voltage).toFixed(3):'—'} V<br><b>Current:</b> ${r?Math.abs(r.current).toFixed(4):'—'} A<br><b>Power:</b> ${r?Math.abs(r.power).toFixed(3):'—'} W</p>
 <div class="button-row"><button data-action="terminal" data-terminal="${p.id}:a">⚪ Connect A</button><button data-action="terminal" data-terminal="${p.id}:b">⚪ Connect B</button><button data-action="move" data-dir="-1,0">←</button><button data-action="move" data-dir="1,0">→</button><button data-action="move" data-dir="0,-1">↑</button><button data-action="move" data-dir="0,1">↓</button><button data-action="remove" data-id="${p.id}">🗑 Remove</button></div></div>`;
}
function buildPanel(){return `<div class="lab">${editingTools()}<div class="board"><div class="board-controls"><button data-action="power">${circuit.powerOn?'⏻ Power off':'⚡ Power on'}</button><button data-action="view-mode">${player.settings.diagram?'🖼️ Picture':'📐 Diagram'} mode</button><button data-action="reset">↻ Reset</button></div>${drawing()}</div><div class="lab-status" role="status"><strong>${last.status==='ok'?'✅ Circuit operating':last.status==='short'?'⚠️ Overcurrent / short':last.status==='off'?'⏻ Supply off':last.status==='open'?'🔌 Circuit open':'⚠️ Circuit invalid'}</strong><p>${escapeHtml(feedback||last.warnings[0]||'Tap two yellow terminals to connect a wire. Tap a wire dot to disconnect.')}</p><small>Current and component behaviour use an educational DC resistive approximation.</small></div>${properties()}</div>`}
function workshopScreen(){return `<section class="panel"><div class="panel-title"><div><span class="eyebrow">FREE BUILD · INVENTOR’S WORKSHOP</span><h1>🔧 Your circuit laboratory</h1></div><button data-action="reference">📚 Components</button></div><p>Tap a component to add it. Tap two yellow terminals to wire them together. Move parts with the arrow controls.</p><div class="button-row">${STARTER_TEMPLATES.map(k=>`<button data-action="template" data-name="${k}">${escapeHtml(k)}</button>`).join('')}</div>${buildPanel()}<div class="button-row"><button class="primary" data-action="save-design">💾 Save</button><button data-action="load-design">📂 Load</button><button data-action="export-design">⬇ JSON</button><button data-action="import-design">⬆ Import</button><button data-action="export-svg">🖼 SVG</button><button data-action="print">🖨 Print</button></div><p class="fine">AC, capacitors, transistors, relay dynamics and code execution are not simulated. This is a safe educational model, not an engineering design approval tool.</p>${showReference?reference():''}</section>`}
function reference(){return `<section class="reference"><h2>Component guide</h2>${CATALOG.map(c=>`<p><b>${c.emoji} ${escapeHtml(c.label)}</b> · From Year ${c.year}<br>${escapeHtml(c.model)}</p>`).join('')}<h3>Not available in the DC simulator</h3>${UNAVAILABLE.map(x=>`<p><b>${escapeHtml(x.label)}</b> — ${escapeHtml(x.reason)}</p>`).join('')}</section>`}
function grownupsScreen(){
 const records=Object.values(player.progress),assistedCount=records.filter(r=>r.assisted).length;
 return `<section class="panel"><h1>⚙️ Grown-ups and teachers</h1><p>This game runs locally. No child email or personal details are required. Each nickname creates a separate local record.</p><h2>Profiles</h2><div class="button-row">${Object.keys(store.profiles).map(name=>`<button data-action="profile" data-name="${escapeHtml(name)}" ${store.active===name?'aria-pressed="true"':''}>${store.active===name?'✓ ':''}${escapeHtml(name)}</button>`).join('')}<button data-action="new-profile">+ Add local hero</button></div><label>Hero suit <select id="suit">${[['#ec7540','Orange'],['#13786e','Teal'],['#586cca','Blue'],['#ad4b7f','Berry']].map(([value,label])=>`<option value="${value}" ${player.suit===value?'selected':''}>${label}</option>`).join('')}</select></label>
 <h2>Progress and teaching</h2><p>${records.filter(r=>r.completed).length} missions recorded · ${assistedCount} completed with help · ${records.filter(r=>r.independent).length} recorded independently.</p><p>Independent is a local activity record, not a validated assessment of mastery.</p><p>Choose any Year 4–11 mission on the map. Every mission has a shareable code, such as <code>CQ4-01</code>, which can be opened via <code>?level=CQ4-01</code>.</p><div class="region-stats">${REGIONS.map(r=>`<div><b>Year ${r.year}</b> <span>${MISSIONS.filter(m=>m.year===r.year&&player.progress[m.id]?.completed).length} / 10</span></div>`).join('')}</div><h2>Display and reading</h2>${[['diagram','Use diagram symbols'],['big','Larger text'],['contrast','High contrast'],['reduce','Reduce animation']].map(([key,label])=>`<label class="check"><input type="checkbox" data-setting="${key}" ${(player.settings as unknown as Record<string,boolean>)[key]?'checked':''}> ${label}</label>`).join('')}<div class="button-row"><button data-action="speak" data-text="help">🔊 Preview voice</button><button data-action="stop-voice">⏹ Stop</button></div><p class="fine">Speech is optional and device-based; a British English voice is preferred where installed. There is no paid speech or account dependency.</p><h2>Local backups</h2><div class="button-row"><button data-action="backup">⬇ Export all player data</button><button data-action="restore">⬆ Restore backup</button><button data-action="clear-data">🗑 Delete local records</button></div><h2>Curriculum information</h2><p>Year 4 and Year 6 statutory electricity objectives; Year 5 is consolidation/enrichment. Years 7–9 are flexible Key Stage 3 bands. GCSE tagging here is introductory and requires per-board specification review before use as an exam tracker.</p><p>Only low-voltage virtual models are used. Never build or modify household mains wiring.</p><p>All data stays on this browser until you explicitly export it. Optional ChoreQuest synchronisation is not enabled until its verified authentication contract is available.</p><a href="https://www.gov.uk/government/publications/national-curriculum-in-england-science-programmes-of-study" target="_blank" rel="noopener noreferrer">Department for Education science curriculum</a></section>`;
}
function render(){
 player=store.profiles[store.active];document.body.classList.toggle('big-text',player.settings.big);document.body.classList.toggle('high-contrast',player.settings.contrast);document.body.classList.toggle('reduce-motion',player.settings.reduce);
 app.innerHTML=screen==='map'?mapScreen():screen==='workshop'?workshopScreen():screen==='mission'?missionScreen():grownupsScreen();
 document.querySelectorAll('[data-screen]').forEach(el=>el.setAttribute('aria-current',(el as HTMLElement).dataset.screen===screen?'page':'false'));
}
function download(name:string,contents:string,type='application/json'){const url=URL.createObjectURL(new Blob([contents],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function importFile(callback:(text:string)=>void){const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=async()=>{const file=input.files?.[0];if(!file||file.size>250000){feedback='Only JSON files smaller than 250 KB are accepted.';render();return;}try{callback(await file.text())}catch{feedback='This file could not be read.';render();}};input.click()}
function useDesign(raw:string){try{const data=JSON.parse(raw);const errs=validate(data);if(errs.length)throw new Error(errs[0]);circuit=clone(data);history=[];future=[];last=simulate(circuit);selected=circuit.parts[0]?.id||'';feedback='Design loaded';render();}catch(e){feedback='Invalid circuit file: '+String(e).slice(0,120);render()}}
function renderSvgExport(){const svg=document.querySelector('.circuit-svg');if(!svg)return;const copy=svg.cloneNode(true) as SVGSVGElement;copy.setAttribute('xmlns','http://www.w3.org/2000/svg');download('circuitquest-design.svg',new XMLSerializer().serializeToString(copy),'image/svg+xml')}
function nextMission(){const next=MISSIONS.find(m=>!player.progress[m.id]?.completed)||MISSIONS[0];pickMission(next.id)}
function onAction(el:HTMLElement){
 const a=el.dataset.action,code=el.dataset.code||'';
 if(a==='start-next'){nextMission();return}
 if(a==='mission'){pickMission(code);return}
 if(a==='next-stage'){phase=Math.min(phase+1,7);feedback='';render();return}
 if(a==='speak'||a==='slow'){say(el.dataset.text==='lesson'?mission?.lesson||'': 'Hello! I’m Pip. Let’s build something amazing.',a==='slow');return}
 if(a==='stop-voice'){speechSynthesis?.cancel();return}
 if(a==='practice'){const idx=Number(el.dataset.idx);if(idx!==practice){feedback='Try the experiment in order.';render();return}if(el.dataset.answer===(idx===0?'no':'yes')){practice++;feedback='Great observation!'}else{feedback='Try again. An open switch makes a gap, and a complete loop allows current.';tries++;}render();return}
 if(a==='test-mission'){
  tries++;last=simulate(circuit);
  if(mission?.goal==='calculations'){const q=practiceQuestion(mission,tries);const input=window.prompt(q.question+'\nEnter a number:');if(input===null)return;passed=Math.abs(toNumber(input,NaN)-q.answer)<.0001;feedback=passed?q.why:'Not quite. '+q.why+' = '+q.answer+'. Try again.';}
  else {passed=!!mission&&checkGoal(mission);feedback=passed?'The circuit meets this mission’s electrical target.':last.warnings[0]||'Check your connections, switch and components. Tap Help for guidance.';}
  phase=6;render();return;
 }
 if(a==='back-build'){phase=4;render();return}
 if(a==='finish'){finish();return}
 if(a==='hint'){assisted=true;feedback='Follow the loop: battery + → switch → load → battery −. Tap two terminals to join them. Use a starter template if helpful.';render();return}
 if(a==='side'){if(!player.side.includes(code))player.side.push(code);persist();feedback='You found a golden bolt!';render();return}
 if(a==='reference'){showReference=!showReference;render();return}
 if(a==='template'){circuit=template(el.dataset.name as Parameters<typeof template>[0]);history=[];future=[];last=simulate(circuit);selected=circuit.parts[0]?.id||'';render();return}
 if(a==='power'){mutate(()=>circuit.powerOn=!circuit.powerOn);return}
 if(a==='view-mode'){player.settings.diagram=!player.settings.diagram;persist();render();return}
 if(a==='reset'){mutate(()=>{circuit=mission&&screen==='mission'?startingCircuit(mission):template('torch')});return}
 if(a==='undo'){if(history.length){future.push(clone(circuit));circuit=history.pop()!;last=simulate(circuit);render()}return}
 if(a==='redo'){if(future.length){history.push(clone(circuit));circuit=future.pop()!;last=simulate(circuit);render()}return}
 if(a==='zoom-in'||a==='zoom-out'){zoom=Math.max(.7,Math.min(1.8,zoom+(a==='zoom-in'?.2:-.2)));render();return}
 if(a==='add'){const kind=el.dataset.kind as Kind;if(!CATALOG.some(c=>c.kind===kind))return;mutate(()=>{const id='p'+Date.now().toString(36)+Math.floor(Math.random()*1000).toString(36);const n=circuit.parts.length;const p=makePart(kind,id,110+(n%4)*115,120+Math.floor(n/4)*85);circuit.parts.push(p);selected=id;});return}
 if(a==='select-part'){selected=el.dataset.id||'';render();return}
 if(a==='terminal'){const t=el.dataset.terminal||'';if(!terminal){terminal=t;feedback='Now choose another terminal.';render();return}if(terminal!==t&&!circuit.wires.some(w=>(w.from===terminal&&w.to===t)||(w.to===terminal&&w.from===t))){const first=terminal;terminal='';mutate(()=>circuit.wires.push({from:first,to:t}));}else{terminal='';render();}return}
 if(a==='delete-wire'){mutate(()=>{circuit.wires.splice(Number(el.dataset.index),1)});return}
 if(a==='toggle'){mutate(()=>{const p=circuit.parts.find(x=>x.id===el.dataset.id);if(p)p.closed=!p.closed});return}
 if(a==='remove'){mutate(()=>{circuit.parts=circuit.parts.filter(x=>x.id!==el.dataset.id);circuit.wires=circuit.wires.filter(w=>!w.from.startsWith(el.dataset.id+':')&&!w.to.startsWith(el.dataset.id+':'));selected=circuit.parts[0]?.id||'';});return}
 if(a==='change-value'){const p=circuit.parts.find(x=>x.id===selected),v=toNumber((document.getElementById('component-value') as HTMLInputElement)?.value,NaN);if(p&&Number.isFinite(v)&&v>=.01&&v<=1000000)mutate(()=>{p.value=v});else {feedback='Enter a value between 0.01 and 1,000,000.';render()}return}
 if(a==='move'){const [dx,dy]=(el.dataset.dir||'0,0').split(',').map(Number);mutate(()=>{const p=circuit.parts.find(x=>x.id===selected);if(p){p.x=Math.max(60,Math.min(520,p.x+dx*20));p.y=Math.max(45,Math.min(365,p.y+dy*20));}});return}
 if(a==='save-design'){const n=window.prompt('Name this invention (a nickname only):','My invention');if(n){player.saved[n.slice(0,40)]=clone(circuit);persist();feedback='Saved locally: '+n.slice(0,40);render()}return}
 if(a==='load-design'){const names=Object.keys(player.saved);if(!names.length){feedback='No inventions saved yet.';render();return}const n=window.prompt('Choose a saved name:\n'+names.join('\n'),names[0]);if(n&&player.saved[n])useDesign(JSON.stringify(player.saved[n]));return}
 if(a==='export-design'){download('circuitquest-invention.json',JSON.stringify(circuit,null,2));return}
 if(a==='import-design'){importFile(useDesign);return}
 if(a==='export-svg'){renderSvgExport();return}
 if(a==='print'){window.print();return}
 if(a==='profile'){const next=el.dataset.name||'';if(store.profiles[next]){store.active=next;persist();render()}return}
 if(a==='new-profile'){const n=window.prompt('Choose a local hero nickname (no real name needed):','New Hero')?.trim().slice(0,28);if(n&&!store.profiles[n]&&Object.keys(store.profiles).length<8){store.profiles[n]=fresh(n);store.active=n;persist();render()}return}
 if(a==='backup'){download('circuitquest-backup.json',JSON.stringify(store,null,2));return}
 if(a==='restore'){importFile(text=>{try{const candidate=JSON.parse(text);if(candidate.version!==1||typeof candidate.active!=='string'||!candidate.profiles?.[candidate.active]||Object.keys(candidate.profiles).length>8)throw Error('Not a CircuitQuest backup');store=candidate;player=store.profiles[store.active];persist();feedback='Backup restored.';render();}catch{feedback='Backup format not recognised.';render()}});return}
 if(a==='clear-data'){if(window.confirm('Delete all local CircuitQuest profiles and inventions? Export a backup first.')){localStorage.removeItem(KEY);store=loadStore();player=store.profiles[store.active];render()}return}
}
document.addEventListener('click',ev=>{const el=(ev.target as Element)?.closest<HTMLElement>('[data-action], [data-screen]');if(!el)return;if(el.dataset.screen){screen=el.dataset.screen as typeof screen;feedback='';render();return}onAction(el)});
document.addEventListener('keydown',ev=>{if((ev.key==='Enter'||ev.key===' ')&&(ev.target as Element)?.matches('svg [role="button"]')){ev.preventDefault();onAction(ev.target as HTMLElement)}});
document.addEventListener('change',ev=>{const el=ev.target as HTMLInputElement;if(el.dataset.setting){(player.settings as unknown as Record<string,boolean>)[el.dataset.setting]=el.checked;persist();render()}if(el.id==='suit'){player.suit=el.value;persist();render()}});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
const requested=new URLSearchParams(location.search).get('level');if(requested&&MISSIONS.some(m=>m.id===requested.toUpperCase()))pickMission(requested);else render();
