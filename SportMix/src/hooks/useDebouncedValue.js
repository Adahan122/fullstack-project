import { useEffect, useRef, useState } from 'react';

export function useDebouncedValue(value, delay = 150) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timerRef = useRef(null);

  useEffect(() => {
    // Очистить предыдущий таймер
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Если значение пустое, обновить сразу
    if (!value || value.trim() === '') {
      setDebouncedValue(value);
      return undefined;
    }

    // Установить новый таймер
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}
