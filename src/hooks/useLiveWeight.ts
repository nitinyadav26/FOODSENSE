"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type WeightMode = "idle" | "bluetooth" | "network";

type BleCharacteristic = {
  value?: DataView | null;
  startNotifications: () => Promise<void>;
  addEventListener: (type: "characteristicvaluechanged", listener: (event: Event) => void) => void;
  removeEventListener: (type: "characteristicvaluechanged", listener: (event: Event) => void) => void;
};

type BleServer = {
  getPrimaryService: (uuid: string) => Promise<{ getCharacteristic: (uuid: string) => Promise<BleCharacteristic> }>;
};

type BleDevice = {
  addEventListener: (type: "gattserverdisconnected", listener: (event: Event) => void) => void;
  gatt?: {
    connected: boolean;
    connect: () => Promise<BleServer | undefined>;
    disconnect: () => void;
  };
};

type BluetoothNavigator = Navigator & {
  bluetooth?: {
    requestDevice: (options: { filters: { services: string[] }[] }) => Promise<BleDevice>;
  };
};

const SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
const CHARACTERISTIC_UUID = "0000fff1-0000-1000-8000-00805f9b34fb";

export const useLiveWeight = () => {
  const [weight, setWeight] = useState<number | null>(null);
  const [mode, setMode] = useState<WeightMode>("idle");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationHandlerRef = useRef<((event: Event) => void) | null>(null);
  const characteristicRef = useRef<BleCharacteristic | null>(null);
  const deviceRef = useRef<BleDevice | null>(null);

  const cleanupBle = useCallback(() => {
    const characteristic = characteristicRef.current;
    if (characteristic && notificationHandlerRef.current) {
      characteristic.removeEventListener("characteristicvaluechanged", notificationHandlerRef.current);
    }
    characteristicRef.current = null;
    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }
    deviceRef.current = null;
  }, []);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    cleanupBle();
    stopPolling();
    setMode("idle");
  }, [cleanupBle, stopPolling]);

  const connectBluetooth = useCallback(async () => {
    const nav = typeof navigator !== "undefined" ? (navigator as BluetoothNavigator) : undefined;
    if (!nav?.bluetooth) {
      setError("Web Bluetooth not supported on this device");
      return;
    }
    setIsConnecting(true);
    setError(null);
    stopPolling();
    try {
      const device = await nav.bluetooth.requestDevice({ filters: [{ services: [SERVICE_UUID] }] });
      deviceRef.current = device;
      device.addEventListener("gattserverdisconnected", () => {
        setMode("idle");
        cleanupBle();
      });
      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService(SERVICE_UUID);
      const characteristic = await service?.getCharacteristic(CHARACTERISTIC_UUID);
      if (!characteristic) {
        throw new Error("Characteristic unavailable");
      }
      characteristicRef.current = characteristic;
      notificationHandlerRef.current = (event) => {
        const target = event.target as { value?: DataView | null };
        const value = target?.value;
        if (!value) return;
        const data = new DataView(value.buffer);
        const grams = data.getInt32(0, true);
        setWeight(Math.max(0, grams));
        setMode("bluetooth");
      };
      characteristic.addEventListener("characteristicvaluechanged", notificationHandlerRef.current);
      await characteristic.startNotifications();
      setMode("bluetooth");
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Unable to connect via Bluetooth");
      cleanupBle();
    } finally {
      setIsConnecting(false);
    }
  }, [cleanupBle, stopPolling]);

  const startNetworkPolling = useCallback(() => {
    stopPolling();
    cleanupBle();
    setMode("network");
    setError(null);

    const poll = async () => {
      try {
        const res = await fetch("/api/scale/live-weight", { cache: "no-store" });
        if (!res.ok) throw new Error("Offline");
        const data = await res.json();
        setWeight(data.weightGrams ?? null);
      } catch (pollError) {
        console.warn("Weight polling failed", pollError);
        setError("Unable to reach scale service");
      }
    };

    poll();
    pollRef.current = setInterval(poll, 2000);
  }, [cleanupBle, stopPolling]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const navSupportsBluetooth = typeof navigator !== "undefined" && !!(navigator as BluetoothNavigator).bluetooth;

  return {
    weight,
    mode,
    isConnecting,
    error,
    connectBluetooth,
    startNetworkPolling,
    disconnect,
    bluetoothAvailable: navSupportsBluetooth,
  };
};
