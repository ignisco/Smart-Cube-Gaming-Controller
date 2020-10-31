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
             cubeCharacteristic.addEventListener("characteristicvaluechanged", GiikerNotifications);
         } else if (server.device.name.startsWith("GoCube_")) {
             var cubeService = await server.getPrimaryService(GOCUBE_SERVICE_UUID);
             var cubeCharacteristic = await cubeService.getCharacteristic(GOCUBE_CHARACTERISTIC_UUID);
             await cubeCharacteristic.startNotifications();
             cubeCharacteristic.addEventListener("characteristicvaluechanged", GoNotifications);
         } else {
             throw "Unknown device: " + server.device.name;
         }


     } catch (ex) {
         device = null;
         console.log(ex);
     }
 }


 function GoNotifications(event) {
      try {
          var val = event.target.value;
          var len = val.byteLength;
          if (len = 8 && val.getUint8(1) /* payload len */ == 6) {
            var turn = ["B", "B'", "F", "F'", "U", "U'", "D", "D'", "R", "R'", "L", "L'"][val.getUint8(3)];
            console.log(turn + ";GO");
            }
        } catch (ex) {
            alert("ERROR (K): " + ex.message);
        }
    }

    var first = true;
    function GiikerNotifications(event) {
      try {
          if (first) {
              first = false;
              return; // skip first event
          }
          var val = event.target.value;
          var state = [];
          if (val.getUint8(18) == 0xa7) { // decrypt
              var key = [176, 81, 104, 224, 86, 137, 237, 119, 38, 26, 193, 161, 210, 126, 150, 81, 93, 13, 236, 249, 89, 235, 88, 24, 113, 81, 214, 131, 130, 199, 2, 169, 39, 165, 171, 41];
              var k = val.getUint8(19);
              var k1 = k >> 4 & 0xf;
              var k2 = k & 0xf;
              for (var i = 0; i < 20; i++) {
                  var v = (val.getUint8(i) + key[i + k1] + key[i + k2]) & 0xff;
                  state.push(v >> 4 & 0xf);
                  state.push(v & 0xf);
              }
          }
          else // not encrypted
          {
              for (var i = 0; i < 20; i++) {
                  var v = val.getUint8(i);
                  state.push(v >> 4 & 0xf);
                  state.push(v & 0xf);
              }
          }
          var face = state[32];
          var amount = state[33];
          var turn = ["?", "B", "D", "L", "U", "R", "F"][face] + ["", "", "2", "'"][amount == 9 ? 2 : amount]; // twistCallback
          console.log(turn + ";GI");
      } catch (ex) {
          alert("ERROR (K): " + ex.message);
      }
  }
