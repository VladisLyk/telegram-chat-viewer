
import "@/globals.css";
import { theme } from "@/theme";
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from "notistack";

export default function MyApp({ Component, pageProps }) {
    return (
        <SnackbarProvider maxSnack={5}>
            <ThemeProvider theme={theme}>
                <Component {...pageProps} />
            </ThemeProvider>
        </SnackbarProvider>
    );
}
