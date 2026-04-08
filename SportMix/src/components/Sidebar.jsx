import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

const formatNumber = (value) => Number(value || 0).toLocaleString("ru-RU");

function Sidebar({
  minPrice,
  maxPrice,
  priceRange,
  onPriceChange,
  products = [],
  selectedBrands,
  onBrandChange,
}) {
  const [localMin, setLocalMin] = useState(priceRange[0]);
  const [localMax, setLocalMax] = useState(priceRange[1]);

  useEffect(() => {
    setLocalMin(priceRange[0]);
    setLocalMax(priceRange[1]);
  }, [priceRange]);

  const brandCounts = useMemo(() => {
    const counts = {};

    products.forEach((item) => {
      if (item.brand) {
        const formattedBrand = item.brand.charAt(0).toUpperCase() + item.brand.slice(1).toLowerCase();
        counts[formattedBrand] = (counts[formattedBrand] || 0) + 1;
      }
    });

    return counts;
  }, [products]);

  const formattedBrands = useMemo(() => Object.keys(brandCounts).sort(), [brandCounts]);

  const handleInputBlur = () => {
    let min = localMin === "" ? minPrice : Math.max(minPrice, Math.min(localMin, maxPrice));
    let max = localMax === "" ? maxPrice : Math.max(minPrice, Math.min(localMax, maxPrice));

    if (min > max) {
      const temp = min;
      min = max;
      max = temp;
    }

    onPriceChange(null, [min, max]);
  };

  return (
    <Box
      sx={{
        width: 280,
        p: 3,
        borderRadius: "28px",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
        border: "1px solid rgba(148,163,184,0.14)",
        boxShadow: "0 24px 60px rgba(15,23,42,0.06)",
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "#0f449e", mb: 0.9 }}>
          Фильтры
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>
          Настрой свой поиск
        </Typography>
        <Typography sx={{ color: "#64748b", fontSize: "14px", mt: 0.75, lineHeight: 1.6 }}>
          Сузь каталог по цене и брендам, чтобы быстрее найти точное попадание.
        </Typography>
      </Box>

      <Box sx={{ p: 2, borderRadius: "20px", backgroundColor: "#f8fafc", border: "1px solid rgba(148,163,184,0.12)", mb: 3 }}>
        <Typography sx={{ fontWeight: 800, color: "#0f172a", mb: 1.2 }}>Цена</Typography>
        <Typography sx={{ color: "#64748b", mb: 2, fontWeight: 600, fontSize: "14px" }}>
          от {formatNumber(priceRange[0])} ₽ до {formatNumber(priceRange[1])} ₽
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <TextField
            value={localMin}
            size="small"
            onChange={(event) => setLocalMin(event.target.value === "" ? "" : Number(event.target.value))}
            onBlur={handleInputBlur}
            onKeyDown={(event) => event.key === "Enter" && handleInputBlur()}
            inputProps={{ style: { fontSize: 14, padding: "10px 12px", fontWeight: 700 } }}
            placeholder="от"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", bgcolor: "#fff" } }}
          />
          <Typography sx={{ color: "#94a3b8", fontWeight: 800 }}>—</Typography>
          <TextField
            value={localMax}
            size="small"
            onChange={(event) => setLocalMax(event.target.value === "" ? "" : Number(event.target.value))}
            onBlur={handleInputBlur}
            onKeyDown={(event) => event.key === "Enter" && handleInputBlur()}
            inputProps={{ style: { fontSize: 14, padding: "10px 12px", fontWeight: 700 } }}
            placeholder="до"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px", bgcolor: "#fff" } }}
          />
        </Box>

        <Slider
          value={priceRange}
          onChange={onPriceChange}
          min={minPrice}
          max={maxPrice}
          sx={{
            color: "#0f449e",
            height: 6,
            "& .MuiSlider-track": { border: "none" },
            "& .MuiSlider-rail": { backgroundColor: "#dbeafe" },
            "& .MuiSlider-thumb": {
              width: 20,
              height: 20,
              backgroundColor: "#fff",
              border: "3px solid currentColor",
              boxShadow: "0 8px 20px rgba(15,68,158,0.20)",
            },
          }}
        />
      </Box>

      <Box sx={{ p: 2, borderRadius: "20px", backgroundColor: "#f8fafc", border: "1px solid rgba(148,163,184,0.12)" }}>
        <Typography sx={{ fontWeight: 800, color: "#0f172a", mb: 1.4 }}>Бренды</Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
          <Chip icon={<AutoAwesomeIcon />} label={`${formattedBrands.length} брендов`} sx={{ bgcolor: "#fff", color: "#0f449e", fontWeight: 800 }} />
          <Chip icon={<LocalOfferIcon />} label={`${selectedBrands.length} выбрано`} sx={{ bgcolor: "#fff", color: "#0f172a", fontWeight: 800 }} />
        </Stack>

        <FormGroup sx={{ maxHeight: 280, overflowY: "auto", pr: 0.5 }}>
          {formattedBrands.map((brand) => {
            const isChecked = selectedBrands.some((selectedBrand) => selectedBrand.toLowerCase() === brand.toLowerCase());

            return (
              <FormControlLabel
                key={brand}
                control={
                  <Checkbox
                    checked={isChecked}
                    onChange={() => {
                      const originalBrand =
                        Object.keys(brandCounts).find((key) => key.toLowerCase() === brand.toLowerCase()) || brand;
                      onBrandChange(originalBrand);
                    }}
                    sx={{ color: "#cbd5e1", "&.Mui-checked": { color: "#0f449e" } }}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", pr: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: "#334155", fontSize: "14px" }}>{brand}</Typography>
                    <Typography sx={{ color: "#94a3b8", fontSize: "12px", fontWeight: 800 }}>{brandCounts[brand]}</Typography>
                  </Box>
                }
                sx={{
                  m: 0,
                  px: 0.5,
                  py: 0.35,
                  borderRadius: "14px",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.8)" },
                }}
              />
            );
          })}
        </FormGroup>
      </Box>

      <Box
        sx={{
          mt: 3,
          borderRadius: "24px",
          background:
            "linear-gradient(160deg, rgba(15,23,42,0.90) 0%, rgba(15,68,158,0.86) 50%, rgba(37,99,235,0.80) 100%), url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&auto=format&fit=crop&w=800') center/cover",
          color: "#fff",
          p: 2.5,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Typography sx={{ fontSize: "12px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)", mb: 0.8 }}>
          Curated Pick
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
          До -50% на трендовые кроссовки
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.82)", fontSize: "14px", lineHeight: 1.6, mb: 2 }}>
          Собрали самые заметные модели сезона, чтобы ты нашел пару быстрее.
        </Typography>
        <Button variant="contained" sx={{ bgcolor: "#fff", color: "#0f172a", borderRadius: "999px", fontWeight: 900, px: 2.5, "&:hover": { bgcolor: "#e2e8f0" } }}>
          Смотреть подборку
        </Button>
      </Box>
    </Box>
  );
}

export default Sidebar;
