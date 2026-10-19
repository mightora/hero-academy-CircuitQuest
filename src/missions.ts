import {template, type Circuit, type Kind} from './engine.js';
export type Goal='on'|'switch'|'off'|'two'|'parallel'|'series'|'voltage'|'meter'|'led'|'resistor'|'shortsafe'|'calculations';
export type Mission={id:string;year:number;region:string;title:string;concept:string;lesson:string;mission:string;goal:Goal;starter:Parameters<typeof template>[0];tag:'core'|'enrichment'|'separate'|'higher';source:string;symbol?:string};
const REGION_NAMES=['The First Spark','The Workshop','Circuit City','The Current Caverns','The Magnetic Mountains',"The Inventor’s Laboratory",'The Power Grid','The Grand Power Restoration'];
/** Each entry is bespoke title, learning objective, accurate one-sentence explanation, and mission instruction. */
const rows=[
[
['The First Lantern','A complete loop','Current flows when there is a complete conductive path through the supply and load.','Connect the missing wire to light the lantern.','on','torch'],
['Pip’s Torch','Cells supply energy','A cell transfers chemical energy to electrical energy; current carries charge around the loop.','Build a torch for Pip.','on','torch'],
['The Dark Cave','A broken path','A gap in a circuit stops a steady current from flowing.','Find and repair the disconnected lamp wire.','on','torch'],
['Open the Electric Gate','Switches','A closed switch completes its section of the circuit; an open switch breaks the path.','Close the switch to operate the gate.','switch','motor'],
['The Emergency Buzzer','Sounds from circuits','A buzzer produces sound when enough electrical energy is transferred to it.','Power the rescue buzzer.','on','doorbell'],
['Safe Materials','Conductors and insulators','Metals are generally conductors. Plastic and rubber usually act as insulators at ordinary low voltages.','Use a wire to bridge the gap; never experiment with mains.','on','torch'],
['The Two-Terminal Mystery','Component connections','Many simple components must have both ends connected into a loop.','Connect both lamp terminals properly.','on','torch'],
['The Silent Doorbell','Tracing faults','Follow a circuit from one battery terminal and back to discover a missing connection.','Trace and fix the doorbell.','on','doorbell'],
['Pip’s Checklist','Electrical safety','Never experiment with plug sockets or household wiring. Use only a safe virtual circuit here.','Build a safe battery-powered lamp.','on','torch'],
['Clubhouse Lights','Final engineering challenge','A reliable low-voltage system needs a cell, a complete path and a controlled load.','Restore the Hero Academy clubhouse lights.','switch','torch']],
[
['Predict the Glow','Predicting effects','Changing a component can change the circuit current and energy transfer.','Predict then test the workshop lamp.','on','torch'],
['Material Detectives','Fair testing','Change only the material being tested to compare how well it conducts.','Create a complete test circuit.','on','torch'],
['Two Lamps Together','Adding bulbs','Two identical lamps in series share the supply voltage; each is usually dimmer than one lamp alone.','Build a two-lamp circuit.','two','series'],
['Pip’s Power Pack','More cells','Adding cells in series in the same direction increases total potential difference.','Power the upgraded torch.','voltage','torch'],
['Secret Door Alarm','Make a warning','A simple switch can control whether a buzzer is energised.','Activate the secret door alarm.','switch','doorbell'],
['Electric Drawbridge','Motors','In a simplified DC circuit, a motor is an electrical load converting transferred energy into movement.','Operate the bridge motor.','switch','motor'],
['Workshop Test Bench','Record evidence','Repeating tests helps identify inconsistent results and faulty connections.','Measure the lamp in a closed circuit.','meter','meter'],
['Switch Hunt','Isolating faults','A single open connection can interrupt a series circuit.','Find the open switch and restore power.','switch','torch'],
['Pip’s Moving Vehicle','Make an invention','Motors need a complete circuit and suitable supply. Real motors are more complex than resistors.','Power Pip’s vehicle.','on','motor'],
['Workshop Safety System','Final engineering challenge','Combine independently tested loads and controls to create a reliable invention.','Build a warning system with a switch and buzzer.','switch','doorbell']],
[
['Symbols on the Map','Circuit diagrams','Standard circuit symbols show electrical connections without drawing realistic component pictures.','Switch to Diagram Mode and complete the circuit.','on','torch'],
['Cells in Series','Supply voltage','The potential differences of correctly aligned cells in series add together.','Increase the supply voltage and test the lamp.','voltage','torch'],
['Brighter Lanterns','Brightness and cells','With the same lamp, increasing voltage often increases power and brightness; filament resistance may also change.','Compare a stronger and weaker supply.','voltage','torch'],
['Buzzer Tower','Voltage and sound','A buzzer often responds differently when its supply voltage changes, within its rated range.','Energise the tower buzzer.','on','doorbell'],
['Series Street','Simple series circuit','There is one pathway for current through a series circuit.','Run two lamps in one loop.','series','series'],
['The Switch Puzzle','Switch position','A series switch interrupts the current wherever it is placed in the loop.','Control a lamp with one switch.','switch','torch'],
['Draw the Diagram','Reading symbols','A circuit drawing describes connections, rather than where the parts sit on a table.','Build the shown connection using Diagram Mode.','on','torch'],
['Broken Streetlights','Systematic fault finding','Testing one connection at a time makes a fault easier to locate.','Repair the streetlight loop.','on','series'],
['Battery Choices','Predict then test','Compare predictions with observations after changing the number of cells or loads.','Test a cell-powered warning system.','on','doorbell'],
['Circuit City Rescue','Final engineering challenge','Explain using symbols how a complete series circuit powers a load.','Restore city lighting and the warning circuit.','two','series']],
[
['Charges on the Move','Electric charge','Electric current is the rate of flow of electric charge.','Complete a circuit and inspect the current.','on','torch'],
['The Ampere Bridge','Measuring current','Current is measured in amperes using an ammeter placed in series.','Add an ammeter to the route.','meter','meter'],
['Voltage Falls','Potential difference','Voltage is the energy transferred per unit charge between two points.','Compare the supply and load voltages.','voltage','meter'],
['Resistance Ridge','Electrical resistance','For Ohmic components, resistance equals potential difference divided by current.','Change the resistance and measure current.','resistor','torch'],
['One Path or Many','Series versus parallel','In parallel networks charge can flow through more than one branch.','Create a two-branch lamp network.','parallel','parallel'],
['Junction Junction','Conservation of charge','The total current entering a junction equals the total current leaving it.','Power both branches and inspect their currents.','parallel','parallel'],
['The Voltmeter Cabin','Measuring voltage','A voltmeter should be connected across a component and draw very little current.','Measure the potential difference across a bulb.','meter','meter'],
['The Load Comparison','Resistance in circuits','At fixed supply voltage, a larger resistance usually gives less current.','Compare two resistor values.','resistor','torch'],
['Mystery Network','Tracing networks','Identify junctions and complete paths before predicting the behaviour.','Reconnect a parallel network.','parallel','parallel'],
['Current Caverns Rescue','Final engineering challenge','Use measurements and current conservation to restore several pathways.','Keep two cave lamps powered at once.','parallel','parallel']],
[
['Magnetic Compass','Magnetic fields','Magnets have north and south poles; field lines indicate direction and relative strength.','Power a field-study indicator circuit.','on','torch'],
['Charge Sparks','Static charge','Electrons can be transferred by friction, leaving objects with a net charge.','Restore the static display with a safe virtual lamp.','on','torch'],
['Attract or Repel','Magnetic poles','Like magnetic poles repel and unlike poles attract.','Power the magnet research station.','on','torch'],
['Current Makes Magnetism','Magnetic effect of current','A current-carrying wire produces a magnetic field around it.','Power the magnetic test coil.','on','motor'],
['Solenoid Cave','Solenoids','A coil of current-carrying wire creates a field similar to a bar magnet.','Build a current-powered coil.','on','motor'],
['The Electromagnet Crane','Controllable magnets','An electromagnet can be switched on and off by controlling current in its coil.','Switch the lifting machine on.','switch','motor'],
['The Simple Motor','Motor effect','A force acts on a current-carrying conductor in a magnetic field.','Power the model motor.','on','motor'],
['The Stronger Coil','Investigate variables','In real solenoids, current, turns and core material can affect magnetic strength.','Compare coil current under two supply settings.','voltage','motor'],
['Mountain Safety Beacon','Current and power','Electromagnets heat up as current flows; use appropriate low-voltage control.','Build a controlled beacon circuit.','switch','doorbell'],
['The Great Lifting Rescue','Final engineering challenge','An electromagnet needs current, and switching permits controlled lifting.','Power and control the virtual rescue crane.','switch','motor']],
[
['Inventor’s Design Brief','Engineering constraints','A useful design solves a real need and meets measurable constraints.','Restore the lab lamp with a safe current.','on','torch'],
['Resistance Tuning','Variable resistors','A variable resistor changes the circuit current when supply voltage stays constant.','Add or adjust resistance in the loop.','resistor','torch'],
['Heat Sensor','Thermistors','The resistance of an NTC thermistor decreases when its temperature increases.','Model a thermistor with an adjustable resistor.','resistor','torch'],
['Night Sensor','Light-dependent resistors','An LDR usually has less resistance in brighter light.','Model the night-light sensor resistor.','resistor','torch'],
['One-Way Street','Diodes','A diode conducts readily in one direction and blocks most current in reverse.','Orient the diode to allow current.','led','led'],
['LED Warning Signs','Light-emitting diodes','An LED requires correct polarity and current limiting; its voltage-current response is nonlinear.','Light the LED without overcurrent.','led','led'],
['Input and Output','Control systems','A sensor provides an input and an actuator can provide an output.','Switch a simple controlled motor.','switch','motor'],
['Logic Room','Logical decisions','Controllers can combine conditions, such as AND or OR, to decide when to act.','Build a circuit that demonstrates a single input and output.','switch','doorbell'],
['Microcontroller Ideas','Embedded control','Microcontrollers read inputs and control outputs through programs; they are not directly modelled here.','Power a model warning output.','on','doorbell'],
['Automated Laboratory','Final engineering challenge','Evaluate the safety, efficiency and behaviour of a system before using it.','Restore the laboratory with a sensor-style resistor and LED.','led','led']],
[
['Coulombs and Seconds','Q = It','Charge transferred equals current multiplied by time: Q = It.','Calculate charge transferred.','calculations','torch'],
['Volts and Amps','V = IR','For an Ohmic conductor, potential difference equals current times resistance.','Calculate potential difference.','calculations','torch'],
['Ohmic Detective','Current–voltage graphs','An Ohmic resistor has a straight-line I–V graph at constant temperature.','Calculate resistance from potential difference and current.','calculations','torch'],
['Filament Behaviour','Non-Ohmic lamps','As a filament heats its resistance increases; a real filament lamp does not have a straight-line I–V graph.','Compare the simplified circuit model with a real filament.','calculations','torch'],
['Diode Workshop','Current–voltage characteristics','Diode current rises sharply in forward bias after a threshold; it is tiny in reverse bias.','Energise a current-limited LED.','led','led'],
['Series Mathematics','Series resistance','Series resistances add: R(total) = R1 + R2.','Build a series path and inspect current.','series','series'],
['Parallel Mathematics','Parallel current','In parallel, each branch has the same potential difference across its end nodes.','Power parallel lamps and compare branches.','parallel','parallel'],
['Power Formula','P = IV','Electrical power equals the product of current and potential difference.','Calculate electrical power.','calculations','torch'],
['Energy Tracker','E = Pt','Energy transferred equals power multiplied by time.','Calculate energy use in joules.','calculations','torch'],
['Research Centre Grid','Final engineering challenge','Use measurements, calculations and resistance to design a working low-voltage supply.','Power an efficient research centre circuit.','meter','meter']],
[
['DC and AC','Current direction','DC current has one direction; alternating current changes direction periodically.','Explore a safe DC supply; AC waveform simulation is not yet available.','on','torch'],
['Mains Safety','Live, neutral and earth','UK mains electricity can be fatal. Learn wire functions only through diagrams and simulations.','Power a separate virtual battery safety display.','on','torch'],
['Protective Devices','Fuses and faults','Fuses break a circuit when excessive current heats their element.','Identify a virtual short then make a safe circuit.','shortsafe','torch'],
['Power and Efficiency','Useful energy','Efficiency is useful energy transferred divided by total input energy transferred.','Calculate useful energy.','calculations','torch'],
['The National Grid','Transmission','High transmission voltage reduces current and resistive power loss for a given transferred power.','Investigate low-current distribution in the model.','resistor','torch'],
['Transformer Tower','Transformers','Transformers use changing magnetic flux, and do not operate on steady DC.','Review transformer ratios in calculation practice.','calculations','torch'],
['The Motor Effect','Force on a wire','A current-carrying wire in a magnetic field can experience a force.','Power a model motor and compare current.','on','motor'],
['Generators and Induction','Electromagnetic induction','Changing magnetic flux can induce a potential difference across a conductor.','Examine a DC load while reviewing generator principles.','on','motor'],
['The Fault Inspector','Complex diagnoses','Measure systematically before changing a fault; avoid introducing short circuits.','Restore a two-branch circuit.','parallel','parallel'],
['Restore the Spark Isles','Final engineering challenge','Engineers combine safe designs, measured evidence and evaluation to restore networks.','Power two loads in a stable final network.','parallel','parallel']]
];
const tags=(year:number,idx:number):Mission['tag']=>year===5?'enrichment':year===9&&idx>=2&&idx<=8?'enrichment':year===11&&[5,7].includes(idx)?'separate':'core';
export const REGIONS=REGION_NAMES.map((name,i)=>({year:i+4,name}));
export const MISSIONS:Mission[]=rows.flatMap((items,i)=>items.map((r,j)=>({
 id:`CQ${i+4}-${String(j+1).padStart(2,'0')}`,year:i+4,region:REGION_NAMES[i],
 title:r[0],concept:r[1],lesson:r[2],mission:r[3],goal:r[4] as Goal,starter:r[5] as Mission['starter'],
 tag:tags(i+4,j),
 source:i<=2?'DfE Science KS2 / D&T':i<=5?'DfE Science KS3 / D&T':'DfE Science KS4 / AQA, Edexcel, OCR (verify specific pathway)'
})));
export const SIDE_ACTIVITIES=REGIONS.flatMap(r=>['Find three golden bolts','Explore Pip’s tunnel','Guide the maintenance bot','Spot a hidden tool','Repair a tiny footbridge'].map((name,i)=>({id:`SIDE-${r.year}-${i+1}`,name,year:r.year})));
export const STARTER_TEMPLATES=['torch','doorbell','motor','led','series','parallel','meter'] as const;
export function startingCircuit(m:Mission):Circuit{
 const c=template(m.starter);
 if(m.goal==='shortsafe') c.wires.push({from:'battery:a',to:'battery:b'});
 else if(m.goal==='switch'||m.goal==='off')c.parts.find(p=>p.kind==='switch')!.closed=false;
 else if(['on','two','parallel','series','led','meter','voltage','resistor'].includes(m.goal))c.wires.pop();
 if(m.goal==='voltage')c.parts.find(p=>p.kind==='cell')!.value=3;
 if(m.goal==='resistor'){c.parts.push({id:'resistor2',kind:'resistor',value:50,x:370,y:240});}
 return c;
}
export function practiceQuestion(m:Mission,attempt:number):{question:string;answer:number;why:string}{
 const n=(m.year+attempt*3)%6+2,k=(attempt*2+m.year)%5+2;
 const title=m.title.toLowerCase();
 if(/coulomb|charge/.test(title))return {question:`A current of ${n} A flows for ${k} s. What charge passes (C)?`,answer:n*k,why:'Q = I × t'};
 if(/power formula|power and efficiency/.test(title))return {question:`A device runs at ${n} V and ${k} A. What is its power (W)?`,answer:n*k,why:'P = V × I'};
 if(/energy|efficiency/.test(title))return {question:`A ${n} W lamp works for ${k} s. Energy transferred (J)?`,answer:n*k,why:'E = P × t'};
 if(/transformer/.test(title))return {question:`An ideal transformer has ${n} turns on the primary and ${n*k} turns on the secondary. Primary voltage is ${n} V. What is secondary voltage (V)?`,answer:n*k,why:'Vs / Vp = Ns / Np (ideal transformer, AC only)'};
 if(/ohmic detective|filament/.test(title))return {question:`A resistor has ${n*k} V across it and ${k} A through it. Find its resistance (Ω).`,answer:n,why:'R = V / I; real hot filaments are non-Ohmic'};
 return {question:`A resistor of ${k} Ω carries ${n} A. Calculate V (volts).`,answer:n*k,why:'V = I × R'};
}
export function validateContent():string[]{
 const errors:string[]=[];
 if(MISSIONS.length!==80)errors.push('Expected eighty missions');
 if(new Set(MISSIONS.map(m=>m.id)).size!==MISSIONS.length)errors.push('Repeated mission codes');
 if(SIDE_ACTIVITIES.length!==40)errors.push('Expected forty side activities');
 for(const m of MISSIONS){if(!m.title||!m.lesson||!m.mission||!m.concept||!m.source)errors.push('Missing authored content: '+m.id);}
 return errors;
}
