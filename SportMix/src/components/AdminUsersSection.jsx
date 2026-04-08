import { Box, Button, Chip, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography } from "@mui/material";

import { formatCurrency } from "../lib/format";

function AdminUsersSection({ users, onRoleChange, onDeleteUser }) {
  if (users.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: "24px", border: "1px solid rgba(148,163,184,0.12)", bgcolor: "#fff" }}>
        <Typography sx={{ fontWeight: 900, color: "#0f172a", mb: 0.8 }}>
          Никого не нашли
        </Typography>
        <Typography sx={{ color: "#64748b", lineHeight: 1.7 }}>
          Попробуй изменить запрос поиска по имени, email, телефону или адресу.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: "1.4rem", mb: 2.5 }}>
        Управление пользователями
      </Typography>

      <Stack spacing={1.6}>
        {users.map((member) => (
          <Paper key={member.id} elevation={0} sx={{ p: 2.2, borderRadius: "22px", border: "1px solid rgba(148,163,184,0.12)", bgcolor: "#fff" }}>
            <Stack direction={{ xs: "column", xl: "row" }} spacing={2} justifyContent="space-between">
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.8 }}>
                  <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                    {member.username}
                  </Typography>
                  <Chip label={member.role === "admin" ? "Admin" : "Customer"} color={member.role === "admin" ? "warning" : "default"} size="small" sx={{ fontWeight: 800, borderRadius: "999px" }} />
                </Stack>
                <Typography sx={{ color: "#64748b", fontSize: "14px", mb: 0.45 }}>
                  {member.email}
                </Typography>
                <Typography sx={{ color: "#475569", fontSize: "14px" }}>
                  Заказов: {member.ordersCount} · Потратил: {formatCurrency(member.spentTotal)}
                </Typography>
                {(member.phone || member.address) && (
                  <Typography sx={{ color: "#64748b", fontSize: "13px", mt: 0.7 }}>
                    {member.phone || "Телефон не указан"} {member.address ? `· ${member.address}` : ""}
                  </Typography>
                )}
              </Box>

              <Stack direction={{ xs: "column", md: "row" }} spacing={1.2} alignItems={{ md: "center" }} sx={{ width: { xs: "100%", xl: "auto" } }}>
                <FormControl size="small" sx={{ minWidth: 190 }}>
                  <InputLabel>Роль</InputLabel>
                  <Select
                    label="Роль"
                    value={member.role}
                    onChange={(event) => onRoleChange(member, event.target.value)}
                    sx={{ borderRadius: "16px", bgcolor: "#fff" }}
                  >
                    <MenuItem value="customer">Customer</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="outlined" color="error" onClick={() => onDeleteUser(member.id)} sx={{ textTransform: "none", borderRadius: "999px", fontWeight: 800 }}>
                  Удалить
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}

export default AdminUsersSection;
