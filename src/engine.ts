/**
 * CircuitQuest DC engine. Wires form ideal equipotential nets; components never
 * depend on pixel positions. Battery is a Thevenin source represented as a
 * Norton source with 0.2 ohm internal resistance. Diodes use a clearly labelled
 * piecewise-linear educational approximation, NOT a SPICE semiconductor model.
 */
export type Kind = 'cell'|'lamp'|'resistor'|'switch'|'buzzer'|'motor'|'ammeter'|'voltmeter'|'led'|'diode'|'variable'|'thermistor'|'ldr'|'electromagnet'|'capacitor'|'transistor'|'relay'|'logic'|'sensor'|'microcontroller'|'ac';
export type Part = {id:string;kind:Kind;x:number;y:number;value?:number;closed?:boolean};
export type Wire = {from:string;to:string};
export type Circuit = {parts:Part[];wires:Wire[];powerOn:boolean};
export type Reading = {voltage:number;current:number;power:number;active:boolean};
export type Result = {status:'ok'|'open'|'off'|'short'|'invalid';readings:Record<string,Reading>;warnings:string[];model:string};
export const CATALOG: {kind:Kind;label:string;emoji:string;year:number;model:string}[]=[
 {kind:'cell',label:'Cell',emoji:'🔋',year:4,model:'DC source (internal resistance 0.2 Ω)'},
 {kind:'lamp',label:'Bulb',emoji:'💡',year:4,model:'Resistive bulb (constant R; no filament thermal response)'},
 {kind:'switch',label:'Switch',emoji:'🔘',year:4,model:'Open/closed contact'},
 {kind:'buzzer',label:'Buzzer',emoji:'🔔',year:4,model:'Resistive load with on/off indicator'},
 {kind:'motor',label:'Motor',emoji:'⚙️',year:5,model:'Resistive motor; no rotation torque/back EMF model'},
 {kind:'resistor',label:'Resistor',emoji:'▰',year:7,model:'Linear Ohmic resistor'},
 {kind:'ammeter',label:'Ammeter',emoji:'Ⓐ',year:7,model:'Low-resistance meter (0.02 Ω)'},
 {kind:'voltmeter',label:'Voltmeter',emoji:'Ⓥ',year:7,model:'High-resistance meter (1 GΩ)'},
 {kind:'variable',label:'Variable resistor',emoji:'🎚️',year:9,model:'Adjustable Ohmic resistor'},
 {kind:'thermistor',label:'Thermistor',emoji:'🌡️',year:9,model:'Manually adjustable effective resistance; no temperature model'},
 {kind:'ldr',label:'LDR',emoji:'☀️',year:9,model:'Manually adjustable effective resistance; no light model'},
 {kind:'led',label:'LED',emoji:'🔆',year:9,model:'2.0 V piecewise threshold + 5 Ω; approximation'},
 {kind:'diode',label:'Diode',emoji:'▷|',year:10,model:'0.7 V piecewise threshold + 1 Ω; approximation'},
 {kind:'electromagnet',label:'Electromagnet',emoji:'🧲',year:8,model:'Resistive coil; magnetic effects not calculated'}
];
export const UNAVAILABLE: {kind:Kind;label:string;reason:string}[]=[
 {kind:'capacitor',label:'Capacitor',reason:'Dynamic charging not implemented'},
 {kind:'transistor',label:'Transistor',reason:'Three-terminal nonlinear analysis not implemented'},
 {kind:'relay',label:'Relay',reason:'Mechanical contact dynamics not implemented'},
 {kind:'logic',label:'Logic gates',reason:'Digital logic engine not implemented'},
 {kind:'sensor',label:'Sensor module',reason:'Requires a specific sensor model'},
 {kind:'microcontroller',label:'Microcontroller',reason:'No executable firmware simulation'},
 {kind:'ac',label:'AC source',reason:'Transient/phasor AC analysis not implemented'}
];
const defaults: Partial<Record<Kind,number>>={cell:1.5,lamp:10,resistor:100,buzzer:15,motor:12,variable:50,thermistor:80,ldr:80,electromagnet:8};
export function defaultValue(kind:Kind){return defaults[kind]??10}
const supported=new Set<Kind>(CATALOG.map(x=>x.kind));
const finite=(x:number)=>Number.isFinite(x)&&Math.abs(x)<1e12;
export function validate(c:Circuit):string[]{
 const errors:string[]=[];
 if(!c||!Array.isArray(c.parts)||!Array.isArray(c.wires))return ['Invalid circuit document'];
 if(c.parts.length>100||c.wires.length>250)return ['Circuit exceeds safe size limits'];
 const ids=new Set<string>();
 for(const p of c.parts){
  if(!p||typeof p.id!=='string'||!/^[-_a-zA-Z0-9]{1,40}$/.test(p.id)||ids.has(p.id)) errors.push('Invalid or duplicate component ID');
  else ids.add(p.id);
  if(!supported.has(p.kind))errors.push('Unsupported component: '+String(p.kind));
  if(!finite(p.x)||!finite(p.y)||Math.abs(p.x)>10000||Math.abs(p.y)>10000)errors.push('Invalid component position');
  if(p.value!==undefined&&(!finite(p.value)||p.value<0.01||p.value>1000000))errors.push('Component value is outside simulation limits');
 }
 for(const w of c.wires){
  if(!w||typeof w.from!=='string'||typeof w.to!=='string') {errors.push('Invalid wire');continue;}
  for(const t of [w.from,w.to]){
   const m=/^([-_a-zA-Z0-9]{1,40}):(a|b)$/.exec(t);
   if(!m||!ids.has(m[1]))errors.push('Wire references an unknown terminal');
  }
 }
 if(typeof c.powerOn!=='boolean')errors.push('Power control must be boolean');
 return [...new Set(errors)];
}
function linearSolve(A:number[][],B:number[]):number[]|null {
 const n=B.length;
 for(let k=0;k<n;k++){
  let pivot=k;
  for(let j=k+1;j<n;j++)if(Math.abs(A[j][k])>Math.abs(A[pivot][k]))pivot=j;
  if(Math.abs(A[pivot][k])<1e-17)return null;
  [A[pivot],A[k]]=[A[k],A[pivot]];[B[pivot],B[k]]=[B[k],B[pivot]];
  const q=A[k][k];for(let i=k;i<n;i++)A[k][i]/=q;B[k]/=q;
  for(let j=0;j<n;j++)if(j!==k){const f=A[j][k];if(f===0)continue;for(let i=k;i<n;i++)A[j][i]-=f*A[k][i];B[j]-=f*B[k];}
 }
 return B;
}
export function simulate(c:Circuit):Result {
 const warnings=validate(c);const readings:Record<string,Reading>={};
 const model='DC resistive-network approximation; LED/diode use fixed forward thresholds; motors, lamps and coils have simplified resistance.';
 if(warnings.length)return {status:'invalid',warnings,readings,model};
 const terminals=c.parts.flatMap(p=>[p.id+':a',p.id+':b']);
 const parent=new Map(terminals.map(x=>[x,x]));
 function find(x:string):string {const y=parent.get(x)!;if(y===x)return x;const z=find(y);parent.set(x,z);return z}
 function join(a:string,b:string){parent.set(find(a),find(b))}
 c.wires.forEach(w=>join(w.from,w.to));
 const nets=[...new Set(terminals.map(find))],index=new Map(nets.map((n,i)=>[n,i]));
 const pairs=c.parts.map(p=>[index.get(find(p.id+':a'))!,index.get(find(p.id+':b'))!] as const);
 const size=nets.length;
 if(!size)return {status:'open',readings,warnings:['Add a cell and a component to begin.'],model};
 if(c.parts.some((p,i)=>p.kind==='cell'&&pairs[i][0]===pairs[i][1])){
  return {status:'short',readings,warnings:['A wire joins both battery terminals. Disconnect it to protect the supply.'],model};
 }
 const diodeOn=new Map<string,boolean>();
 let volts=Array(size).fill(0),stable=false;
 for(let iteration=0;iteration<30;iteration++){
  const A=Array.from({length:size},()=>Array(size).fill(0)),B=Array(size).fill(0);
  for(let k=0;k<size;k++)A[k][k]+=1e-10; // disconnected islands stay numerically bounded
  c.parts.forEach((p,i)=>{
   const [a,b]=pairs[i];if(a===b)return;
   const r=valueResistance(p),diode=p.kind==='led'||p.kind==='diode';
   const on=!diode||!!diodeOn.get(p.id);
   const g=diode&&!on?1e-10:1/r;
   const vOffset=p.kind==='cell'&&c.powerOn?(p.value??1.5):(diode&&on?(p.kind==='led'?2:0.7):0);
   A[a][a]+=g;A[b][b]+=g;A[a][b]-=g;A[b][a]-=g;
   B[a]+=g*vOffset;B[b]-=g*vOffset;
  });
  // eliminate reference node to stop singularity of common-mode voltage
  A[0]=Array(size).fill(0);A[0][0]=1;B[0]=0;
  for(let i=1;i<size;i++)A[i][0]=0;
  const solution=linearSolve(A,B);
  if(!solution||solution.some(x=>!finite(x)))return {status:'invalid',readings,warnings:['This network cannot be solved safely. Simplify the circuit.'],model};
  volts=solution;let changes=0;
  c.parts.forEach((p,i)=>{
   if(p.kind!=='led'&&p.kind!=='diode')return;
   const [a,b]=pairs[i],drop=p.kind==='led'?2:0.7;
   const shouldOn=volts[a]-volts[b]>drop-0.00001;
   if(shouldOn!==!!diodeOn.get(p.id)){changes++;diodeOn.set(p.id,shouldOn);}
  });
  if(!changes){stable=true;break}
 }
 if(!stable)warnings.push('Diode model did not settle. Treat readings as approximate.');
 let used=false,short=false;
 c.parts.forEach((p,i)=>{
  const [a,b]=pairs[i],v=volts[a]-volts[b],r=valueResistance(p);
  const diode=p.kind==='led'||p.kind==='diode';
  const forward=diode&&!!diodeOn.get(p.id);
  const offset=p.kind==='cell'&&c.powerOn?(p.value??1.5):(forward?(p.kind==='led'?2:0.7):0);
  const current=diode&&!forward?v*1e-10:(v-offset)/r;
  const power=v*current;
  const active=p.kind!=='cell'&&p.kind!=='voltmeter'&&p.kind!=='resistor'&&p.kind!=='variable'&&p.kind!=='thermistor'&&p.kind!=='ldr'&&p.kind!=='ammeter'&&p.kind!=='diode'&&Math.abs(current)>.005;
  readings[p.id]={voltage:clean(v),current:clean(current),power:clean(power),active};
  if(p.kind!=='cell'&&Math.abs(current)>.00001)used=true;
  if(Math.abs(current)>20||Math.abs(power)>1000)short=true;
 });
 if(short)warnings.push('Overcurrent / overload. Disconnect the supply and add resistance.');
 const status=!c.powerOn?'off':short?'short':used?'ok':'open';
 if(status==='open')warnings.push('No complete path is carrying useful current. Check the wires and switches.');
 if(c.parts.some(p=>p.kind==='voltmeter'&&Math.abs(readings[p.id].current)>.00001))warnings.push('A voltmeter should be placed in parallel, not in series.');
 if(c.parts.some(p=>p.kind==='ammeter'&&Math.abs(readings[p.id].current)>5))warnings.push('Ammeter overload: never connect an ammeter directly across a supply.');
 return {status,readings,warnings,model};
}
function valueResistance(p:Part):number {
 switch(p.kind){
  case 'cell': return 0.2;
  case 'switch':return p.closed?0.02:1e12;
  case 'ammeter':return 0.02;
  case 'voltmeter':return 1e9;
  case 'led':return 5;
  case 'diode':return 1;
  default:return Math.max(0.01,p.value??defaultValue(p.kind));
 }
}
function clean(x:number){return Math.abs(x)<1e-10?0:Math.round(x*1e6)/1e6}
export function makePart(kind:Kind,id:string,x=50,y=50):Part{return {kind,id,x,y,value:defaultValue(kind),closed:kind==='switch'?true:undefined}}
export function template(kind:'torch'|'doorbell'|'motor'|'led'|'series'|'parallel'|'meter'='torch'):Circuit{
 const b=makePart('cell','battery',40,110),s=makePart('switch','switch',170,110),l=makePart(kind==='doorbell'?'buzzer':kind==='motor'?'motor':kind==='led'?'led':'lamp','load',300,110);
 const parts:Part[]=[b,s,l];const wires:Wire[]=[{from:'battery:a',to:'switch:a'},{from:'switch:b',to:'load:a'},{from:'load:b',to:'battery:b'}];
 if(kind==='series'){parts.push(makePart('lamp','load2',440,110));wires[2]={from:'load:b',to:'load2:a'};wires.push({from:'load2:b',to:'battery:b'});}
 if(kind==='parallel'){parts.push(makePart('lamp','load2',300,245));wires.push({from:'switch:b',to:'load2:a'},{from:'load2:b',to:'battery:b'});}
 if(kind==='meter'){parts.push(makePart('voltmeter','meter',330,245));wires.push({from:'load:a',to:'meter:a'},{from:'load:b',to:'meter:b'});}
 if(kind==='led')parts.push(makePart('resistor','limiter',230,230)),wires.splice(1,1,{from:'switch:b',to:'limiter:a'},{from:'limiter:b',to:'load:a'});
 return {parts,wires,powerOn:true};
}
