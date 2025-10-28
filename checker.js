const fs = require('fs');
const path = require('path');

function runChecker(files) {
  files.forEach(file => {
    const filePath = path.resolve(file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File tidak ditemukan: ${file}`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);

    const stack = [];
    const pairs = {
      '{': '}',
      '(': ')',
      '[': ']',
      '"': '"',
      "'": "'",
      '`': '`'
    };

    const opening = Object.keys(pairs);
    const closing = Object.values(pairs);

    let errorsFound = false;

    lines.forEach((line, idx) => {
      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        // cek jika quote (tunggal, ganda, template)
        if (['"', "'", '`'].includes(char)) {
          const last = stack[stack.length - 1];
          if (last === char) {
            stack.pop();
          } else if (!stack.includes(char)) {
            stack.push(char);
          }
          continue;
        }

        // cek kurung buka
        if (opening.includes(char) && !['"', "'", '`'].includes(char)) {
          stack.push({ char, line: idx + 1, col: i + 1 });
        }

        // cek kurung tutup
        if (closing.includes(char)) {
          const last = stack[stack.length - 1];
          const expected = Object.keys(pairs).find(k => pairs[k] === char);
          if (last && last.char === expected) {
            stack.pop();
          } else {
            console.error(`❌ ${file} -> Line ${idx + 1}, Column ${i + 1}: Unexpected '${char}'`);
            console.log(`Context: ${line.trim()}`);
            errorsFound = true;
          }
        }
      }
    });

    // jika masih ada stack tersisa
    stack.forEach(item => {
      if (typeof item === 'object') {
        console.error(`❌ ${file} -> Line ${item.line}, Column ${item.col}: Missing '${pairs[item.char]}'`);
        console.log(`Context: ${lines[item.line - 1].trim()}`);
        errorsFound = true;
      } else {
        console.error(`❌ ${file} -> Unclosed quote '${item}'`);
        errorsFound = true;
      }
    });

    if (!errorsFound) {
      console.log(`✅ ${file} tidak ada masalah sintaksis.`);
    }
  });
}

module.exports = { runChecker };
