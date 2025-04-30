WITH tax_year_assess AS (
    SELECT
        property_id,
        SAFE_CAST(market_value AS FLOAT64) AS market_value
    FROM
        core.phl_opa_assessments
    WHERE
        SAFE_CAST(market_value AS FLOAT64) IS NOT NULL
        AND year = '2024'
),

model_assess AS (
    SELECT
        property_id,
        SAFE_CAST(price AS FLOAT64) AS price
    FROM
        derived.model_assessment_output
    WHERE
        SAFE_CAST(price AS FLOAT64) IS NOT NULL
),

price_changes AS (
    SELECT
        (price - market_value) / market_value AS delta
    FROM tax_year_assess
    INNER JOIN model_assess ON tax_year_assess.property_id = model_assess.property_id
    WHERE
        market_value > 10000
        AND price > 0
)

SELECT
    2025 AS tax_year,
    FLOOR(delta * 10) * 10 AS lower_bound,
    CEIL(delta * 10) * 10 AS upper_bound,
    COUNT(*) AS property_count
FROM
    price_changes
GROUP BY
    lower_bound, upper_bound
HAVING
    lower_bound >= -400
    AND upper_bound <= 200
ORDER BY
    lower_bound
