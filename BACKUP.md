# Backup e continuidade de dados — Podify

## Situação atual (crítico — ler antes de usar com clínicas reais)

O projeto Supabase deste sistema (`Podify`, ref `ilbgywngoxqdtvrftoyr`, org
`vistoria-app`, região `sa-east-1`) está hoje no **plano Free**.

No plano Free, o Supabase **não oferece backups automáticos nem Point-in-Time
Recovery (PITR)**. Isso significa que, se houver uma falha de infraestrutura,
um erro humano (ex: um `DELETE`/`UPDATE` incorreto rodado direto no banco) ou
qualquer outro incidente, **não existe hoje um caminho oficial de restauração
para um ponto anterior no tempo**. Os dados armazenados incluem prontuários
de pacientes (anamneses, fotos clínicas, assinaturas) — perda de dados aqui
não é um inconveniente, é um problema sério para a clínica e para o paciente.

## Ação obrigatória antes de onboarding de clínicas reais

**Fazer upgrade do projeto para o plano Pro do Supabase antes de aceitar
qualquer clínica pagante com dados reais de pacientes.**

O plano Pro habilita:
- Backups diários automáticos, com retenção configurável (7 dias por padrão,
  estendível).
- Point-in-Time Recovery (PITR) como add-on, permitindo restaurar o banco
  para qualquer segundo dentro da janela de retenção contratada — essencial
  para reverter um erro de escrita sem perder todo o histórico desde o último
  backup diário.
- Maior limite de conexões, sem pausa automática do projeto por inatividade.

Upgrade é feito em: Supabase Dashboard → organização `vistoria-app` → projeto
`Podify` → **Settings → Billing → Change plan**.

## O que já está mitigado no código (mas não substitui backup)

Estas proteções reduzem o risco de perda de dados por falha de rede/UI, mas
**não protegem contra perda de dados já persistidos no banco** (só um backup
faz isso):

- **Autosave da ficha de anamnese**: a cada 15s, se houver alterações e um
  paciente selecionado, a ficha é salva automaticamente como rascunho
  (`status: 'em_andamento'`), mesmo que o usuário nunca clique em "Salvar
  Ficha" ou perca a conexão no meio do preenchimento.
- **Assinaturas e fotos em Supabase Storage**, não em campos de texto no
  banco — reduz risco de corrupção de linha e acelera carregamento.
- **Checagem de erro em todas as escritas** (`insert`/`update`/`upsert`) do
  app, com notificação visível ao usuário sempre que uma escrita falhar —
  nunca fica implícito que "salvou" quando na verdade falhou.
- **Aviso de saída com alterações não salvas** (`beforeunload` + confirmação)
  nos formulários de Anamnese, Cliente, Consulta, Registro Financeiro,
  Produto e Fornecedor.

## Recomendações adicionais (não implementadas ainda)

- Configurar os **Database Webhooks / réplica lógica** ou um job agendado
  (`pg_cron` + `pg_dump` para um bucket externo) como backup adicional,
  independente do backup gerenciado do Supabase, especialmente para as
  tabelas `anamneses`, `anamnese_fotos` e `clientes`.
- Testar periodicamente uma restauração real (não só confiar que o backup
  existe) — um backup nunca testado é uma suposição, não uma garantia.
- Definir uma política de retenção e LGPD para os dados de saúde armazenados
  (prontuário/anamnese é dado sensível conforme a LGPD, art. 5º, II).
