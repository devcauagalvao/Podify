-- Protege colunas sensíveis de public.profiles contra alteração pelo próprio
-- usuário via API (PostgREST).
--
-- Problema corrigido: a policy "profiles_own" (FOR ALL, auth.uid() = id)
-- deixava qualquer usuário logado fazer UPDATE no próprio profile, inclusive
-- em is_admin (virar admin e ver dados de todas as clínicas), plano /
-- assinatura_expira_em (Pro de graça) e asaas_subscription_id (apontar pra
-- assinatura de outra conta e herdar os pagamentos dela via webhook).
--
-- Regras:
--   * service_role (webhook, purge, asaas-checkout), processos internos sem
--     JWT (trigger handle_new_user, pg_cron) e admins: sem restrição.
--   * Usuário comum (authenticated/anon):
--       - INSERT: bloqueado (o profile é criado pelo trigger handle_new_user).
--       - UPDATE: só pode alterar nome_completo, nome_clinica, telefone,
--         avatar_url e cpf_cnpj. Exceção: pode REBAIXAR o próprio plano pra
--         'expirado' / status 'cancelada' (usado pela function asaas-cancel,
--         que roda com o JWT do usuário).
--
-- ORDEM DE APLICAÇÃO: publicar ANTES a nova versão de asaas-checkout (que
-- grava asaas_customer_id / asaas_subscription_id / assinatura_expira_em com
-- service role). Se aplicar esta migração com a versão antiga no ar, o
-- checkout passa a falhar ao salvar esses campos.

create or replace function public.profiles_protect_sensitive_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  papel text := coalesce(auth.role(), '');
begin
  -- Só restringe requisições da API feitas com JWT de usuário/anon.
  if papel not in ('authenticated', 'anon') then
    return new;
  end if;

  -- Admin continua podendo editar qualquer conta pelo painel /admin.
  -- (is_admin() lê a linha já gravada, ou seja, o valor ANTES deste UPDATE.)
  if public.is_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    raise exception 'Não é permitido criar perfil diretamente.'
      using errcode = '42501';
  end if;

  if new.id                    is distinct from old.id
  or new.is_admin              is distinct from old.is_admin
  or new.trial_expira_em       is distinct from old.trial_expira_em
  or new.assinatura_expira_em  is distinct from old.assinatura_expira_em
  or new.asaas_customer_id     is distinct from old.asaas_customer_id
  or new.asaas_subscription_id is distinct from old.asaas_subscription_id
  or new.created_at            is distinct from old.created_at
  then
    raise exception 'Campo protegido do perfil não pode ser alterado.'
      using errcode = '42501';
  end if;

  -- plano / assinatura_status: só aceita rebaixamento (cancelar).
  if new.plano is distinct from old.plano and new.plano <> 'expirado' then
    raise exception 'Campo protegido do perfil não pode ser alterado.'
      using errcode = '42501';
  end if;
  if new.assinatura_status is distinct from old.assinatura_status
     and new.assinatura_status not in ('cancelada', 'expirada') then
    raise exception 'Campo protegido do perfil não pode ser alterado.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.profiles_protect_sensitive_columns() from public, anon, authenticated;

drop trigger if exists profiles_protect_sensitive_columns on public.profiles;
create trigger profiles_protect_sensitive_columns
  before insert or update on public.profiles
  for each row execute function public.profiles_protect_sensitive_columns();

-- Funções internas não precisam ser chamáveis via /rest/v1/rpc por
-- usuários (apontado pelo Security Advisor do Supabase).
revoke execute on function public.expirar_assinaturas_vencidas() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
