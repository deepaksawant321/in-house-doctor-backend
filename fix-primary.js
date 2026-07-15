const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'entities');
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.entity.ts')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('@Entity(') && !content.includes('@Primary')) {
      console.log('Fixing:', file);
      
      // Add import PrimaryGeneratedColumn if not present
      if (!content.includes('PrimaryGeneratedColumn')) {
        content = content.replace(/import {([^}]+)} from 'typeorm';/, (match, p1) => {
          return `import {${p1}, PrimaryGeneratedColumn } from 'typeorm';`;
        });
      }

      // Add id: string
      content = content.replace(/export class .*? {/, (match) => {
        return `${match}\n  @PrimaryGeneratedColumn('uuid')\n  id: string;\n`;
      });

      fs.writeFileSync(filePath, content);
    }
  }
}
