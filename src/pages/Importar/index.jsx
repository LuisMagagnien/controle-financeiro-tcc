import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useFinance } from '../../context/FinanceContext'
import './Importar.css'

const categorias = ['Alimentação','Moradia','Transporte','Saúde','Educação','Lazer','Salário','Freelance','Outros']
const tiposCarteira = ['banco','cartao','dinheiro','invest']

export default function Importar() {
  const { adicionarTransacao, adicionarMeta, adicionarCarteira } = useFinance()
  const inputRef = useRef()
  const [arquivo, setArquivo]     = useState(null)
  const [preview, setPreview]     = useState(null)
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading]     = useState(false)
  const [erro, setErro]           = useState('')

  function handleArquivo(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setErro('Apenas arquivos .xlsx ou .xls são aceitos.')
      return
    }
    setArquivo(file)
    setErro('')
    setResultado(null)
    lerArquivo(file)
  }

  function lerArquivo(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' })
        const dados = {}
        if (workbook.SheetNames.includes('Transacoes')) {
          dados.transacoes = XLSX.utils.sheet_to_json(workbook.Sheets['Transacoes'])
        }
        if (workbook.SheetNames.includes('Metas')) {
          dados.metas = XLSX.utils.sheet_to_json(workbook.Sheets['Metas'])
        }
        if (workbook.SheetNames.includes('Carteiras')) {
          dados.carteiras = XLSX.utils.sheet_to_json(workbook.Sheets['Carteiras'])
        }
        setPreview(dados)
      } catch {
        setErro('Erro ao ler o arquivo. Verifique se está no formato correto.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  function validarTransacao(t) { return t.descricao && t.tipo && t.valor && t.data }
  function validarMeta(m)      { return m.nome && m.objetivo }
  function validarCarteira(c)  { return c.nome && c.tipo }
  function converterData(data) {
  if (!data) return ''
  const str = String(data)
  if (str.includes('/')) {
    const partes = str.split('/')
    if (partes.length === 3) {
      const [dia, mes, ano] = partes
      return `${ano}-${mes.padStart(2,'0')}-${dia.padStart(2,'0')}`
    }
  }
  return str
}

  async function handleImportar() {
    if (!preview) return
    setLoading(true)
    const res = { transacoes: 0, metas: 0, carteiras: 0, erros: [] }

    if (preview.transacoes) {
      for (const t of preview.transacoes) {
        if (!validarTransacao(t)) { res.erros.push(`Transação inválida: "${t.descricao || 'sem descrição'}"`); continue }
        try {
          await adicionarTransacao({
            desc: t.descricao,
            tipo: t.tipo?.toLowerCase() === 'receita' ? 'receita' : 'despesa',
            categoria: categorias.includes(t.categoria) ? t.categoria : 'Outros',
            valor: parseFloat(t.valor),
            data: converterData(t.data),
          })
          res.transacoes++
        } catch { res.erros.push(`Erro ao importar transação: "${t.descricao}"`) }
      }
    }

    if (preview.metas) {
      for (const m of preview.metas) {
        if (!validarMeta(m)) { res.erros.push(`Meta inválida: "${m.nome || 'sem nome'}"`); continue }
        try {
          await adicionarMeta({
            nome: m.nome,
            objetivo: parseFloat(m.objetivo),
            atual: parseFloat(m.atual) || 0,
            icone: m.icone || '🎯',
            cor: m.cor || '#4ade80',
          })
          res.metas++
        } catch { res.erros.push(`Erro ao importar meta: "${m.nome}"`) }
      }
    }

    if (preview.carteiras) {
      for (const c of preview.carteiras) {
        if (!validarCarteira(c)) { res.erros.push(`Carteira inválida: "${c.nome || 'sem nome'}"`); continue }
        try {
          await adicionarCarteira({
            nome: c.nome,
            tipo: tiposCarteira.includes(c.tipo?.toLowerCase()) ? c.tipo.toLowerCase() : 'banco',
            saldo: parseFloat(c.saldo) || 0,
            cor: c.cor || '#60a5fa',
          })
          res.carteiras++
        } catch { res.erros.push(`Erro ao importar carteira: "${c.nome}"`) }
      }
    }

    setResultado(res)
    setLoading(false)
  }

  function baixarModelo() {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      { descricao: 'Salário',      tipo: 'receita', categoria: 'Salário',     valor: 5000, data: '2024-07-01' },
      { descricao: 'Aluguel',      tipo: 'despesa', categoria: 'Moradia',     valor: 1200, data: '2024-07-05' },
      { descricao: 'Supermercado', tipo: 'despesa', categoria: 'Alimentação', valor: 380,  data: '2024-07-08' },
    ]), 'Transacoes')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      { nome: 'Viagem', objetivo: 5000,  atual: 1000, icone: '✈', cor: '#60a5fa' },
      { nome: 'Reserva', objetivo: 10000, atual: 3000, icone: '🛡', cor: '#4ade80' },
    ]), 'Metas')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([
      { nome: 'Nubank',   tipo: 'banco',   saldo: 3200, cor: '#c084fc' },
      { nome: 'Dinheiro', tipo: 'dinheiro', saldo: 500, cor: '#4ade80' },
    ]), 'Carteiras')
    XLSX.writeFile(wb, 'modelo-financontrol.xlsx')
  }

  return (
    <div className="importar-page">
      <div className="importar-header">
        <h2>Importar dados</h2>
        <p>Importe suas transações, metas e carteiras a partir de uma planilha Excel.</p>
      </div>

      <div className="modelo-card">
        <div className="modelo-info">
          <FileSpreadsheet size={32} className="modelo-icone" />
          <div>
            <strong>Baixe o modelo de planilha</strong>
            <p>Use nosso modelo para garantir que os dados sejam importados corretamente.</p>
            <div className="modelo-colunas">
              <span className="col-hint" data-hint="Nome da transação. Ex: Salário">descricao</span>
              <span className="col-hint" data-hint="Apenas: receita ou despesa">tipo</span>
              <span className="col-hint" data-hint="Ex: Alimentação, Moradia, Salário">categoria</span>
              <span className="col-hint" data-hint="Valor numérico. Ex: 1500.00">valor</span>
              <span className="col-hint" data-hint="Formato: AAAA-MM-DD. Ex: 2024-07-01">data</span>
            </div>
          </div>
        </div>
        <button className="btn-modelo" onClick={baixarModelo}>Baixar modelo .xlsx</button>
      </div>

      <div
        className={`upload-area ${arquivo ? 'tem-arquivo' : ''}`}
        onClick={() => inputRef.current.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const f = e.dataTransfer.files[0]
          if (f) handleArquivo({ target: { files: [f] } })
        }}
      >
        <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleArquivo} style={{ display: 'none' }} />
        <Upload size={36} className="upload-icone" />
        {arquivo ? (
          <>
            <p className="upload-nome">{arquivo.name}</p>
            <p className="upload-sub">Clique para trocar o arquivo</p>
          </>
        ) : (
          <>
            <p className="upload-texto">Clique ou arraste seu arquivo aqui</p>
            <p className="upload-sub">Formatos aceitos: .xlsx, .xls</p>
          </>
        )}
      </div>

      {erro && (
        <div className="importar-erro">
          <XCircle size={16} />
          {erro}
        </div>
      )}

      {preview && !resultado && (
        <div className="preview-card">
          <h3>Dados encontrados no arquivo</h3>
          <div className="preview-grid">
            <div className="preview-item">
              <span className="preview-num">{preview.transacoes?.length || 0}</span>
              <span>Transações</span>
            </div>
            <div className="preview-item">
              <span className="preview-num">{preview.metas?.length || 0}</span>
              <span>Metas</span>
            </div>
            <div className="preview-item">
              <span className="preview-num">{preview.carteiras?.length || 0}</span>
              <span>Carteiras</span>
            </div>
          </div>

          {preview.transacoes?.length > 0 && (
            <div className="preview-tabela">
              <p className="preview-titulo">Prévia das transações</p>
              <div className="tabela-mini-header">
                <span className="col-hint" data-hint="Nome da transação">Descrição ⓘ</span>
                <span className="col-hint" data-hint="Apenas: receita ou despesa">Tipo ⓘ</span>
                <span className="col-hint" data-hint="Valor numérico. Ex: 1500.00">Valor ⓘ</span>
                <span className="col-hint" data-hint="Formato: AAAA-MM-DD">Data ⓘ</span>
              </div>
              {preview.transacoes.slice(0, 5).map((t, i) => (
                <div key={i} className="tabela-mini-row">
                  <span>{t.descricao}</span>
                  <span className={t.tipo?.toLowerCase() === 'receita' ? 'receita' : 'despesa'}>{t.tipo}</span>
                  <span>R$ {parseFloat(t.valor || 0).toFixed(2)}</span>
                  <span>{t.data}</span>
                </div>
              ))}
              {preview.transacoes.length > 5 && (
                <p className="preview-mais">+{preview.transacoes.length - 5} transações</p>
              )}
            </div>
          )}

          <button className="btn-importar" onClick={handleImportar} disabled={loading}>
            {loading ? 'Importando...' : `Importar ${(preview.transacoes?.length || 0) + (preview.metas?.length || 0) + (preview.carteiras?.length || 0)} registros`}
          </button>
        </div>
      )}

      {resultado && (
        <div className="resultado-card">
          <div className="resultado-header">
            <CheckCircle size={28} className="resultado-icone" />
            <h3>Importação concluída!</h3>
          </div>
          <div className="resultado-grid">
            <div className="resultado-item">
              <span className="resultado-num verde">{resultado.transacoes}</span>
              <span>Transações importadas</span>
            </div>
            <div className="resultado-item">
              <span className="resultado-num verde">{resultado.metas}</span>
              <span>Metas importadas</span>
            </div>
            <div className="resultado-item">
              <span className="resultado-num verde">{resultado.carteiras}</span>
              <span>Carteiras importadas</span>
            </div>
          </div>
          {resultado.erros.length > 0 && (
            <div className="resultado-erros">
              <div className="erros-header">
                <AlertCircle size={16} />
                <span>{resultado.erros.length} registro(s) com problema</span>
              </div>
              {resultado.erros.map((e, i) => (
                <p key={i} className="erro-item">{e}</p>
              ))}
            </div>
          )}
          <button className="btn-nova-importacao" onClick={() => { setArquivo(null); setPreview(null); setResultado(null) }}>
            Fazer nova importação
          </button>
        </div>
      )}
    </div>
  )
}