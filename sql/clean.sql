--- Trim trailing whitespace from route IDs
UPDATE jore.jr_inf_kohde SET lintunnus = TRIM (TRAILING FROM lintunnus);
UPDATE jore.jr_inf_aikataulu_vp SET reitunnus = TRIM (TRAILING FROM reitunnus);
