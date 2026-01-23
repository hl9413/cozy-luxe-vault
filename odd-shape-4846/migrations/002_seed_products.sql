-- 商品 1
INSERT INTO products (title_en, title_zh, description_en, price_usd) VALUES
  ('Rose Blossom Scarf', 'Rose Blossom Scarf', 'Soft and cozy scarf with floral pattern.', 29.99);

INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES
  ((SELECT id FROM products WHERE title_en = 'Rose Blossom Scarf'), '/images/product1/1.jpg', 1, 1),
  ((SELECT id FROM products WHERE title_en = 'Rose Blossom Scarf'), '/images/product1/2.jpg', 0, 2),
  ((SELECT id FROM products WHERE title_en = 'Rose Blossom Scarf'), '/images/product1/3.jpg', 0, 3),
  ((SELECT id FROM products WHERE title_en = 'Rose Blossom Scarf'), '/images/product1/4.jpg', 0, 4);

-- 商品 2
INSERT INTO products (title_en, title_zh, description_en, price_usd) VALUES
  ('Cozy Knit Socks (Set)', 'Cozy Knit Socks (Set)', 'Premium knit socks set for all seasons.', 15.50);

INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES
  ((SELECT id FROM products WHERE title_en = 'Cozy Knit Socks (Set)'), '/images/product2/1.jpg', 1, 1),
  ((SELECT id FROM products WHERE title_en = 'Cozy Knit Socks (Set)'), '/images/product2/2.jpg', 0, 2),
  ((SELECT id FROM products WHERE title_en = 'Cozy Knit Socks (Set)'), '/images/product2/3.jpg', 0, 3),
  ((SELECT id FROM products WHERE title_en = 'Cozy Knit Socks (Set)'), '/images/product2/4.jpg', 0, 4);

-- 商品 3
INSERT INTO products (title_en, title_zh, description_en, price_usd) VALUES
  ('Luxe Tote Bag', 'Luxe Tote Bag', 'Everyday tote bag with elegant design and roomy interior.', 49.00);

INSERT INTO product_images (product_id, image_url, is_primary, sort_order) VALUES
  ((SELECT id FROM products WHERE title_en = 'Luxe Tote Bag'), '/images/product3/1.jpg', 1, 1),
  ((SELECT id FROM products WHERE title_en = 'Luxe Tote Bag'), '/images/product3/2.jpg', 0, 2),
  ((SELECT id FROM products WHERE title_en = 'Luxe Tote Bag'), '/images/product3/3.jpg', 0, 3),
  ((SELECT id FROM products WHERE title_en = 'Luxe Tote Bag'), '/images/product3/4.jpg', 0, 4);
