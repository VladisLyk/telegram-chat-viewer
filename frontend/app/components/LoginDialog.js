import { Box, Button, DialogContent, Stack, TextField, Typography } from "@mui/material";
import MyDialog from "./MyDialog";
import React from "react";
import { useForm } from "react-hook-form";
import { useSnackbar } from "notistack";
import { api } from "@/lib/api";
import UserStorage from "@/lib/user";
import { useRouter } from "next/router";

export default function LoginDialog(props) {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const { enqueueSnackbar } = useSnackbar();

    const onSubmit = async (data) => {
        try {
            const res = await api.post("auth/login", data);
            UserStorage.saveUserData(res.data);
            router.push('/profile')
        } catch (error) {
            enqueueSnackbar({
                variant: "error",
                message: error?.response?.data?.detail || "Помилка під час входу"
            })

        }
    };

    return (
        <MyDialog maxWidth="xs" fullWidth {...props}>
            <DialogContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack gap={3}>
                        <Box textAlign="center">
                            <Typography
                                color="primary"
                                variant="h5"
                                fontWeight={500}
                                textTransform="uppercase"
                            >
                                Увійти в систему
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
                                {...register("email", {
                                    required: "Це поле обов'язкове",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Введіть коректну email-адресу",
                                    },
                                })}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />
                            <TextField
                                label="Пароль"
                                type="password"
                                variant="outlined"
                                fullWidth
                                required
                                {...register("password", {
                                    required: "Це поле обов'язкове",
                                })}
                                error={!!errors.password}
                                helperText={errors.password?.message}
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                sx={{ mt: 2 }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Вхід..." : "Увійти"}
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </DialogContent>
        </MyDialog>
    );
}
