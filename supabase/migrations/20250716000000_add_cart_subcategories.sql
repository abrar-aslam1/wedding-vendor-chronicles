-- Add cart subcategories to vendor_subcategories table
INSERT INTO vendor_subcategories (category, name, description)
VALUES 
  ('carts', 'Coffee Carts', 'Mobile coffee stations with barista service for ceremonies and receptions'),
  ('carts', 'Matcha Carts', 'Specialty matcha and tea service carts for unique wedding experiences'),
  ('carts', 'Cocktail Carts', 'Mobile bar carts with bartender service for cocktail hour and reception'),
  ('carts', 'Dessert Carts', 'Mobile dessert stations with ice cream, pastries, and sweet treats'),
  ('carts', 'Flower Carts', 'Mobile floral arrangements and flower crown stations'),
  ('carts', 'Champagne Carts', 'Elegant champagne service carts for toasts and celebrations')
ON CONFLICT (category, name) DO NOTHING;