/**
 * Driver for Broadlink devices
 *
 * Copyright 2018, R Wensveen
 *
 * This file is part of com.broadlink
 * com.broadlink is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * com.broadlink is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with com.broadlink.  If not, see <http://www.gnu.org/licenses/>.
 */



/*
 * see: https://pycrc.org/models.html
 * 
crc-16-modbus
=============
Width              16
Poly               0x8005
Reflect In         True
XOR In             0xffff
Reflect Out        True
XOR Out            0x0000
Short command      pycrc.py --model crc-16-modbus
Extended command   pycrc.py --width 16 --poly 0x8005 --reflect-in True --xor-in 0xffff --reflect-out True --xor-out 0x0000
Check              0x4b37
 */



'use strict';

const Homey = require('homey');
const Util = require('./../../lib/util.js');
const BroadlinkDevice = require('./../BroadlinkDevice');
const CRC16 = require('crc').crc16modbus;


class HysenDevice extends BroadlinkDevice {

	/**
	 * 
	 */
	async onCheckInterval( interval ) {
		return await this.get_temperature();
	}

	
	_updateCapabilities() {
		Util.debugLog("==> hysen._updateCapabilities")
		if( this.data['RoomTemperature'] ) {
			Util.debugLog("_updateCapabilities - room temperature = "+this.data['RoomTemperature']);
			this.setCapabilityValue('measure_temperature', this.data['RoomTemperature'] );
			this.setCapabilityValue('measure_temperature.room', this.data['RoomTemperature'] );
		}
		if( this.data['ExternalTemperature'] ) {
			Util.debugLog("_updateCapabilities - external temperature = "+this.data['ExternalTemperature']);
			this.setCapabilityValue('measure_temperature.outside', this.data['ExternalTemperature'] );
		}
		if( this.data['TargetTemperature'] ) {
			Util.debugLog("_updateCapabilities - target_temperature = "+this.data['TargetTemperature']);
			this.setCapabilityValue('target_temperature', this.data['TargetTemperature'] ); 
		}
	}
	
	_updateSettings() {
		let newSettings = {};
		
		if( this.data['TempRangeExtSensor'] ) { newSettings['TempRangeExtSensor'] = this.data['TempRangeExtSensor']; }
		if( this.data['SensorMode'        ] ) { newSettings['SensorMode'        ] = this.data['SensorMode'        ]; }
		if( this.data['RoomTempAdjust'    ] ) { newSettings['RoomTempAdjust'    ] = this.data['RoomTempAdjust'    ]; }
		if( this.data['AutoMode'          ] ) { newSettings['AutoMode'          ] = this.data['AutoMode'          ]; }
		if( this.data['LoopMode'          ] ) { newSettings['LoopMode'          ] = this.data['LoopMode'          ]; }
		if( this.data['FloorTempDeadZone' ] ) { newSettings['FloorTempDeadZone' ] = this.data['FloorTempDeadZone' ]; }
		if( this.data['SensorUpperLimit'  ] ) { newSettings['SensorUpperLimit'  ] = this.data['SensorUpperLimit'  ]; }
		if( this.data['SensorLowerLimit'  ] ) { newSettings['SensorLowerLimit'  ] = this.data['SensorLowerLimit'  ]; }
		if( this.data['AntiFreezeMode'    ] ) { newSettings['AntiFreezeMode'    ] = this.data['AntiFreezeMode'    ]; }
	
		if( Object.keys(newSettings).length > 0) {
			Util.debugLog('_updateSettings: ' + JSON.stringify(newSettings));
			this.setSettings( newSettings )
		}
	}
	
	_updateSetting( name, changedKeysArr, newSettingsObj ) {
		if( changedKeysArr.indexOf(name) >= 0 ) {
			Util.debugLog("==> hysen._updateSettings:"+name)
			this.data[name] = newSettingsObj[name];
			return true;
		}
		return false;
	}
	
	
	/**
	 * Called when the device settings are changed by the user
	 * (so NOT called on programmatically changing settings)
	 *
	 *  @param changedKeysArr   contains an array of keys that have been changed
	 */
	onSettings( oldSettingsObj, newSettingsObj, changedKeysArr, callback ) {

		super.onSettings( oldSettingsObj, newSettingsObj, changedKeysArr, undefined );
		Util.debugLog("==> hysen.onSettings");
		
		let changed = false
		
		// sanity check
		let upperlimit = this.data['SensorUpperLimit'];
		let lowerlimit = this.data['SensorLowerLimit'];
		if( changedKeysArr.indexOf('SensorUpperLimit') >= 0 ) { upperlimit = newSettingsObj['SensorUpperLimit'] }
		if( changedKeysArr.indexOf('SensorLowerLimit') >= 0 ) { lowerlimit = newSettingsObj['SensorLowerLimit'] }
		if( upperlimit <= lowerlimit ) {
			//Util.debugLog('Invalid sensor limits.');
			callback( Homey.__("invalid_sensor_limits") );
		}
		else {
			if( changedKeysArr.indexOf('CheckInterval') >= 0 ) {
				this.stop_check_interval()
				this.start_check_interval( newSettingsObj['CheckInterval'] )
			}
			changed |= this._updateSetting( 'TempRangeExtSensor', changedKeysArr, newSettingsObj );
			changed |= this._updateSetting( 'SensorMode', changedKeysArr, newSettingsObj );
			changed |= this._updateSetting( 'RoomTempAdjust', changedKeysArr, newSettingsObj );
			changed |= this._updateSetting( 'AutoMode', changedKeysArr, newSettingsObj );
			changed |= this._updateSetting( 'LoopMode', changedKeysArr, newSettingsObj );
			changed |= this._updateSetting( 'FloorTempDeadZone', changedKeysArr, newSettingsObj );
			changed |= this._updateSetting( 'SensorUpperLimit', changedKeysArr, newSettingsObj );
			changed |= this._updateSetting( 'SensorLowerLimit', changedKeysArr, newSettingsObj );
			changed |= this._updateSetting( 'AntiFreezeMode', changedKeysArr, newSettingsObj );
			
			if( changed ) {
				this.set_advanced( this.data['LoopMode'], this.data['SensorMode'], this.data['TempRangeExtSensor'], 
									this.data['FloorTempDeadZone'], this.data['SensorUpperLimit'], this.data['SensorLowerLimit'], 
									this.data['RoomTempAdjust'], this.data['AntiFreezeMode'], this.data['poweron']);
			
				this.set_mode( this.data['AutoMode'], this.data['LoopMode'] /*, sensor*/ );
			}
		
			if( callback ) {
				/* only do callback if this functions was called by Homey.
				 * if it was called by another class, that class will do the callback.
				 */
				callback( null, true );
			}
		}
	}

	
	/* Send a request
	 * input_payload should be a bytearray, usually 6 bytes, e.g. bytearray([0x01,0x06,0x00,0x02,0x10,0x00])
	 * Returns decrypted payload
	 * New behaviour: raises a ValueError if the device response indicates an error or CRC check fails
	 * The function prepends length (2 bytes) and appends CRC
	 */
	async send_request( input_payload ) {

	    var crc = CRC16(input_payload)
	    
	    // first byte is length +2 (for CRC16)
	    var request_payload = Util.concatTypedArrays( new Uint8Array([input_payload.length + 2,0x00]), input_payload )

	    // append CRC
	    request_payload = Util.concatTypedArrays( request_payload, new Uint8Array([crc & 0xFF, (crc >> 8) & 0xFF]) ) 
	    
	    // send to device
	    var response = await this._communicate.send_packet(0x6a, true, request_payload)
	    if( response.error == 0 ) {
	    	// response does not contain command (4 bytes), but length and tailing crc
	    	var resp = Util.concatTypedArrays( response.cmd.slice(2), response.payload.slice(0,-2))
	    	return resp
	    }
	    else {
	    	//resp = new Uint8Array( 19 )
	    	//resp[5] = 40
	    	//resp[18]=5
	    	//return resp
	    	Util.debugLog( "<** hysen.send_request: Errorcode "+response.error + " in response")
	    	throw( "Errorcode: " + response.error )
	    }
	}

	/**
	 * Get current room temperature in degrees celsius
	 */
	async get_temperature() {
		Util.debugLog("==> hysen.get_temperature")
		
		try {
			var payload = new Uint8Array([0x01,0x03,0x00,0x00,0x00,0x08])
			var response = await this.send_request(payload)

			this.data['RoomTemperature'] = response[ 5 ] / 2.0;
			this.data['ExternalTemperature'] = response[ 18 ] / 2.0;

//			this._updateCapabilities();
		}
		catch( err ) {
			Util.debugLog('<** hysen.get_temperature - catch = ' + err);
			this.data['RoomTemperature']=18.0
		}
		this._updateCapabilities();
	}


	/**
	 * Get full status (including timer schedule)
	 */
	async get_full_status() {
		Util.debugLog("==> hysen.get_full_status");

		try {
			var payload = new Uint8Array([0x01,0x03,0x00,0x00,0x00,0x16]);
			var response = await this.send_request(payload);

			//Util.debugLog('==>Hysendevice.get_full_status - ' + Util.asHex(response));

			this.data['remote_lock'] =  response.payload[3] & 1;
			this.data['power'] =  response.payload[4] & 1;
			this.data['active'] =  (response.payload[4] >> 4) & 1;
			this.data['temp_manual'] =  (response.payload[4] >> 6) & 1;
			this.data['RoomTemperature'] =  (response.payload[5] & 255)/2.0;
			this.data['TargetTemperture'] =  (response.payload[6] & 255)/2.0;
			this.data['AutoMode'] =  response.payload[7] & 15;
			this.data['LoopMode'] =  (response.payload[7] >> 4) & 15;
			this.data['SensorMode'] = response.payload[8];
			this.data['TempRangeExtSensor'] = response.payload[9];
			this.data['FloorTempDeadZone'] = response.payload[10];
			this.data['SensorUpperLimit'] = response.payload[11];
			this.data['SensorLowerLimit'] = response.payload[12];
			this.data['RoomTempAdjust'] = ((response.payload[13] << 8) + response.payload[14])/2.0;
			if( this.data['RoomTempAdjust'] > 32767 ) {
		  		this.data['RoomTempAdjust'] = 32767 - this.data['RoomTempAdjust'];
		  	}
			this.data['AntiFreezeMode'] = response.payload[15];
			this.data['poweron'] = response.payload[16];
			this.data['unknown'] = response.payload[17];
			this.data['ExternalTemperature'] = (response.payload[18] & 255)/2.0;
			this.data['hour'] =  response.payload[19];
			this.data['min'] =  response.payload[20];
			this.data['sec'] =  response.payload[21];
			this.data['dayofweek'] =  response.payload[22];

			weekday = [];
			for( let i =0; i < 6; i++ ) {
	  			weekday.append({'start_hour':response.payload[2*i + 23], 
	  						    'start_minute':response.payload[2*i + 24],
	  						    'temp':response.payload[i + 39]/2.0});
			}
			this.data['weekday'] = weekday;
			
			weekend = [];
			for( let i =6; i < 8; i++ ) {
				weekend.append({'start_hour':response.payload[2*i + 23], 
							    'start_minute':response.payload[2*i + 24],
							    'temp':response.payload[i + 39]/2.0});
			}
			this.data['weekend'] = weekend;
		}
		catch( err ) {
			Util.debugLog('<** hysen.get_full_status - catch = ' + err);
		}
		this._updateCapabilities(); 
		this._updateSettings();
	}


	/**
	 * Change controller mode
     * auto_mode = 1 for auto (scheduled/timed) mode, 0 for manual mode.
     * Manual mode will activate last used temperature.  In typical usage call set_temp to activate manual control and set temp.
     * LoopMode refers to index in [ "12345,67", "123456,7", "1234567" ]
     * E.g. LoopMode = 0 ("12345,67") means Saturday and Sunday follow the "weekend" schedule
     * LoopMode = 2 ("1234567") means every day (including Saturday and Sunday) follows the "weekday" schedule
     * The sensor command is currently experimental
     */
     set_mode( AutoMode, LoopMode, sensor) {
    	 try {
    		 Util.debugLog("==> hysen.set_mode");

    		 if( sensor === undefined ) { sensor = 0; }
    		 let mode_byte = ( (LoopMode + 1) << 4) + AutoMode;
    		 // Util.debugLog('Mode byte: ' + mode_byte)

    		 var payload = new Uint8Array([0x01,0x06,0x00,0x02,mode_byte,sensor]);
    		 return this.send_request(payload);
    	 }
    	 catch( err ) {
    		 Util.debugLog("<** hysen.set_mode: catch = " + err);
    	 }
	}


	/**
	 * Advanced settings
	 * sensor_mode   Sensor mode (SEN)
	 *                 0 for internal sensor,
	 *                 1 for external sensor,
	 *                 2 for internal control temperature, external limit temperature.
	 *                 Factory default: 0.
	 * TempRangeExtSensor           Set temperature range for external sensor
	 *                 TempRangeExtSensor = 5..99.
	 *                 Factory default: 42C
	 * FloorTempDeadZone
	 *               Deadzone for floor temprature
	 *                 dif = 1..9.
	 *                 Factory default: 2C
	 * SensorUpperLimit
	 *               Upper temperature limit for internal sensor
	 *                 SensorUpperLimit = 5..99.
	 *                 Factory default: 35C
	 * SensorLowerLimit
	 *               Lower temperature limit for internal sensor
	 *                 SensorLowerLimit = 5..99.
	 *                 Factory default: 5C
	 * RoomTempAdjust
	 *               Actual temperature calibration
	 *                 adj = -0.5.
	 *                 Prescision 0.1C
	 * AntiFreezeMode
	 *               Anti-freezing function
	 *                 0 for anti-freezing function shut down,
	 *                 1 for anti-freezing function open.
	 *                 Factory default: 0
	 * poweron       Power on memory
	 *                 0 for power on memory off,
	 *                 1 for power on memory on.
	 *                 Factory default: 0
	 */
	async set_advanced( LoopMode, SensorMode, TempRangeExtSensor, FloorTempDeadZone, SensorUpperLimit, 
			      SensorLowerLimit, RoomTempAdjust, AntiFreezeMode, poweron) {
		try {
			Util.debugLog("==> hysen.set_advanced");

			let payload = new Uint8Array([0x01,0x10,0x00,0x02,0x00,0x05,0x0a,
    	                               LoopMode, SensorMode, TempRangeExtSensor, 
    	                               FloorTempDeadZone, SensorUpperLimit, SensorLowerLimit,
    	                               ((RoomTempAdjust*2)>>8 & 0xff), ((RoomTempAdjust*2) & 0xff),
    	                               AntiFreezeMode, poweron]);

			await this.send_request(payload);
		}
   	 	catch( err ) {
   	 		Util.debugLog("<** hysen.set_advanced: catch = " + err);
   	 	}
	}



	/**
	 * Set temperature for manual mode (also activates manual mode if currently in automatic)
	 */
	async set_temp(temp) {
   	 	this.data['TargetTemperature'] = temp
		try {
			Util.debugLog("==> hysen.set_temp: " + this.data['TargetTemperature']);
			let payload = new Uint8Array([0x01,0x06,0x00,0x01,0x00,temp * 2]);
			await this.send_request(payload);
		}
   	 	catch( err ) {
   	 		Util.debugLog("<** hysen.set_temp: catch = " + err);
   	 	}
	}


	/**
	 * Set device on(1) or off(0), does not deactivate Wifi connectivity.
	 * Remote lock disables control by buttons on thermostat.
	 */
 	async set_power( power, remote_lock ) {
		Util.debugLog("==> hysen.set_power");

    	let payload = new Uint8Array([0x01,0x06,0x00,0x00,remote_lock,power]);
		await this.send_request(payload);
	}

 	
	/**
	 * set time on device
	 * n.b. day=1 is Monday, ..., day=7 is Sunday
	 */
	async set_time(hour, minute, second, day) {
		try {
			Util.debugLog("==> hysen.set_time");

			let payload = new Uint8Array([0x01,0x10,0x00,0x08,0x00,0x02,0x04, hour, minute, second, day ]);
			await this.send_request(payload);
		}
   	 	catch( err ) {
   	 		Util.debugLog("<** hysen.set_time: catch = " + err);
   	 	}
	}


	/**
	 * Set timer schedule
	 * Format is the same as you get from get_full_status.
	 * weekday is a list (ordered) of 6 dicts like:
	 * {'start_hour':17, 'start_minute':30, 'temp': 22 }
	 * Each one specifies the thermostat temp that will become effective at start_hour:start_minute
	 * weekend is similar but only has 2 (e.g. switch on in morning and off in afternoon)
	 */
	async set_schedule(weekday,weekend) {
		try {
		Util.debugLog("==> hysen.set_schedule")

			// Begin with some magic values ...
			let input_payload = new Uint8Array([0x01,0x10,0x00,0x0a,0x00,0x0c,0x18]);

			// Now simply append times/temps
			// weekday times
			for( let i=0; i < 6; i++) {
				input_payload.append( weekday[i]['start_hour'] );
				input_payload.append( weekday[i]['start_minute'] );
			}
			// weekend times
			for( let i=0; i < 2; i++) {
				input_payload.append( weekend[i]['start_hour'] );
				input_payload.append( weekend[i]['start_minute'] );
			}
			// weekday temperatures
			for( let i=0; i < 6; i++) {
				input_payload.append( weekday[i]['temp'] * 2 );
			}
			// weekend temperatures
			for( let i=0; i < 2; i++) {
				input_payload.append( weekend[i]['temp'] * 2 );
			}

			await this.send_request(input_payload);
		}
   	 	catch( err ) {
   	 		Util.debugLog("<** hysen.set_schedule: catch = " + err);
   	 	}
	}

	
	async onCapabilityTargetTemperature( temp ) {
		Util.debugLog('==> hysen.onCapabilityTargetTemperature - temp = '+temp );
		await this.set_temp( temp )
	}

	
	async onInit() {
		super.onInit();
		this.data = [];
		this.registerCapabilityListener('target_temperature', this.onCapabilityTargetTemperature.bind(this));
		
		// set default, otherwise temp-setting on phone might not work
		this.data['TargetTemperature'] = 5;
		this.data['RoomTemperature'] = 5;
		this.data['ExternalTemperature'] = 5;
		
		this.data['SensorUpperLimit'] = 87.0
		
		setTimeout( function() {
			Util.debugLog('==> hysen.onAdded.timeout');
			this.get_full_status()
		}.bind(this), 10000 );  // timeout in [msec]

		Util.debugLog("hysen.onInit");
	}

	
	/**
	 * This method is called when the user adds the device, called just after pairing.
	 */
	async onAdded() {
		Util.debugLog('hysen.onAdded');
		super.onAdded();
		this.data = [];
	}


	/**
	 * This method will be called when a device has been removed.
	 */
	onDeleted() {
		super.onDeleted();
		this.data = [];
		Util.debugLog('hysen.onDeleted');
	}

}

module.exports = HysenDevice;




