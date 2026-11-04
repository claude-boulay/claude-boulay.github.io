// Génère public/CV-Claude-Boulay.pdf (publié sur le site, sans téléphone).
// Si cv/telephone.txt existe, génère aussi cv/CV-Claude-Boulay-complet.pdf (hors Git).
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const chrome = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const print = (html, pdf) =>
  execFileSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--virtual-time-budget=5000',
    `--print-to-pdf=${resolve(pdf)}`,
    pathToFileURL(resolve(html)).href,
  ], { stdio: 'ignore' });

print('cv/cv.html', 'public/CV-Claude-Boulay.pdf');

if (existsSync('cv/telephone.txt')) {
  const phone = readFileSync('cv/telephone.txt', 'utf8').trim();
  const temp = 'cv/.complet.html';
  writeFileSync(temp, readFileSync('cv/cv.html', 'utf8').replace('<!-- tel -->', `<p>${phone}</p>`));
  print(temp, 'cv/CV-Claude-Boulay-complet.pdf');
  rmSync(temp);
}
