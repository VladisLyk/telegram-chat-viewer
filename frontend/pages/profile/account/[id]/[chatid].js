import Sidebar from "@/components/SideBar";
import { api } from "@/lib/api";
import {
    Box,
    Stack,
    Typography,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Paper,
    IconButton,
    Button,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { enqueueSnackbar } from "notistack";
import { useRouter } from "next/router";
import { useState, useCallback, useEffect, useRef } from "react";
import Head from "next/head";
import dayjs from "dayjs";

export default function ChatMessages() {
    const router = useRouter();
    const { id: accountId, chatid: chatId } = router.query;
    const limit = 50;
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [offsetId, setOffsetId] = useState(null);
    const [totalCount, setTotalCount] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const lastFetchedOffsetRef = useRef(null);
    const [resolvedChatId, setResolvedChatId] = useState(null);
    const [firstLoad, setFirstLoad] = useState(true)

    const fetchMessages = useCallback(async () => {
        if (!accountId || !chatId || loading || !hasMore) return;
        if (offsetId === lastFetchedOffsetRef.current && !firstLoad) return;
        lastFetchedOffsetRef.current = offsetId;

        setFirstLoad(false);
        setLoading(true);
        try {
            const params = { limit };
            if (offsetId) params.offset_id = offsetId;

            const res = await api.get(`telegram/accounts/${accountId}/chats/${chatId}/messages`, {
                params,
            });

            const newMessages = res.data.messages;
            const total = res.data.total_count;

            if (typeof total === "number") setTotalCount(total);

            if (!newMessages.length || (messages.length + newMessages.length) >= total) {
                setHasMore(false);
            }

            if (newMessages.length > 0) {
                setMessages(prev => [...prev, ...newMessages]);
                setOffsetId(newMessages[newMessages.length - 1]?.id);
            }
        } catch (error) {
            console.error(error);
            enqueueSnackbar(error.response?.data?.detail || "Не вдалося завантажити повідомлення.", { variant: "error" });
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [accountId, chatId, offsetId, limit, loading, hasMore, messages.length]);

    useEffect(() => {
        setMessages([]);
        setOffsetId(null);
        setTotalCount(null);
        setHasMore(true);
        lastFetchedOffsetRef.current = null;
    }, [accountId, chatId]);

    useEffect(() => {
        if (accountId && chatId) {
            fetchMessages();
        }
    }, [accountId, chatId]);

    useEffect(() => {
        if (chatId) setResolvedChatId(chatId);
    }, [chatId]);

    const handleGoBack = () => {
        router.push(`/profile/account/${accountId}`);
    };

    return (
        <>
            <Head>
                <title>Чат #{resolvedChatId ?? "..."}</title>
            </Head>
            <Stack direction="row">
                <Sidebar />
                <Box sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <IconButton onClick={handleGoBack} sx={{ mr: 1 }}>
                            <ArrowBack />
                        </IconButton>
                        <Typography variant="h5" fontWeight="bold">
                            {resolvedChatId ? `Чат #${resolvedChatId}` : "Завантаження..."}
                        </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                        Відображено {messages.length} з {totalCount ?? "..."} повідомлень
                    </Typography>
                    <List>
                        {messages.map((msg) => (
                            <Box key={msg.id} sx={{ mb: 2 }}>
                                <Paper elevation={2} sx={{ p: 2 }}>
                                    <ListItem alignItems="flex-start" disablePadding>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {msg.sender?.first_name || "Невідомий користувач"}{" "}
                                                    {msg.sender?.username && `(@${msg.sender.username})`}
                                                    {" • "}
                                                    {dayjs(msg.date).format("YYYY-MM-DD HH:mm")}
                                                </Typography>
                                            }
                                            secondary={
                                                <>
                                                    {msg.text ? (
                                                        <Typography variant="body1">{msg.text}</Typography>
                                                    ) : msg.media ? (
                                                        <Typography variant="body2" color="primary">
                                                            📎 Вкладення: {msg.media.type}
                                                        </Typography>
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary">
                                                            <i>(Без тексту)</i>
                                                        </Typography>
                                                    )}
                                                </>
                                            }
                                        />
                                    </ListItem>
                                </Paper>
                            </Box>
                        ))}
                        {messages.length === 0 && !loading && (
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                                Повідомлень не знайдено.
                            </Typography>
                        )}
                    </List>
                    {loading && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                            <CircularProgress />
                        </Box>
                    )}
                    {hasMore && !loading && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={fetchMessages}
                                sx={{ textTransform: "none" }}
                            >
                                Завантажити ще
                            </Button>
                        </Box>
                    )}
                    {!hasMore && messages.length > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 2 }}>
                            Всі повідомлення завантажені.
                        </Typography>
                    )}
                </Box>
            </Stack>
        </>
    );
}
