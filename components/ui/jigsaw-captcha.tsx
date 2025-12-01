'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Loader2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

interface JigsawCaptchaProps {
    onVerify: (isValid: boolean) => void;
    onRefresh?: () => void;
    width?: number;
    height?: number;
    className?: string;
}

export function JigsawCaptcha({
    onVerify,
    onRefresh,
    width = 320,
    height = 160,
    className
}: JigsawCaptchaProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const blockRef = useRef<HTMLCanvasElement>(null);
    const [sliderValue, setSliderValue] = useState([0]);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('loading');
    const [targetX, setTargetX] = useState(0);
    const [imgSrc, setImgSrc] = useState('');

    // Puzzle piece constants
    const l = 42; // side length
    const r = 10; // radius
    const PI = Math.PI;
    const L = l + r * 2; // actual width

    const getRandomImg = () => {
        // Use picsum for random images, or a local set
        return `https://picsum.photos/${width}/${height}?random=${Math.random()}`;
    };

    const initImg = useCallback(() => {
        setStatus('loading');
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = getRandomImg();
        img.onload = () => {
            setImgSrc(img.src);
            draw(img);
            setStatus('idle');
        };
        img.onerror = () => {
            setStatus('error');
        };
    }, [width, height]);

    useEffect(() => {
        initImg();
    }, [initImg]);

    const draw = (img: HTMLImageElement) => {
        const canvas = canvasRef.current;
        const block = blockRef.current;
        if (!canvas || !block) return;

        const ctx = canvas.getContext('2d');
        const blockCtx = block.getContext('2d');
        if (!ctx || !blockCtx) return;

        // Random position
        const x = Math.random() * (width - L - 100) + 100; // Keep away from left edge
        const y = Math.random() * (height - L - 10) + 10;
        setTargetX(x);

        // Clean
        ctx.clearRect(0, 0, width, height);
        blockCtx.clearRect(0, 0, width, height);

        // Draw background
        ctx.drawImage(img, 0, 0, width, height);

        // Draw hole
        drawPath(ctx, x, y, 'fill');
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();

        // Draw block
        // 1. Draw the full image on block canvas
        // 2. Clip the path at (x, y)
        // 3. Extract the clipped part
        // 4. Clear block canvas and put the extracted part at (0, y)

        // Alternative: Draw path at (0, y) on block canvas, clip, then draw image shifted by -x

        // Let's stick to the extraction method but be careful with coordinates

        // Temp canvas for block
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;

        drawPath(tempCtx, x, y, 'clip');
        tempCtx.drawImage(img, 0, 0, width, height);

        // Extract the piece
        const y_offset = y - r * 2; // Adjust for top ear
        // Ensure we capture enough height
        const ImageData = tempCtx.getImageData(x, y_offset, L, L + r * 2);

        // Resize block canvas to match piece size?
        // No, let's keep block canvas full size but transparent, and draw the piece at x=0
        block.width = width; // Reset width to clear

        // Put data at x=0, y=y_offset
        blockCtx.putImageData(ImageData, 0, y_offset);
    };

    const drawPath = (ctx: CanvasRenderingContext2D, x: number, y: number, operation: 'fill' | 'clip') => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x + l / 2, y - r + 2, r, 0.72 * PI, 2.26 * PI);
        ctx.lineTo(x + l, y);
        ctx.arc(x + l + r - 2, y + l / 2, r, 1.21 * PI, 2.78 * PI);
        ctx.lineTo(x + l, y + l);
        ctx.lineTo(x, y + l);
        ctx.arc(x + r - 2, y + l / 2, r + 0.4, 2.76 * PI, 1.24 * PI, true);
        ctx.lineTo(x, y);
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.stroke();
        ctx.globalCompositeOperation = 'destination-over';
        if (operation === 'fill') {
            ctx.fill();
        } else {
            ctx.clip();
        }
    };

    const handleSliderChange = (value: number[]) => {
        if (status === 'success') return;
        setSliderValue(value);
    };

    const handleSliderCommit = (value: number[]) => {
        if (status === 'success') return;

        const finalX = value[0];
        // Allow 5px error margin
        if (Math.abs(finalX - targetX) < 5) {
            setStatus('success');
            onVerify(true);
        } else {
            setStatus('error');
            onVerify(false);
            // Reset after delay
            setTimeout(() => {
                setStatus('idle');
                setSliderValue([0]);
            }, 1000);
        }
    };

    const handleRefresh = () => {
        setSliderValue([0]);
        initImg();
        if (onRefresh) onRefresh();
    };

    return (
        <div className={cn("relative w-full max-w-[320px] select-none", className)}>
            <div className="relative overflow-hidden rounded-lg shadow-sm bg-gray-100" style={{ width, height }}>
                {status === 'loading' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                )}

                <canvas ref={canvasRef} width={width} height={height} className="block" />
                <canvas
                    ref={blockRef}
                    width={width}
                    height={height}
                    className="absolute top-0 left-0 pointer-events-none"
                    style={{
                        transform: `translateX(${sliderValue[0]}px)`,
                    }}
                />

                <div className="absolute top-2 right-2 z-10">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="p-1.5 bg-white/80 backdrop-blur rounded-md hover:bg-white transition-colors shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4 text-gray-600" />
                    </button>
                </div>

                {status === 'success' && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-20 animate-in fade-in">
                        <div className="flex flex-col items-center text-green-600">
                            <CheckCircle2 className="w-10 h-10 mb-2" />
                            <span className="font-bold">验证通过</span>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-20 animate-in fade-in duration-200 pointer-events-none">
                        <div className="flex flex-col items-center text-white drop-shadow-md">
                            <XCircle className="w-10 h-10 mb-2" />
                            <span className="font-bold">验证失败</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 relative">
                <div className="absolute inset-0 bg-gray-100 rounded-full h-10 border border-gray-200">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-xs text-gray-400 select-none pointer-events-none">
                        向右滑动填充拼图
                    </div>
                </div>
                <Slider
                    value={sliderValue}
                    min={0}
                    max={width - L} // Don't slide past the end
                    step={1}
                    onValueChange={handleSliderChange}
                    onValueCommit={handleSliderCommit}
                    className="relative z-10 py-3" // Add padding to make touch target larger
                // We need to customize the slider thumb to match the style if possible, 
                // but default shadcn slider is fine for now.
                />
            </div>
        </div>
    );
}
