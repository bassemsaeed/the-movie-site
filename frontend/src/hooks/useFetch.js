import { useState, useEffect, useCallback } from "react";

function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const signal = controller.signal;
    const finalUrl =
      options.lang === "ar" && options.currentPage
        ? url + `&l=ar&page=${options.currentPage}`
        : options.lang !== "ar" && options.currentPage
          ? url + `&page=${options.currentPage}`
          : options.lang === "ar" && !options.currentPage
            ? url + `&l=ar`
            : url;

    try {
      const response = await fetch(finalUrl, {
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      setData(result);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, [url, options.currentPage, options.lang, JSON.stringify(options)]); // keeping it to refresh when same button same settings clicked again to trigger a refresh

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useFetch;
