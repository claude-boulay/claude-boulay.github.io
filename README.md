# Portfolio de Claude Boulay

Site statique construit avec [Astro](https://astro.build). Tout le contenu est dans [src/data/site.ts](src/data/site.ts).

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # génère le site dans dist/
npm run cv       # regénère le CV depuis cv/cv.html, à lancer avant le build
```

## Hébergement

**GitHub Pages (gratuit, repo public)** : pousser sur `main`, puis dans le repo aller dans
Settings > Pages > Source et choisir **GitHub Actions**. Le workflow déploie ensuite à chaque push.
Un repo nommé `claude-boulay.github.io` donne l'adresse la plus courte, tout autre nom est servi sous `/<repo>/`.

**VPS ou autre hébergeur** : lancer `npm run build` et servir le contenu de `dist/` avec n'importe quel
serveur web (Nginx, Caddy...). Aucun Node.js n'est nécessaire en production.
