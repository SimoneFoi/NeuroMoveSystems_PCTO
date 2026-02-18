/**
 * A javascript library to interact with BBC micro:bit using web bluetooth API
 */

// 
// UART Code referenced and modified from
// https://gist.github.com/kotobuki/7c67f8b9361e08930da1a5cfcfb0653f
// micro:bit BLE specifications 
// https://lancaster-university.github.io/microbit-docs/resources/bluetooth/bluetooth_profile.html
// An implementation of Nordic Semicondutor's UART/Serial Port Emulation over Bluetooth low energy
// Official Nordic Documentation
// https://developer.nordicsemi.com/nRF_Connect_SDK/doc/1.5.1/nrf/include/bluetooth/services/nus.html


const ACCEL_SRV_UUID = 'e95d0753-251d-470a-a062-fa1922dfa9a8'
const ACCEL_DATA_UUID = 'e95dca4b-251d-470a-a062-fa1922dfa9a8'
const ACCEL_PERIOD_UUID = 'e95dfb24-251d-470a-a062-fa1922dfa9a8'
const MAGNETO_SRV_UUID = 'e95df2d8-251d-470a-a062-fa1922dfa9a8'
const MAGNETO_DATA_UUID = 'e95dfb11-251d-470a-a062-fa1922dfa9a8'
const MAGNETO_PERIOD_UUID = 'e95d386c-251d-470a-a062-fa1922dfa9a8'
const MAGNETO_BEARING_UUID = 'e95d9715-251d-470a-a062-fa1922dfa9a8'
const BTN_SRV_UUID = 'e95d9882-251d-470a-a062-fa1922dfa9a8'
const BTN_A_STATE_UUID = 'e95dda90-251d-470a-a062-fa1922dfa9a8'
const BTN_B_STATE_UUID = 'e95dda91-251d-470a-a062-fa1922dfa9a8'
const IO_PIN_SRV_UUID = 'e95d127b-251d-470a-a062-fa1922dfa9a8'
const IO_PIN_DATA_UUID = 'e95d8d00-251d-470a-a062-fa1922dfa9a8'
const IO_AD_CONFIG_UUID = 'e95d5899-251d-470a-a062-fa1922dfa9a8'
const IO_PIN_CONFIG_UUID = 'e95db9fe-251d-470a-a062-fa1922dfa9a8'
const IO_PIN_PWM_UUID = 'e95dd822-251d-470a-a062-fa1922dfa9a8'
const LED_SRV_UUID = 'e95dd91d-251d-470a-a062-fa1922dfa9a8'
const LED_STATE_UUID = 'e95d7b77-251d-470a-a062-fa1922dfa9a8'
const LED_TEXT_UUID = 'e95d93ee-251d-470a-a062-fa1922dfa9a8'
const LED_SCROLL_UUID = 'e95d0d2d-251d-470a-a062-fa1922dfa9a8'
const TEMP_SRV_UUID = 'e95d6100-251d-470a-a062-fa1922dfa9a8'
const TEMP_DATA_UUID = 'e95d9250-251d-470a-a062-fa1922dfa9a8'
const TEMP_PERIOD_UUID = 'e95d1b25-251d-470a-a062-fa1922dfa9a8'
const UART_SRV_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_TX_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const UART_RX_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

class uBitWebBluetooth {

  constructor() {
    this.device;
    this.connected = false;

    this.CONSOLE_LOG = false;

    this.accelerometer = {
      x: 0,
      y: 0,
      z: 0
    };

    this.magnetometer_raw = {
      x: 0,
      y: 0,
      z: 0
    };

    this.magnetometer_bearing = 0;
    this.temperature = 0;

    this.buttonA = 0;
    this.buttonACallback=function(){};

    this.buttonB = 0;
    this.buttonBCallback=function(){};

    this.onConnectCallback=function(){};
    this.onDisconnectCallback=function(){};

    this.onBLENotifyCallback=function(){};
    this.onReceiveUARTCallback = function(data){};

    this.characteristics = {
      IO_PIN_DATA: {},
      IO_AD_CONFIG: {},
      IO_PIN_CONFIG: {},
      IO_PIN_PWM: {},
      LED_STATE: {},
      LED_TEXT: {},
      LED_SCROLL: {},
      UART_TX: {},
      UART_RX: {}
    }
  }

  getTemperature() {
    return this.temperature;
  }

  getAccelerometer() {
    return this.accelerometer;
  }

  getBearing() {
    return this.magnetometer_bearing;
  }

  getButtonA() {
    return this.buttonA;
  }

  setButtonACallback(callbackFunction){
    this.buttonACallback=callbackFunction;
  }

  getButtonB() {
    return this.buttonB;
  }

  setButtonBCallback(callbackFunction){
    this.buttonBCallback=callbackFunction;
  }

  setReceiveUARTCallback(callbackFunction){
    this.onReceiveUARTCallback = callbackFunction;
  }

  onReceiveUART(callbackFunction){
    this.onReceiveUARTCallback = callbackFunction;
  }

  onReceiveSerial(callbackFunction){
    this.onReceiveUART(callbackFunction);
  }

  onConnect(callbackFunction){
    this.onConnectCallback=callbackFunction;
  }

  onDisconnect(callbackFunction){
    this.onDisconnectCallback=callbackFunction;
  }

  onBleNotify(callbackFunction){
    this.onBLENotifyCallback=callbackFunction;
  }

  setPin(){

  }
  writePin(pin,val) {
    //something like this should work, but we need to create the correct buffer
    var data = new Uint8Array([0, 1]);

    if(this.connected){
      this.characteristics.IO_PIN_DATA.writeValue(data)
      .then(_ => {
      })
      .catch(error => {
        console.log(error);
      });
    }
    //this.characteristics.IO_PIN_DATA.writeValue(data);
  }

  readPin(pin) {
    // this.characteristics.IO_PIN_DATA.readValue().then(
    //   (data) => {
    //     console.log("IO_PIN_DATA",data);
    //   }
    // )
  }

  writeMatrixIcon(icon) {
    var ledMatrix = new Int8Array(5);
    var buffer = [
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0'],
      ['0', '0', '0', '0', '0', '0', '0', '0']
    ]
    for (var i = 0; i < 5; i++) {
      for (var j = 0; j < 5; j++) {
        buffer[i][7-j] = icon[i][4 - j]
      }
    }
    for (var i = 0; i < 5; i++) {
      var string = buffer[i].join("");
      ledMatrix[i]=parseInt(string,2)
    }
    if(this.connected){
      //TODO: cant find the writeValue property.
      //console.log("LED_STATE",this.characteristics.LED_STATE)
      this.characteristics.LED_STATE.writeValue(ledMatrix)
      .then(_ => {
      })
      .catch(error => {
        console.log(error);
      });
    }
  }

  writeMatrixTextSpeed(speed){
    var buffer= new Uint8Array(speed);
    if(this.connected){
      this.characteristics.LED_TEXT.writeValue(buffer)
      .then(_ => {
      })
      .catch(error => {
        console.log(error);
      });
    }
  }

  writeMatrixText(str){
    var buffer= new Uint8Array(toUTF8Array(str));
    if(this.connected){
      this.characteristics.LED_TEXT.writeValue(buffer)
      .then(_ => {
      })
      .catch(error => {
        console.log(error);
      });
    }
  }
  
  /**
 * Send a string to a specific device with a newline.
 * @param {string} data to send (must not include newlines)
 */


  writeUARTData(data){
    if (!this.characteristics.UART_RX) {
      console.log("rxCharacteristic is not defined.")
      return;
    }
    try {
      let encoder = new TextEncoder();
      this.characteristics.UART_RX.writeValue(encoder.encode(data+"\n"));
    } catch (error) {
      console.log(error);
    }

  }

  sendSerial(data){
    this.writeUARTData(data);
  }

  uBitSend(data) {
    this.writeUARTData(data);
  }


  onUARTTxCharacteristicValueChanged(event) {
    let receivedData = [];
    for (var i = 0; i < event.target.value.byteLength; i++) {
      receivedData[i] = event.target.value.getUint8(i);
    }

    const receivedString = String.fromCharCode.apply(null, receivedData).replace(/\r\n|\r|\n/gm,"\n");

    if(this.CONSOLE_LOG) console.log("UART_TX",receivedString);
    
    this.onReceiveUARTCallback(receivedString);
    
  }

  onButtonA(){
    this.buttonACallback();
  }

  onButtonB(){
    this.buttonBCallback();
  }

  characteristic_updated(event) {

    this.onBLENotifyCallback();
    //BUTTON CHARACTERISTIC
    if (event.target.uuid == BTN_A_STATE_UUID) {
      if(this.CONSOLE_LOG)  console.log("BTN_A_STATE", event.target.value.getInt8());
      this.buttonA = event.target.value.getInt8();
      if (this.buttonA){
        this.onButtonA();
      }
    }

    if (event.target.uuid == BTN_B_STATE_UUID) {
      if(this.CONSOLE_LOG) console.log("BTN_B_STATE", event.target.value.getInt8());
      this.buttonB = event.target.value.getInt8();
      if (this.buttonB){
        this.onButtonB();
      }
    }

    //ACCELEROMETER CHARACTERISTIC
    if (event.target.uuid == ACCEL_DATA_UUID) {
      //true is for reading the bits as little-endian
      if(this.CONSOLE_LOG) {
        console.log("ACCEL_DATA_X", event.target.value.getInt16(0,true));
      console.log("ACCEL_DATA_Y", event.target.value.getInt16(2,true));
      console.log("ACCEL_DATA_Z", event.target.value.getInt16(4,true));
    }
      this.accelerometer.x = event.target.value.getInt16(0, true);
      this.accelerometer.y = event.target.value.getInt16(2, true);
      this.accelerometer.z = event.target.value.getInt16(4, true);
    }

    // MAGNETOMETER CHARACTERISTIC (raw data)
    if (event.target.uuid == MAGNETO_DATA_UUID) {
      if(this.CONSOLE_LOG) {       
        console.log("MAGNETO_DATA_X", event.target.value.getInt16(0,true));
       console.log("MAGNETO_DATA_Y", event.target.value.getInt16(2,true));
       console.log("MAGNETO_DATA_Z", event.target.value.getInt16(4,true));}
      this.magnetometer_raw.x = event.target.value.getInt16(0, true);
      this.magnetometer_raw.y = event.target.value.getInt16(2, true);
      this.magnetometer_raw.z = event.target.value.getInt16(4, true);
    }

    // MAGNETOMETER CHARACTERISTIC (bearing)
    if (event.target.uuid == MAGNETO_BEARING_UUID) {
      if(this.CONSOLE_LOG) console.log("BEARING", event.target.value.getInt16(0,true));
      this.magnetometer_bearing = event.target.value.getInt16(0, true);
    }

    // TEMPERATURE CHARACTERISTIC
    if (event.target.uuid == TEMP_DATA_UUID) {
      if(this.CONSOLE_LOG) console.log("TEMP_DATA", event.target.value.getInt8());
      this.temperature = event.target.value.getInt8();

    }
    // UART CHARACTERISTIC
    if(event.target.uuid == UART_TX_UUID){

      this.onUARTTxCharacteristicValueChanged(event);
    }

  }

  searchDevice() {
   
    var options = {};
    options.filters =  [{ namePrefix: "BBC" }];
    //options.acceptAllDevices = true;
    options.optionalServices = [ACCEL_SRV_UUID, MAGNETO_SRV_UUID, BTN_SRV_UUID, IO_PIN_SRV_UUID, LED_SRV_UUID, TEMP_SRV_UUID,UART_SRV_UUID];

    console.log('Requesting Bluetooth Device...');
    console.log('with ' + JSON.stringify(options));


    navigator.bluetooth.requestDevice(options)
    .then((device) => {

      console.log('> Name:             ' + device.name);
      console.log('> Id:               ' + device.id);

      

      device.addEventListener('gattserverdisconnected', this.onDisconnectCallback);

      this.device = device;
      // Attempts to connect to remote GATT Server.
      return device.gatt.connect();

    })
    .then((server) => {
      // Note that we could also get all services that match a specific UUID by
      // passing it to getPrimaryServices().
      //if(typeof this.onConnectCallback == "function") this.onConnectCallback();
      this.server = server;
      this.connected = true;

      console.log('Getting Services...');
      return server.getPrimaryServices();
    })
    .then((services) => {
      console.log('Getting Characteristics...');
      let queue = Promise.resolve();
      services.forEach((service) => {
        queue = queue.then(_ => service.getCharacteristics().then(characteristics => {
          //console.log("SERVICE",service);
          console.log('> Service: ' + service.uuid);
          characteristics.forEach(characteristic => {
            console.log('>> Characteristic: ' + characteristic.uuid + ' ' +
              getSupportedProperties(characteristic));

            //need to store all the characteristic I want to write to be able to access them later.
            switch (characteristic.uuid) {
              case IO_PIN_DATA_UUID:
                this.characteristics.IO_PIN_DATA = characteristic;
                
                this.writePin(0,1);
                break;

              case IO_AD_CONFIG_UUID:
                this.characteristics.IO_AD_CONFIG = characteristic;
                break;

              case IO_PIN_CONFIG_UUID:
                this.characteristics.IO_PIN_CONFIG = characteristic;
                break;

              case IO_PIN_PWM_UUID:
                this.characteristics.IO_PIN_PWM = characteristic;
                break;

              case LED_STATE_UUID:
                this.characteristics.LED_STATE = characteristic;
                break;

              case LED_TEXT_UUID:
                this.characteristics.LED_TEXT = characteristic;
                break;

              case LED_SCROLL_UUID:
                console.log("LED_SCROLL", this)
                this.characteristics.LED_SCROLL = characteristic;
                break;

              case UART_TX_UUID:
                // console.log("setting TX");
                // console.log("this",this.characteristic);
                // console.log("that",this.characteristic);

                this.characteristics.UART_TX = characteristic;
                // this.characteristics.UART_TX.startNotifications();
                // this.characteristics.UART_TX.addEventListener(
                //   "characteristicvaluechanged",
                //   this.onUARTTxCharacteristicValueChanged
                // );
                break;

              case UART_RX_UUID:
                console.log("setting RX"+characteristic.uuid);
               

                this.characteristics.UART_RX = characteristic;
                break;

              default:

            }

            if (getSupportedProperties(characteristic).includes('NOTIFY')||getSupportedProperties(characteristic).includes('INDICATE') ) {

              characteristic.startNotifications().catch(err => console.log('startNotifications', err));
              characteristic.addEventListener('characteristicvaluechanged',
                this.characteristic_updated.bind(this));
            }
          });
        }));
      });
      return queue;
    }
  )
    .catch(error => {
      console.error('Argh! ' + error);
      
      //TODO: add an error message if connectDevice() is called from outside p5 canvas (i.e button)
      if(typeof(this.characteristics) == "undefined"){
        console.error("cannot find a uBit instance! \nmicroBit.searchDevice() must be called within p5 canvas! e.g connectButton.mousePressed(() => {microBit.searchDevice()})");
      }
    });
  }


  connectDevice() {
    this.searchDevice();
  }

  disconnectDevice(){
      if (!this.device) {
        console.log("Device Not connected!");
        return;
      }

      if (this.device.gatt.connected) {
        this.device.gatt.disconnect();
        console.log("Disconnected.");
      }
  }

}

/* Utils */

function isWebBluetoothEnabled() {
  if (navigator.bluetooth) {
    return true;
  } else {
    ChromeSamples.setStatus('Web Bluetooth API is not available.\n' +
      'Please make sure the "Experimental Web Platform features" flag is enabled.');
    return false;
  }
}


function getSupportedProperties(characteristic) {
  let supportedProperties = [];
  for (const p in characteristic.properties) {
    if (characteristic.properties[p] === true) {
      supportedProperties.push(p.toUpperCase());
    }
  }
  return '[' + supportedProperties.join(', ') + ']';
}

function toUTF8Array(str) {
    var utf8 = [];
    for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >>18),
                      0x80 | ((charcode>>12) & 0x3f),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}
