# Carnet Java — plateforme de suivi du mentorat

App React + Vite + Supabase : tableau de bord, cours archivés, notes personnelles,
projets pratiques (liens GitHub), quiz de compréhension, réglages (fenêtre de
session quotidienne, position dans le programme).

## 1. Configurer Supabase

1. Sur [supabase.com](https://supabase.com), crée un nouveau projet (gratuit).
2. Va dans **SQL Editor** → New query, colle le contenu de `supabase-schema.sql`
   fourni dans ce dossier, exécute.
3. Va dans **Project Settings → API** : récupère `Project URL` et la clé
   `anon public`.

## 2. Configurer le projet en local

```bash
cp .env.example .env
```

Remplis `.env` avec ton URL et ta clé Supabase :

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=ta-cle-anon-publique
```

Puis :

```bash
npm install
npm run dev
```

L'app tourne sur `http://localhost:5173`.

## 3. Déployer

### Vercel

```bash
npm i -g vercel
vercel
```

Ou via l'interface : importe le dépôt GitHub sur [vercel.com/new](https://vercel.com/new),
Vercel détecte Vite automatiquement (build command `npm run build`, output `dist`).
Ajoute les variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
dans **Project Settings → Environment Variables**.

### Netlify

Importe le dépôt sur [app.netlify.com](https://app.netlify.com), ou :

```bash
npm i -g netlify-cli
netlify deploy --build
```

Build command : `npm run build` — Publish directory : `dist`.
Ajoute les mêmes variables d'environnement dans **Site settings → Environment variables**.

## 4. Sécurité — à savoir

Les politiques RLS du script SQL sont ouvertes (`using (true)`) : c'est un choix
volontaire pour un outil personnel mono-utilisateur, simple à mettre en place.
Concrètement, quiconque récupère ton URL Supabase + clé anon (visibles dans le
code déployé, c'est normal pour une clé "anon") peut lire/écrire ces tables.
Rien de sensible n'y transite (pas de mot de passe, pas de données personnelles
identifiantes) donc le risque est faible, mais garde ça en tête. Si tu veux
resserrer plus tard, on peut ajouter une authentification Supabase (email/mot
de passe) et des policies liées à `auth.uid()`.

## 5. Archivage automatique des cours

Section "Cours archivés" : normalement remplie par Claude à la fin de chaque
séance de mentorat, directement dans la base. Deux façons de faire fonctionner
ça une fois l'app déployée sur ta propre infrastructure :

- **Connecteur Supabase MCP branché sur Claude** : Claude peut écrire
  directement dans ta base à la fin de chaque séance de chat, sans action de
  ta part.
- **Sans connecteur** : à la fin de chaque séance, Claude te donne le texte
  structuré du cours, tu le colles dans le formulaire "Ajouter / corriger
  manuellement" de l'onglet Cours archivés (30 secondes).

Les deux fonctionnent avec la structure actuelle — rien à changer dans le code
selon l'option choisie.
