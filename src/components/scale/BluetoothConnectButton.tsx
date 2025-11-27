"use client";

import { Button } from "@/components/common/Button";

export const BluetoothConnectButton = ({
  supported,
  onConnect,
  isConnecting,
}: {
  supported: boolean;
  onConnect: () => void;
  isConnecting: boolean;
}) => {
  return (
    <div className="space-y-2">
      <Button onClick={onConnect} disabled={!supported || isConnecting} fullWidth>
        {supported ? (isConnecting ? "Connecting..." : "Connect via Bluetooth") : "Bluetooth unavailable"}
      </Button>
      {!supported && (
        <p className="text-center text-xs text-amber-300">
          Try the Wi-Fi mode below if Web Bluetooth isn&apos;t supported on this device.
        </p>
      )}
    </div>
  );
};
