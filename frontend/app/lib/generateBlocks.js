import { utils } from "animejs";
const BLOCKS_COUNT = 20;

export default function generateBlocks(bounds) {
    const width = bounds?.width || window.innerWidth;
    const height = bounds?.height || window.innerHeight;
    const blocks = [];
    const minDistance = 120; // зменшено для більш щільного, але не накладеного розміщення

    for (let i = 0; i < BLOCKS_COUNT; i++) {
        let attempts = 0;
        let block;
        do {
            const size = utils.random(20, 90);
            // Розподіляємо блоки по всій площині контейнера
            const x = utils.random(-width / 2 + size / 2, width / 2 - size / 2);
            const y = utils.random(-height / 2 + size / 2, height / 2 - size / 2);
            const borderRadius = utils.random(30, 50) + "%";
            const alpha = utils.random(0.15, 0.8);
            const blur = utils.random(6, 32);
            const color = `rgba(${utils.random(80, 255)},${utils.random(80, 255)},${utils.random(180, 255)},${alpha})`;
            const zIndex = Math.floor(utils.random(0, 2));
            const rotate = utils.random(0, 360);
            const border = Math.random() > 0.8
                ? `${utils.random(1, 4)}px solid rgba(${utils.random(100, 255)},${utils.random(100, 255)},${utils.random(100, 255)},${utils.random(0.2, 0.5)})`
                : "none";

            block = {
                id: i,
                opacity: alpha,
                blur,
                size,
                x,
                y,
                color,
                speed: utils.random(0.05, 0.2),
                borderRadius,
                zIndex,
                rotate,
                border,
            };

            const isTooClose = blocks.some(existing => {
                const dx = existing.x - block.x;
                const dy = existing.y - block.y;
                const minDist = (existing.size + block.size) / 2 + minDistance;
                return Math.sqrt(dx * dx + dy * dy) < minDist;
            });

            if (!isTooClose) break;
            attempts++;
        } while (attempts < 200);

        blocks.push(block);
    }

    return blocks;
}