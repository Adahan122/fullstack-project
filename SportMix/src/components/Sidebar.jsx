import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AccessibilityNewIcon from "@mui/icons-material/AccessibilityNew";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import StraightenIcon from "@mui/icons-material/Straighten";

import { getBrandOptions, getGenderOptions, getSizeOptions } from "../lib/catalog";

function Sidebar({
  products = [],
  selectedBrands,
  onBrandChange,
  selectedGenders,
  onGenderChange,
  selectedSizes,
  onSizeChange,
}) {
  const navigate = useNavigate();

  const brandCounts = useMemo(() => {
    const counts = {};

    products.forEach((item) => {
      if (item.brand) {
        counts[item.brand] = (counts[item.brand] || 0) + 1;
      }
    });

    return counts;
  }, [products]);

  const genderCounts = useMemo(() => {
    const counts = {};

    products.forEach((item) => {
      if (item.gender) {
        counts[item.gender] = (counts[item.gender] || 0) + 1;
      }
    });

    return counts;
  }, [products]);

  const sizeCounts = useMemo(() => {
    const counts = {};

    products.forEach((item) => {
      (Array.isArray(item.sizes) ? item.sizes : []).forEach((size) => {
        counts[size] = (counts[size] || 0) + 1;
      });
    });

    return counts;
  }, [products]);

  const formattedBrands = useMemo(() => getBrandOptions(products), [products]);
  const formattedGenders = useMemo(() => getGenderOptions(products), [products]);
  const formattedSizes = useMemo(() => getSizeOptions(products), [products]);

  const marketingStats = useMemo(() => {
    const saleCount = products.filter(
      (item) => Number(item.oldPrice || item.old_price) > Number(item.price || 0),
    ).length;
    const newCount = products.filter((item) => Boolean(item.is_new)).length;
    const lowStockCount = products.filter((item) => {
      const stock = Number(item.stock || 0);
      return stock > 0 && stock <= 3;
    }).length;
    const topBrand =
      Object.entries(brandCounts).sort(([, countA], [, countB]) => countB - countA)[0]?.[0] ||
      "Nike";

    return {
      saleCount,
      newCount,
      lowStockCount,
      topBrand,
    };
  }, [brandCounts, products]);

  const marketingCard = useMemo(() => {
    if (selectedSizes.length > 0) {
      return {
        eyebrow: "Точный матч",
        title: `Размер ${selectedSizes[0]} уже в фокусе`,
        description:
          "Когда покупатель выбрал размер, пустое место лучше превращать в мягкий триггер: показать, что подходящие варианты уже отфильтрованы и можно идти к выбору быстрее.",
        primaryLabel: "Размер уже учтен",
        primaryAction: null,
        secondaryLabel: `${marketingStats.lowStockCount} позиций почти раскупили`,
      };
    }

    if (selectedBrands.length > 0) {
      return {
        eyebrow: "Любимый бренд",
        title: `${selectedBrands[0]} лучше всего дожимать через новинки`,
        description:
          "Если бренд уже выбран, следующий хороший шаг это быстро показать свежие поступления и создать ощущение актуальности предложения.",
        primaryLabel: "Открыть новинки",
        primaryAction: () => navigate("/?category=New"),
        secondaryLabel: `${marketingStats.newCount} новых моделей`,
      };
    }

    return {
      eyebrow: "Маркетинговый ход",
      title: `${marketingStats.topBrand} и скидки сегодня работают сильнее всего`,
      description:
        "Вместо пустого блока под фильтрами ставим мини-оффер: выгода, дефицит и простой CTA. Это уже кусок воронки, а не просто декоративное пятно.",
      primaryLabel: "Смотреть скидки",
      primaryAction: () => navigate("/?category=Sale"),
      secondaryLabel: `${marketingStats.saleCount} товаров со скидкой`,
    };
  }, [marketingStats, navigate, selectedBrands, selectedSizes]);

  return (
    <Box
      sx={{
        width: "100%",
        p: { xs: 2.25, md: 3 },
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
          Сузь каталог по бренду, полу и размеру, чтобы быстрее найти нужный товар.
        </Typography>
      </Box>

      <Box sx={{ p: 2, borderRadius: "20px", backgroundColor: "#f8fafc", border: "1px solid rgba(148,163,184,0.12)", mb: 3 }}>
        <Typography sx={{ fontWeight: 800, color: "#0f172a", mb: 1.4 }}>Бренды</Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
          <Chip icon={<AutoAwesomeIcon />} label={`${formattedBrands.length} брендов`} sx={{ bgcolor: "#fff", color: "#0f449e", fontWeight: 800 }} />
          <Chip icon={<LocalOfferIcon />} label={`${selectedBrands.length} выбрано`} sx={{ bgcolor: "#fff", color: "#0f172a", fontWeight: 800 }} />
        </Stack>

        <FormGroup sx={{ maxHeight: 220, overflowY: "auto", pr: 0.5 }}>
          {formattedBrands.map((brand) => {
            const isChecked = selectedBrands.some((selectedBrand) => selectedBrand.toLowerCase() === brand.toLowerCase());

            return (
              <FormControlLabel
                key={brand}
                control={
                  <Checkbox
                    checked={isChecked}
                    onChange={() => onBrandChange(brand)}
                    sx={{ color: "#cbd5e1", "&.Mui-checked": { color: "#0f449e" } }}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", pr: 1 }}>
                    <Typography sx={{ fontWeight: 700, color: "#334155", fontSize: "14px" }}>{brand}</Typography>
                    <Typography sx={{ color: "#94a3b8", fontSize: "12px", fontWeight: 800 }}>{brandCounts[brand] || 0}</Typography>
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

      <Box sx={{ p: 2, borderRadius: "20px", backgroundColor: "#f8fafc", border: "1px solid rgba(148,163,184,0.12)", mb: 3 }}>
        <Typography sx={{ fontWeight: 800, color: "#0f172a", mb: 1.4 }}>Раздел</Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
          <Chip icon={<AccessibilityNewIcon />} label={`${formattedGenders.length} варианта`} sx={{ bgcolor: "#fff", color: "#0f449e", fontWeight: 800 }} />
          <Chip label={`${selectedGenders.length} выбрано`} sx={{ bgcolor: "#fff", color: "#0f172a", fontWeight: 800 }} />
        </Stack>

        <FormGroup>
          {formattedGenders.map((gender) => (
            <FormControlLabel
              key={gender}
              control={
                <Checkbox
                  checked={selectedGenders.some((selectedGender) => selectedGender.toLowerCase() === gender.toLowerCase())}
                  onChange={() => onGenderChange(gender)}
                  sx={{ color: "#cbd5e1", "&.Mui-checked": { color: "#0f449e" } }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", pr: 1 }}>
                  <Typography sx={{ fontWeight: 700, color: "#334155", fontSize: "14px" }}>{gender}</Typography>
                  <Typography sx={{ color: "#94a3b8", fontSize: "12px", fontWeight: 800 }}>{genderCounts[gender] || 0}</Typography>
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
          ))}
        </FormGroup>
      </Box>

      <Box sx={{ p: 2, borderRadius: "20px", backgroundColor: "#f8fafc", border: "1px solid rgba(148,163,184,0.12)" }}>
        <Typography sx={{ fontWeight: 800, color: "#0f172a", mb: 1.4 }}>Размер</Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
          <Chip icon={<StraightenIcon />} label={`${formattedSizes.length} размеров`} sx={{ bgcolor: "#fff", color: "#0f449e", fontWeight: 800 }} />
          <Chip label={`${selectedSizes.length} выбрано`} sx={{ bgcolor: "#fff", color: "#0f172a", fontWeight: 800 }} />
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ maxHeight: 220, overflowY: "auto", pr: 0.5 }}>
          {formattedSizes.map((size) => {
            const isSelected = selectedSizes.some((selectedSize) => String(selectedSize).toLowerCase() === String(size).toLowerCase());

            return (
              <Chip
                key={size}
                label={`${size} · ${sizeCounts[size] || 0}`}
                clickable
                onClick={() => onSizeChange(size)}
                sx={{
                  bgcolor: isSelected ? "#0f449e" : "#fff",
                  color: isSelected ? "#fff" : "#334155",
                  fontWeight: 800,
                  borderRadius: "999px",
                  border: isSelected ? "none" : "1px solid rgba(148,163,184,0.16)",
                }}
              />
            );
          })}
        </Stack>
      </Box>

      <Box
        sx={{
          mt: 3,
          borderRadius: "24px",
          background:
            "linear-gradient(160deg, rgba(15,23,42,0.94) 0%, rgba(15,68,158,0.88) 50%, rgba(37,99,235,0.80) 100%), url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&auto=format&fit=crop&w=800') center/cover",
          color: "#fff",
          p: 2.5,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 24px 48px rgba(15,23,42,0.22)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)",
            pointerEvents: "none",
          }}
        />

        <Typography sx={{ position: "relative", fontSize: "12px", fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.72)", mb: 0.8 }}>
          {marketingCard.eyebrow}
        </Typography>
        <Typography variant="h6" sx={{ position: "relative", fontWeight: 900, mb: 1, lineHeight: 1.25 }}>
          {marketingCard.title}
        </Typography>
        <Typography sx={{ position: "relative", color: "rgba(255,255,255,0.84)", fontSize: "14px", lineHeight: 1.6, mb: 2 }}>
          {marketingCard.description}
        </Typography>

        <Box sx={{ position: "relative", display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          <Chip label={marketingCard.secondaryLabel} sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff", fontWeight: 800 }} />
          <Chip label={`${marketingStats.newCount} новинок`} sx={{ bgcolor: "rgba(255,255,255,0.10)", color: "#fff", fontWeight: 800 }} />
        </Box>

        <Button
          variant="contained"
          onClick={marketingCard.primaryAction || undefined}
          disabled={!marketingCard.primaryAction}
          sx={{
            position: "relative",
            bgcolor: "#fff",
            color: "#0f172a",
            borderRadius: "999px",
            fontWeight: 900,
            px: 2.5,
            "&:hover": { bgcolor: "#e2e8f0" },
            "&.Mui-disabled": {
              bgcolor: "rgba(255,255,255,0.78)",
              color: "#334155",
            },
          }}
        >
          {marketingCard.primaryLabel}
        </Button>
      </Box>
    </Box>
  );
}

export default memo(Sidebar);
