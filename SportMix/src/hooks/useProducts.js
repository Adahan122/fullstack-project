import { useEffect, useState } from "react";

import { fetchProducts } from "../lib/api";

let productsCache = null;
let productsCacheError = null;
let productsRequest = null;

function loadProducts() {
  if (productsCache) {
    return Promise.resolve(productsCache);
  }

  if (productsCacheError) {
    return Promise.reject(productsCacheError);
  }

  if (!productsRequest) {
    productsRequest = fetchProducts()
      .then((items) => {
        productsCache = Array.isArray(items) ? items : [];
        productsCacheError = null;
        return productsCache;
      })
      .catch((requestError) => {
        productsCacheError = requestError;
        throw requestError;
      })
      .finally(() => {
        productsRequest = null;
      });
  }

  return productsRequest;
}

export function useProducts() {
  const [products, setProducts] = useState(() => productsCache || []);
  const [loading, setLoading] = useState(() => !productsCache && !productsCacheError);
  const [error, setError] = useState(() => productsCacheError);

  useEffect(() => {
    let isMounted = true;

    loadProducts()
      .then((items) => {
        if (isMounted) {
          setProducts(items);
          setError(null);
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(requestError);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { products, loading, error };
}
