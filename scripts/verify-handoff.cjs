/* Compare editable app sources against the current designer handoff snapshot. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),manifest=require('../internal/releases/20261109-designer-handoff.json');
const changed=[];
for(const file of manifest.files){const target=path.join(root,'busan-drop',file.path);const bytes=fs.existsSync(target)?fs.readFileSync(target):null;if(!bytes||crypto.createHash('sha256').update(bytes).digest('hex')!==file.sha256)changed.push(file.path);}
if(changed.length){console.error('Changed from the 2026-11-09 designer handoff (expected after design edits):\n'+changed.join('\n'));process.exitCode=1;}
else console.log(`PASS: ${manifest.files.length} app source files match the 2026-11-09 designer handoff.`);
