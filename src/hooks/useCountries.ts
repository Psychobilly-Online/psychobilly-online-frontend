import { useState, useEffect } from 'react';

export interface Country {
  id: number;
  name: string;
  print_name: string;
  iso: string;
  iso3: string;
  numcode: number;
}

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/countries/all');

        if (!response.ok) {
          throw new Error('Failed to fetch countries');
        }

        const data = await response.json();
        setCountries(data.data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load countries');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, isLoading, error };
}
