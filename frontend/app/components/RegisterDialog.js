import { useState } from "react";
import { Box, Button, DialogContent, Stack, TextField, Typography, CircularProgress } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { api } from "@/lib/api";
import MyDialog from "./MyDialog";

export default function RegisterDialog(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setLoading(true);
        try {
            await api.post("auth/register", {
                email,
                username: email.split("@")[0], // використовуємо частину до @ як username
                hashed_password: password,
            });
            enqueueSnackbar("Реєстрація успішна! Можете увійти.", { variant: "success" });
            handleClose();
        } catch (error) {
            console.error(error);
            enqueueSnackbar(error.response?.data?.detail || "Помилка реєстрації", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail("");
        setPassword("");
        props.onClose();
    };

    return (
        <MyDialog maxWidth="xs" fullWidth {...props}>
            <DialogContent>
                <Stack gap={3}>
                    <Box textAlign="center">
                        <Typography color="primary" variant="h5" fontWeight={500} textTransform="uppercase">
                            Зареєструватись
                        </Typography>
                        <Typography>Заповніть форму нижче</Typography>
                    </Box>
                    <Stack gap={1}>
                        <TextField
                            label="Електронна пошта"
                            type="email"
                            variant="outlined"
                            fullWidth
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <TextField
                            label="Пароль"
                            type="password"
                            variant="outlined"
                            fullWidth
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Box position="relative">
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ mt: 2 }}
                                onClick={handleRegister}
                                disabled={loading}
                            >
                                Зареєструватись
                            </Button>
                            {loading && (
                                <CircularProgress
                                    size={24}
                                    sx={{
                                        color: "primary.main",
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        marginTop: "-12px",
                                        marginLeft: "-12px",
                                    }}
                                />
                            )}
                        </Box>
                    </Stack>
                </Stack>
            </DialogContent>
        </MyDialog>
    );
}
