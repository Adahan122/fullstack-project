import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";

import { useApp } from "../context/app-context";

function AuthRequiredDialog() {
  const navigate = useNavigate();
  const { isAuthModalOpen, setIsAuthModalOpen } = useApp();

  const closeModal = () => setIsAuthModalOpen(false);

  return (
    <Dialog
      open={isAuthModalOpen}
      onClose={closeModal}
      PaperProps={{ sx: { borderRadius: "16px", p: 2, maxWidth: "400px" } }}
    >
      <DialogTitle sx={{ textAlign: "center", pb: 0 }}>
        <Box
          sx={{
            display: "inline-flex",
            bgcolor: "#fff3e0",
            color: "#ff9800",
            p: 1.5,
            borderRadius: "50%",
            mb: 2,
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 30 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#1A202C" }}>
          Требуется авторизация
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center" }}>
        <Typography sx={{ color: "#718096", mt: 1 }}>
          Чтобы добавлять товары в корзину, лайкать и оформлять покупки, войдите в свой аккаунт.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ flexDirection: "column", gap: 1, px: 3, pb: 2 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={() => {
            closeModal();
            navigate("/login");
          }}
          sx={{
            bgcolor: "#0f449e",
            borderRadius: "50px",
            fontWeight: "bold",
            py: 1.2,
            "&:hover": { bgcolor: "#0b3376" },
          }}
        >
          Войти
        </Button>
        <Button
          variant="text"
          fullWidth
          onClick={() => {
            closeModal();
            navigate("/register");
          }}
          sx={{ color: "#718096", fontWeight: 600, textTransform: "none" }}
        >
          Еще нет аккаунта? Зарегистрироваться
        </Button>
        <Button fullWidth onClick={closeModal} sx={{ color: "#A0AEC0", textTransform: "none", fontSize: "0.9rem" }}>
          Продолжить просмотр
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AuthRequiredDialog;
