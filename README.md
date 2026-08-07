# STUDIO CORA

Sistema web demonstrativo para gestão de projetos de identidade visual e papelaria para casamentos.

## Como executar

Abra a pasta em um servidor local simples (por exemplo, Live Server do VS Code) e acesse `index.html`. Como os módulos JavaScript usam ES Modules, abrir diretamente via `file://` pode ser bloqueado pelo navegador.

## Acessos demonstrativos

- Administradora: `admin@studiocora.com` / `cora123`
- Cliente: `cliente@exemplo.com` / `cora123`

O acesso atual usa PIN demonstrativo: administradora `0909`; cada cliente usa o dia e mês do casamento no formato `DDMM` (por exemplo, 1306). Os dados ficam no LocalStorage deste navegador e não substituem autenticação, autorização ou banco de dados seguros.

## O que está implementado

Kanban geral administrativo com drag-and-drop sincronizado aos Kanbans individuais, clientes com busca/filtro/cadastro, perfil com briefing completo, formulário público de contratação em `briefing.html`, portal da cliente com acesso somente ao próprio Kanban, configurações e exportação/importação de backup. O formulário pode receber `?cliente=001` para atualizar um registro existente, mas sem parâmetro ele cria uma nova noiva no LocalStorage ao ser enviado.

## Personalização

As cores, tipografias, espaçamentos e componentes estão centralizados em `css/styles.css`, especialmente nas variáveis de `:root`. O nome e textos principais ficam em `js/data.js`. A logo fornecida pode ser substituída na área de marca ou adicionada em `assets/images/` para uma futura versão com imagem.

## Próximos passos para produção

Integrar autenticação real com sessões seguras, backend/API, banco de dados, armazenamento privado de arquivos, permissões por cliente, e-mail/WhatsApp, logs, proteção contra XSS/CSRF e validação no servidor.
## Banco de dados Supabase

O projeto já possui uma integração opcional com Supabase. Siga o passo a passo em [SUPABASE-SETUP.md](SUPABASE-SETUP.md) e preencha `js/cloud.js` com a Project URL e a chave pública. O arquivo `supabase-setup.sql` cria a tabela necessária.

Para dados reais de clientes, configure Supabase Auth antes da publicação definitiva; o PIN atual é uma camada de acesso simples e não substitui autenticação de produção.
