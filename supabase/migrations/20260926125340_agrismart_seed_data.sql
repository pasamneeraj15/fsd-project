/*
# AgriSmart - Seed Reference Data

Populates the crops, pesticides, and fertilizers tables with demonstration data
covering Wheat, Rice, Cotton, Tomato, Potato, Grapes, and Chili.

NOTE: All pesticide and fertilizer dosage values are DEMONSTRATION data only.
They are not verified agricultural recommendations and should be replaced
with authoritative, label-verified information before production use.
*/

-- ============ CROPS ============
INSERT INTO crops (name, description, growing_season, soil_requirements, water_requirements, common_pests, category) VALUES
('Wheat', 'A staple cereal grain grown worldwide, essential for bread, pasta, and livestock feed.', 'November to April (Rabi)', 'Well-drained loamy soil, pH 6.0-7.5', 'Moderate irrigation; 450-650 mm per season', 'Aphids, Rust fungi, Wheat weevil', 'Cereal'),
('Rice', 'Primary food crop for half the world, grown in flooded paddies or upland conditions.', 'June to October (Kharif)', 'Clay or clay-loam soil, pH 5.5-6.5', 'High water need; flooded paddies, 1,200-1,600 mm', 'Stem borer, Brown planthopper, Rice blast', 'Cereal'),
('Cotton', 'Major fiber crop used in textiles, grown for its soft boll fiber.', 'April to November (Kharif)', 'Deep black cotton soil, pH 6.0-8.0', 'Moderate irrigation; 700-1,300 mm per season', 'Bollworm, Whitefly, Aphids', 'Fiber'),
('Tomato', 'Popular vegetable crop rich in vitamins, used fresh and processed.', 'Year-round (optimal: Feb-Jun)', 'Well-drained sandy loam, pH 6.0-6.8', 'Regular irrigation; 400-600 mm per season', 'Fruit borer, Whitefly, Early blight', 'Vegetable'),
('Potato', 'Tuber crop and global food staple, high in carbohydrates.', 'October to February (Rabi)', 'Sandy loam, pH 5.0-6.0', 'Moderate irrigation; 500-700 mm per season', 'Late blight, Aphids, Potato tuber moth', 'Tuber'),
('Grapes', 'Fruit crop grown for fresh consumption, raisins, and wine production.', 'Jan to May (pruning dependent)', 'Well-drained sandy loam, pH 6.5-7.5', 'Drip irrigation; 500-900 mm per season', 'Mealybug, Thrips, Downy mildew', 'Fruit'),
('Chili', 'Spice and vegetable crop valued for its pungent capsaicin content.', 'Year-round (optimal: Jun-Oct)', 'Well-drained sandy loam, pH 5.5-6.5', 'Moderate irrigation; 600-900 mm per season', 'Thrips, Fruit borer, Powdery mildew', 'Vegetable')
ON CONFLICT DO NOTHING;

-- ============ PESTICIDES ============
-- Wheat
INSERT INTO pesticides (name, target_pest, crop, dosage, form, pre_harvest_interval, safety_info) VALUES
('Imidacloprid', 'Aphids', 'Wheat', '40 g/acre', 'Soluble powder', '30 days', 'Wear protective gloves and mask. Do not spray in windy conditions.'),
('Propiconazole', 'Rust fungi', 'Wheat', '200 ml/acre', 'Emulsifiable concentrate', '35 days', 'Fungicide. Avoid contact with skin and eyes.'),
('Chlorpyrifos', 'Wheat weevil', 'Wheat', '400 ml/acre', 'Emulsifiable concentrate', '30 days', 'Toxic to bees. Apply in early morning or evening.'),
('Lambda-cyhalothrin', 'Stem borer', 'Wheat', '100 ml/acre', 'Emulsifiable concentrate', '21 days', 'Highly toxic to aquatic life. Use with caution.')
ON CONFLICT DO NOTHING;

-- Rice
INSERT INTO pesticides (name, target_pest, crop, dosage, form, pre_harvest_interval, safety_info) VALUES
('Chlorantraniliprole', 'Stem borer', 'Rice', '40 g/acre', 'Water dispersible granule', '20 days', 'Low toxicity to mammals. Follow label dosage strictly.'),
('Buprofezin', 'Brown planthopper', 'Rice', '200 ml/acre', 'Suspension concentrate', '14 days', 'Insect growth regulator. Do not mix with alkaline products.'),
('Tricyclazole', 'Rice blast', 'Rice', '75 g/acre', 'Wettable powder', '25 days', 'Systemic fungicide. Apply at disease onset.'),
('Hexaconazole', 'Sheath blight', 'Rice', '100 ml/acre', 'Suspension concentrate', '30 days', 'Avoid excessive application to prevent resistance.')
ON CONFLICT DO NOTHING;

-- Cotton
INSERT INTO pesticides (name, target_pest, crop, dosage, form, pre_harvest_interval, safety_info) VALUES
('Emamectin benzoate', 'Bollworm', 'Cotton', '8 g/acre', 'Soluble granule', '7 days', 'Effective against resistant bollworm. Use in rotation.'),
('Spiromesifen', 'Whitefly', 'Cotton', '96 ml/acre', 'Suspension concentrate', '14 days', 'Affects mites and whiteflies. Avoid drift to water.'),
('Acetamiprid', 'Aphids', 'Cotton', '40 g/acre', 'Soluble powder', '15 days', 'Systemic insecticide. Do not apply during bloom.'),
('Azoxystrobin', 'Boll rot', 'Cotton', '200 ml/acre', 'Suspension concentrate', '21 days', 'Broad-spectrum fungicide. Rotate mode of action.')
ON CONFLICT DO NOTHING;

-- Tomato
INSERT INTO pesticides (name, target_pest, crop, dosage, form, pre_harvest_interval, safety_info) VALUES
('Spinosad', 'Fruit borer', 'Tomato', '75 ml/acre', 'Suspension concentrate', '3 days', 'Derived from natural bacteria. Low bee toxicity.'),
('Imidacloprid', 'Whitefly', 'Tomato', '40 g/acre', 'Soluble powder', '7 days', 'Systemic. Apply at early growth stage for best results.'),
('Mancozeb', 'Early blight', 'Tomato', '750 g/acre', 'Wettable powder', '5 days', 'Contact fungicide. Apply preventively at 7-10 day intervals.'),
('Copper oxychloride', 'Bacterial wilt', 'Tomato', '500 g/acre', 'Wettable powder', '7 days', 'Protectant bactericide. Avoid use in high temperatures.')
ON CONFLICT DO NOTHING;

-- Potato
INSERT INTO pesticides (name, target_pest, crop, dosage, form, pre_harvest_interval, safety_info) VALUES
('Mancozeb', 'Late blight', 'Potato', '750 g/acre', 'Wettable powder', '14 days', 'Contact fungicide. Apply before disease appearance.'),
('Imidacloprid', 'Aphids', 'Potato', '40 g/acre', 'Soluble powder', '21 days', 'Systemic insecticide. Soil application at planting.'),
('Phorate', 'Tuber moth', 'Potato', '1 kg/acre', 'Granule', '45 days', 'Highly toxic. Apply to soil only, never to foliage.'),
('Metalaxyl + Mancozeb', 'Late blight', 'Potato', '800 g/acre', 'Wettable powder', '14 days', 'Combination product. Do not exceed 3 sprays per season.')
ON CONFLICT DO NOTHING;

-- Grapes
INSERT INTO pesticides (name, target_pest, crop, dosage, form, pre_harvest_interval, safety_info) VALUES
('Buprofezin', 'Mealybug', 'Grapes', '250 ml/acre', 'Suspension concentrate', '30 days', 'IGR. Effective against nymphs. Do not use during flowering.'),
('Spinosad', 'Thrips', 'Grapes', '75 ml/acre', 'Suspension concentrate', '7 days', 'Naturalyte. Safe for beneficial insects at label rates.'),
('Metalaxyl + Mancozeb', 'Downy mildew', 'Grapes', '800 g/acre', 'Wettable powder', '35 days', 'Systemic + contact. Apply at bloom and pre-bunch closure.'),
('Sulfur', 'Powdery mildew', 'Grapes', '1.5 kg/acre', 'Wettable powder', '0 days', 'Contact fungicide. Do not apply above 30°C temperature.')
ON CONFLICT DO NOTHING;

-- Chili
INSERT INTO pesticides (name, target_pest, crop, dosage, form, pre_harvest_interval, safety_info) VALUES
('Spinosad', 'Thrips', 'Chili', '75 ml/acre', 'Suspension concentrate', '3 days', 'Low residue. Ideal for integrated pest management.'),
(' Emamectin benzoate', 'Fruit borer', 'Chili', '8 g/acre', 'Soluble granule', '5 days', 'Effective against fruit borer complex. Rotate use.'),
('Hexaconazole', 'Powdery mildew', 'Chili', '100 ml/acre', 'Suspension concentrate', '14 days', 'Systemic fungicide. Limit to 2-3 applications.'),
('Abamectin', 'Mites', 'Chili', '100 ml/acre', 'Emulsifiable concentrate', '7 days', 'Acaricide. Toxic to bees; apply post-bloom.'),
('Emamectin benzoate', 'Fruit borer', 'Chili', '8 g/acre', 'Soluble granule', '5 days', 'Effective against fruit borer complex. Rotate use.')
ON CONFLICT DO NOTHING;

-- ============ FERTILIZERS ============
INSERT INTO fertilizers (name, category, description, dosage, suitable_crops) VALUES
('Urea (46% N)', 'Inorganic', 'Highly concentrated nitrogen fertilizer for vegetative growth.', '50-100 kg/acre (split doses)', ARRAY['Wheat','Rice','Cotton','Potato','Chili']),
('DAP (18:46:0)', 'Inorganic', 'Di-ammonium phosphate providing nitrogen and phosphorus for root development.', '50 kg/acre at basal', ARRAY['Wheat','Rice','Cotton','Tomato','Potato','Grapes','Chili']),
('MOP (0:0:60)', 'Inorganic', 'Muriate of potash, supplies potassium for disease resistance and fruit quality.', '25-50 kg/acre', ARRAY['Potato','Tomato','Grapes','Chili','Cotton']),
('NPK (19:19:19)', 'Inorganic', 'Balanced water-soluble NPK for all-round crop nutrition.', '5-10 g/L as foliar spray', ARRAY['Wheat','Rice','Tomato','Potato','Grapes','Chili']),
('Compost', 'Organic', 'Decomposed organic matter that improves soil structure and microbial activity.', '2-4 tons/acre at basal', ARRAY['Wheat','Rice','Cotton','Tomato','Potato','Grapes','Chili']),
('Vermicompost', 'Organic', 'Worm-processed compost rich in nutrients and beneficial microbes.', '1-2 tons/acre', ARRAY['Tomato','Potato','Grapes','Chili']),
('Rhizobium Biofertilizer', 'Biofertilizer', 'Nitrogen-fixing bacteria for legumes; enhances soil nitrogen naturally.', '200 g per 10 kg seed', ARRAY['Cotton','Chili']),
('Azotobacter', 'Biofertilizer', 'Free-living nitrogen fixer suitable for non-legume crops.', '2 kg/acre as soil application', ARRAY['Wheat','Rice','Tomato','Potato']),
('PSB (Phosphate Solubilizing Bacteria)', 'Biofertilizer', 'Solubilizes insoluble phosphorus in soil, improving phosphorus uptake.', '2 kg/acre as soil application', ARRAY['Wheat','Rice','Cotton','Tomato','Potato','Grapes','Chili'])
ON CONFLICT DO NOTHING;
