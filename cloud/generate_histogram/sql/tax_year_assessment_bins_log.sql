SELECT 
    year AS tax_year,
    POWER(10, FLOOR(LOG(CAST(market_value AS FLOAT64) + 0.1))) AS lower_bound,
    POWER(10, CEIL(LOG(CAST(market_value AS FLOAT64) + 0.1))) AS upper_bound,
    COUNT(*) AS quantity
FROM 
    core.phl_opa_assessments
WHERE 
    SAFE_CAST(market_value AS FLOAT64) IS NOT NULL
GROUP BY 
    year, lower_bound, upper_bound
ORDER BY 
    tax_year, lower_bound