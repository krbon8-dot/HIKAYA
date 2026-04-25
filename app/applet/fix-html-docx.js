import fs from 'fs';

let content = fs.readFileSync('src/components/ExportModal.tsx', 'utf8');

const getStartEnd = (type1, type2) => {
   const start = content.indexOf(`         } else if (block.type === '${type1}') {`);
   const end = content.indexOf(`         } else if (block.type === '${type2}') {`);
   return {start, end};
};

const d = getStartEnd('dialogue', 'table');
const dContent = content.substring(d.start, d.end);

const newDialogue = `         } else if (block.type === 'dialogue') {
            const db = block as DialogueBlock;
            const isRtl = db.direction !== 'ltr';
            
            let brStyle = 'border-radius: 15px; border: 2px solid #000;';
            if (db.bubbleType === 'speech') brStyle = 'border-radius: 20px 20px 0 20px; border: 2px solid #000;';
            else if (db.bubbleType === 'thought') brStyle = 'border-radius: 30px; border: 2px dashed #000; font-style: italic; color: #475569;';
            else if (db.bubbleType === 'shout') brStyle = 'font-weight: bold; font-size: 1.25em; border: 2px solid #000;';
            
            let bgColor = db.bubbleColor || '#ffffff';
            let fontStyle = db.fontFamily ? \`font-family: \${db.fontFamily};\` : '';
            
            html += \`<table width="100%" cellpadding="10" style="margin: 20px 0; border: none; border-collapse: collapse;"><tr>\`;
            
            const avatarHtml = db.avatarUrl ? \`<td width="\${db.avatarSize || 100}" valign="top" style="border: none; padding: 0 10px;"><img src="\${db.avatarUrl}" style="border-radius: 8px; object-fit: cover; border: 2px solid #000;" width="\${db.avatarSize || 100}" height="\${db.avatarSize || 100}" /></td>\` : '';
            const textHtml = \`<td valign="top" style="border: none; padding: 0 10px;"><div style="background-color: \${bgColor}; padding: 15px; min-height: 50px; font-size: 1.1em; \${brStyle} \${fontStyle}">\${db.text}</div></td>\`;
            
            if (isRtl) {
              html += avatarHtml + textHtml;
            } else {
              html += textHtml + avatarHtml;
            }
            html += \`</tr></table>\`;
`;
content = content.replace(dContent, newDialogue);

const ct = getStartEnd('chat', 'quest');
const ctContent = content.substring(ct.start, ct.end);

const newChat = `         } else if (block.type === 'chat') {
            const chat = block as ChatBlock;
            html += \`<div style="border: 2px solid #334155; padding: 20px; margin: 20px auto; max-width: 500px; background: #f8fafc; border-radius: 12px; text-align: right;">\`;
            if (chat.title) html += \`<h3 style="text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">\${chat.title}</h3>\`;
            html += \`<table width="100%" cellpadding="5" style="border: none; border-collapse: collapse;">\`;
            (chat.messages || []).forEach(msg => {
              html += \`<tr>\`;
              if (msg.isSelf) {
                 html += \`<td width="20%" style="border: none;"></td><td width="80%" align="right" valign="top" style="border: none;"><div style="background: #dbeafe; color: #1e3a8a; padding: 10px 15px; border-radius: 15px 15px 0 15px; font-size: 0.95em;">\${msg.content}</div></td>\`;
              } else {
                 html += \`<td width="80%" align="right" valign="top" style="border: none;"><div style="background: #e2e8f0; color: #334155; padding: 10px 15px; border-radius: 15px 15px 15px 0; font-size: 0.95em;"><div style="font-weight: bold; font-size: 0.8em; margin-bottom: 4px; opacity: 0.7;">\${msg.sender}</div>\${msg.content}</div></td><td width="20%" style="border: none;"></td>\`;
              }
              html += \`</tr>\`;
            });
            html += \`</table></div>\`;
`;
content = content.replace(ctContent, newChat);

fs.writeFileSync('src/components/ExportModal.tsx', content);
