/**
 * Base de perguntas e respostas fixa da LIA, usada enquanto a Edge Function
 * de IA (lia-chat, que chama a Claude API) ainda não está publicada. Cobre
 * os temas mais comuns de podologia com respostas prontas; perguntas fora
 * dessa base continuam sendo tentadas via Edge Function normalmente, então
 * tudo passa a responder com IA de verdade assim que ela for publicada,
 * sem precisar mexer aqui.
 */
interface FaqEntry {
  palavrasChave: string[]
  resposta: string
}

const BASE_CONHECIMENTO: FaqEntry[] = [
  {
    palavrasChave: ['onicocriptose', 'unha encravada', 'unha encravando', 'unha encravou'],
    resposta:
      'Onicocriptose é o nome técnico da unha encravada — quando a borda da lâmina ungueal cresce ou é cortada de forma que perfura a pele lateral do dedo, causando dor, vermelhidão e, às vezes, infecção. As causas mais comuns são corte incorreto da unha (arredondado nas laterais em vez de reto), calçados apertados, pisada inadequada e predisposição do formato da unha. O tratamento vai desde a técnica de órtese ungueal e remoção parcial da borda encravada até, em casos mais graves ou recorrentes, a matricectomia parcial. É importante orientar o cliente a cortar a unha reta e não arredondar as pontas, para evitar recidiva.',
  },
  {
    palavrasChave: ['pé diabético', 'pe diabetico', 'diabetes no pé', 'diabetes no pe', 'cuidados com o pé diabético'],
    resposta:
      'O pé diabético exige cuidado redobrado porque a neuropatia (perda de sensibilidade) e a má circulação características do diabetes fazem com que pequenas lesões passem despercebidas e demorem mais para cicatrizar, com risco de infecção e ulceração. Os cuidados essenciais incluem: inspeção diária dos pés (inclusive entre os dedos e a sola), hidratação da pele sem passar creme entre os dedos, corte de unhas reto e sem cutucar a cutícula, uso de calçados fechados e confortáveis sem costuras internas, evitar andar descalço, e consultas regulares com o podólogo para remoção de calosidades e avaliação da sensibilidade e circulação. Qualquer ferida, bolha ou alteração de cor deve ser avaliada rapidamente.',
  },
  {
    palavrasChave: ['tipos de calo', 'tipos de calosidade', 'calos e calosidades'],
    resposta:
      'Os calos (hiperqueratoses) são o espessamento da pele em resposta a atrito ou pressão repetida, e existem alguns tipos principais: o calo duro (heloma durum), mais comum sobre as articulações dos dedos e na sola; o calo mole (heloma molle), que aparece entre os dedos, mantido úmido pelo suor; o calo vascular e o calo neurofibroso, mais profundos e dolorosos, que podem ter um vaso sanguíneo ou terminação nervosa encravados no centro; e a calosidade difusa (queratose plantar), mais espalhada, comum em quem tem deformidades ósseas ou pisada alterada. O tratamento envolve debridamento com o instrumental adequado, mas o mais importante é identificar e corrigir a causa (calçado, pisada, deformidade) para evitar que volte.',
  },
  {
    palavrasChave: ['fasciite plantar', 'fascite plantar', 'tratar fasciite', 'tratamento da fasciite'],
    resposta:
      'A fascite plantar é a inflamação da fáscia plantar, a faixa de tecido que liga o calcanhar aos dedos, geralmente causada por sobrecarga repetitiva — comum em quem fica muito tempo em pé, pratica corrida, tem sobrepeso ou pisada pronada. O sintoma clássico é dor na sola perto do calcanhar, pior nos primeiros passos do dia. O tratamento inicial costuma combinar repouso relativo, alongamento da fáscia plantar e da panturrilha, gelo local, palmilhas ou órteses com suporte de arco, e calçados adequados; em casos persistentes pode-se usar liberação miofascial, taping ou encaminhamento para fisioterapia. Costuma melhorar em semanas a poucos meses com tratamento consistente.',
  },
  {
    palavrasChave: ['micose', 'frieira', 'tinea pedis', 'fungo no pé', 'fungo no pe', 'pé de atleta', 'pe de atleta'],
    resposta:
      'A tinea pedis, popularmente chamada de frieira ou pé de atleta, é uma infecção fúngica da pele dos pés, mais comum entre os dedos, causando coceira, descamação, vermelhidão e, às vezes, rachaduras ou bolhas. Prolifera em ambientes quentes e úmidos, como dentro de calçados fechados e chuveiros públicos. O tratamento geralmente é feito com antifúngico tópico por algumas semanas, mantendo os pés sempre secos (principalmente entre os dedos), trocando meias com frequência e arejando o calçado. Se atingir também as unhas (onicomicose) ou não melhorar com o tratamento tópico, pode ser necessário antifúngico oral prescrito por um médico.',
  },
  {
    palavrasChave: ['bromidrose', 'chulé', 'chule', 'cheiro nos pés', 'cheiro nos pes', 'suor nos pés', 'suor nos pes'],
    resposta:
      'A bromidrose é o odor forte nos pés causado pela decomposição do suor por bactérias presentes na pele, favorecida pela hiperidrose (sudorese excessiva) e pelo uso de calçados fechados por longos períodos. As orientações costumam incluir higienização diária bem feita e secagem completa entre os dedos, uso de meias de algodão trocadas com frequência, alternar os pares de calçado para deixá-los arejar, e produtos com ação antibacteriana ou antitranspirante específicos para os pés. Em casos mais intensos de hiperidrose, pode valer encaminhar para avaliação de tratamentos como iontoforese ou toxina botulínica.',
  },
  {
    palavrasChave: ['joanete', 'hálux valgo', 'halux valgo'],
    resposta:
      'O joanete, ou hálux valgo, é o desvio lateral do dedão do pé associado a uma proeminência óssea na base da articulação, que costuma causar dor, vermelhidão e dificuldade para calçar sapatos fechados. Tem componente genético importante, mas é agravado pelo uso de calçados apertados ou de salto alto. O manejo conservador inclui calçados com bico largo, palmilhas e órteses de silicone para aliviar a pressão, e cuidados com as calosidades que se formam ao redor; em casos avançados ou muito dolorosos, a correção definitiva costuma ser cirúrgica, feita por ortopedista.',
  },
  {
    palavrasChave: ['verruga plantar'],
    resposta:
      'A verruga plantar é causada pelo HPV (papilomavírus humano) e aparece como uma lesão arredondada na sola do pé, geralmente com pontos escuros no centro (capilares trombosados), podendo ser dolorosa ao pisar por crescer para dentro devido à pressão do peso do corpo. É contagiosa por contato direto ou superfícies úmidas compartilhadas, como vestiários e piscinas. O tratamento pode incluir ácidos queratolíticos, crioterapia, eletrocauterização ou outras técnicas conforme o tamanho e a resposta ao tratamento — muitas vezes exige mais de uma sessão.',
  },
  {
    palavrasChave: ['onicomicose', 'fungo na unha', 'unha com fungo', 'micose na unha'],
    resposta:
      'A onicomicose é a infecção fúngica da unha, que fica espessada, amarelada ou esbranquiçada, quebradiça e às vezes descolada do leito ungueal. É mais comum nas unhas dos pés e tende a evoluir lentamente se não tratada. O tratamento costuma combinar esmalte ou solução antifúngica tópica com desbaste da unha pelo podólogo para melhorar a penetração do produto; em casos mais extensos, o médico pode prescrever antifúngico oral. É importante manter os pés secos e desinfetar calçados e instrumentos de manicure/pedicure para evitar reinfecção.',
  },
  {
    palavrasChave: ['calçado ideal', 'calcado ideal', 'qual calçado usar', 'qual calcado usar', 'prevenção', 'prevencao', 'escolher calçado', 'escolher calcado'],
    resposta:
      'Um bom calçado para a saúde dos pés deve ter bico largo o suficiente para não apertar os dedos, solado com boa amortecimento e antiderrapante, contraforte firme no calcanhar, e material que permita a respiração do pé. O salto deve ser baixo a moderado (até cerca de 3-4 cm) para não sobrecarregar o antepé. Vale experimentar o calçado no fim do dia, quando os pés estão naturalmente mais inchados, e alternar entre pares diferentes ao longo da semana em vez de usar sempre o mesmo, para ele arejar entre os usos.',
  },
]

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/** Cada palavra da frase-chave precisa aparecer inteira (com limite de
 * palavra, pra "pé" não bater dentro de "pele") em qualquer lugar da
 * pergunta, em qualquer ordem — assim "minha unha tá toda encravada" bate
 * com a chave "unha encravada" mesmo sem as palavras estarem juntas. */
function contemFraseChave(perguntaNormalizada: string, fraseChave: string): boolean {
  const palavras = normalizar(fraseChave).split(/\s+/).filter(Boolean)
  return palavras.every((palavra) => {
    const escapada = palavra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`\\b${escapada}\\b`).test(perguntaNormalizada)
  })
}

/** Procura na base fixa a resposta que bate com mais palavras-chave da
 * pergunta. Retorna `null` se nada bater (aí quem chama tenta a IA de
 * verdade via Edge Function como fallback). */
export function buscarRespostaFaq(pergunta: string): string | null {
  const normalizada = normalizar(pergunta)
  let melhor: { resposta: string; pontos: number } | null = null

  for (const entrada of BASE_CONHECIMENTO) {
    const pontos = entrada.palavrasChave.filter((p) => contemFraseChave(normalizada, p)).length
    if (pontos > 0 && (!melhor || pontos > melhor.pontos)) {
      melhor = { resposta: entrada.resposta, pontos }
    }
  }

  return melhor?.resposta ?? null
}
