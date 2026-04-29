
INSERT INTO public.plans (
  name, description, price, currency, interval,
  is_starter, is_active, trial_days,
  max_proposals, max_clients, features
) VALUES (
  'Starter',
  'Plano ideal para pequenos negócios enviarem propostas profissionais e acompanharem seus resultados',
  29.90,
  'BRL',
  'month',
  true,
  true,
  7,
  NULL,
  NULL,
  '["Propostas ilimitadas","Clientes ilimitados","Link público para o cliente","Compartilhamento via WhatsApp","Exportação em PDF","Acompanhamento de visualizações","Histórico de status"]'::jsonb
);
