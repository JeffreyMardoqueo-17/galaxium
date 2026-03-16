"use client";

import * as React from "react";
import { Camera, CameraOff } from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

type BarcodeScannerProps = {
  onDetected: (code: string) => void;
  onError?: (message: string) => void;
};

function playBeep() {
  try {
    const AudioContextRef =
      window.AudioContext ||
      (window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      }).webkitAudioContext;

    if (!AudioContextRef) return;

    const ctx = new AudioContextRef();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.value = 0.05;

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.12);
    oscillator.onended = () => ctx.close();
  } catch {}
}

export default function BarcodeScanner({
  onDetected,
  onError,
}: BarcodeScannerProps) {
  const [isActive, setIsActive] = React.useState(false);
  const [lastScannedCode, setLastScannedCode] = React.useState("");
  const [cameraError, setCameraError] = React.useState("");

  const scannerRef = React.useRef<Html5Qrcode | null>(null);
  const hasDetectedRef = React.useRef(false);

  // ===============================
  // STOP SCANNER
  // ===============================
  const stopScanner = React.useCallback(async () => {
    console.log("[BARCODE] Deteniendo scanner...");
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error("[BARCODE] Error deteniendo:", err);
      }
    }
    scannerRef.current = null;
    hasDetectedRef.current = false;
    setIsActive(false);
    setCameraError("");
  }, []);

  // ===============================
  // START SCANNER
  // ===============================
  const startScanner = React.useCallback(async () => {
    console.log("[BARCODE] Iniciando scanner...");
    setIsActive(true);
    setCameraError("");
    hasDetectedRef.current = false;

    setTimeout(async () => {
      try {
        const element = document.getElementById("barcode-qr-reader");
        if (!element) {
          throw new Error("Elemento no encontrado");
        }

        console.log("[BARCODE] Creando Html5Qrcode...");
        const scanner = new Html5Qrcode("barcode-qr-reader");
        scannerRef.current = scanner;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.777,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ],
        };

        console.log("[BARCODE] Iniciando cámara...");
        await scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            console.log("[BARCODE] ✓✓✓ CÓDIGO DETECTADO:", decodedText);
            
            if (hasDetectedRef.current) return;
            hasDetectedRef.current = true;

            setLastScannedCode(decodedText);
            // alert(`✓ Código escaneado:\n${decodedText}`);
            playBeep();
            onDetected(decodedText);

            setTimeout(() => {
              stopScanner();
            }, 500);
          },
          () => {
            // Ignorar errores de "no encontrado"
          }
        );

        console.log("[BARCODE] ✓ Cámara iniciada correctamente");
      } catch (err) {
        console.error("[BARCODE] Error:", err);
        const errorMsg = err instanceof Error ? err.message : "Error desconocido";
        setCameraError(errorMsg);
        setIsActive(false);
        
        alert(
          `❌ Error activando cámara:\n${errorMsg}\n\nVerifica:\n• Permisos de cámara\n• Que tengas cámara conectada\n• Usar HTTPS o localhost`
        );
        
        if (onError) onError(errorMsg);
      }
    }, 100);
  }, [onDetected, onError, stopScanner]);

  // ===============================
  // CLEANUP
  // ===============================
  React.useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // ===============================
  // UI
  // ===============================
  return (
    <div className="space-y-4">
      {/* BOTONES */}
      <div className="flex items-center gap-3">
        {!isActive ? (
          <button
            type="button"
            onClick={startScanner}
            className="flex items-center gap-2 px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white rounded-lg font-medium transition"
          >
            <Camera className="w-4 h-4" />
            Activar Cámara
          </button>
        ) : (
          <button
            type="button"
            onClick={stopScanner}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
          >
            <CameraOff className="w-4 h-4" />
            Detener
          </button>
        )}

        {isActive && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
            <div className="w-2.5 h-2.5 bg-green-600 rounded-full animate-pulse" />
            Escaneando...
          </div>
        )}
      </div>

      {/* SCANNER */}
      <div className="relative rounded-xl overflow-hidden border-2 border-blue-950 shadow-xl">
        {isActive ? (
          <div
            id="barcode-qr-reader"
            className="bg-black"
            style={{
              width: "100%",
              minHeight: "400px",
            }}
          />
        ) : (
          <div className="w-full h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-blue-900" />
              </div>
              <p className="text-gray-700 font-semibold text-lg">
                Presiona para escanear
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Activa la cámara para leer códigos de barras
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ERROR */}
      {cameraError && (
        <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
          <p className="text-xs text-red-700 font-medium">Error:</p>
          <p className="text-sm text-red-900">{cameraError}</p>
        </div>
      )}

      {/* RESULTADO */}
      {lastScannedCode && (
        <div className="p-3 bg-green-50 border border-green-300 rounded-lg">
          <p className="text-xs text-green-700 font-medium">
            ✓ Último código detectado:
          </p>
          <p className="text-sm text-green-900 font-mono font-bold break-all">
            {lastScannedCode}
          </p>
        </div>
      )}

    </div>
  );
}
