import { useState } from "react";
import { Alert, Box, Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

import AuthShell from "./AuthShell";
import { useApp } from "../context/app-context";
import { registerUser } from "../lib/api";

function RegisterPage() {
  const navigate = useNavigate();
  const { completeAuth } = useApp();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    setFormData((currentForm) => ({ ...currentForm, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const authPayload = await registerUser(formData);
      completeAuth(authPayload);
      navigate("/");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Регистрация"
      title="Создай свой профиль"
      subtitle="Сохраняй любимые товары, управляй покупками и собирай свой каталог без лишней суеты."
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {error && <Alert severity="error" sx={{ borderRadius: "16px" }}>{error}</Alert>}

        <TextField
          label="Имя пользователя"
          name="username"
          fullWidth
          required
          value={formData.username}
          onChange={handleChange}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "18px", bgcolor: "#fff" } }}
        />
        <TextField
          label="E-mail"
          name="email"
          type="email"
          fullWidth
          required
          value={formData.email}
          onChange={handleChange}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "18px", bgcolor: "#fff" } }}
        />
        <TextField
          label="Пароль"
          name="password"
          type="password"
          fullWidth
          required
          value={formData.password}
          onChange={handleChange}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "18px", bgcolor: "#fff" } }}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          fullWidth
          sx={{ bgcolor: "#0f449e", py: 1.7, borderRadius: "18px", fontWeight: 900, boxShadow: "0 18px 32px rgba(15,68,158,0.22)", "&:hover": { bgcolor: "#0b3376" } }}
        >
          {isSubmitting ? "Создаем аккаунт..." : "Создать аккаунт"}
        </Button>

        <Button variant="text" fullWidth onClick={() => navigate("/login")} sx={{ color: "#64748b", fontWeight: 800, textTransform: "none" }}>
          Уже есть аккаунт? Войти
        </Button>
      </Box>
    </AuthShell>
  );
}

export default RegisterPage;
