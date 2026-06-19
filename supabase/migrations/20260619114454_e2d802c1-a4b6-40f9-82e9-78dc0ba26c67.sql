
CREATE TABLE public.discovery_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.discovery_calls TO anon, authenticated;
GRANT ALL ON public.discovery_calls TO service_role;

ALTER TABLE public.discovery_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a discovery call request"
  ON public.discovery_calls
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(name) BETWEEN 1 AND 120
    AND length(industry) BETWEEN 1 AND 80
    AND length(phone) BETWEEN 7 AND 20
    AND preferred_date >= CURRENT_DATE
  );
