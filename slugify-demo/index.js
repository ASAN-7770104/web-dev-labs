const slugify = require('slugify');

// Исходные строки для проверки
const textA = 'Fresh Bananas';
const textB = 'Fresh Bananas@';
const textC = 'Fresh Bananas';

// a. Перевод всех заглавных букв в нижний регистр
const resultA = slugify(textA, {
  lower: true
});
console.log('Task A:', resultA); 
// Вывод: fresh-bananas

// b. Удаление специальных символов (кроме символа замены)
const resultB = slugify(textB, {
  lower: true,
  remove: /[*+~.()'"!:@]/g
});
console.log('Task B:', resultB); 
// Вывод: fresh-bananas

// c. Замена пробелов на знак "="
const resultC = slugify(textC, {
  lower: true,
  replacement: '='
});
console.log('Task C:', resultC); 
// Вывод: fresh=bananas
