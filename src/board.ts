import type {Part,Wire} from './engine.js';

/** Circuit editor geometry; purely visual, independent of electrical topology. */
export const BOARD={width:1000,height:610,terminalOffset:68,terminalRadius:23,touchRadius:31} as const;
export type XY={x:number;y:number};
export type Viewport={x:number;y:number;width:number;height:number};
export function terminalPoint(parts:readonly Part[],terminal:string):XY {
 const [id,end]=terminal.split(':');
 const p=parts.find(part=>part.id===id);
 if(!p||!['a','b'].includes(end))throw new Error('Unknown terminal');
 return {x:p.x+(end==='a'?-BOARD.terminalOffset:BOARD.terminalOffset),y:p.y};
}
/** Preserve old imported component coordinates, including cells near x=40. */
export function viewport(parts:readonly Part[]):Viewport {
 const left=Math.min(0,...parts.map(p=>p.x-BOARD.terminalOffset-BOARD.touchRadius-25));
 const right=Math.max(BOARD.width,...parts.map(p=>p.x+BOARD.terminalOffset+BOARD.touchRadius+55));
 const top=Math.min(0,...parts.map(p=>p.y-95));
 const bottom=Math.max(BOARD.height,...parts.map(p=>p.y+170));
 return {x:left,y:top,width:right-left,height:bottom-top};
}
export function spreadParts(parts:readonly Part[]):Part[] {
 const count=parts.length;
 const cols=count<=4?count:count<=6?3:4;
 const pitch=count===4?235:count<=3?300:220;
 const start=cols===1?BOARD.width/2:(BOARD.width-pitch*(cols-1))/2;
 return parts.map((p,i)=>({...p,x:Math.round(start+(i%cols)*pitch),y:count>4?215+Math.floor(i/cols)*195:245}));
}
export function nextFreePosition(parts:readonly Part[]):XY {
 const positions=[180,420,660,865].flatMap(x=>[145,370,555,765,955].map(y=>({x,y})));
 return positions.find(q=>parts.every(p=>Math.hypot(q.x-p.x,q.y-p.y)>=170))||{x:180,y:1150+parts.length*80};
}
export type WireRoute={d:string;handle:XY};
export function wireRoute(parts:readonly Part[],wire:Wire,index:number):WireRoute {
 const a=terminalPoint(parts,wire.from),b=terminalPoint(parts,wire.to);
 // Wires run around, rather than behind, the source or receiving components.
 const minY=Math.min(...parts.map(p=>p.y),200);
 const maxY=Math.max(...parts.map(p=>p.y),270);
 if(a.x>b.x+85){
  const lane=maxY+105+(index%2)*26;
  const aLead=a.x+32,bLead=b.x+32;
  return {d:`M ${a.x} ${a.y} L ${aLead} ${a.y} L ${aLead} ${lane} L ${bLead} ${lane} L ${bLead} ${b.y} L ${b.x} ${b.y}`,handle:{x:(aLead+bLead)/2,y:lane}};
 }
 if(wire.from.endsWith(':a')&&wire.to.endsWith(':a')&&a.x<b.x){
  const lane=Math.max(55,minY-116-(index%2)*22);
  const aLead=a.x-32,bLead=b.x-32;
  return {d:`M ${a.x} ${a.y} L ${aLead} ${a.y} L ${aLead} ${lane} L ${bLead} ${lane} L ${bLead} ${b.y} L ${b.x} ${b.y}`,handle:{x:(aLead+bLead)/2,y:lane}};
 }
 if(Math.abs(a.y-b.y)<5&&b.x>a.x){
  return {d:`M ${a.x} ${a.y} L ${b.x} ${b.y}`,handle:{x:(a.x+b.x)/2,y:a.y}};
 }
 const mid=(a.x+b.x)/2;
 return {d:`M ${a.x} ${a.y} L ${mid} ${a.y} L ${mid} ${b.y} L ${b.x} ${b.y}`,handle:{x:mid,y:(a.y+b.y)/2}};
}
