
-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clients" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own clients" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE USING (auth.uid() = user_id);

-- Create proposals table
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  public_code TEXT NOT NULL UNIQUE DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 12),
  title TEXT NOT NULL,
  description TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status_id UUID REFERENCES public.proposal_statuses(id) ON DELETE SET NULL,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own proposals" ON public.proposals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own proposals" ON public.proposals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own proposals" ON public.proposals FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own proposals" ON public.proposals FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public can view by public_code" ON public.proposals FOR SELECT TO anon USING (true);

-- Create proposal_items table
CREATE TABLE public.proposal_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  description TEXT NOT NULL DEFAULT '',
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.proposal_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own proposal items" ON public.proposal_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.proposals WHERE proposals.id = proposal_items.proposal_id AND proposals.user_id = auth.uid()));
CREATE POLICY "Public can view proposal items" ON public.proposal_items FOR SELECT TO anon USING (true);

-- Create proposal_status_history table
CREATE TABLE public.proposal_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  status_id UUID REFERENCES public.proposal_statuses(id) ON DELETE SET NULL,
  changed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.proposal_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own proposal history" ON public.proposal_status_history FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.proposals WHERE proposals.id = proposal_status_history.proposal_id AND proposals.user_id = auth.uid()));
CREATE POLICY "Public can view proposal history" ON public.proposal_status_history FOR SELECT TO anon USING (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Status change history trigger
CREATE OR REPLACE FUNCTION public.track_proposal_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status_id IS DISTINCT FROM NEW.status_id THEN
    INSERT INTO public.proposal_status_history (proposal_id, status_id, changed_by)
    VALUES (NEW.id, NEW.status_id, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_proposal_status_change BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.track_proposal_status_change();

-- Allow anon to update proposal status (for "Accept" on public page)
CREATE POLICY "Public can accept proposals" ON public.proposals FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

-- Allow anon to insert history (triggered by status update)
CREATE POLICY "Public can insert history" ON public.proposal_status_history FOR INSERT TO anon
  WITH CHECK (true);

-- Enable realtime on proposals
ALTER PUBLICATION supabase_realtime ADD TABLE public.proposals;

-- Indexes
CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_proposals_user_id ON public.proposals(user_id);
CREATE INDEX idx_proposals_client_id ON public.proposals(client_id);
CREATE INDEX idx_proposals_public_code ON public.proposals(public_code);
CREATE INDEX idx_proposal_items_proposal_id ON public.proposal_items(proposal_id);
CREATE INDEX idx_proposal_status_history_proposal_id ON public.proposal_status_history(proposal_id);
