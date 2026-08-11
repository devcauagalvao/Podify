import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

const BRAND = '#2f9d84'
const VERDE = '#059669'
const VERMELHO = '#e11d48'

Font.registerHyphenationCallback((word) => [word])

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#0f1b2d',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottom: `2 solid ${BRAND}`,
  },
  clinicName: {
    fontSize: 14,
    fontWeight: 700,
    color: '#0f1b2d',
  },
  docTitle: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  periodoLabel: {
    fontSize: 11,
    fontWeight: 700,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 4,
    border: '1 solid #e2e8f0',
    paddingVertical: 10,
  },
  summaryLabel: {
    fontSize: 7,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 700,
  },
  sectionTitle: {
    backgroundColor: BRAND,
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 700,
    paddingVertical: 5,
    paddingHorizontal: 8,
    letterSpacing: 0.5,
  },
  table: {
    borderRadius: 4,
    overflow: 'hidden',
    border: '1 solid #e2e8f0',
    marginBottom: 14,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: BRAND,
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontSize: 7,
    fontWeight: 700,
    textTransform: 'uppercase',
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: 'row',
    borderTop: '1 solid #e2e8f0',
  },
  tableRowAlt: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 8,
    paddingVertical: 5,
    paddingHorizontal: 6,
    color: '#0f1b2d',
  },
  colData: { width: '8%' },
  colCliente: { width: '15%' },
  colDescricao: { width: '20%' },
  colCategoria: { width: '10%' },
  colEndereco: { width: '32%' },
  colValor: { width: '15%', textAlign: 'right' },
  subColCategoria: { width: '40%' },
  subColValor: { width: '30%', textAlign: 'right' },
  emptyNotice: {
    fontSize: 8,
    color: '#94a3b8',
    padding: 8,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 16,
    left: 28,
    right: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#94a3b8',
    borderTop: '1 solid #e2e8f0',
    paddingTop: 6,
  },
})

function fmtBRL(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

export interface FinanceiroPdfCategoria {
  categoria: string
  entradas: number
  saidas: number
}

export interface FinanceiroPdfRegistro {
  data: string
  tipo: string
  categoria: string
  descricao: string
  cliente: string
  endereco: string
  valor: number
}

export interface FinanceiroPdfData {
  nomeClinica: string | null
  cpfCnpj: string | null
  periodoLabel: string
  totalEntradas: number
  totalSaidas: number
  saldo: number
  categorias: FinanceiroPdfCategoria[]
  registros: FinanceiroPdfRegistro[]
}

export function FinanceiroPdfDocument({ d }: { d: FinanceiroPdfData }) {
  return (
    <Document title={`Extrato Financeiro - ${d.periodoLabel}`} author="Podify">
      <Page size="A4" orientation="landscape" style={styles.page} wrap>
        <View style={styles.headerRow} fixed>
          <View>
            <Text style={styles.clinicName}>{d.nomeClinica || 'Clínica de Podologia'}</Text>
            {d.cpfCnpj && <Text style={styles.docTitle}>CPF/CNPJ: {d.cpfCnpj}</Text>}
            <Text style={styles.docTitle}>Extrato Financeiro</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.periodoLabel}>{d.periodoLabel}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total de Entradas</Text>
            <Text style={{ ...styles.summaryValue, color: VERDE }}>{fmtBRL(d.totalEntradas)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total de Saídas</Text>
            <Text style={{ ...styles.summaryValue, color: VERMELHO }}>{fmtBRL(d.totalSaidas)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Saldo do Período</Text>
            <Text style={styles.summaryValue}>{fmtBRL(d.saldo)}</Text>
          </View>
        </View>

        <View wrap={false}>
          <Text style={styles.sectionTitle}>REGISTROS DO PERÍODO</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tableHeaderRow} fixed>
            <Text style={{ ...styles.tableHeaderCell, ...styles.colData }}>Data</Text>
            <Text style={{ ...styles.tableHeaderCell, ...styles.colCliente }}>Cliente</Text>
            <Text style={{ ...styles.tableHeaderCell, ...styles.colDescricao }}>Procedimento/Produto</Text>
            <Text style={{ ...styles.tableHeaderCell, ...styles.colCategoria }}>Categoria</Text>
            <Text style={{ ...styles.tableHeaderCell, ...styles.colEndereco }}>Endereço do Cliente</Text>
            <Text style={{ ...styles.tableHeaderCell, ...styles.colValor }}>Valor</Text>
          </View>
          {d.registros.length === 0 ? (
            <Text style={styles.emptyNotice}>Nenhum registro no período selecionado.</Text>
          ) : (
            d.registros.map((r, i) => (
              <View
                key={i}
                style={i % 2 === 1 ? { ...styles.tableRow, ...styles.tableRowAlt } : styles.tableRow}
                wrap={false}
              >
                <Text style={{ ...styles.tableCell, ...styles.colData }}>{formatDateBR(r.data)}</Text>
                <Text style={{ ...styles.tableCell, ...styles.colCliente }}>{r.cliente || '—'}</Text>
                <Text style={{ ...styles.tableCell, ...styles.colDescricao }}>{r.descricao || '—'}</Text>
                <Text style={{ ...styles.tableCell, ...styles.colCategoria }}>{r.categoria}</Text>
                <Text style={{ ...styles.tableCell, ...styles.colEndereco }}>{r.endereco || '—'}</Text>
                <Text
                  style={{
                    ...styles.tableCell,
                    ...styles.colValor,
                    fontWeight: 700,
                    color: r.tipo === 'entrada' ? VERDE : VERMELHO,
                  }}
                >
                  {r.tipo === 'entrada' ? '+ ' : '- '}
                  {fmtBRL(r.valor)}
                </Text>
              </View>
            ))
          )}
        </View>

        {d.categorias.length > 0 && (
          <View wrap={false}>
            <Text style={styles.sectionTitle}>SUBTOTAL POR CATEGORIA</Text>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <Text style={{ ...styles.tableHeaderCell, ...styles.subColCategoria }}>Categoria</Text>
                <Text style={{ ...styles.tableHeaderCell, ...styles.subColValor }}>Entradas</Text>
                <Text style={{ ...styles.tableHeaderCell, ...styles.subColValor }}>Saídas</Text>
              </View>
              {d.categorias.map((c, i) => (
                <View
                  key={c.categoria}
                  style={i % 2 === 1 ? { ...styles.tableRow, ...styles.tableRowAlt } : styles.tableRow}
                >
                  <Text style={{ ...styles.tableCell, ...styles.subColCategoria }}>{c.categoria}</Text>
                  <Text style={{ ...styles.tableCell, ...styles.subColValor, color: VERDE }}>
                    {c.entradas > 0 ? fmtBRL(c.entradas) : '—'}
                  </Text>
                  <Text style={{ ...styles.tableCell, ...styles.subColValor, color: VERMELHO }}>
                    {c.saidas > 0 ? fmtBRL(c.saidas) : '—'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>Gerado por Podify em {new Date().toLocaleString('pt-BR')}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
