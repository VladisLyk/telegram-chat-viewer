import { useState } from 'react';
import {
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stepper,
    Step,
    StepLabel,
    Button,
    CircularProgress,
    Box
} from '@mui/material';
import { api } from '@/lib/api';
import MyDialog from './MyDialog';
import { enqueueSnackbar } from 'notistack';

export default function ConnectAccountDialog({ open, onClose }) {
    const [step, setStep] = useState(0);
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [phoneCodeHash, setPhoneCodeHash] = useState("");
    const [loading, setLoading] = useState(false);

    const steps = ["Введення телефону", "Введення коду", "2FA пароль"];

    const handleNext = async () => {
        setLoading(true);
        try {
            if (step === 0) {
                const res = await api.post('telegram/connect/send-code', { phone });
                setPhoneCodeHash(res.data.phone_code_hash);
                enqueueSnackbar({
                    variant: "info",
                    message: "Код відправлено до вашого профілю Telegram"
                });
                setStep(1);
            } else if (step === 1) {
                await api.post('telegram/connect/verify-code', {
                    phone,
                    code,
                    phone_code_hash: phoneCodeHash,
                });
                enqueueSnackbar({
                    variant: "success",
                    message: "Акаунт підключено!"
                });
                handleClose(true);
            } else if (step === 2) {
                await api.post('telegram/connect/verify-password', {
                    phone,
                    code,
                    phone_code_hash: phoneCodeHash,
                    password,
                });
                enqueueSnackbar({
                    variant: "success",
                    message: "Акаунт підключено після введення пароля!"
                });
                handleClose(true);
            }
        } catch (err) {
            console.error(err);
            const detail = err.response?.data?.detail || "";
            if (step === 1 && err.response?.status === 400) {
                setStep(2);
            } else {
                enqueueSnackbar({
                    variant: "error",
                    message: detail || "Сталася помилка. Спробуйте ще раз."
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = (reload = false) => {
        setStep(0);
        setPhone("");
        setCode("");
        setPassword("");
        setPhoneCodeHash("");
        onClose();
        if (reload) {
            window.location.reload(); // оновлюємо сторінку після підключення
        }
    };

    return (
        <MyDialog open={open} onClose={() => handleClose(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Підключення акаунту</DialogTitle>
            <DialogContent>
                <Stepper activeStep={step} alternativeLabel sx={{ mb: 2 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                {step === 0 && (
                    <TextField
                        label="Номер телефону"
                        fullWidth
                        margin="normal"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                )}
                {step === 1 && (
                    <TextField
                        label="Код із Telegram"
                        fullWidth
                        margin="normal"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                )}
                {step === 2 && (
                    <TextField
                        label="Пароль для 2FA"
                        fullWidth
                        margin="normal"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose(false)} disabled={loading}>Скасувати</Button>
                <Box sx={{ position: "relative" }}>
                    <Button onClick={handleNext} disabled={loading}>
                        {step === 2 ? "Підключити" : "Далі"}
                    </Button>
                    {loading && (
                        <CircularProgress
                            size={24}
                            sx={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                marginTop: "-12px",
                                marginLeft: "-12px",
                            }}
                        />
                    )}
                </Box>
            </DialogActions>
        </MyDialog>
    );
}
