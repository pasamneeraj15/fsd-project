/*
# Add image URLs to crops and fertilizers

1. Updates crops table: sets image_url for all 7 crops with real Pexels photos
2. Updates fertilizers table: adds image_url column and sets images for all 9 fertilizers
3. No structural schema changes beyond adding the image_url column to fertilizers
*/

ALTER TABLE fertilizers ADD COLUMN IF NOT EXISTS image_url text DEFAULT '';

-- Crop images
UPDATE crops SET image_url = 'https://images.pexels.com/photos/33397323/pexels-photo-33397323.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Wheat';
UPDATE crops SET image_url = 'https://images.pexels.com/photos/39602572/pexels-photo-39602572.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Rice';
UPDATE crops SET image_url = 'https://images.pexels.com/photos/13924870/pexels-photo-13924870.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Cotton';
UPDATE crops SET image_url = 'https://images.pexels.com/photos/36317349/pexels-photo-36317349.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Tomato';
UPDATE crops SET image_url = 'https://images.pexels.com/photos/31908568/pexels-photo-31908568.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Potato';
UPDATE crops SET image_url = 'https://images.pexels.com/photos/33344322/pexels-photo-33344322.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Grapes';
UPDATE crops SET image_url = 'https://images.pexels.com/photos/13220059/pexels-photo-13220059.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Chili';

-- Fertilizer images
UPDATE fertilizers SET image_url = 'https://images.pexels.com/photos/31673795/pexels-photo-31673795.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Urea (46% N)';
UPDATE fertilizers SET image_url = 'https://images.pexels.com/photos/31673795/pexels-photo-31673795.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'DAP (18:46:0)';
UPDATE fertilizers SET image_url = 'https://images.pexels.com/photos/31673795/pexels-photo-31673795.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'MOP (0:0:60)';
UPDATE fertilizers SET image_url = 'https://images.pexels.com/photos/31673795/pexels-photo-31673795.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'NPK (19:19:19)';
UPDATE fertilizers SET image_url = 'https://images.pexels.com/photos/39069475/pexels-photo-39069475.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Compost';
UPDATE fertilizers SET image_url = 'https://images.pexels.com/photos/28214180/pexels-photo-28214180.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Vermicompost';
UPDATE fertilizers SET image_url = 'https://images.pexels.com/photos/3696170/pexels-photo-3696170.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Rhizobium Biofertilizer';
UPDATE fertilizers SET image_url = 'https://images.pexels.com/photos/33771472/pexels-photo-33771472.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'Azotobacter';
UPDATE fertilizers SET image_url = 'https://images.pexels.com/photos/33771472/pexels-photo-33771472.jpeg?auto=compress&cs=tinysrgb&w=600' WHERE name = 'PSB (Phosphate Solubilizing Bacteria)';
