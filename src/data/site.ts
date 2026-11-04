// Tout le contenu du site est ici : modifier ce fichier suffit pour le mettre à jour.

const github = 'https://github.com/claude-boulay';

export const profile = {
  name: 'Claude Boulay',
  role: 'Dev full-stack',
  lead: "Je construis les outils qui font tourner une activité e-commerce, et l’infrastructure qui va avec.",
  facts: ['Alternance chez Tubconcept', 'Master à SUPINFO Tours', 'Dernière année'],
  search: 'Je cherche un poste partout en France, à la fin de mes études.',
  email: 'claudeboulay41@gmail.com',
  github,
  squidLink: 'jeu/', // destination du calmar qui passe dans le hero
  linkedin: 'https://www.linkedin.com/in/claude-boulay-832747306/',
};

export const tubconcept = {
  meta: 'Alternance · depuis plus de 2 ans',
  intro:
    'Trois chantiers autour de la vente en ligne : la boutique, les données fournisseurs et la gestion des commandes.',
  erp: {
    title: 'ERP marketplaces',
    text: 'Un ERP pour relier et gérer les commandes de nos quatre marketplaces : Amazon, ManoMano, Castorama et Leroy Merlin. Les commandes de ces plateformes se gèrent au même endroit.',
    stack: ['CodeIgniter', 'PHP', 'JavaScript', 'jQuery', 'DataTables'],
  },
  others: [
    {
      title: 'Scrapers fournisseurs',
      text: 'Récupération chez nos fournisseurs des données produits, des stocks et des prix, pour être à jour le plus rapidement possible, ainsi que du suivi de nos commandes.',
      stack: ['Python'],
    },
    {
      title: 'Module de tampons personnalisés',
      text: 'Un module PrestaShop qui lie des dimensions de tampon à un produit. Sur la page produit, le client écrit dans le cadre et place son texte à sa convenance. À la validation de la commande, un PDF y est associé pour l’impression.',
      stack: ['PrestaShop', 'PHP'],
    },
  ],
};

export const featured = [
  {
    name: 'Yu-Gi-Oh! D&D',
    year: '2026',
    team: 'Solo',
    url: `${github}/DND_DUEL_GO`,
    text: "Une application web pour animer des parties de jeu de rôle sur table : fiches de personnage, dés, économie et boutiques, deckbuilding et duels pilotés par le MJ.",
    points: [
      'Duels sur le vrai moteur C++ ocgcore, compilé dans l’image Docker et piloté depuis Node par un protocole texte sur stdin/stdout, avec un process par duel.',
      'Dés côté serveur : les rerolls de Chance sont vérifiés et décomptés avant diffusion, pour éviter la triche.',
      'CI GitHub Actions : tests contre une vraie base Mongo, CodeQL, audit npm, images publiées sur GHCR.',
    ],
    stack: ['React', 'TypeScript', 'Express', 'Socket.io', 'MongoDB', 'C++', 'Docker', 'Caddy'],
  },
  {
    name: 'Taylor Shift’s Ticket Shop',
    year: '2026',
    team: 'En binôme',
    url: `${github}/5HASH-Taylor-Shift-s-Ticket-Shop`,
    text: "L’infrastructure d’une billetterie PrestaShop, du réseau au déploiement, décrite entièrement en code et testée sur un émulateur AWS local.",
    points: [
      'Terraform en modules (réseau, calcul, base, sécurité, secrets) et trois environnements : dev, staging, prod.',
      'Load balancer devant des instances réparties sur deux zones, base RDS isolée en sous-réseaux privés.',
      'Configuration et déploiement de l’application avec Ansible.',
    ],
    stack: ['Terraform', 'Ansible', 'AWS', 'Docker', 'PrestaShop', 'GitHub Actions'],
  },
  {
    name: 'SchooInc',
    year: '2026',
    team: 'En binôme',
    url: `${github}/SchooInc`,
    text: 'Une application de gestion scolaire (utilisateurs, classes, cours, calendrier, notes) en microservices GraphQL.',
    points: [
      'Trois services, chacun avec sa base PostgreSQL, réunis derrière une gateway GraphQL Mesh.',
      'Synchronisation des tables miroirs au démarrage, ignorée si le service source est injoignable pour ne pas effacer de données.',
    ],
    stack: ['React', 'GraphQL', 'Apollo', 'PostgreSQL', 'JWT', 'Docker Compose'],
  },
  {
    name: 'kubeTracker',
    year: '2025',
    team: 'À trois',
    url: `${github}/kubeTracker`,
    text: "Le déploiement sur Kubernetes d’une application de suivi de positions : base, file de messages, simulateur, tracker, API gateway et interface web.",
    points: ['Manifestes pour chaque service, stockage persistant pour MongoDB et documentation technique.'],
    stack: ['Kubernetes', 'MongoDB'],
  },
];

export const others = [
  { name: 'VoteApp', year: '2025', text: 'App de vote distribuée sur un cluster Docker Swarm', stack: 'Python · .NET · Node · Redis', url: `${github}/VoteApp` },
  { name: 'Student Recipe', year: '2025', text: 'Appli Android de recettes, avec cache local', stack: 'Kotlin · Compose · Room', url: `${github}/Student-Recipe` },
  { name: 'RailRoad API', year: '2024', text: 'API de gestion de trains et de gares, avec rôles', stack: 'Node.js · JWT · Swagger', url: `${github}/project_node_end_module` },
  { name: 'SIOConnect', year: '2024', text: 'Appli Android autour des anciens étudiants et de leurs postes', stack: 'Java · Android', url: `${github}/SIOConnect` },
  { name: 'Randomiser LoL', year: '2024', text: 'Site qui tire au sort des parties de League of Legends', stack: 'PHP · CodeIgniter', url: `${github}/randomiserLol` },
  { name: 'Demonia', year: '2024', text: 'Mod Minecraft', stack: 'Java · Forge', url: `${github}/DemoniaForge` },
];

export const skills = [
  { title: 'Web', items: ['TypeScript', 'React', 'Node.js', 'Express', 'PHP', 'CodeIgniter', 'PrestaShop', 'jQuery', 'GraphQL', 'Socket.io'] },
  { title: 'Données', items: ['Python', 'Scraping', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis'] },
  { title: 'Infra', items: ['Docker', 'Kubernetes', 'Terraform', 'Ansible', 'AWS', 'GitHub Actions'] },
  { title: 'Mobile', items: ['Kotlin', 'Jetpack Compose', 'Java Android'] },
];

export const timeline = [
  { when: 'Aujourd’hui', title: 'Master à SUPINFO Tours', text: 'Dernière année, spécialité développement et mobile.' },
  { when: 'Depuis plus de 2 ans', title: 'Alternance chez Tubconcept', text: 'ERP marketplaces, scrapers Python et PrestaShop.' },
  { when: '2022 – 2024', title: 'BTS SIO option SLAM', text: 'Avec deux stages de 5 semaines en développement web, à l’Atelier numérique et chez Tubconcept.' },
  { when: '2020', title: 'Bac S, mention Bien', text: 'Lycée Claude de France, Romorantin-Lanthenay.' },
];
