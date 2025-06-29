import { createTheme } from '@mui/material/styles';
import { Rubik } from 'next/font/google';

const geints = Rubik({
    subsets: ['latin', 'cyrillic'],
    weight: ['300', '400', '500', '700', '900'],
});

export const theme = createTheme({
    palette: {
        primary: {
            main: '#0088cc', // Основний синій колір Telegram
            contrastText: '#ffffff', // Білий текст
        },
        secondary: {
            main: '#d1e8ff', // Світло-блакитний для акцентів
        },
        success: {
            main: '#4caf50', // Зелений для успіху
            contrastText: '#ffffff', // Білий текст
        },
        error: {
            main: '#f44336', // Червоний для помилок
            contrastText: '#ffffff', // Білий текст
        },
        warning: {
            main: '#ff9800', // Помаранчевий для попереджень
            contrastText: '#ffffff', // Білий текст
        },
        background: {
            default: '#f3f3f3', // Світло-сірий фон
            paper: '#ffffff', // Білий фон для карток
        },
        text: {
            primary: '#000000', // Чорний текст
            secondary: '#5f6368', // Сірий текст
        },
    },
    typography: {
        fontFamily: geints.style.fontFamily,
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: "12px"
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: "8px",
                }
            }
        },
        MuiBackdrop: {
            styleOverrides: {
                root: {
                    backgroundColor: "rgba(0,0,0,0.1)",
                    backdropFilter: "blur(5px)"
                }
            }
        },

        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: "20px",
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: "20px",
                },
            },
        },
    }
});