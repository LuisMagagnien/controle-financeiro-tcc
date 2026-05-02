import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { FileText, Download, TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import './Relatorio.css'

export default function Relatorio() {
  const { transacoes, metas, carteiras, totalReceitas, totalDespesas, saldo } = useFinance()
  const [gerando, setGerando] = useState(false)
  const [filtro, setFiltro]   = useState('todos')

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  const transacoesFiltradas = transacoes.filter(t => {
    if (filtro === 'todos') return true
    return t.tipo === filtro
  })

  function formatarValor(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function formatarData(data) {
    if (!data) return ''
    return data.split('-').reverse().join('/')
  }

  async function gerarPDF() {
    setGerando(true)
    try {
      const doc = new jsPDF()
      const dataAtual = new Date().toLocaleDateString('pt-BR')
      const horaAtual = new Date().toLocaleTimeString('pt-BR')

      // Cabeçalho
      doc.setFillColor(26, 26, 46)
      doc.rect(0, 0, 210, 40, 'F')
      doc.setTextColor(74, 222, 128)
      doc.setFontSize(22)
      doc.setFont('helvetica', 'bold')
      doc.text('FinanControl', 14, 18)
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'normal')
      doc.text('Relatório Financeiro', 14, 28)
      doc.setFontSize(9)
      doc.text(`Gerado em: ${dataAtual} às ${horaAtual}`, 14, 36)
      doc.text(`Usuário: ${usuario.nome || 'N/A'}`, 140, 28)
      doc.text(`E-mail: ${usuario.email || 'N/A'}`, 140, 36)

      // Resumo financeiro
      doc.setTextColor(26, 26, 46)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('Resumo Financeiro', 14, 54)

      const resumoData = [
        ['Saldo Total', formatarValor(saldo)],
        ['Total de Receitas', formatarValor(totalReceitas)],
        ['Total de Despesas', formatarValor(totalDespesas)],
        ['Total de Transações', transacoes.length.toString()],
        ['Metas Cadastradas', metas.length.toString()],
        ['Carteiras Cadastradas', carteiras.length.toString()],
      ]

      autoTable(doc, {
        startY: 58,
        head: [['Item', 'Valor']],
        body: resumoData,
        theme: 'grid',
        headStyles: { fillColor: [26, 26, 46], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 250] },
        columnStyles: { 1: { halign: 'right' } },
        margin: { left: 14, right: 14 },
      })

      // Transações
      const y1 = doc.lastAutoTable.finalY + 12
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(26, 26, 46)
      doc.text('Transações', 14, y1)

      const transacoesData = transacoesFiltradas.map(t => [
        t.desc,
        t.tipo === 'receita' ? 'Receita' : 'Despesa',
        t.categoria,
        formatarData(t.data),
        (t.tipo === 'receita' ? '+' : '-') + formatarValor(t.valor),
      ])

      autoTable(doc, {
        startY: y1 + 4,
        head: [['Descrição', 'Tipo', 'Categoria', 'Data', 'Valor']],
        body: transacoesData.length > 0 ? transacoesData : [['Nenhuma transação encontrada', '', '', '', '']],
        theme: 'grid',
        headStyles: { fillColor: [26, 26, 46], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 250] },
        columnStyles: { 4: { halign: 'right' } },
        margin: { left: 14, right: 14 },
        didParseCell: (data) => {
          if (data.column.index === 4 && data.section === 'body') {
            const val = data.cell.raw || ''
            if (val.startsWith('+')) data.cell.styles.textColor = [34, 197, 94]
            if (val.startsWith('-')) data.cell.styles.textColor = [239, 68, 68]
          }
        }
      })

      // Metas
      if (metas.length > 0) {
        const y2 = doc.lastAutoTable.finalY + 12
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(26, 26, 46)
        doc.text('Metas Financeiras', 14, y2)

        autoTable(doc, {
          startY: y2 + 4,
          head: [['Meta', 'Objetivo', 'Acumulado', 'Progresso']],
          body: metas.map(m => [
            m.nome,
            formatarValor(m.objetivo),
            formatarValor(m.atual),
            `${Math.min(Math.round((m.atual / m.objetivo) * 100), 100)}%`,
          ]),
          theme: 'grid',
          headStyles: { fillColor: [26, 26, 46], textColor: [255, 255, 255], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 245, 250] },
          columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
          margin: { left: 14, right: 14 },
        })
      }

      // Carteiras
      if (carteiras.length > 0) {
        const y3 = doc.lastAutoTable.finalY + 12
        doc.setFontSize(13)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(26, 26, 46)
        doc.text('Carteiras', 14, y3)

        autoTable(doc, {
          startY: y3 + 4,
          head: [['Carteira', 'Tipo', 'Saldo']],
          body: carteiras.map(c => [
            c.nome,
            c.tipo.charAt(0).toUpperCase() + c.tipo.slice(1),
            formatarValor(c.saldo),
          ]),
          theme: 'grid',
          headStyles: { fillColor: [26, 26, 46], textColor: [255, 255, 255], fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 245, 250] },
          columnStyles: { 2: { halign: 'right' } },
          margin: { left: 14, right: 14 },
        })
      }

      // Rodapé
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(`FinanControl — Relatório gerado em ${dataAtual}`, 14, 290)
        doc.text(`Página ${i} de ${pageCount}`, 185, 290, { align: 'right' })
      }

      doc.save(`relatorio-financontrol-${dataAtual.replace(/\//g, '-')}.pdf`)
    } finally {
      setGerando(false)
    }
  }

  return (
    <div className="relatorio-page">
      <div className="relatorio-header">
        <h2>Relatório financeiro</h2>
        <p>Visualize um resumo completo e exporte em PDF.</p>
      </div>

      {/* Cards resumo */}
      <div className="relatorio-cards">
        <div className="rel-card blue">
          <Wallet size={20} />
          <div>
            <span>Saldo total</span>
            <strong>{formatarValor(saldo)}</strong>
          </div>
        </div>
        <div className="rel-card green">
          <TrendingUp size={20} />
          <div>
            <span>Receitas</span>
            <strong>{formatarValor(totalReceitas)}</strong>
          </div>
        </div>
        <div className="rel-card red">
          <TrendingDown size={20} />
          <div>
            <span>Despesas</span>
            <strong>{formatarValor(totalDespesas)}</strong>
          </div>
        </div>
        <div className="rel-card purple">
          <Target size={20} />
          <div>
            <span>Metas</span>
            <strong>{metas.length}</strong>
          </div>
        </div>
      </div>

      {/* Prévia das transações */}
      <div className="relatorio-secao">
        <div className="secao-header">
          <h3>Transações</h3>
          <div className="filtro-tipo">
            {['todos', 'receita', 'despesa'].map(f => (
              <button
                key={f}
                className={`filtro-btn ${filtro === f ? 'ativo' : ''}`}
                onClick={() => setFiltro(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="rel-tabela">
          <div className="rel-tabela-header">
            <span>Descrição</span>
            <span>Categoria</span>
            <span>Data</span>
            <span>Valor</span>
          </div>
          {transacoesFiltradas.length === 0 ? (
            <div className="rel-vazio">Nenhuma transação encontrada.</div>
          ) : (
            transacoesFiltradas.map((t, i) => (
              <div key={i} className="rel-tabela-row">
                <span className="t-desc">
                  <div className={`tipo-dot ${t.tipo}`} />
                  {t.desc}
                </span>
                <span className="t-cat">{t.categoria}</span>
                <span className="t-data">{formatarData(t.data)}</span>
                <span className={`t-valor ${t.tipo}`}>
                  {t.tipo === 'receita' ? '+' : '-'}{formatarValor(t.valor)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Botão gerar PDF */}
      <button className="btn-pdf" onClick={gerarPDF} disabled={gerando}>
        {gerando ? (
          <>Gerando PDF...</>
        ) : (
          <>
            <Download size={18} />
            Exportar relatório em PDF
          </>
        )}
      </button>
    </div>
  )
}