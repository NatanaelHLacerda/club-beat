#!/usr/bin/env bash
# Roda SQL no banco local como um usuário de exemplo. Uso: supabase/testar.sh isabela "select ..."
set -euo pipefail
declare -A ids=([isabela]=1 [fernanda]=2 [marcela]=3 [direcao]=4 [juridico]=5 [financeiro]=6 [operacoes]=7)
id="00000000-0000-4000-a000-00000000000${ids[$1]}"
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -qtA -v ON_ERROR_STOP=0 <<SQL
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"$id","role":"authenticated"}';
$2
rollback;
SQL
