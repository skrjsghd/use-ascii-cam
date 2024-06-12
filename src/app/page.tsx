"use client";

import { useEffect, useRef, useState } from "react";

const hangulChars = "뷁별밥방뷰부ㅂㅅㅇㅡㅣ";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvaseRef = useRef<HTMLCanvasElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (!start) return;
    const capturing = setInterval(drawToCanvas, 1000 / 25);
    return () => {
      clearInterval(capturing);
    };
  }, [start]);

  const startup = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 400,
        height: 400,
      },
      audio: false,
    });
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
    setStart(true);
  };
  const drawToCanvas = () => {
    if (!videoRef.current || !canvaseRef.current) return;
    const canvas = canvaseRef.current;
    const video = videoRef.current;
    const context = canvas.getContext("2d", {
      willReadFrequently: true,
    });
    canvas.width = 100;
    canvas.height = 100;

    if (!context) return;
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);

    if (!imageData) return;
    const data = imageData.data;

    const ascii: string[] = [];
    for (let i = 0; i < data.length; i += 4) {
      const grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const hangulCharIndex = Math.floor(
        (grayscale / 255) * hangulChars.length
      );
      ascii.push(hangulChars[hangulCharIndex]);
    }
    let result = "";
    for (let i = 0; i < ascii.length; i += canvas.width) {
      result += ascii.slice(i, i + canvas.width).join("") + "\n";
    }
    if (!filterRef.current) return;
    filterRef.current.innerHTML = result;
  };

  return (
    <main className="h-dvh flex flex-col items-center justify-center">
      <div className="mb-6 text-center max-w-lg">
        <h1 className="text-2xl font-bold">Use Cam with Ascii</h1>
        <p className="text-zinc-400">
          Now you are in the world of Ascii Art. Enjoy it!
        </p>
      </div>
      <div className="flex">
        <video
          ref={videoRef}
          id="video"
          autoPlay
          width={400}
          height={400}
          hidden
        ></video>
        <canvas ref={canvaseRef} hidden></canvas>
        <div
          ref={filterRef}
          className="whitespace-pre text-[6px] leading-none font-mono "
        ></div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={startup}>시작하기</button>
        <button onClick={() => setStart(false)}>멈춰랏!</button>
      </div>
    </main>
  );
}
