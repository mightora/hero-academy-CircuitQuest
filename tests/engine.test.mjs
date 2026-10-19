import test from 'node:test';
import assert from 'node:assert/strict';
import {template,simulate,validate,makePart} from '../dist/engine.js';
import {MISSIONS,SIDE_ACTIVITIES,validateContent,startingCircuit,practiceQuestion} from '../dist/missions.js';
function close(actual,expected,tol=.03){assert.ok(Math.abs(actual-expected)<tol,`expected ${expected}, got ${actual}`)}
test('all authored mission entries have unique level codes and curriculum text',()=>{
 assert.deepEqual(validateContent(),[]);assert.equal(MISSIONS.length,80);assert.equal(SIDE_ACTIVITIES.length,40);
 for(const mission of MISSIONS)assert.equal(validate(startingCircuit(mission)).length,0);
});
test('complete torch operates and open switch stops current',()=>{
 const c=template('torch');let r=simulate(c);assert.equal(r.status,'ok');assert.ok(r.readings.load.active);
 c.parts.find(p=>p.kind==='switch').closed=false;r=simulate(c);assert.equal(r.status,'open');assert.ok(!r.readings.load.active);
});
test('series paths and current conservation',()=>{
 const c=template('series');const r=simulate(c);
 assert.equal(r.status,'ok');close(r.readings.load.current,r.readings.load2.current,.0001);
 close(Math.abs(r.readings.load.current),1.5/(10+10+.2+.02),.0001);
});
test('parallel branches each have the same voltage',()=>{
 const c=template('parallel');const r=simulate(c);assert.equal(r.status,'ok');
 close(r.readings.load.voltage,r.readings.load2.voltage,.0001);
 close(Math.abs(r.readings.battery.current),Math.abs(r.readings.load.current+r.readings.load2.current),.001);
});
test('voltmeter draws almost no current',()=>{
 const c=template('meter');const r=simulate(c);assert.equal(r.status,'ok');
 assert.ok(Math.abs(r.readings.meter.current)<.000001);
 close(r.readings.meter.voltage,r.readings.load.voltage,.0001);
});
test('direct wire across cell reports short and no infinite matrix',()=>{
 const c=template('torch');c.wires.push({from:'battery:a',to:'battery:b'});
 assert.equal(simulate(c).status,'short');
});
test('no current through an open topology',()=>{
 const c=template('torch');c.wires.pop();
 assert.equal(simulate(c).status,'open');
});
test('LED polarity and current limiting',()=>{
 const c=template('led');c.parts.find(p=>p.kind==='cell').value=4.5;
 let r=simulate(c);assert.equal(r.status,'ok');assert.equal(r.readings.load.active,true);
 for(const w of c.wires){if(w.from==='limiter:b')w.to='load:b';else if(w.from==='load:b')w.from='load:a'}
 r=simulate(c);assert.equal(r.status,'open');
});
test('unsafe imported circuit is rejected',()=>{
 const c=template('torch');c.wires.push({from:'oops:a',to:'battery:a'});
 assert.equal(validate(c).length>0,true);assert.equal(simulate(c).status,'invalid');
});
test('numerical practice has reproducible checked answers',()=>{
 const m=MISSIONS.find(x=>x.title==='Coulombs and Seconds');
 assert.ok(m);const q=practiceQuestion(m,1);assert.match(q.question,/charge/);assert.ok(q.answer>0);
 assert.deepEqual(q,practiceQuestion(m,1));
});
