import { useState } from 'react'
import Pagination from './Pagination'
import { PHASES } from '../lib/phases'
import { todayISO, fmtDateLong } from '../lib/helpers'

const DAILY_NOTIONS = [
  { title: 'String.equals()', text: 'Compare le contenu de deux chaînes avec equals(), jamais avec ==.', why: '== compare les références mémoire. equals() compare les caractères, ce qui correspond presque toujours à l’intention.', code: 'String a = new String("Java");\nString b = new String("Java");\nSystem.out.println(a.equals(b)); // true', result: 'Le résultat est true : les deux chaînes contiennent le même texte.' },
  { title: 'final', text: 'Une variable final ne peut être assignée qu’une seule fois après son initialisation.', why: 'final rend l’intention explicite et évite qu’une valeur importante soit modifiée par erreur.', code: 'final int maxEssais = 3;\n// maxEssais = 4; // Erreur de compilation', result: 'La seconde affectation est refusée par le compilateur.' },
  { title: 'ArrayList', text: 'ArrayList offre un accès rapide par index, mais les insertions au milieu peuvent coûter cher.', why: 'Les éléments situés après l’insertion doivent être décalés. Choisis cette collection surtout pour les lectures par index.', code: 'List<String> langages = new ArrayList<>();\nlangages.add("Java");\nlangages.add("SQL");\nSystem.out.println(langages.get(0)); // Java', result: 'get(0) récupère rapidement le premier élément.' },
  { title: 'Optional', text: 'Utilise Optional pour représenter une valeur de retour potentiellement absente, pas pour chaque champ.', why: 'Il oblige le code appelant à traiter explicitement le cas où aucune valeur n’existe.', code: 'Optional<String> nom = Optional.of("Ada");\nString affichage = nom.orElse("Inconnu");', result: 'affichage vaut Ada. Avec un Optional vide, il vaudrait Inconnu.' },
  { title: 'try-with-resources', text: 'Cette syntaxe ferme automatiquement les ressources qui implémentent AutoCloseable.', why: 'Elle évite les fuites de ressources, même si une exception survient pendant la lecture ou l’écriture.', code: 'try (BufferedReader reader = Files.newBufferedReader(path)) {\n    System.out.println(reader.readLine());\n}', result: 'reader.close() est appelé automatiquement à la fin du bloc.' },
  { title: 'HashMap', text: 'HashMap associe une clé à une valeur et garantit une recherche rapide en moyenne.', why: 'C’est le bon outil quand tu dois retrouver une donnée à partir d’un identifiant unique.', code: 'Map<Integer, String> users = new HashMap<>();\nusers.put(1, "Ada");\nSystem.out.println(users.get(1)); // Ada', result: 'La clé 1 permet de retrouver directement la valeur Ada.' },
  { title: 'Stream', text: 'Un Stream est lazy : ses opérations intermédiaires ne s’exécutent qu’à l’appel terminal.', why: 'Cette exécution différée permet de composer un traitement lisible et d’éviter du travail inutile.', code: 'List<Integer> nombres = List.of(1, 2, 3, 4);\nlong total = nombres.stream()\n    .filter(n -> n % 2 == 0)\n    .count();', result: 'total vaut 2 : seuls 2 et 4 passent le filtre.' },
  { title: 'Encapsulation', text: 'Protège l’état interne d’une classe et expose seulement les opérations nécessaires.', why: 'Une classe bien encapsulée contrôle ses invariants et devient plus simple à faire évoluer.', code: 'class Compte {\n    private double solde;\n    public double getSolde() { return solde; }\n}', result: 'solde ne peut pas être modifié directement depuis l’extérieur.' },
  { title: 'Polymorphisme', text: 'Une référence d’un type parent peut désigner une instance d’une classe enfant.', why: 'Il permet d’écrire du code flexible qui fonctionne avec plusieurs implémentations.', code: 'Animal animal = new Chien();\nanimal.parler(); // comportement de Chien', result: 'Java appelle la méthode correspondant à l’objet réel, ici Chien.' },
  { title: 'Immutabilité', text: 'Un objet immuable ne change pas après sa création, ce qui simplifie le partage entre threads.', why: 'Un objet immuable est prévisible : il peut être partagé sans craindre une modification cachée.', code: 'String message = "Bonjour";\nmessage.toUpperCase();\nSystem.out.println(message); // Bonjour', result: 'toUpperCase() retourne une nouvelle chaîne et ne modifie pas message.' },
]

function notionOfTheDay(isoDate) {
  const dayNumber = Number(isoDate.replaceAll('-', ''))
  return DAILY_NOTIONS[dayNumber % DAILY_NOTIONS.length]
}

function DailyCode({ source }) {
  return (
    <div className="code-editor notion-code">
      <div className="code-toolbar"><span className="code-dots"><i /><i /><i /></span><span>java</span></div>
      <code>{source.split("\n").map((line, index) => <span className="code-line" key={`${index}-${line}`}><i>{index + 1}</i><b>{line || " "}</b></span>)}</code>
    </div>
  )
}

export default function Dashboard({ settings }) {
  const [page, setPage] = useState(0)

  if (!settings) {
    return (
      <section className="view">
        <div className="view-header"><div><h1>Tableau de bord</h1></div></div>
        <p className="muted">Connexion à Supabase en cours, ou configuration manquante (vérifie ton fichier .env).</p>
      </section>
    )
  }

  const today = todayISO()
  const dailyNotion = notionOfTheDay(today)
  const pageSize = 6
  const totalPages = Math.ceil(PHASES.length / pageSize)
  const start = page * pageSize
  const visiblePhases = PHASES.slice(start, start + pageSize)

  return (
    <section className="view">
      <div className="view-header">
        <div>
          <h1>Tableau de bord</h1>
          <div className="sub">Suivi du parcours Java</div>
        </div>
        <div className="date-tag">{fmtDateLong(today)}</div>
      </div>

      <div className="card">
        <h2 className="section-title">Notion du jour</h2>
        <div className="daily-notion">
          <span className="daily-kicker">À retenir en Java</span>
          <strong>{dailyNotion.title}</strong>
          <p>{dailyNotion.text}</p>
          <div className="notion-detail"><b>Pourquoi c’est important</b><span>{dailyNotion.why}</span></div>
          <DailyCode source={dailyNotion.code} />
          <div className="notion-result"><b>À observer</b><span>{dailyNotion.result}</span></div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h2 className="section-title">Progression du programme</h2>
        <div className="timeline">
          {visiblePhases.map((p) => {
            const cls = p.id < settings.current_phase_id ? 'done' : p.id === settings.current_phase_id ? 'current' : ''
            const label = p.id < settings.current_phase_id ? 'fait' : p.id === settings.current_phase_id ? 'en cours' : 'à venir'
            return (
              <div className={`phase-row ${cls}`} key={p.id}>
                <span className="num">{String(p.id).padStart(2, '0')}</span>
                <span className="title">{p.title}</span>
                <span className="state">{label}</span>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 12 }}>
          <Pagination
            page={page}
            hasNext={page < totalPages - 1}
            onPrevious={() => setPage((current) => Math.max(0, current - 1))}
            onNext={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
            label="phases"
          />
        </div>
      </div>
    </section>
  )
}
