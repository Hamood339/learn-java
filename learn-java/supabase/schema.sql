-- Learn-Java — schéma Supabase complet (tables + sécurité + bibliothèque de référence)
-- À exécuter en une seule fois dans Supabase : Dashboard > SQL Editor > New query.
--
-- ATTENTION : ce script commence par supprimer les tables existantes (settings, days,
-- projects, quizzes, phase_reference) pour repartir d'une structure propre, au cas où
-- une version précédente aurait créé ces tables avec une structure différente (ex. sans
-- colonne user_id), ce qui provoque l'erreur "column user_id does not exist" sur les policies.
-- Si tu as déjà des données importantes dans ces tables, sauvegarde-les avant de lancer ce script.

drop table if exists public.phase_reference cascade;
drop table if exists public.quizzes cascade;
drop table if exists public.projects cascade;
drop table if exists public.days cascade;
drop table if exists public.settings cascade;

create extension if not exists pgcrypto;

-- ================= Réglages (un enregistrement par utilisateur) =================
create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  reminder_start time not null default '21:00',
  reminder_end time not null default '00:00',
  active_days int[] not null default '{1,2,3,4,5,6,7}',
  current_phase_id int not null default 0,
  day_in_program int not null default 1,
  objective text default '',
  updated_at timestamptz default now()
);

-- ================= Journal quotidien (session + note + cours archivé) =================
create table if not exists public.days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  phase_id int not null default 0,
  day_in_program int,
  statut text not null default 'a_faire',
  note_contenu text default '',
  cours_contenu text default '',
  updated_at timestamptz default now(),
  unique (user_id, date)
);

-- ================= Projets pratiques (liens GitHub) =================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titre text not null,
  lien text not null,
  phase_id int,
  description text default '',
  date_ajout timestamptz default now()
);

-- ================= Quiz (questions + historique de scores, par phase) =================
create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  phase_id int not null,
  questions jsonb not null default '[]',
  history jsonb not null default '[]',
  unique (user_id, phase_id)
);

-- ================= Bibliothèque de référence (contenu générique par phase) =================
create table if not exists public.phase_reference (
  phase_id int primary key,
  content text not null default '',
  updated_at timestamptz default now()
);

-- ================= Sécurité (RLS) : chacun ne voit / n'écrit que ses propres données =================
alter table public.settings enable row level security;
alter table public.days enable row level security;
alter table public.projects enable row level security;
alter table public.quizzes enable row level security;
alter table public.phase_reference enable row level security;

drop policy if exists "settings_own" on public.settings;
create policy "settings_own" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "days_own" on public.days;
create policy "days_own" on public.days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "projects_own" on public.projects;
create policy "projects_own" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "quizzes_own" on public.quizzes;
create policy "quizzes_own" on public.quizzes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Bibliothèque : lecture pour tout utilisateur connecté ; l'écriture se fait uniquement
-- via ce script (seed ci-dessous), pas depuis l'app.
drop policy if exists "phase_reference_read" on public.phase_reference;
create policy "phase_reference_read" on public.phase_reference
  for select using (auth.role() = 'authenticated');

-- ================= Contenu de la bibliothèque (24 phases) =================
-- Sûr à relancer : met à jour le contenu si la phase existe déjà (on conflict).

insert into public.phase_reference (phase_id, content) values
(0, $$## Concept
Java est un langage compilé vers un bytecode intermédiaire, exécuté par une machine virtuelle (JVM) plutôt que directement par le processeur.

## Pourquoi
Ce choix permet au même bytecode de tourner sur n'importe quelle plateforme disposant d'une JVM ("write once, run anywhere"), au prix d'une couche d'exécution supplémentaire.

## Points clés
- JDK = outils de développement (compilateur javac, débogueur...)
- JRE = environnement d'exécution (JVM + bibliothèques standard)
- JVM = machine virtuelle qui exécute le bytecode
- Compilation : .java vers .class (bytecode), pas de code machine natif direct
- Class loading : la JVM charge les classes à la demande, au moment de leur première utilisation
- JIT (Just-In-Time) : le bytecode chaud est recompilé en code machine natif à l'exécution
- Garbage Collector : libère automatiquement la mémoire des objets non référencés

## Pièges
- Confondre JDK et JRE : le JRE seul ne permet pas de compiler
- Croire que Java est "interprété" au sens strict — le JIT complique cette vision
- Oublier que le typage statique est vérifié à la compilation, pas à l'exécution$$),

(1, $$## Concept
Les briques de base d'un programme Java : variables, types primitifs, structures de contrôle, méthodes.

## Pourquoi
Sans ces fondations, impossible d'exprimer une logique — c'est le vocabulaire minimal du langage.

## Points clés
- 8 types primitifs : byte, short, int, long, float, double, char, boolean — stockés par valeur
- Types référence (classes, tableaux, interfaces) — stockés par référence
- Portée (scope) d'une variable = bloc dans lequel elle est déclarée
- switch moderne (Java 14+) avec expressions et flèches
- Une méthode a une signature : nom + types de paramètres (pas le type de retour)

## Pièges
- Confondre = (affectation) et == (comparaison), surtout avec les booléens
- Oublier qu'un int qui déborde ne lève pas d'exception, il boucle silencieusement
- Utiliser == pour comparer des objets (String compris) au lieu de equals()$$),

(2, $$## Concept
Deux zones mémoire distinctes : la Stack (variables locales, primitives, appels de méthode) et le Heap (tous les objets).

## Pourquoi
Comprendre cette séparation explique pourquoi deux variables peuvent pointer vers le même objet, et pourquoi modifier un objet via une référence affecte toutes les variables qui le référencent.

## Points clés
- Java passe TOUJOURS les paramètres par valeur — pour un objet, la valeur passée est la référence, pas l'objet
- String Pool : les littéraux String sont réutilisés en mémoire
- Autoboxing/unboxing : conversion automatique entre types primitifs et leurs wrappers
- Un objet devient éligible au Garbage Collector quand plus aucune référence ne pointe vers lui
- NullPointerException : tentative d'utiliser une référence qui vaut null

## Pièges
- Croire que Java passe les objets "par référence" au sens C++
- Comparer des Integer avec == au-delà de la plage -128 à 127
- Modifier un objet mutable utilisé comme clé de HashMap après l'avoir inséré$$),

(3, $$## Concept
Organiser le code autour d'objets qui combinent état (attributs) et comportement (méthodes).

## Pourquoi
Ça rapproche le code du domaine métier et permet la réutilisation via héritage et composition.

## Points clés
- Encapsulation : cacher l'état interne, exposer un contrat via des méthodes publiques
- Héritage (extends) : relation "est un", une seule classe parente possible
- Composition : une classe contient une instance d'une autre — relation "a un", plus flexible
- Interface : contrat pur, plusieurs implémentables à la fois
- Classe abstraite : mélange de méthodes concrètes et abstraites, héritage simple seulement
- Polymorphisme : une référence de type parent peut pointer vers un objet enfant

## Pièges
- Abuser de l'héritage là où la composition serait plus flexible
- Casser l'encapsulation avec des getters/setters qui exposent l'état mutable sans copie défensive
- Confondre redéfinition (override) et surcharge (overload)$$),

(4, $$## Concept
Le contrat implicite entre equals(), hashCode() et toString() que tout objet Java respecte.

## Pourquoi
Les collections comme HashMap et HashSet reposent sur ce contrat pour fonctionner correctement.

## Points clés
- Règle d'or : si equals() est redéfini, hashCode() doit l'être aussi
- Identité (==) différente d'égalité (equals()) : deux objets distincts en mémoire peuvent être égaux logiquement
- toString() sert au débogage et au logging, pas à la logique métier
- Les records (Java 16+) génèrent automatiquement equals/hashCode/toString cohérents

## Pièges
- Redéfinir equals() sans hashCode() : casse le comportement dans les HashMap/HashSet
- Modifier un champ utilisé dans equals()/hashCode() après insertion dans une collection basée sur le hachage
- Oublier que le hashCode par défaut d'Object est basé sur l'identité mémoire$$),

(5, $$## Concept
Des types Java au-delà des classes classiques : enum, record, sealed classes, interfaces avec du comportement.

## Pourquoi
Ils réduisent le code répétitif (boilerplate) et rendent certaines erreurs impossibles à la compilation.

## Points clés
- enum : type sûr pour un ensemble fixe de valeurs, peut avoir des champs, méthodes, voire un corps par constante
- record : classe immuable pour transporter des données, avec equals/hashCode/toString générés
- sealed class : restreint explicitement quelles classes peuvent hériter d'elle
- default method dans une interface : fournit une implémentation par défaut réutilisable

## Pièges
- Utiliser une enum comme simple liste de constantes alors qu'elle pourrait porter du comportement
- Rendre un record mutable via un champ référence non copié
- Oublier qu'une sealed class doit lister explicitement (permits) ses sous-types autorisés$$),

(6, $$## Concept
Mécanisme de gestion des erreurs qui interrompt le flux normal d'exécution.

## Pourquoi
Séparer la logique métier de la gestion des cas d'échec, et forcer ou non le code appelant à réagir.

## Points clés
- Checked exception : doit être déclarée (throws) ou attrapée — vérifié par le compilateur
- Unchecked exception (RuntimeException) : pas de vérification à la compilation
- try-with-resources : ferme automatiquement les ressources même en cas d'exception
- finally s'exécute toujours, sauf arrêt JVM brutal
- Wrapping : envelopper une exception technique dans une exception métier plus parlante

## Pièges
- Attraper Exception de façon générique et avaler l'erreur silencieusement
- Utiliser les exceptions pour du contrôle de flux normal
- Checked exceptions à outrance : rend l'API pénible à utiliser sans réel bénéfice$$),

(7, $$## Concept
Les structures de données standard de Java pour stocker des groupes d'éléments : List, Set, Map, Queue.

## Pourquoi
Chaque structure a des garanties différentes (ordre, doublons, performance) adaptées à des besoins différents.

## Points clés
- ArrayList : accès rapide par index, insertion/suppression au milieu coûteuse
- LinkedList : insertion/suppression rapide aux extrémités, accès par index lent
- HashSet : pas d'ordre garanti, pas de doublons, recherche rapide en moyenne
- TreeSet/TreeMap : éléments triés, opérations en O(log n)
- HashMap : clé vers valeur, pas d'ordre, recherche rapide en moyenne
- LinkedHashMap : conserve l'ordre d'insertion

## Pièges
- Utiliser ArrayList quand on fait beaucoup d'insertions/suppressions en milieu de liste
- Croire que HashMap garantit un ordre quelconque
- Itérer et modifier une collection en même temps (ConcurrentModificationException)$$),

(8, $$## Concept
Paramétrer une classe ou une méthode par un type, vérifié à la compilation.

## Pourquoi
Éviter les ClassCastException à l'exécution en détectant les erreurs de type dès la compilation.

## Points clés
- List<String> garantit que seuls des String peuvent y être ajoutés
- Bounded type : <T extends Number> restreint T aux sous-types de Number
- Wildcard ? extends T : lecture seule, accepte T et ses sous-types
- Wildcard ? super T : écriture possible, accepte T et ses supertypes
- PECS : "Producer Extends, Consumer Super" — règle pour choisir le bon wildcard
- Type erasure : les informations de type générique sont effacées à l'exécution

## Pièges
- Croire qu'on peut connaître le type générique à l'exécution
- Créer un tableau générique directement (interdit à cause de l'erasure)
- Mal choisir entre extends et super, rendant l'API trop restrictive$$),

(9, $$## Concept
Traiter les fonctions comme des valeurs, via des interfaces fonctionnelles (une seule méthode abstraite).

## Pourquoi
Rend le code plus concis pour exprimer un comportement à passer en paramètre.

## Points clés
- Predicate<T> : teste une condition, retourne boolean
- Function<T,R> : transforme T en R
- Consumer<T> : consomme une valeur, ne retourne rien
- Supplier<T> : fournit une valeur sans argument
- Method reference (ClassName::method) : raccourci quand la lambda ne fait qu'appeler une méthode existante
- Les lambdas capturent les variables externes en lecture seule (effectively final)

## Pièges
- Abuser des lambdas au point de nuire à la lisibilité
- Créer des effets de bord dans une lambda censée être pure
- Oublier qu'une lambda ne peut pas réassigner une variable capturée$$),

(10, $$## Concept
Pipeline de traitement de données en style déclaratif : source, opérations intermédiaires, opération terminale.

## Pourquoi
Exprime le "quoi" plutôt que le "comment", et permet potentiellement la parallélisation.

## Points clés
- Lazy evaluation : rien ne s'exécute avant l'opération terminale (collect, forEach, reduce...)
- map/filter/sorted/distinct : opérations intermédiaires, retournent un nouveau Stream
- collect(Collectors.groupingBy(...)) : regroupe les éléments par une clé
- reduce : agrège les éléments en une seule valeur
- Un Stream ne se consomme qu'une seule fois

## Pièges
- Utiliser un Stream pour une simple boucle sans transformation
- Provoquer des effets de bord dans un map()
- Réutiliser un Stream déjà consommé (IllegalStateException)$$),

(11, $$## Concept
Un conteneur qui représente explicitement l'absence possible d'une valeur.

## Pourquoi
Force le code appelant à gérer le cas "pas de valeur" au lieu de risquer un NullPointerException silencieux.

## Points clés
- Optional.ofNullable() : crée un Optional à partir d'une valeur potentiellement nulle
- map/flatMap : transforment la valeur si présente, ne font rien sinon
- orElseThrow() : lève une exception explicite si la valeur est absente
- Optional est fait pour les valeurs de retour, pas pour les champs de classe ni les paramètres

## Pièges
- Appeler .get() sans vérifier isPresent()
- Utiliser Optional comme type de champ dans une entité
- Empiler des Optional imbriqués au lieu d'utiliser flatMap$$),

(12, $$## Concept
L'API java.time (depuis Java 8) modélise précisément les différentes notions de temps.

## Pourquoi
L'ancienne API Date/Calendar était mutable, mal conçue et source de bugs liés aux fuseaux horaires.

## Points clés
- LocalDate/LocalTime/LocalDateTime : pas de fuseau horaire, "heure du mur"
- Instant : point précis sur la timeline UTC, utile pour les timestamps techniques
- ZonedDateTime : date/heure plus fuseau horaire complet
- Duration : durée en temps ; Period : durée en dates
- Toutes ces classes sont immuables — chaque opération retourne une nouvelle instance

## Pièges
- Stocker un LocalDateTime pour un événement qui doit rester correct malgré un changement de fuseau
- Oublier qu'une opération comme plusDays() ne modifie pas l'objet original
- Confondre Duration et Period pour des calculs de dates$$),

(13, $$## Concept
Lire et écrire des données depuis ou vers des fichiers ou flux externes.

## Pourquoi
Un programme doit souvent interagir avec le système de fichiers ou le réseau.

## Points clés
- Path/Files (java.nio) : API moderne pour manipuler fichiers et répertoires
- try-with-resources : garantit la fermeture des flux même en cas d'exception
- BufferedReader/BufferedWriter : ajoutent un tampon pour réduire les accès disque coûteux
- Sérialisation JSON : généralement via une librairie tierce (Jackson, Gson)

## Pièges
- Oublier de fermer un flux (fuite de ressources)
- Lire un gros fichier ligne par ligne sans tampon
- Mélanger chemins relatifs et absolus sans vérifier le répertoire de travail courant$$),

(14, $$## Concept
Exécuter plusieurs tâches en parallèle au sein d'un même programme, via des threads.

## Pourquoi
Exploiter les processeurs multi-cœurs et ne pas bloquer sur des opérations longues.

## Points clés
- Runnable (sans retour) vs Callable (avec retour et exception)
- ExecutorService : gère un pool de threads réutilisables
- Future/CompletableFuture : représente un résultat disponible plus tard
- synchronized : garantit qu'un seul thread exécute un bloc à la fois
- volatile : garantit la visibilité d'une variable entre threads, pas l'atomicité
- Race condition : résultat dépendant de l'ordre d'exécution imprévisible
- Deadlock : deux threads s'attendent mutuellement indéfiniment

## Pièges
- Créer des threads manuellement au lieu d'utiliser un ExecutorService
- Croire que volatile suffit pour les opérations composées
- Verrouiller dans des ordres différents selon les threads$$),

(15, $$## Concept
Comprendre les mécanismes internes de la JVM qui influencent la performance d'une application.

## Pourquoi
Diagnostiquer et corriger des problèmes de mémoire ou de lenteur nécessite de savoir ce qui se passe sous le capot.

## Points clés
- Heap : où vivent les objets ; Metaspace : où vivent les métadonnées des classes
- Le Garbage Collector a plusieurs générations pour optimiser les passes de nettoyage
- JIT : compile à la volée le bytecode chaud en code machine natif
- Profiling : mesurer où le temps et la mémoire sont réellement consommés avant d'optimiser
- Big O : notation pour estimer comment le temps/espace croît avec la taille des données

## Pièges
- Optimiser sans avoir profilé
- Confondre complexité algorithmique et performance réelle mesurée
- Ignorer l'impact mémoire d'une structure choisie uniquement pour sa simplicité$$),

(16, $$## Concept
Inspecter et manipuler des classes, méthodes et champs à l'exécution, plutôt qu'à la compilation.

## Pourquoi
C'est la base de nombreux frameworks, Spring compris, qui construisent et configurent des objets dynamiquement.

## Points clés
- Annotation : métadonnée attachée au code (@Override, @Deprecated, ou personnalisée)
- @Retention : détermine si l'annotation est visible à l'exécution ou seulement à la compilation
- @Target : restreint où l'annotation peut être utilisée
- Class/Method/Field : API de reflection pour inspecter dynamiquement une classe
- Spring utilise la reflection et les annotations pour instancier et connecter les beans automatiquement

## Pièges
- Utiliser la reflection pour des besoins simples résolubles autrement
- Casser l'encapsulation en accédant à des champs privés via reflection
- Oublier qu'une annotation sans @Retention(RUNTIME) est invisible à l'exécution$$),

(17, $$## Concept
Des principes pour écrire du code maintenable, pas des règles absolues.

## Pourquoi
Un code qui marche aujourd'hui peut devenir ingérable si sa structure ne facilite pas le changement.

## Points clés
- SOLID : cinq principes (responsabilité unique, ouvert/fermé, substitution de Liskov, ségrégation d'interfaces, inversion de dépendances)
- DRY : éviter la duplication de connaissance, pas seulement de code
- KISS : préférer la solution la plus simple qui résout le problème
- YAGNI : ne pas construire une flexibilité "au cas où" non demandée
- Couplage : dépendance entre modules ; Cohésion : clarté de la responsabilité d'un module

## Pièges
- Appliquer SOLID dogmatiquement sans peser le coût de l'abstraction ajoutée
- Confondre DRY avec "ne jamais répéter de code"
- Sur-ingénierie au nom de la qualité, alors qu'un code simple suffirait$$),

(18, $$## Concept
Des solutions réutilisables à des problèmes de conception récurrents.

## Pourquoi
Donnent un vocabulaire commun entre développeurs et évitent de réinventer des solutions déjà éprouvées.

## Points clés
- Strategy : encapsule des algorithmes interchangeables derrière une interface commune
- Factory : centralise la création d'objets
- Builder : construit un objet complexe étape par étape
- Adapter : fait cohabiter deux interfaces incompatibles
- Decorator : ajoute des responsabilités à un objet dynamiquement, sans hériter
- Observer : notifie automatiquement des abonnés lors d'un changement d'état
- Singleton : garantit une seule instance — souvent critiqué

## Pièges
- Utiliser un pattern juste pour montrer qu'on le connaît, sans besoin réel
- Abuser du Singleton, qui introduit un couplage global difficile à tester
- Choisir Factory là où un simple constructeur suffirait$$),

(19, $$## Concept
Construire une application complète (gestion bancaire) sans framework, pour consolider tous les acquis.

## Pourquoi
Réutiliser en situation réelle ce qui a été appris isolément renforce la compréhension et révèle les manques.

## Points clés
- Modéliser le domaine : comptes, utilisateurs, transactions, avec des règles métier claires
- Valider les entrées et lever des exceptions métier explicites
- Utiliser les bonnes structures de collections selon le besoin réel
- Écrire des tests pour les règles métier critiques

## Pièges
- Se précipiter sur le code avant d'avoir conçu les classes et leurs responsabilités
- Mélanger logique métier et affichage dans les mêmes classes
- Sous-tester les cas limites (solde négatif, montants invalides...)$$),

(20, $$## Concept
Vérifier automatiquement que le code se comporte comme attendu, avant et après modification.

## Pourquoi
Un test automatisé détecte une régression immédiatement, sans dépendre d'une vérification manuelle.

## Points clés
- JUnit 5 : framework standard pour écrire et exécuter des tests unitaires
- Given/When/Then : structurer un test en préparation, action, vérification
- Mockito : simuler les dépendances d'une classe pour l'isoler pendant le test
- Un mock vérifie le comportement (verify), un stub fournit juste des données prédéfinies

## Pièges
- Tester l'implémentation plutôt que le comportement
- Mocker des objets simples qui n'ont pas besoin de l'être
- Écrire des tests qui dépendent de l'ordre d'exécution des autres tests$$),

(21, $$## Concept
Un framework qui gère la création et le câblage des objets (beans) à la place du développeur.

## Pourquoi
Réduit le code répétitif de construction manuelle et centralise la configuration de l'application.

## Points clés
- IoC (Inversion of Control) : Spring, pas le développeur, décide quand créer les objets
- DI (Dependency Injection) : les dépendances d'une classe lui sont fournies plutôt que créées par elle
- Bean : un objet géré par le conteneur Spring (ApplicationContext)
- Injection par constructeur : approche recommandée, dépendances explicites et immuables
- Scope : singleton par défaut, prototype pour une nouvelle instance à chaque demande

## Pièges
- Utiliser l'injection par champ plutôt que par constructeur
- Ne pas comprendre pourquoi un bean singleton pose problème s'il garde un état mutable
- Croire que Spring "fait de la magie" sans savoir qu'il repose sur reflection et proxies$$),

(22, $$## Concept
Une couche au-dessus de Spring qui simplifie la configuration et le démarrage d'une application.

## Pourquoi
Réduit drastiquement le code de configuration nécessaire pour démarrer un projet Spring.

## Points clés
- @RestController + @RequestMapping : exposent une API REST
- Validation (@Valid, Bean Validation) : vérifie automatiquement les DTO entrants
- Spring Data JPA : génère les requêtes de base à partir du nom des méthodes de repository
- @Transactional : délimite une transaction, avec rollback automatique en cas d'exception
- JWT : jeton signé utilisé pour authentifier les requêtes sans état côté serveur

## Pièges
- Mettre de la logique métier dans le Controller au lieu du Service
- Oublier qu'une méthode @Transactional appelée depuis la même classe ne passe pas par le proxy Spring
- Exposer directement les entités JPA dans l'API au lieu de passer par des DTO$$),

(23, $$## Concept
Construire des architectures robustes : Controller vers Service vers Repository, avec dépendances externes.

## Pourquoi
Un backend en production doit être résilient aux pannes réseau, aux doublons de requêtes, et observable.

## Points clés
- DTO : objet dédié au transport de données, découplé de l'entité de persistance
- Idempotence : une requête répétée plusieurs fois produit le même effet qu'une seule fois
- Retry : réessayer automatiquement un appel externe qui échoue temporairement
- Timeout : éviter qu'un appel bloqué ne bloque indéfiniment le système appelant
- Logs structurés et observabilité : comprendre ce qui se passe en production

## Pièges
- Appeler un service externe sans timeout ni gestion d'échec
- Concevoir une API non idempotente pour des opérations qui peuvent être rejouées
- Négliger les logs jusqu'à ce qu'un incident en production devienne impossible à diagnostiquer$$)

on conflict (phase_id) do update set content = excluded.content, updated_at = now();
