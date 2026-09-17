export default function MarkdownLite({ text }) {
  const lines = (text || "").split("\n")
  const blocks = []
  let list = null

  const flushList = () => {
    if (list) {
      blocks.push({ type: "ul", items: list })
      list = null
    }
  }

  lines.forEach((raw, i) => {
    const line = raw.trim()
    if (line.startsWith("## ")) {
      flushList()
      blocks.push({ type: "h3", text: line.slice(3), key: i })
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!list) list = []
      list.push(line.slice(2))
    } else if (line === "") {
      flushList()
    } else {
      flushList()
      blocks.push({ type: "p", text: line, key: i })
    }
  })
  flushList()

  return (
    <div>
      {blocks.map((b, i) => {
        if (b.type === "h3") return <h3 key={i} className="md-h3">{b.text}</h3>
        if (b.type === "ul") return (
          <ul key={i} className="md-ul">
            {b.items.map((it, j) => <li key={j}>{it}</li>)}
          </ul>
        )
        return <p key={i} className="md-p">{b.text}</p>
      })}
    </div>
  )
}
