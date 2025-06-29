import { useState, useEffect } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Button, Divider } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddLinkIcon from '@mui/icons-material/AddLink';
import LogoutIcon from '@mui/icons-material/Logout';
import UserStorage from '@/lib/user';
import ConnectAccountDialog from './ConnectAccountDialog';
import { api } from '@/lib/api';
import { useRouter } from 'next/router';
import { enqueueSnackbar } from 'notistack';

export default function Sidebar() {
    const [activeTab, setActiveTab] = useState(0);
    const [user, setUser] = useState({ id: "0", username: "" });
    const [dialogOpen, setDialogOpen] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await api.post('auth/logout');
            UserStorage.clearUserData();
            enqueueSnackbar("Ви вийшли з акаунту", { variant: "success" });
            router.push("/")
        } catch (error) {
            console.error(error);
            enqueueSnackbar("Не вдалося виконати вихід", { variant: "error" });
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const data = UserStorage.getUserData();
            if (data) setUser(data);
        }
    }, []);

    const handleAddAccount = () => {
        setDialogOpen(true);
    };

    return (
        <>
            <Drawer
                variant="permanent"
                sx={{
                    width: 300,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: 300,
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '100vh',
                    },
                }}
            >
                <Box pt={2} width={"100%"}>
                    <Box sx={{ px: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            User ID: {user.id}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold" lineHeight={1}>
                            {user.username}
                        </Typography>
                    </Box>
                    <List>
                        <ListItem button selected={activeTab === 0} onClick={() => setActiveTab(0)}>
                            <ListItemIcon>
                                <AccountCircleIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Мої акаунти"
                                primaryTypographyProps={{
                                    fontWeight: activeTab === 0 ? 'bold' : 'normal',
                                }}
                            />
                        </ListItem>
                        <ListItem button onClick={handleAddAccount}>
                            <ListItemIcon>
                                <AddLinkIcon />
                            </ListItemIcon>
                            <ListItemText primary="Підключити аккаунт" />
                        </ListItem>
                    </List>
                </Box>
                <Box sx={{ p: 2 }}>
                    <Divider sx={{ mb: 1 }} />
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutIcon />}
                        fullWidth
                        onClick={handleLogout}
                    >
                        Вийти
                    </Button>
                </Box>
            </Drawer>

            <ConnectAccountDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
        </>
    );
}
