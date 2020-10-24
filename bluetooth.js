const GIIKER_SERVICE_UUID = "0000aadb-0000-1000-8000-00805f9b34fb";
const GIIKER_CHARACTERISTIC_UUID = "0000aadc-0000-1000-8000-00805f9b34fb";

const GAN_SERVICE_UUID = "0000fff0-0000-1000-8000-00805f9b34fb";
const GAN_CHARACTERISTIC_UUID = "0000fff5-0000-1000-8000-00805f9b34fb";
const GAN_SERVICE_UUID_META = "0000180a-0000-1000-8000-00805f9b34fb";
const GAN_CHARACTERISTIC_VERSION = "00002a28-0000-1000-8000-00805f9b34fb";
const GAN_CHARACTERISTIC_UUID_HARDWARE = "00002a23-0000-1000-8000-00805f9b34fb";
const GAN_ENCRYPTION_KEYS = [
    "NoRgnAHANATADDWJYwMxQOxiiEcfYgSK6Hpr4TYCs0IG1OEAbDszALpA",
    "NoNg7ANATFIQnARmogLBRUCs0oAYN8U5J45EQBmFADg0oJAOSlUQF0g"];

const GOCUBE_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const GOCUBE_CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";


var device;
var ganDecoder = null;
 async function connect() {
     try {
         device = await window.navigator.bluetooth.requestDevice({
         filters: [{ namePrefix: "Gi" }, { namePrefix: "GAN-" }, { namePrefix: "GoCube_" }],
         optionalServices: [
             GIIKER_SERVICE_UUID,
             GAN_SERVICE_UUID, GAN_SERVICE_UUID_META,
             GOCUBE_SERVICE_UUID, "battery_service" // "battery_service" apparently doesnt exist
         ]
         });
         var server = await device.gatt.connect();
         if (server.device.name.startsWith("GAN-")) {
             ganDecoder = null;
             var meta = await server.getPrimaryService(GAN_SERVICE_UUID_META);
             var versionCharacteristic = await meta.getCharacteristic(GAN_CHARACTERISTIC_VERSION);
             var versionValue = await versionCharacteristic.readValue();
             var version = versionValue.getUint8(0) << 16 | versionValue.getUint8(1) << 8 | versionValue.getUint8(2);
             if (version > 0x010007 && (version & 0xfffe00) == 0x010000) {
                 var hardwareCharacteristic = await meta.getCharacteristic(GAN_CHARACTERISTIC_UUID_HARDWARE);
                 var hardwareValue = await hardwareCharacteristic.readValue();
                 var key = GAN_ENCRYPTION_KEYS[version >> 8 & 0xff];
                 if (!key) {
                     alert("Unsupported GAN cube with unknown encryption key.");
                     errorCallback()
                     return;
                 }
                 key = JSON.parse(LZString.decompressFromEncodedURIComponent(key));
                 for (var i = 0; i < 6; i++) {
                     key[i] = (key[i] + hardwareValue.getUint8(5 - i)) & 0xff;
                 }
                 ganDecoder = new aes128(key);
             }
             var cubeService = await server.getPrimaryService(GAN_SERVICE_UUID);
             var cubeCharacteristic = await cubeService.getCharacteristic(GAN_CHARACTERISTIC_UUID);
         } else if (server.device.name.startsWith("Gi")) {
             var cubeService = await server.getPrimaryService(GIIKER_SERVICE_UUID);
             var cubeCharacteristic = await cubeService.getCharacteristic(GIIKER_CHARACTERISTIC_UUID);
             await cubeCharacteristic.startNotifications();
         } else if (server.device.name.startsWith("GoCube_")) {
             var cubeService = await server.getPrimaryService(GOCUBE_SERVICE_UUID);
             var cubeCharacteristic = await cubeService.getCharacteristic(GOCUBE_CHARACTERISTIC_UUID);
             await cubeCharacteristic.startNotifications();
             cubeCharacteristic.addEventListener("characteristicvaluechanged", handleNotifications);
         } else {
             throw "Unknown device: " + server.device.name;
         }


     } catch (ex) {
         device = null;
         console.log(ex);
     }
 }


 function handleNotifications(event) {
        try {
            var val = event.target.value;
            var len = val.byteLength;
            if (len = 8 && val.getUint8(1) /* payload len */ == 6) {
              var turn = ["B", "B'", "F", "F'", "U", "U'", "D", "D'", "R", "R'", "L", "L'"][val.getUint8(3)];
              console.log("Turned " + turn);
            }
        } catch (ex) {
            alert("ERROR (K): " + ex.message);
        }
    }
