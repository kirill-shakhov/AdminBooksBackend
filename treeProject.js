const fs = require('fs');
const path = require('path');

function printTree(dir, prefix = '') {
    const files = fs.readdirSync(dir);

    files.forEach((file, index) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        const isLast = index === files.length - 1;

        if (file === 'node_modules' || file === '.env' || file === '.git') {
            console.log(prefix + (isLast ? '└── ' : '├── ') + file);
            // Не показываем содержимое этих папок/файлов
            return;
        }

        console.log(prefix + (isLast ? '└── ' : '├── ') + file);

        if (stat.isDirectory()) {
            printTree(filePath, prefix + (isLast ? '    ' : '│   '));
        }
    });
}

const pathToYourProject = __dirname;
printTree(pathToYourProject);
