ALTER TABLE leads ADD COLUMN product_quantities INTEGER[];

UPDATE leads
SET product_quantities = CASE
    WHEN cardinality(product_ids) = 0 THEN '{}'::INTEGER[]
    ELSE array_fill(1, ARRAY[cardinality(product_ids)])
END;

-- NULL permits requests from the preceding deployment during rollout.
-- The current application always supplies one quantity per selected product.
ALTER TABLE leads ADD CONSTRAINT leads_product_quantities_check CHECK (
    product_quantities IS NULL OR (
        cardinality(product_quantities) = cardinality(product_ids)
        AND array_position(product_quantities, NULL) IS NULL
        AND 1 <= ALL(product_quantities)
        AND 5 >= ALL(product_quantities)
        AND (cardinality(product_quantities) = 0 OR (
            array_ndims(product_quantities) = 1
            AND array_lower(product_quantities, 1) = 1
        ))
    )
);
