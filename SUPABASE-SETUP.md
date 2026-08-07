# Configuração do banco do STUDIO CORA

## 1. Criar o projeto

1. Acesse [supabase.com](https://supabase.com) e crie uma conta.
2. Clique em **New project**.
3. Escolha uma organização, dê o nome `studio-cora` e crie uma senha forte para o banco.
4. Aguarde o projeto terminar de provisionar.

## 2. Criar a tabela

1. No menu esquerdo, abra **SQL Editor**.
2. Clique em **New query**.
3. Abra o arquivo `supabase-setup.sql` deste projeto, copie todo o conteúdo e cole no editor.
4. Clique em **Run**.

## 3. Copiar as chaves públicas

1. No Supabase, abra **Project Settings → Data API**.
2. Copie a **Project URL**.
3. Copie a chave **Publishable key** (ou a antiga chave `anon public`).
4. Cole os dois valores em `js/cloud.js`, nestes campos:

```js
const SUPABASE_URL = 'cole-aqui-a-Project-URL';
const SUPABASE_ANON_KEY = 'cole-aqui-a-chave-publica';
```

Use somente a chave pública. Nunca cole uma chave com o nome `secret` ou `service_role` no navegador.

## 4. Como testar

Abra o sistema, entre com o PIN `0909`, altere ou crie um item e confira no Supabase em **Table Editor → studio_cora_state**.

O briefing também sincroniza o estado quando é enviado. Se o Supabase estiver indisponível, o sistema continua usando o backup local e mostra um aviso no console do navegador.

## Importante sobre segurança

Esta primeira integração preserva os dados na nuvem, mas o login atual ainda é um PIN customizado. Como a aplicação é estática, a chave pública e as regras de acesso ficam visíveis no navegador. Antes de enviar dados reais de clientes para produção, o próximo passo recomendado é trocar o PIN por Supabase Auth e criar regras RLS por usuário. O arquivo SQL atual deve ser considerado uma etapa de persistência/teste, não uma camada definitiva de privacidade.
