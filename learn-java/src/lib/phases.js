export const PHASES = [
  { id: 0,  title: "Comprendre Java", notions: ["Langage compilé vs interprété","Typage statique","JDK / JRE / JVM","Bytecode","Class loading, JIT, GC"] },
  { id: 1,  title: "Syntaxe et fondamentaux", notions: ["Variables, types primitifs","Opérateurs, conditions, boucles","Méthodes, paramètres, portée"] },
  { id: 2,  title: "Mémoire et références", notions: ["Stack vs Heap","Passage par valeur","String Pool","Autoboxing / unboxing","NullPointerException"] },
  { id: 3,  title: "Programmation orientée objet", notions: ["Encapsulation","Héritage vs composition","Interface vs classe abstraite","Polymorphisme"] },
  { id: 4,  title: "Object contracts", notions: ["equals / hashCode","toString","Identité vs égalité","Records"] },
  { id: 5,  title: "Enums et classes modernes", notions: ["Enum avec comportement","Records","Sealed classes","Interfaces modernes"] },
  { id: 6,  title: "Exceptions", notions: ["Checked vs unchecked","try / catch / finally","try-with-resources","Exceptions personnalisées"] },
  { id: 7,  title: "Collections", notions: ["List / Set / Map / Queue","ArrayList vs LinkedList","HashMap vs TreeMap","Complexité et cas d'usage"] },
  { id: 8,  title: "Generics", notions: ["Type safety","Bounded types","Wildcards, PECS","Type erasure"] },
  { id: 9,  title: "Lambda et programmation fonctionnelle", notions: ["Functional interfaces","Predicate / Function / Consumer / Supplier","Method references"] },
  { id: 10, title: "Stream API", notions: ["Pipeline, lazy evaluation","map / filter / reduce / collect","groupingBy / partitioningBy"] },
  { id: 11, title: "Optional", notions: ["null vs Optional","map / flatMap / orElseThrow","Bonnes et mauvaises utilisations"] },
  { id: 12, title: "Date et temps", notions: ["LocalDate / LocalDateTime","Instant, ZonedDateTime","Duration / Period"] },
  { id: 13, title: "Input/Output", notions: ["Path, Files","try-with-resources","Sérialisation JSON"] },
  { id: 14, title: "Concurrence et threads", notions: ["Thread, Runnable, Callable","ExecutorService, Future","synchronized, locks, volatile","Race condition, deadlock"] },
  { id: 15, title: "JVM et performance", notions: ["Heap, Metaspace, GC","JIT, profiling","Complexité algorithmique (Big O)"] },
  { id: 16, title: "Reflection et annotations", notions: ["Annotations personnalisées","Class, Method, Field","Lien avec le fonctionnement de Spring"] },
  { id: 17, title: "Design et qualité du code", notions: ["SOLID (avec compromis)","DRY, KISS, YAGNI","Couplage et cohésion"] },
  { id: 18, title: "Design patterns", notions: ["Strategy, Factory, Builder","Adapter, Decorator, Observer","Singleton et ses problèmes"] },
  { id: 19, title: "Projet Java pur", notions: ["Application de gestion bancaire","Sans Spring, en autonomie"] },
  { id: 20, title: "Tests Java", notions: ["JUnit 5, assertions","Mockito, mocks, stubs","Given / When / Then"] },
  { id: 21, title: "Introduction à Spring", notions: ["IoC, DI, Bean","ApplicationContext, scopes","Ce que Spring fait derrière les abstractions"] },
  { id: 22, title: "Spring Boot", notions: ["REST, validation","Spring Data JPA, transactions","Sécurité, JWT"] },
  { id: 23, title: "Backend professionnel", notions: ["Architecture Controller → Service → Repository","API externes, Kafka","Idempotence, retries, observabilité"] },
]

export const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

export function phaseTitle(id) {
  const p = PHASES.find((p) => p.id === Number(id))
  return p ? p.title : "—"
}
