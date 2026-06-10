import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { useLocation, useNavigate } from "react-router-dom";

import { useApp } from "../context/app-context";

const hiddenPaths = ["/login", "/register"];

function resolveNavValue(pathname, isAdmin) {
  if (pathname.startsWith("/favorites")) return "/favorites";
  if (pathname.startsWith("/orders")) return "/orders";
  if (pathname.startsWith("/profile")) return "/profile";
  if (pathname.startsWith("/admin") && isAdmin) return "/admin";
  return "/";
}

function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, user } = useApp();

  if (hiddenPaths.some((path) => location.pathname.startsWith(path))) {
    return null;
  }

  const actions = [
    { label: "Главная", value: "/", icon: <HomeOutlinedIcon /> },
    { label: "Избранное", value: "/favorites", icon: <FavoriteBorderIcon /> },
    { label: "Заказы", value: user ? "/orders" : "/login", icon: <ReceiptLongOutlinedIcon /> },
    { label: "Профиль", value: user ? "/profile" : "/login", icon: <PersonOutlineIcon /> },
  ];

  if (isAdmin) {
    actions.push({ label: "Админ", value: "/admin", icon: <ShieldOutlinedIcon /> });
  }

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1200,
          display: { xs: "block", md: "none" },
          borderTop: "1px solid rgba(148,163,184,0.18)",
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(18px)",
          pb: "env(safe-area-inset-bottom)",
        }}
      >
        <BottomNavigation
          showLabels
          value={resolveNavValue(location.pathname, isAdmin)}
          onChange={(_, value) => navigate(value)}
          sx={{
            height: 58,
            background: "transparent",
            "& .MuiBottomNavigationAction-root": {
              minWidth: 0,
              padding: "6px 0 5px",
              color: "#64748b",
            },
            "& .MuiSvgIcon-root": {
              fontSize: 21,
            },
            "& .Mui-selected": {
              color: "#0f449e",
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.66rem",
              fontWeight: 700,
            },
          }}
        >
          {actions.map((action) => (
            <BottomNavigationAction
              key={`${action.label}-${action.value}`}
              label={action.label}
              value={action.value}
              icon={action.icon}
            />
          ))}
        </BottomNavigation>
      </Paper>
      <Paper sx={{ height: "calc(58px + env(safe-area-inset-bottom))", display: { xs: "block", md: "none" }, visibility: "hidden" }} />
    </>
  );
}

export default MobileBottomNav;
