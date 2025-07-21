const fs = require('fs');
const path = require('path');

const fontPath = path.join(__dirname, 'NotoNaskhArabic-VariableFont_wght.ttf');
const fontData = fs.readFileSync(fontPath).toString('base64');

const out = `
export const vfs = {
  "NotoNaskhArabic-VariableFont_wght.ttf": "${fontData}"
};

export const fonts = {
  NotoNaskhArabic: {
    normal: "NotoNaskhArabic-VariableFont_wght.ttf",
    bold: "NotoNaskhArabic-VariableFont_wght.ttf",
    italics: "NotoNaskhArabic-VariableFont_wght.ttf",
    bolditalics: "NotoNaskhArabic-VariableFont_wght.ttf"
  }
};
`;

fs.writeFileSync(path.join(__dirname, 'notoFont.js'), out);
console.log('تم توليد ملف notoFont.js بنجاح!');
