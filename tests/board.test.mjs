import test from 'node:test';
import assert from 'node:assert/strict';
import {template,simulate,makePart} from '../dist/engine.js';
import {BOARD,viewport,terminalPoint,wireRoute,spreadParts,nextFreePosition} from '../dist/board.js';

const presets=['torch','doorbell','motor','led','series','parallel','meter'];

test('all starter presets show both battery terminals with a usable touch margin',()=>{
 for(const kind of presets){
  const c=template(kind);
  const battery=c.parts.find(p=>p.id==='battery');
  assert.ok(battery,`Missing battery on ${kind}`);
  const box=viewport(c.parts);
  for(const end of ['a','b']){
   const {x,y}=terminalPoint(c.parts,`battery:${end}`);
   assert.ok(x-BOARD.touchRadius>=box.x,`${kind} battery terminal ${end} clipped left`);
   assert.ok(x+BOARD.touchRadius<=box.x+box.width,`${kind} battery terminal ${end} clipped right`);
   assert.ok(y-BOARD.touchRadius>=box.y,`${kind} terminal clipped top`);
  }
  for(const wire of c.wires)assert.ok(wireRoute(c.parts,wire,0).d.startsWith('M '));
 }
});
test('old imported coordinate layouts also get a viewport that reveals both battery terminals',()=>{
 const original=template('torch');
 const legacy={...original,parts:original.parts.map((p,i)=>({...p,x:40+i*130,y:110}))};
 const box=viewport(legacy.parts);
 assert.ok(box.x<0);
 assert.ok(terminalPoint(legacy.parts,'battery:a').x-BOARD.touchRadius>box.x);
});
test('first wire routes above components and return wire routes below them',()=>{
 const c=template('torch');
 const top=wireRoute(c.parts,c.wires[0],0);
 const bottom=wireRoute(c.parts,c.wires[2],2);
 const y=c.parts[0].y;
 assert.ok(top.handle.y<y-50);
 assert.ok(bottom.handle.y>y+75);
 assert.ok(top.d.includes('L '));
 assert.ok(bottom.d.includes('L '));
});
test('spread out changes drawing positions but preserves electrical physics and wire graph',()=>{
 const c=template('series'),before=simulate(c);
 const after={...c,parts:spreadParts(c.parts)};
 assert.deepEqual(simulate(after),before);
 assert.deepEqual(after.wires,c.wires);
 for(let i=0;i<after.parts.length;i++)for(let j=i+1;j<after.parts.length;j++){
  assert.ok(Math.hypot(after.parts[i].x-after.parts[j].x,after.parts[i].y-after.parts[j].y)>=180);
 }
});
test('new component placement avoids crowded existing component positions',()=>{
 const c=template('torch'),pos=nextFreePosition(c.parts);
 assert.ok(c.parts.every(p=>Math.hypot(pos.x-p.x,pos.y-p.y)>=170));
});
