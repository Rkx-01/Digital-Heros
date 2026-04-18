-- ============================================================
-- SEED DATA - Sample Charities
-- ============================================================
INSERT INTO public.charities (name, description, image_url, category, featured, active) VALUES
(
  'Cancer Research UK',
  'We are the world''s leading independent cancer research charity. We fund scientists, nurses and doctors, and help make new treatments possible.',
  'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400',
  'Health',
  true,
  true
),
(
  'Children''s Society',
  'We fight for children who are facing impossible odds. We work until every child can have the life they deserve.',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400',
  'Children',
  false,
  true
),
(
  'WWF – World Wildlife Fund',
  'WWF''s mission is to conserve nature and reduce the most pressing threats to the diversity of life on Earth.',
  'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=400',
  'Environment',
  true,
  true
),
(
  'Mind UK',
  'We provide advice and support to empower anyone experiencing a mental health problem.',
  'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400',
  'Mental Health',
  false,
  true
),
(
  'Shelter',
  'Every year we help millions of people get through housing problems. We fight for lasting change — an end to the housing emergency.',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=400',
  'Housing',
  false,
  true
),
(
  'Oxfam GB',
  'Oxfam is a global movement of people working together to end the injustice of poverty.',
  'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400',
  'Poverty',
  false,
  true
);
