const fs = require('fs');
const path = require('path');

const files = [
    'SchedulePostView.jsx',
    'SpecialDaysAIView.jsx',
    'TwitterThreadBuilderView.jsx',
    'UploadCSVView.jsx',
    'GraphicsAIView.jsx'
];

const dir = path.join(__dirname, 'client/src/components/social');

const replacements = [
    [/bg-\[\#f5f5f5\]/g, 'bg-transparent'],
    [/bg-white/g, 'bg-white/5'],
    [/bg-\[\#f9f9f9\]/g, 'bg-[#111]'],
    [/bg-slate-50/g, 'bg-white/5'],
    [/bg-slate-100/g, 'bg-black/20'],
    [/bg-slate-200/g, 'bg-white/10'],
    [/border-\[\#e0e0e0\]/g, 'border-white/10'],
    [/border-\[\#d0d0d0\]/g, 'border-white/10'],
    [/border-slate-200/g, 'border-white/10'],
    [/border-slate-300/g, 'border-white/20'],
    [/text-gray-900/g, 'text-white'],
    [/text-gray-800/g, 'text-white/90'],
    [/text-gray-700/g, 'text-white/80'],
    [/text-gray-600/g, 'text-white/70'],
    [/text-gray-500/g, 'text-white/50'],
    [/text-gray-400/g, 'text-white/40'],
    [/text-slate-900/g, 'text-white'],
    [/text-slate-700/g, 'text-white/80'],
    [/text-slate-500/g, 'text-white/50']
];

files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Exceptional cases: we don't want to replace some literal "bg-white" if it's meant to be text-white or similar, but the regex targets the class.
        // Also fix `bg-white/5/5` just in case
        
        replacements.forEach(([regex, replacement]) => {
            content = content.replace(regex, replacement);
        });
        
        // Fix multiple slashes
        content = content.replace(/bg-white\/5\/5/g, 'bg-white/5');
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`File not found: ${file}`);
    }
});
