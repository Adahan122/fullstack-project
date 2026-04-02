import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button'; // 🔥 ВОТ ОН, ЭТОТ ДОБАВЛЕННЫЙ ИМПОРТ!

const Sidebar = ({
  minPrice,
  maxPrice,
  priceRange,
  onPriceChange,
  products = [], // Передаем сюда все товары для подсчета количества
  selectedBrands,
  onBrandChange,
}) => {
  // Локальный стейт для инпутов, чтобы ввод цифр не тормозил из-за тяжелого рендера каталога
  const [localMin, setLocalMin] = useState(priceRange[0]);
  const [localMax, setLocalMax] = useState(priceRange[1]);

  useEffect(() => {
    setLocalMin(priceRange[0]);
    setLocalMax(priceRange[1]);
  }, [priceRange]);

  const handleMinInputChange = (e) => {
    const val = e.target.value === '' ? '' : Number(e.target.value);
    setLocalMin(val);
  };

  const handleMaxInputChange = (e) => {
    const val = e.target.value === '' ? '' : Number(e.target.value);
    setLocalMax(val);
  };

  // Когда пользователь уводит фокус с инпута или жмет Enter — применяем фильтр
  const handleInputBlur = () => {
    let min = localMin === '' ? minPrice : Math.max(minPrice, Math.min(localMin, maxPrice));
    let max = localMax === '' ? maxPrice : Math.max(minPrice, Math.min(localMax, maxPrice));

    if (min > max) {
      const temp = min;
      min = max;
      max = temp;
    }

    onPriceChange(null, [min, max]);
  };

  // 1. Приводим бренды к единому регистру и считаем их количество
  const brandCounts = {};
  products.forEach((item) => {
    if (item.brand) {
      // Делаем первую букву заглавной, остальные строчными (NIKE -> Nike)
      const formattedBrand = item.brand.charAt(0).toUpperCase() + item.brand.slice(1).toLowerCase();
      brandCounts[formattedBrand] = (brandCounts[formattedBrand] || 0) + 1;
    }
  });

  const formattedBrands = Object.keys(brandCounts).sort();

  return (
    <Box sx={{ width: 260, p: 3, bgcolor: '#f7f8fa', borderRadius: 3, boxShadow: 1 }}>
      {/* СЕКЦИЯ: ЦЕНА */}
      <Typography variant='subtitle1' sx={{ fontWeight: 800, mb: 1.5, color: '#1a1a1a' }}>
        Цена
      </Typography>

      {/* Текстовый диапазон */}
      <Typography variant='body2' sx={{ color: '#555', mb: 2, fontWeight: 500 }}>
        от {priceRange[0].toLocaleString()} ₽ до {priceRange[1].toLocaleString()} ₽
      </Typography>

      {/* Инпуты для ручного ввода */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <TextField
          value={localMin}
          size='small'
          onChange={handleMinInputChange}
          onBlur={handleInputBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleInputBlur()}
          inputProps={{ style: { fontSize: 14, padding: '6px 8px' } }}
          placeholder='от'
        />
        <Typography sx={{ color: '#aaa' }}>—</Typography>
        <TextField
          value={localMax}
          size='small'
          onChange={handleMaxInputChange}
          onBlur={handleInputBlur}
          onKeyDown={(e) => e.key === 'Enter' && handleInputBlur()}
          inputProps={{ style: { fontSize: 14, padding: '6px 8px' } }}
          placeholder='до'
        />
      </Box>

      {/* Ползунок */}
      <Slider
        value={priceRange}
        onChange={onPriceChange}
        min={minPrice}
        max={maxPrice}
        sx={{
          mb: 4,
          color: '#0f449e',
          height: 4,
          '& .MuiSlider-thumb': {
            width: 18,
            height: 18,
            backgroundColor: '#fff',
            border: '2px solid currentColor',
          },
        }}
      />

      {/* СЕКЦИЯ: БРЕНДЫ */}
      <Typography variant='subtitle1' sx={{ fontWeight: 800, mb: 1.5, color: '#1a1a1a' }}>
        Бренды
      </Typography>

      <FormGroup>
        {formattedBrands.map((brand) => {
          const isChecked = selectedBrands.some((b) => b.toLowerCase() === brand.toLowerCase());

          return (
            <FormControlLabel
              key={brand}
              control={
                <Checkbox
                  checked={isChecked}
                  onChange={() => {
                    const originalBrand =
                      Object.keys(brandCounts).find(
                        (k) => k.toLowerCase() === brand.toLowerCase(),
                      ) || brand;
                    onBrandChange(originalBrand);
                  }}
                  sx={{ color: '#bbb', '&.Mui-checked': { color: '#0f449e' } }}
                />
              }
              label={
                <Typography variant='body2' sx={{ fontWeight: 500, color: '#333' }}>
                  {brand}{' '}
                  <span style={{ color: '#aaa', fontSize: '0.85rem' }}>({brandCounts[brand]})</span>
                </Typography>
              }
              sx={{ mb: 0.5 }}
            />
          );
        })}
      </FormGroup>

      {/* Баннер в пустоту под фильтрами */}
      <Box
        sx={{
          mt: 3,
          width: '80%',
          height: '650px',
          borderRadius: '12px',
          background:
            'linear-gradient(rgba(15, 68, 158, 0.8), rgba(11, 51, 118, 0.8)), url("https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&auto=format&fit=crop") center/cover',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1 }}>
          СКИДКИ ДО -50%
        </Typography>
        <Typography variant='body2' sx={{ mb: 2 }}>
          На все кроссовки из новой коллекции
        </Typography>
        <Button
          variant='contained'
          sx={{
            bgcolor: '#fff',
            color: '#0f449e',
            '&:hover': { bgcolor: '#f0f0f0' },
            textTransform: 'none',
            fontWeight: 'bold',
          }}
        >
          Смотреть
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;