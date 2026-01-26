const text = "[Descritor](id:starforged/oracles/core/descriptor) + [Foco](id:starforged/oracles/core/focus)";

const linkRegex = /\[([^\]]+)\]\(id:([^)]+)\)/g;
const links = [];
let match;

while ((match = linkRegex.exec(text)) !== null) {
  links.push(match[2]);
}

console.log('Text:', text);
console.log('Links found:', links);
