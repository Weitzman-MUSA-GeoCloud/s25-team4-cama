SELECT 
    phl_properties.property_id,
    location AS address,
    CAST(model_assessment.price AS NUMERIC) AS current_assessed_value,
    CAST(phl_assessment.market_value AS NUMERIC) AS tax_year_assessed_value,
    ST_ASGEOJSON(geometry) AS geometry
FROM `musa5090s25-team4.derived.model_assessment_output` AS model_assessment
INNER JOIN (
  select 
    property_id,
    market_value
  from `musa5090s25-team4.core.phl_opa_assessments`
  where year = '2024'
) AS phl_assessment ON model_assessment.property_id = phl_assessment.property_id
INNER JOIN `musa5090s25-team4.core.phl_opa_properties` AS phl_properties ON model_assessment.property_id = phl_properties.property_id 
INNER JOIN `musa5090s25-team4.core.phl_pwd_parcels` AS pwd_parcels ON model_assessment.property_id = pwd_parcels.property_id
