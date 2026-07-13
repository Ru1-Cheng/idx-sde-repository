-- Fix invalid default timestamp
SET SESSION sql_mode = '';

UPDATE rets_property
SET active_check = NULL
WHERE active_check = '0000-00-00 00:00:00';

ALTER TABLE rets_property
MODIFY active_check DATETIME NULL DEFAULT NULL;

-- Indexes
CREATE INDEX idx_property_city
ON rets_property (L_City);

CREATE INDEX idx_property_zip
ON rets_property (L_Zip);

CREATE INDEX idx_property_price
ON rets_property (L_SystemPrice);

CREATE INDEX idx_property_beds
ON rets_property (L_Keyword2);

CREATE INDEX idx_property_baths
ON rets_property (LM_Dec_3);

CREATE INDEX idx_property_city_price
ON rets_property (L_City, L_SystemPrice);