import { Box, Button, Dialog, DialogContent, Slide, Stack, TextField, Typography, useMediaQuery, Zoom } from "@mui/material";
import Image from "next/image";
import { animate, stagger, createAnimatable, utils } from 'animejs';
import React, { useEffect, useRef, useState } from "react";
import generateBlocks from "@/lib/generateBlocks";
import MyDialog from "@/components/MyDialog";
import LoginDialog from "@/components/LoginDialog";
import RegisterDialog from "@/components/RegisterDialog";
import Head from "next/head";
import { useRouter } from "next/router";
import UserStorage from "@/lib/user";

function AnimatedBackground({ blocks, blocksRefs, boxRef }) {
    return (
        <Box ref={boxRef} position={"absolute"} width={"100%"} height={"100%"} sx={{ left: 0, top: 0, zIndex: 0, opacity: 0.3 }}>
            {blocks.current.map((block, i) => (
                <Box
                    key={block.id}
                    ref={el => (blocksRefs.current[i] = el)}
                    sx={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        width: block.size,
                        height: block.size,
                        bgcolor: block.color,
                        opacity: block.opacity,
                        filter: `blur(${block.blur}px)`,
                        borderRadius: block.borderRadius,
                        pointerEvents: 'none',
                        transform: `translate(-50%, -50%) rotate(${block.rotate}deg)`,
                        zIndex: block.zIndex,
                        border: block.border,
                        transition: 'box-shadow 0.3s',
                        boxShadow: Math.random() > 0.7 ? `0 0 ${utils.random(10, 40)}px ${block.color}` : 'none',
                    }}
                />
            ))}
        </Box>
    );
}

function Logo({ logo }) {
    return (
        <Image ref={logo} alt="telegram logo" width={100} height={100} src={"https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg"} />
    );
}

function Title({ titleRef, titleText }) {
    return (
        <Typography
            ref={titleRef}
            mt={2}
            variant="h4"
            fontWeight="bold"
            textTransform="uppercase"
            sx={{ display: 'flex' }}
        >
            {titleText.split("").map((letter, idx) => (
                <span key={idx} style={{ opacity: 0, display: 'inline-block' }}>
                    {letter === " " ? '\u00A0' : letter}
                </span>
            ))}
        </Typography>
    );
}

function Subtitle({ subtitleRef, isMobile }) {
    return (
        <Typography
            ref={subtitleRef}
            maxWidth={isMobile ? "80%" : "100%"}
            textAlign={isMobile ? "center" : "inherit"}
            fontWeight={"300"}
            color="text.secondary"
            textTransform={"uppercase"}
        >
            Ваш універсальний інструмент перегляду чатів Telegram
        </Typography>
    );
}

function Actions({ actionsRef }) {
    const [openLoginDialog, setOpenLoginDialog] = useState(false);
    const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const userData = UserStorage.getUserData();
        setIsAuthenticated(!!userData);
    }, []);

    const handleLoginClick = () => setOpenLoginDialog(true);
    const handleRegisterClick = () => setOpenRegisterDialog(true);
    const handleCloseLoginDialog = () => setOpenLoginDialog(false);
    const handleCloseRegisterDialog = () => setOpenRegisterDialog(false);

    const handleGoToCabinet = () => router.push('/profile');
    const handleLogout = () => {
        UserStorage.clearUserData();
        setIsAuthenticated(false);
        router.push('/');
    };

    return (
        <Stack direction={"row"} gap={4} ref={actionsRef}>
            <LoginDialog open={openLoginDialog} onClose={handleCloseLoginDialog} />
            <RegisterDialog open={openRegisterDialog} onClose={handleCloseRegisterDialog} />
            {isAuthenticated ? (
                <>
                    <Button variant="contained" onClick={handleGoToCabinet}>
                        Кабінет
                    </Button>
                    <Button color="error" variant="outlined" onClick={handleLogout}>
                        Вийти
                    </Button>
                </>
            ) : (
                <>
                    <Button variant="outlined" onClick={handleLoginClick}>
                        Увійти
                    </Button>
                    <Button color="error" variant="outlined" onClick={handleRegisterClick}>
                        Зареєструватись
                    </Button>
                </>
            )}
        </Stack>
    );
}

export default function IndexPage() {
    const logo = useRef();
    const actionsRef = useRef();
    const boxRef = useRef();
    const titleRef = useRef();
    const subtitleRef = useRef();
    const titleText = "chat parser";
    const boundsRef = useRef(null);
    const animatableRef = useRef(null);

    const blocksRefs = useRef([]);
    const blocks = useRef([]);
    const [openLoginDialog, setOpenLoginDialog] = useState(false)
    const [openRegisterDialog, setOpenRegisterDialog] = useState(false)

    const isMobile = useMediaQuery("(max-width: 540px)");

    useEffect(() => {
        const boxEl = boxRef.current;
        if (!boxEl) return;

        const bounds = boxEl.getBoundingClientRect();
        boundsRef.current = bounds;

        blocks.current = generateBlocks(bounds);

        forceUpdate();
    }, []);

    const [, setRerender] = useState(0);
    function forceUpdate() {
        setRerender(x => x + 1);
    }

    useEffect(() => {
        const boxEl = boxRef.current;
        if (!boxEl || !blocks.current.length) return;

        boundsRef.current = boxEl.getBoundingClientRect();

        animatableRef.current = createAnimatable(boxEl, {
            x: 0,
            y: 0,
            ease: 'out(3)',
        });

        const animatables = blocksRefs.current.map((ref, i) =>
            ref
                ? createAnimatable(ref, {
                    x: blocks.current[i].x,
                    y: blocks.current[i].y,
                    ease: 'out(3)',
                })
                : null
        );

        const refreshBounds = () => {
            boundsRef.current = boxEl.getBoundingClientRect();
        };
        window.addEventListener('resize', refreshBounds);

        const onMouseMove = e => {
            const bounds = boundsRef.current;
            if (!bounds) return;
            const { width, height, left, top } = bounds;
            const hw = width / 2;
            const hh = height / 2;
            const x = utils.clamp(e.clientX - left - hw, -hw, hw);
            const y = utils.clamp(e.clientY - top - hh, -hh, hh);
            animatableRef.current.x(x * 0.15);
            animatableRef.current.y(y * 0.15);

            animatables.forEach((anim, i) => {
                if (!anim) return;
                const factor = blocks.current[i].speed;
                anim.x(blocks.current[i].x + x * factor);
                anim.y(blocks.current[i].y + y * factor);
            });
        };

        window.addEventListener('mousemove', onMouseMove);

        if (logo.current) {
            animate(logo.current, {
                opacity: [0, 1],
                scale: [0.8, 1],
                duration: 1000,
                delay: stagger(100),
                easing: 'easeInOutQuad',
            });
        }

        if (actionsRef.current) {
            animate(actionsRef.current, {
                opacity: [0, 1],
                delay: stagger(150),
                easing: 'easeInOutQuad',
            });
        }

        if (titleRef.current) {
            animate(titleRef.current.querySelectorAll("span"), {
                opacity: [0, 1],
                translateY: [20, 0],
                easing: "easeOutExpo",
                duration: 600,
                delay: stagger(70),
            });
        }

        if (subtitleRef.current) {
            animate(subtitleRef.current, {
                opacity: [0, 1],
                keyframes: [
                    {
                        y: [20, 0]
                    }
                ],
                duration: 1000,
                delay: stagger(100),
                easing: 'easeInOutQuad',
            });
        }

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', refreshBounds);
        };
    }, [blocks.current.length]);

    return (
        <>
            <Head>
                <title>Chat Parser</title>
            </Head>
            <Stack width={"100%"} gap={3} height={"100vh"} alignItems={"center"} justifyContent={"center"} sx={{ position: 'relative', overflow: 'hidden' }}>
                <AnimatedBackground blocks={blocks} blocksRefs={blocksRefs} boxRef={boxRef} />
                <Stack alignItems={"center"} sx={{ zIndex: 2 }}>
                    <Logo logo={logo} />
                    <Title titleRef={titleRef} titleText={titleText} />
                    <Subtitle subtitleRef={subtitleRef} isMobile={isMobile} />
                </Stack>
                <Actions actionsRef={actionsRef} />
            </Stack>
        </>
    );
}