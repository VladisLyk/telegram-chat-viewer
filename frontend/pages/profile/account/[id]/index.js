import Sidebar from "@/components/SideBar";
import { api } from "@/lib/api";
import { Box, Stack, Typography, List, ListItem, ListItemText, Divider, CircularProgress, IconButton } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";

export default function AccountChats() {
    const router = useRouter();
    const { id: accountId } = router.query;
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!accountId) return;

        const fetch = async () => {
            setLoading(true);
            try {
                const res = await api.get(`telegram/accounts/${accountId}/chats`);
                setChats(res.data.chats);
            } catch (error) {
                console.error(error);
                enqueueSnackbar(error.response?.data?.detail || "Не вдалося завантажити чати.", { variant: "error" });
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [accountId]);

    const handleOpenChat = (chatId) => {
        router.push(`/profile/account/${accountId}/${chatId}`);
    };

    const handleGoBack = () => {
        router.push(`/profile`);
    };

    return (
        <>
            <Head>
                <title>Чати акаунта #{accountId}</title>
            </Head>
            <Stack direction="row">
                <Sidebar />
                <Box sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <IconButton onClick={handleGoBack} sx={{ mr: 1 }}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h5" fontWeight="bold">
                            Чати акаунта #{accountId}
                        </Typography>
                    </Box>
                    {loading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <List>
                            {chats.map((chat) => (
                                <Box key={chat.id}>
                                    <ListItem button onClick={() => handleOpenChat(chat.id)}>
                                        <ListItemText
                                            primary={chat.name || "Без назви"}
                                            secondary={`ID: ${chat.id} (${chat.type})`}
                                        />
                                    </ListItem>
                                    <Divider component="li" />
                                </Box>
                            ))}
                            {chats.length === 0 && (
                                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                                    Чатів не знайдено.
                                </Typography>
                            )}
                        </List>
                    )}
                </Box>
            </Stack>
        </>
    );
}
