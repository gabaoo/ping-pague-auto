# 🚀 Guia de Integração PingPague

## 📋 Resumo das Funcionalidades Implementadas

### ✅ Fase 1 - Dashboard Aprimorado
- Gráfico de recebimentos dos últimos 7 dias
- Distribuição visual de valores (pizza)
- Métricas detalhadas: Total recebido, Pendente, Em atraso
- Lista de cobranças recentes
- Estatísticas de clientes

### ✅ Fase 2 - Automação Básica
- **Cobranças Recorrentes**: Sistema completo com intervalos configuráveis
  - Semanal, Quinzenal, Mensal, Trimestral, Anual
  - Criação automática da próxima cobrança após pagamento
- **Histórico Detalhado por Cliente**:
  - Total cobrado e pago
  - Data do último pagamento
  - Contador de cobranças atrasadas
  - Timeline completa de cobranças
- **Exportação de Relatórios**: Export para CSV

### ✅ Fase 3 - Edge Functions para Automação
Criadas 2 edge functions prontas para integração:

#### 1. `check-overdue-charges`
- **Função**: Verifica vencimentos e envia alertas
- **Execução**: Deve ser chamada diariamente via cron job
- **Funcionalidades**:
  - Atualiza status de cobranças vencidas
  - Envia lembretes 2 dias antes do vencimento
  - Alerta cobranças em atraso
  - Registra todas as notificações no banco

#### 2. `payment-webhook`
- **Função**: Processa confirmações de pagamento
- **Uso**: Endpoint para webhooks de gateways de pagamento
- **Funcionalidades**:
  - Atualiza status da cobrança
  - Cria próxima cobrança recorrente automaticamente
  - Envia confirmação de pagamento
  - Registra histórico completo

## 🔗 Integração WhatsApp via n8n

### Passo 1: Configurar n8n
1. Instale n8n: `npm install -g n8n` ou use a versão cloud
2. Inicie: `n8n start`

### Passo 2: Criar Workflow de Lembretes
```
1. [Cron Trigger] - Executa diariamente às 9h
   ↓
2. [HTTP Request] - Chama edge function check-overdue-charges
   URL: https://txyrhzvzofrxwkxaehkn.supabase.co/functions/v1/check-overdue-charges
   Method: POST
   ↓
3. [Supabase Node] - Busca notificações pendentes
   Table: notifications
   Filter: status = 'pending'
   ↓
4. [Split In Batches] - Processa em lotes
   ↓
5. [WhatsApp Node] - Envia mensagens
   Use: message_content de cada notificação
   Para: phone do cliente
   ↓
6. [Supabase Node] - Atualiza status da notificação
   Set: status = 'sent'
```

### Passo 3: Configurar WhatsApp Business API
Opções:
- **WPPConnect**: Solução open-source
- **Twilio**: API oficial WhatsApp Business
- **Evolution API**: Alternativa brasileira

### Exemplo de Integração WPPConnect
```javascript
// No n8n, use Function node
const phone = items[0].json.phone.replace(/\D/g, '');
const message = items[0].json.message_content;

return [{
  json: {
    chatId: `${phone}@c.us`,
    message: message
  }
}];
```

## 💰 Integração de Pagamento (Fase 4)

### Opção 1: Gerencianet (Efí)
```bash
# Instalar SDK
npm install gn-api-sdk-node
```

```javascript
// Exemplo de geração de Pix
const EfiPay = require('gn-api-sdk-node');

const options = {
  client_id: process.env.GN_CLIENT_ID,
  client_secret: process.env.GN_CLIENT_SECRET,
  sandbox: false
};

const efipay = new EfiPay(options);

// Criar cobrança Pix
const body = {
  calendario: { expiracao: 3600 },
  devedor: { cpf: '12345678909', nome: 'Nome Cliente' },
  valor: { original: '100.00' }
};

efipay.pixCreateImmediateCharge([], body)
  .then((response) => {
    const pixCopyPaste = response.pixCopiaECola;
    const qrCodeImage = response.imagemQrcode;
    // Salvar no banco de dados
  });
```

### Opção 2: Mercado Pago
```bash
npm install mercadopago
```

```javascript
const mercadopago = require('mercadopago');

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

const payment_data = {
  transaction_amount: 100,
  description: 'Cobrança PingPague',
  payment_method_id: 'pix',
  payer: {
    email: 'cliente@email.com'
  }
};

mercadopago.payment.create(payment_data)
  .then((response) => {
    const qrCodeBase64 = response.point_of_interaction.transaction_data.qr_code_base64;
    const qrCode = response.point_of_interaction.transaction_data.qr_code;
  });
```

### Configurar Webhook de Pagamento
1. **No Gateway de Pagamento**: Configure a URL do webhook
   ```
   https://txyrhzvzofrxwkxaehkn.supabase.co/functions/v1/payment-webhook
   ```

2. **Adaptar Payload**: Cada gateway envia formato diferente, adapte a edge function

## 📊 Fase 5 - Inteligência e Relatórios

### Alertas Automáticos Implementados
✅ Sistema de notificações já criado
✅ Tabela `notifications` registra todo histórico
✅ Edge function registra automaticamente:
- Lembretes de vencimento
- Alertas de inadimplência
- Confirmações de pagamento

### Relatórios Disponíveis
✅ **Export CSV**: Já implementado na página de Cobranças
- Inclui todos os dados das cobranças
- Formato pronto para Excel/Google Sheets

### Próximos Passos para BI
```sql
-- Exemplo de query para análise mensal
SELECT 
  DATE_TRUNC('month', due_date) as mes,
  COUNT(*) as total_cobrancas,
  SUM(amount) as valor_total,
  SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as valor_pago,
  SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as valor_atrasado
FROM charges
GROUP BY mes
ORDER BY mes DESC;
```

## 🔄 Configuração do Cron Job

### Opção 1: Cron via n8n (Recomendado)
No workflow do n8n, adicione:
- **Cron Node**: `0 9 * * *` (diário às 9h)
- Chame a edge function `check-overdue-charges`

### Opção 2: Cron via Supabase
```sql
-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Agendar verificação diária às 9h
SELECT cron.schedule(
  'check-overdue-charges',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url:='https://txyrhzvzofrxwkxaehkn.supabase.co/functions/v1/check-overdue-charges',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer SEU_ANON_KEY"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

## 🎯 Checklist de Implementação

### Imediato (Já Funcional)
- [x] Dashboard com gráficos
- [x] Cobranças recorrentes
- [x] Histórico detalhado de clientes
- [x] Sistema de notificações
- [x] Edge functions prontas
- [x] Exportação CSV

### Próximos Passos (Configuração Externa)
- [ ] Configurar n8n
- [ ] Integrar WhatsApp (WPPConnect/Twilio)
- [ ] Escolher e integrar gateway de pagamento
- [ ] Configurar webhooks
- [ ] Ativar cron job diário
- [ ] Testar fluxo completo

## 📱 Estrutura de Mensagens WhatsApp

### Template de Lembrete (2 dias antes)
```
Olá {nome}! 👋

Lembramos que sua cobrança de *R$ {valor}* vence em 2 dias ({data}).

Para efetuar o pagamento, utilize o link:
{link_pagamento}

Qualquer dúvida, estamos à disposição!
```

### Template de Cobrança Vencida
```
Olá {nome},

Identificamos que sua cobrança de *R$ {valor}* está vencida desde {data}.

Por favor, regularize seu pagamento o quanto antes:
{link_pagamento}

Caso já tenha pago, desconsidere esta mensagem.
```

### Template de Confirmação
```
🎉 Pagamento Confirmado!

Olá {nome}, recebemos seu pagamento de *R$ {valor}*.

Obrigado pela preferência!
```

## 🔐 Segurança

- ✅ RLS (Row Level Security) configurado em todas as tabelas
- ✅ Autenticação obrigatória para todas as operações
- ✅ Edge functions com tratamento de erros
- ✅ Logs detalhados para debugging

## 📞 Suporte

Para dúvidas sobre a implementação:
1. Verifique os logs das edge functions no Lovable Cloud
2. Consulte a documentação do n8n: https://docs.n8n.io
3. Documentação Supabase: https://supabase.com/docs
