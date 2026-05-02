import { useState } from 'react'
import { Bell, X, AlertTriangle, AlertCircle } from 'lucide-react'
import { useFinance } from '../context/FinanceContext'
import './Notificacoes.css'

export default function Notificacoes() {
  const { transacoes, orcamentos } = useFinance()
  const [aberto, setAberto] = useState(false)

  if (!orcamentos) return null

  const alertas = []

  orcamentos.forEach(orc => {
    const gasto = transacoes
      .filter(t => t.tipo === 'despesa' && t.categoria === orc.categoria)
      .reduce((acc, t) => acc + t.valor, 0)

    const pct = (gasto / orc.limite) * 100

    if (pct >= 100) {
      alertas.push({
        tipo: 'critico',
        categoria: orc.categoria,
        gasto,
        limite: orc.limite,
        pct: Math.round(pct),
      })
    } else if (pct >= 80) {
      alertas.push({
        tipo: 'aviso',
        categoria: orc.categoria,
        gasto,
        limite: orc.limite,
        pct: Math.round(pct),
      })
    }
  })

  function formatarValor(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <div className="notif-wrapper">
      <button className="notif-btn" onClick={() => setAberto(!aberto)}>
        <Bell size={20} />
        {alertas.length > 0 && (
          <span className={`notif-badge ${alertas.some(a => a.tipo === 'critico') ? 'critico' : 'aviso'}`}>
            {alertas.length}
          </span>
        )}
      </button>

      {aberto && (
        <>
          <div className="notif-overlay" onClick={() => setAberto(false)} />
          <div className="notif-dropdown">
            <div className="notif-header">
              <span>Notificações</span>
              <button onClick={() => setAberto(false)}><X size={16} /></button>
            </div>

            {alertas.length === 0 ? (
              <div className="notif-vazio">
                <Bell size={32} />
                <p>Nenhum alerta no momento!</p>
                <span>Seus gastos estão dentro do limite.</span>
              </div>
            ) : (
              <div className="notif-lista">
                {alertas.map((a, i) => (
                  <div key={i} className={`notif-item ${a.tipo}`}>
                    <div className="notif-icone">
                      {a.tipo === 'critico'
                        ? <AlertCircle size={18} />
                        : <AlertTriangle size={18} />
                      }
                    </div>
                    <div className="notif-conteudo">
                      <strong>
                        {a.tipo === 'critico'
                          ? `Limite ultrapassado — ${a.categoria}`
                          : `Atenção — ${a.categoria}`
                        }
                      </strong>
                      <p>
                        {formatarValor(a.gasto)} de {formatarValor(a.limite)} ({a.pct}%)
                      </p>
                      <div className="notif-barra-bg">
                        <div
                          className={`notif-barra ${a.tipo}`}
                          style={{ width: `${Math.min(a.pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}