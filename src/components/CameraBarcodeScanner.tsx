'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Camera, X, Zap, ZapOff, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';

export interface CameraBarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedText: string) => void;
}

export const CameraBarcodeScanner: React.FC<CameraBarcodeScannerProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [torchSupported, setTorchSupported] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef<boolean>(false);

  // Stop camera and cleanup DOM container
  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isScanningRef.current) {
      try {
        isScanningRef.current = false;
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.warn('Notice stopping camera scanner:', err);
      } finally {
        scannerRef.current = null;
        setCameraActive(false);
        setTorchOn(false);
      }
    }
  }, []);

  // Safe handler on scan detection
  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      // Clean up common barcode prefixes (IMEI:, IMEI 1:, SN:, etc.)
      let cleaned = decodedText.trim();
      cleaned = cleaned.replace(/^(IMEI\s*1?|SN|SERIAL)\s*[:=\-]?\s*/i, '').trim();

      await stopScanner();
      onScanSuccess(cleaned);
      onClose();
    },
    [onScanSuccess, onClose, stopScanner]
  );

  // Toggle torch/flashlight via media track constraints
  const toggleTorch = async () => {
    try {
      const videoEl = document.querySelector('#swapshield-scanner-view video') as HTMLVideoElement | null;
      const stream = videoEl?.srcObject as MediaStream | null;
      const track = stream?.getVideoTracks()[0];

      if (track) {
        const nextState = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState } as MediaTrackConstraintSet & { torch?: boolean }]
        });
        setTorchOn(nextState);
      }
    } catch (err) {
      console.warn('Flashlight toggle not supported on this camera/browser:', err);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    let isMounted = true;
    setIsInitializing(true);
    setErrorMessage(null);

    const startScanner = async () => {
      try {
        // Wait brief tick for DOM container #swapshield-scanner-view to render
        await new Promise((resolve) => setTimeout(resolve, 150));
        if (!isMounted) return;

        const container = document.getElementById('swapshield-scanner-view');
        if (!container) return;

        // Ensure any previous scanner instance is stopped
        if (scannerRef.current && isScanningRef.current) {
          await stopScanner();
        }

        const html5QrCode = new Html5Qrcode('swapshield-scanner-view', {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.QR_CODE
          ],
          verbose: false
        });

        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 15,
            qrbox: { width: 280, height: 160 }
          },
          (decodedText) => {
            if (isMounted) {
              handleScanSuccess(decodedText);
            }
          },
          () => {
            // Frame scan failure is expected between frames, ignore noisy callback
          }
        );

        if (!isMounted) {
          await html5QrCode.stop();
          html5QrCode.clear();
          return;
        }

        isScanningRef.current = true;
        setCameraActive(true);
        setIsInitializing(false);

        // Check if torch/flashlight is supported on active track
        try {
          const videoEl = document.querySelector('#swapshield-scanner-view video') as HTMLVideoElement | null;
          const stream = videoEl?.srcObject as MediaStream | null;
          const track = stream?.getVideoTracks()[0];
          const capabilities = track?.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean }) | undefined;
          setTorchSupported(Boolean(capabilities?.torch));
        } catch {
          setTorchSupported(false);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setIsInitializing(false);
        const msg =
          err instanceof Error
            ? err.message
            : 'Unable to access rear camera. Please ensure camera permissions are granted.';
        setErrorMessage(msg);
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isOpen, stopScanner, handleScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                Hardware IMEI / Barcode Scanner
              </h3>
              <p className="text-[11px] text-slate-400">Align barcode inside the reticle</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Flashlight button if supported */}
            {torchSupported && cameraActive && (
              <button
                type="button"
                onClick={toggleTorch}
                title={torchOn ? 'Turn Flashlight Off' : 'Turn Flashlight On'}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  torchOn
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {torchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
              </button>
            )}

            {/* Close button */}
            <button
              type="button"
              onClick={async () => {
                await stopScanner();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewfinder Body */}
        <div className="relative bg-black min-h-[300px] flex items-center justify-center overflow-hidden">
          {/* DOM Mount Target for Html5Qrcode */}
          <div
            id="swapshield-scanner-view"
            className="w-full h-full min-h-[300px] flex items-center justify-center [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
          />

          {/* Loading Spinner */}
          {isInitializing && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-3 text-slate-300 z-10">
              <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin" />
              <p className="text-xs font-medium">Initializing camera optical sensor...</p>
            </div>
          )}

          {/* Camera Permission / Error State */}
          {errorMessage && (
            <div className="absolute inset-0 bg-slate-950 p-6 flex flex-col items-center justify-center text-center gap-3 z-10">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Camera Access Required</h4>
              <p className="text-xs text-slate-400 max-w-xs">{errorMessage}</p>
              <p className="text-[11px] text-slate-500">
                Note: In desktop environments without a rear camera, you can enter or paste the IMEI directly into the workbench input.
              </p>
            </div>
          )}

          {/* Viewfinder Reticle Overlay (Horizontal 280x160 box for IMEI barcodes) */}
          {cameraActive && !errorMessage && !isInitializing && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-[280px] h-[160px] border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                {/* Reticle Corner Accents */}
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-300 rounded-tl" />
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-300 rounded-tr" />
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-300 rounded-bl" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-300 rounded-br" />

                {/* Animated Horizontal Scan Laser */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse absolute top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}
        </div>

        {/* Footer Guidance */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-300">
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supported Formats: Code 128, Code 39, EAN 13, QR Code</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Scan packaging barcode or dial <span className="font-mono text-emerald-400">*#06#</span> on phone to display IMEI barcode.
          </p>
        </div>
      </div>
    </div>
  );
};
