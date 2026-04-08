import { useEffect, useState } from "react";

import { fetchProducts } from "../lib/api";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetchProducts()
      .then((items) => {
        if (isMounted) {
          setProducts(Array.isArray(items) ? items : []);
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
