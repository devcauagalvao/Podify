import type { ReactNode } from 'react'
import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer'

const BRAND = '#2f9d84'

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
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
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
  patientName: {
    fontSize: 12,
    fontWeight: 700,
  },
  fichaDate: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  section: {
    marginBottom: 10,
    borderRadius: 4,
    overflow: 'hidden',
    border: '1 solid #e2e8f0',
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
  sectionBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  fieldBox: {
    width: '33.33%',
    paddingRight: 8,
    marginBottom: 6,
  },
  fieldBoxFull: {
    width: '100%',
    paddingRight: 8,
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 7,
    color: '#64748b',
    marginBottom: 1,
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontSize: 9,
    color: '#0f1b2d',
  },
  emptyNotice: {
    fontSize: 8,
    color: '#94a3b8',
    padding: 8,
    fontStyle: 'italic',
  },
  fotosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    gap: 6,
  },
  foto: {
    width: 90,
    height: 90,
    borderRadius: 4,
    objectFit: 'cover',
  },
  textBlock: {
    fontSize: 9,
    lineHeight: 1.4,
    padding: 8,
  },
  assinaturasRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 20,
  },
  assinaturaCol: {
    flex: 1,
    alignItems: 'center',
  },
  assinaturaImg: {
    width: 180,
    height: 70,
    objectFit: 'contain',
    marginBottom: 4,
  },
  assinaturaImgPlaceholder: {
    width: 180,
    height: 70,
    marginBottom: 4,
  },
  assinaturaLine: {
    width: 180,
    borderBottom: '1 solid #0f1b2d',
    marginBottom: 4,
  },
  assinaturaLabel: {
    fontSize: 8,
    fontWeight: 700,
  },
  assinaturaSub: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 1,
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

type Obj = Record<string, any>

function isFilled(value: any): boolean {
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'boolean') return value
  return value !== null && value !== undefined && String(value).trim() !== ''
}

function FieldGrid({ obj, labels }: { obj: Obj; labels: [string, string][] }) {
  const entries = labels.filter(([key]) => isFilled(obj[key]))
  if (entries.length === 0) return null
  return (
    <View style={styles.sectionBody}>
      {entries.map(([key, label]) => (
        <View key={key} style={styles.fieldBox}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.fieldValue}>{String(obj[key])}</Text>
        </View>
      ))}
    </View>
  )
}

function Section({
  title,
  obj,
  labels,
  extra,
}: {
  title: string
  obj: Obj
  labels: [string, string][]
  extra?: ReactNode
}) {
  const hasFields = labels.some(([key]) => isFilled(obj[key]))
  const hasExtra = Boolean(extra)
  if (!hasFields && !hasExtra) return null

  return (
    <View style={styles.section} wrap={false}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {extra}
      <FieldGrid obj={obj} labels={labels} />
    </View>
  )
}

const LABELS_PESSOAIS: [string, string][] = [
  ['dataNascimento', 'Data de Nascimento'],
  ['idade', 'Idade'],
  ['genero', 'Gênero'],
  ['profissao', 'Profissão'],
  ['estadoCivil', 'Estado Civil'],
  ['celular', 'Celular'],
  ['telEmergencia', 'Tel. de Emergência'],
  ['contatoEmergencia', 'Contato de Emergência'],
  ['endereco', 'Endereço'],
  ['cep', 'CEP'],
  ['peso', 'Peso (kg)'],
  ['altura', 'Altura (m)'],
  ['imc', 'IMC'],
  ['medicoEspecialidade', 'Médico / Especialidade / Última consulta'],
]

const LABELS_GERAIS: [string, string][] = [
  ['queixaPrincipal', 'Queixa Principal'],
  ['costumaPodologo', 'Costuma ir ao Podólogo?'],
  ['frequenciaPodologo', 'Frequência ao Podólogo'],
  ['medicamentosUso', 'Medicamentos em uso'],
  ['posicaoTrabalho', 'Posição de Trabalho'],
  ['duracaoHoras', 'Duração (horas)'],
  ['maiorParteTempo', 'Maior Parte do Tempo'],
  ['numeroCalcado', 'Nº do Calçado'],
  ['tipoCalcadoDiario', 'Tipo de Calçado Diário'],
  ['alergico', 'Alérgico(a)?'],
  ['substanciasAlergicas', 'Substâncias Alérgicas'],
  ['usaPalmilha', 'Usa Palmilha?'],
  ['tipoPalmilha', 'Tipo de Palmilha'],
  ['fumante', 'Fumante?'],
  ['cicloMenstrual', 'Ciclo Menstrual Regular?'],
  ['dum', 'DUM'],
  ['gestante', 'Gestante?'],
  ['amamentando', 'Amamentando?'],
  ['praticaAtividade', 'Pratica Atividade Física?'],
  ['frequenciaAtividade', 'Frequência'],
  ['esporteTipoCalcado', 'Esporte e tipo de calçado'],
]

const LABELS_CLINICOS: [string, string][] = [
  ['sinalGodet', 'Sinal de Godet'],
  ['diabetes', 'Diabetes?'],
  ['preDiabetes', 'Pré-Diabetes?'],
  ['taxaGlicemica', 'Taxa Glicêmica'],
  ['medicamentoDiabetes', 'Medicamento p/ Diabetes?'],
  ['tipoMedicamento', 'Tipo de medicamento'],
  ['dietaHidrica', 'Dieta Hídrica?'],
  ['dietaAlimentar', 'Dieta Alimentar'],
  ['dataUltimaVerificacao', 'Data da Última Verificação Glicêmica'],
]

const LABELS_LESOES: [string, string][] = [
  ['tipoPisada', 'Tipo de Pisada'],
  ['tipoMarcha', 'Tipo de Marcha'],
  ['marchaPatologica', 'Marcha Patológica — Qual?'],
  ['joelho', 'Joelho'],
]

const LABELS_UNHAS: [string, string][] = [
  ['pdHalux', 'PD Hálux'],
  ['pd2', 'PD 2º'],
  ['pd3', 'PD 3º'],
  ['pd4', 'PD 4º'],
  ['pd5', 'PD 5º'],
  ['peHalux', 'PE Hálux'],
  ['pe2', 'PE 2º'],
  ['pe3', 'PE 3º'],
  ['pe4', 'PE 4º'],
  ['pe5', 'PE 5º'],
  ['outrasAlteracoes', 'Outras Alterações da Lâmina Ungueal'],
]

const LABELS_PELE: [string, string][] = [
  ['perfusaoPD', 'Perfusão Capilar — PD'],
  ['perfusaoPE', 'Perfusão Capilar — PE'],
  ['tempoSeg', 'Tempo (seg)'],
  ['turgorCutaneo', 'Turgor Cutâneo'],
  ['diapasaoD', 'Diapasão D'],
  ['diapasaoE', 'Diapasão E'],
  ['pulsoPD', 'Pulso Dorsal — PD'],
  ['pulsoPE', 'Pulso Dorsal — PE'],
  ['monofilamento', 'Monofilamento'],
  ['analisePele', 'Análise da Pele'],
  ['outrasAlteracoesPele', 'Outras Alterações'],
]

function dedosResumo(dedos: Obj | undefined): string {
  if (!dedos) return ''
  return Object.entries(dedos)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(', ')
}

function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

export interface AnamnesePdfData {
  nomeClinica: string | null
  logoUrl?: string | null
  nomePaciente: string
  nomeProfissional: string | null
  data: string
  dadosPessoais: Obj
  dadosGerais: Obj
  dadosClinicos: Obj
  alteracoesLesoes: Obj
  formatoUnhas: Obj
  alteracoesPele: Obj
  procedimentos: string
  observacoes: string
  orientacao: string
  dataRetorno: string
  autorizacaoImagem: boolean
  assinaturaPaciente: string | null
  assinaturaProfissional: string | null
  fotos: string[]
}

export function AnamnesePdfDocument({ d }: { d: AnamnesePdfData }) {
  const dedosD = dedosResumo(d.alteracoesLesoes?.dedosDireito)
  const dedosE = dedosResumo(d.alteracoesLesoes?.dedosEsquerdo)
  const condicoesClinicas: string[] = d.dadosClinicos?.condicoes ?? []
  const condicoesPele: string[] = d.alteracoesPele?.condicoes ?? []

  const lesoesExtra =
    dedosD || dedosE ? (
      <View style={styles.sectionBody}>
        {dedosD && (
          <View style={styles.fieldBoxFull}>
            <Text style={styles.fieldLabel}>Dedos — Direito</Text>
            <Text style={styles.fieldValue}>{dedosD}</Text>
          </View>
        )}
        {dedosE && (
          <View style={styles.fieldBoxFull}>
            <Text style={styles.fieldLabel}>Dedos — Esquerdo</Text>
            <Text style={styles.fieldValue}>{dedosE}</Text>
          </View>
        )}
      </View>
    ) : undefined

  const clinicosExtra =
    condicoesClinicas.length > 0 ? (
      <View style={styles.sectionBody}>
        <View style={styles.fieldBoxFull}>
          <Text style={styles.fieldLabel}>Condições</Text>
          <Text style={styles.fieldValue}>{condicoesClinicas.join(', ')}</Text>
        </View>
      </View>
    ) : undefined

  const peleExtra =
    condicoesPele.length > 0 ? (
      <View style={styles.sectionBody}>
        <View style={styles.fieldBoxFull}>
          <Text style={styles.fieldLabel}>Condições</Text>
          <Text style={styles.fieldValue}>{condicoesPele.join(', ')}</Text>
        </View>
      </View>
    ) : undefined

  return (
    <Document
      title={`Anamnese - ${d.nomePaciente}`}
      author="Podify"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.headerRow} fixed>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {d.logoUrl && <Image src={d.logoUrl} style={styles.logo} />}
            <View>
              <Text style={styles.clinicName}>{d.nomeClinica || 'Clínica de Podologia'}</Text>
              <Text style={styles.docTitle}>Ficha de Anamnese</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.patientName}>{d.nomePaciente}</Text>
            <Text style={styles.fichaDate}>{formatDateBR(d.data)}</Text>
          </View>
        </View>

        <Section title="DADOS PESSOAIS" obj={d.dadosPessoais ?? {}} labels={LABELS_PESSOAIS} />
        <Section title="DADOS GERAIS" obj={d.dadosGerais ?? {}} labels={LABELS_GERAIS} />
        <Section
          title="DADOS CLÍNICOS"
          obj={d.dadosClinicos ?? {}}
          labels={LABELS_CLINICOS}
          extra={clinicosExtra}
        />
        <Section
          title="ALTERAÇÕES E LESÕES DOS PÉS"
          obj={d.alteracoesLesoes ?? {}}
          labels={LABELS_LESOES}
          extra={lesoesExtra}
        />
        <Section title="FORMATO DAS UNHAS" obj={d.formatoUnhas ?? {}} labels={LABELS_UNHAS} />
        <Section
          title="ALTERAÇÕES, LESÕES E AVALIAÇÃO DA PELE"
          obj={d.alteracoesPele ?? {}}
          labels={LABELS_PELE}
          extra={peleExtra}
        />

        {d.fotos.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>FOTOS DO ATENDIMENTO</Text>
            <View style={styles.fotosGrid}>
              {d.fotos.map((url) => (
                <Image key={url} src={url} style={styles.foto} />
              ))}
            </View>
          </View>
        )}

        {(d.procedimentos || d.observacoes || d.orientacao || d.dataRetorno) && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>PROCEDIMENTOS E OBSERVAÇÕES</Text>
            <View style={styles.textBlock}>
              {d.procedimentos && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={styles.fieldLabel}>Procedimentos Realizados</Text>
                  <Text style={styles.fieldValue}>{d.procedimentos}</Text>
                </View>
              )}
              {d.observacoes && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={styles.fieldLabel}>Observações Clínicas</Text>
                  <Text style={styles.fieldValue}>{d.observacoes}</Text>
                </View>
              )}
              {d.orientacao && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={styles.fieldLabel}>Orientação</Text>
                  <Text style={styles.fieldValue}>{d.orientacao}</Text>
                </View>
              )}
              {d.dataRetorno && (
                <View>
                  <Text style={styles.fieldLabel}>Data de Retorno</Text>
                  <Text style={styles.fieldValue}>{formatDateBR(d.dataRetorno)}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>ASSINATURAS</Text>
          <View style={styles.assinaturasRow}>
            <View style={styles.assinaturaCol}>
              {d.assinaturaPaciente ? (
                <Image src={d.assinaturaPaciente} style={styles.assinaturaImg} />
              ) : (
                <View style={styles.assinaturaImgPlaceholder} />
              )}
              <View style={styles.assinaturaLine} />
              <Text style={styles.assinaturaLabel}>{d.nomePaciente}</Text>
              <Text style={styles.assinaturaSub}>Paciente</Text>
            </View>
            <View style={styles.assinaturaCol}>
              {d.assinaturaProfissional ? (
                <Image src={d.assinaturaProfissional} style={styles.assinaturaImg} />
              ) : (
                <View style={styles.assinaturaImgPlaceholder} />
              )}
              <View style={styles.assinaturaLine} />
              <Text style={styles.assinaturaLabel}>{d.nomeProfissional || 'Profissional Responsável'}</Text>
              <Text style={styles.assinaturaSub}>Profissional</Text>
            </View>
          </View>
          {d.autorizacaoImagem && (
            <Text style={{ ...styles.textBlock, paddingTop: 0 }}>
              Autorização de uso de imagem concedida pelo paciente para fins publicitários,
              educacionais e outros fins relacionados à clínica de podologia, nos termos da
              legislação vigente.
            </Text>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text>Gerado por Podify em {new Date().toLocaleString('pt-BR')}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
