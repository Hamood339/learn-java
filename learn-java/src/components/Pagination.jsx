export default function Pagination({ page, hasNext, onPrevious, onNext, label = 'éléments' }) {
  if (page === 0 && !hasNext) return null

  return (
    <nav className="pagination" aria-label={`Pagination des ${label}`}>
      <button className="btn" type="button" onClick={onPrevious} disabled={page === 0}>
        Précédent
      </button>
      <span>Page {page + 1}</span>
      <button className="btn" type="button" onClick={onNext} disabled={!hasNext}>
        Suivant
      </button>
    </nav>
  )
}
