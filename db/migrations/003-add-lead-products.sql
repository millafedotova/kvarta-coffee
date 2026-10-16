ALTER TABLE leads ADD COLUMN product_ids TEXT[] NOT NULL DEFAULT '{}';

UPDATE leads SET product_ids = ARRAY[product_id] WHERE product_id IS NOT NULL;

ALTER TABLE leads ADD CONSTRAINT leads_product_ids_check CHECK (
    cardinality(product_ids) <= 4
    AND array_position(product_ids, NULL) IS NULL
    AND product_ids <@ ARRAY['ethiopia-yirgacheffe', 'colombia-huila', 'brazil-cerrado', 'drip-assortment']::TEXT[]
    AND (cardinality(product_ids) = 0 OR interest = 'one_time')
    AND (cardinality(product_ids) = 0 OR (
        array_ndims(product_ids) = 1
        AND array_lower(product_ids, 1) = 1
        AND product_id IS NOT NULL
        AND product_id = product_ids[1]
    ))
);
