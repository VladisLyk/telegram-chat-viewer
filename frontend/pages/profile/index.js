import Sidebar from "@/components/SideBar";
import { api } from "@/lib/api";
import { Box, Stack, Typography, Card, CardContent, CardActions, Button, Avatar, Grid, CircularProgress } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function TelegramAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await api.get("telegram/accounts");
                setAccounts(res.data?.accounts);
            } catch (error) {
                enqueueSnackbar({
                    variant: "error",
                    message: error.response?.data?.detail || "Виникла помилка під час парсингу аккаунтів."
                });
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleViewChats = (accountId) => {
        router.push(`/profile/account/${accountId}`);
    };

    const handleDisconnect = async (accountId) => {
        try {
            await api.delete(`telegram/accounts/${accountId}`);
            enqueueSnackbar("Акаунт відключено!", { variant: "success" });
            setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
        } catch (error) {
            console.error(error);
            enqueueSnackbar(error.response?.data?.detail || "Не вдалося відключити акаунт.", { variant: "error" });
        }
    };

    return (
        <>
            <Head>
                <title>Список підключених акаунтів</title>
            </Head>
            <Stack direction="row">
                <Sidebar />
                <Box sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h5" fontWeight={"bold"} gutterBottom>
                        Telegram акаунти
                    </Typography>
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={2}>
                            {accounts.map((acc) => (
                                <Grid item xs={12} md={6} lg={4} key={acc.id}>
                                    <Card>
                                        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                            <Avatar
                                                src={acc.avatar || undefined}
                                                alt={acc.username}
                                                sx={{ width: 56, height: 56 }}
                                            />
                                            <Box>
                                                <Typography variant="h6">{acc.name || "Невідомо"}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    @{acc.username || "немає"}<br />
                                                    Телефон: {acc.phone_number}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                        <CardActions>
                                            <Button size="small" onClick={() => handleViewChats(acc.id)}>
                                                Переглянути чати
                                            </Button>
                                            <Button size="small" color="error" onClick={() => handleDisconnect(acc.id)}>
                                                Відключити
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                            {accounts.length === 0 && !loading && (
                                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                                    Акаунтів не знайдено.
                                </Typography>
                            )}
                        </Grid>
                    )}
                </Box>
            </Stack>
        </>
    );
}
