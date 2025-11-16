import Foundation
import CoreBluetooth
import Combine

final class BLEManager: NSObject, ObservableObject {
    private enum Constants {
        static let serviceUUID = CBUUID(string: "0000FFF0-0000-1000-8000-00805F9B34FB")
        static let weightCharacteristicUUID = CBUUID(string: "0000FFF1-0000-1000-8000-00805F9B34FB")
        static let commandCharacteristicUUID = CBUUID(string: "0000FFF2-0000-1000-8000-00805F9B34FB")
    }

    @Published var isBluetoothOn: Bool = false
    @Published var isConnected: Bool = false
    @Published var currentWeightGrams: Int = 0
    @Published var statusMessage: String = "Initializing Bluetooth..."

    private var centralManager: CBCentralManager!
    private var targetPeripheral: CBPeripheral?
    private var weightCharacteristic: CBCharacteristic?
    private var commandCharacteristic: CBCharacteristic?

    private var reconnectTimer: Timer?

    override init() {
        super.init()
        centralManager = CBCentralManager(delegate: self, queue: DispatchQueue(label: "BLEQueue"))
    }

    func sendTareCommand() {
        guard let peripheral = targetPeripheral,
              let characteristic = commandCharacteristic else {
            return
        }
        let command: UInt8 = 0x01 // Example tare command
        let data = Data([command])
        peripheral.writeValue(data, for: characteristic, type: .withResponse)
    }

    private func startScanning() {
        statusMessage = "Scanning for scale..."
        centralManager.scanForPeripherals(withServices: [Constants.serviceUUID], options: [CBCentralManagerScanOptionAllowDuplicatesKey: true])
    }

    private func stopScanning() {
        centralManager.stopScan()
    }

    private func scheduleReconnect() {
        reconnectTimer?.invalidate()
        reconnectTimer = Timer.scheduledTimer(withTimeInterval: 3.0, repeats: false) { [weak self] _ in
            guard let self else { return }
            if self.isBluetoothOn {
                self.startScanning()
            }
        }
    }
}

extension BLEManager: CBCentralManagerDelegate {
    func centralManagerDidUpdateState(_ central: CBCentralManager) {
        switch central.state {
        case .poweredOn:
            isBluetoothOn = true
            statusMessage = "Bluetooth on. Scanning..."
            startScanning()
        case .unauthorized:
            statusMessage = "Bluetooth unauthorized. Update permissions in Settings."
            isBluetoothOn = false
        case .poweredOff:
            statusMessage = "Bluetooth off. Please enable Bluetooth."
            isBluetoothOn = false
        default:
            statusMessage = "Bluetooth unavailable."
            isBluetoothOn = false
        }
    }

    func centralManager(_ central: CBCentralManager, didDiscover peripheral: CBPeripheral, advertisementData: [String : Any], rssi RSSI: NSNumber) {
        guard targetPeripheral == nil else { return }
        targetPeripheral = peripheral
        statusMessage = "Connecting to \(peripheral.name ?? "scale")..."
        central.connect(peripheral, options: nil)
    }

    func centralManager(_ central: CBCentralManager, didConnect peripheral: CBPeripheral) {
        stopScanning()
        statusMessage = "Connected. Discovering services..."
        isConnected = true
        peripheral.delegate = self
        peripheral.discoverServices([Constants.serviceUUID])
    }

    func centralManager(_ central: CBCentralManager, didFailToConnect peripheral: CBPeripheral, error: Error?) {
        statusMessage = "Failed to connect. Retrying..."
        isConnected = false
        targetPeripheral = nil
        scheduleReconnect()
    }

    func centralManager(_ central: CBCentralManager, didDisconnectPeripheral peripheral: CBPeripheral, error: Error?) {
        statusMessage = "Disconnected. Reconnecting..."
        isConnected = false
        currentWeightGrams = 0
        targetPeripheral = nil
        scheduleReconnect()
    }
}

extension BLEManager: CBPeripheralDelegate {
    func peripheral(_ peripheral: CBPeripheral, didDiscoverServices error: Error?) {
        if let error {
            statusMessage = "Service discovery failed: \(error.localizedDescription)"
            scheduleReconnect()
            return
        }

        guard let services = peripheral.services else { return }
        for service in services where service.uuid == Constants.serviceUUID {
            peripheral.discoverCharacteristics([Constants.weightCharacteristicUUID, Constants.commandCharacteristicUUID], for: service)
        }
    }

    func peripheral(_ peripheral: CBPeripheral, didDiscoverCharacteristicsFor service: CBService, error: Error?) {
        if let error {
            statusMessage = "Characteristic discovery failed: \(error.localizedDescription)"
            return
        }

        guard let characteristics = service.characteristics else { return }
        for characteristic in characteristics {
            if characteristic.uuid == Constants.weightCharacteristicUUID {
                weightCharacteristic = characteristic
                peripheral.setNotifyValue(true, for: characteristic)
                statusMessage = "Receiving weight data..."
            } else if characteristic.uuid == Constants.commandCharacteristicUUID {
                commandCharacteristic = characteristic
            }
        }
    }

    func peripheral(_ peripheral: CBPeripheral, didUpdateValueFor characteristic: CBCharacteristic, error: Error?) {
        if let error {
            statusMessage = "Value update error: \(error.localizedDescription)"
            return
        }
        guard characteristic.uuid == Constants.weightCharacteristicUUID,
              let data = characteristic.value,
              data.count >= 4 else {
            return
        }

        let weight = data.withUnsafeBytes { pointer -> Int32 in
            return pointer.load(as: Int32.self)
        }
        DispatchQueue.main.async {
            self.currentWeightGrams = Int(Int32(littleEndian: weight))
        }
    }
}
