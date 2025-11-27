"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/common/Button";

type CameraCaptureProps = {
  onCapture: (file: File, previewUrl: string) => void;
};

export const CameraCapture = ({ onCapture }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    const startCamera = async () => {
      const nav = typeof navigator !== "undefined" ? navigator : undefined;
      if (!nav?.mediaDevices?.getUserMedia) {
        setError("Camera not supported in this browser. Use upload fallback.");
        return;
      }
      try {
        const stream = await nav.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setIsReady(true);
        setError(null);
      } catch (err) {
        setError((err as Error).message || "Camera permission denied");
      }
    };

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const width = video.videoWidth || 720;
    const height = video.videoHeight || 480;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Unable to access camera frame");
      return;
    }
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Failed to capture snapshot");
          return;
        }
        const file = new File([blob], `foodsense-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file, dataUrl);
      },
      "image/jpeg",
      0.92
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = typeof reader.result === "string" ? reader.result : "";
      onCapture(file, preview);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-3xl bg-slate-950/60">
        <video ref={videoRef} className="h-full w-full object-cover" playsInline muted autoPlay />
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/70 text-center text-sm text-white/80">
            <p>Grant camera access to capture your plate</p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" onClick={capturePhoto} disabled={!isReady} fullWidth>
          {isReady ? "Capture photo" : "Waiting for camera"}
        </Button>
        <Button type="button" variant="ghost" fullWidth onClick={() => fileInputRef.current?.click()}>
          Upload from files
        </Button>
      </div>
      {error && <p className="text-xs text-amber-300">{error}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};
