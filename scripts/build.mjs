import {cpSync, mkdirSync, writeFileSync} from 'node:fs';
mkdirSync('dist', {recursive:true});
cpSync('public','dist',{recursive:true,force:true});
writeFileSync('dist/robots.txt','User-agent: *\nAllow: /\n');
console.log('Static CircuitQuest distribution ready in dist/');
