navigator.bluetooth.requestDevice()
.then(device => {
  // Human-readable name of the device.
  console.log(device.name);

  // Attempts to connect to remote GATT Server.
  return device.gatt.connect();
})
