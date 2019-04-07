/**
 * Driver for Broadlink devices
 *
 * Copyright 2018-2019, R Wensveen
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
	async onCheckInterval() {
		await this.get_temperature()
		await this.get_full_status()
	}

	check_parentalmode_on(callback) {
		callback(null, this.data['ParentalMode'] )
	}

	async do_action_parentalmode_on() {
		this.data['ParentalMode'] = true
		await this.set_power( this.data['power'], true )
		this.setCapabilityValue('parental_mode', true);
	}

	async do_action_parentalmode_off() {
		this.data['ParentalMode'] = false
		await this.set_power( this.data['power'], false )
		this.setCapabilityValue('parental_mode', false);
	}

	_trigger_parentalmode() {
		let drv = this.getDriver();
		if( this.data['ParentalMode'] ) {
			drv.trigger_parentalmode_on.trigger(this,{},{})
		}
		else {
			drv.trigger_parentalmode_off.trigger(this,{},{})
		}
		drv.trigger_parentalmode_toggle.trigger(this,{},{})
	}
	
	_updateCapabilities() {
		this.setCapabilityValue('measure_temperature', this.data['RoomTemperature'] );

		if( this.getCapabilities().indexOf('measure_temperature.room') > -1 ) {
			this.setCapabilityValue('measure_temperature.room', this.data['RoomTemperature'] );
		}
		if( this.getCapabilities().indexOf('measure_temperature.outside') > -1 ) {
			this.setCapabilityValue('measure_temperature.outside', this.data['ExternalTemperature'] );
		}
		if( this.data['TargetTemperature'] ) {
			this.setCapabilityValue('target_temperature', this.data['TargetTemperature'] ); 
		}
		if( this.data['ParentalMode'] != this.getCapabilityValue('parental_mode') ) {
			this._trigger_parentalmode()
			this.setCapabilityValue('parental_mode', this.data['ParentalMode'] );
		}
	}
	
	
	_updateAllSettings() {
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

		newSettings['weekday1'    ] = this.data['schedule'][0]['time'] 
		newSettings['weekday2'    ] = this.data['schedule'][1]['time'] 
		newSettings['weekday3'    ] = this.data['schedule'][2]['time'] 
		newSettings['weekday4'    ] = this.data['schedule'][3]['time'] 
		newSettings['weekday5'    ] = this.data['schedule'][4]['time'] 
		newSettings['weekday6'    ] = this.data['schedule'][5]['time'] 
		newSettings['weekend1'    ] = this.data['schedule'][6]['time'] 
		newSettings['weekend2'    ] = this.data['schedule'][7]['time'] 
		newSettings['weekdaytemp1'] = this.data['schedule'][0]['temp']
		newSettings['weekdaytemp2'] = this.data['schedule'][1]['temp']
		newSettings['weekdaytemp3'] = this.data['schedule'][2]['temp']
		newSettings['weekdaytemp4'] = this.data['schedule'][3]['temp']
		newSettings['weekdaytemp5'] = this.data['schedule'][4]['temp']
		newSettings['weekdaytemp6'] = this.data['schedule'][5]['temp']
		newSettings['weekendtemp1'] = this.data['schedule'][6]['temp']
		newSettings['weekendtemp2'] = this.data['schedule'][7]['temp']
		
		if( Object.keys(newSettings).length > 0) {
			this.setSettings( newSettings )
		}
	}
	
	
	_updateSetting( name, changedKeysArr, newSettingsObj ) {
		if( changedKeysArr.indexOf(name) >= 0 ) {
			this.data[name] = newSettingsObj[name];
			return true;
		}
		return false;
	}
	
	_updateSchedule( dayname, tempname, index, changedKeysArr, newSettingsObj ) {
		let changed = false
		if( changedKeysArr.indexOf(dayname) >= 0 )
		{
			this.data['schedule'][index]['time'] = newSettingsObj[dayname]
			changed = true
		}
		if( changedKeysArr.indexOf(tempname) >= 0 )
		{
			this.data['schedule'][index]['temp'] = Number( newSettingsObj[tempname] )
			changed = true
		}
		return changed
	}
	
	
	_isValidTime( dayname,  changedKeysArr, newSettingsObj )
	{
		try
		{
			if( changedKeysArr.indexOf(dayname) >= 0 )
			{
				if( newSettingsObj[dayname].length != 5 ) { return false }
				if( newSettingsObj[dayname][2] != ':' ) { return false }
				
				let h = Number( newSettingsObj[dayname].substring( 0,2 ) )
				if( ( h<0) || (h>23) ) { return false }
				
				h = Number( newSettingsObj[dayname].substring( 3,5 ) )
				if( ( h<0) || (h>59) ) { return false }
			}		
			return true
		}
		catch( err ) { return false }
	}
	
	
	/**
	 * Called when the device settings are changed by the user
	 * (so NOT called on programmatically changing settings)
	 *
	 *  @param changedKeysArr   contains an array of keys that have been changed
	 */
	async onSettings( oldSettingsObj, newSettingsObj, changedKeysArr, callback ) {
		super.onSettings( oldSettingsObj, newSettingsObj, changedKeysArr, undefined );
		let changed = false

		// sanity check
		let upperlimit = this.data['SensorUpperLimit'];
		let lowerlimit = this.data['SensorLowerLimit'];
		if( changedKeysArr.indexOf('SensorUpperLimit') >= 0 ) { upperlimit = newSettingsObj['SensorUpperLimit'] }
		if( changedKeysArr.indexOf('SensorLowerLimit') >= 0 ) { lowerlimit = newSettingsObj['SensorLowerLimit'] }
		if( upperlimit <= lowerlimit ) {
			callback( Homey.__("errors.invalid_sensor_limits") );
			return
		}

		if( ( ! this._isValidTime( 'weekday1',  changedKeysArr, newSettingsObj ) ) ||
				( ! this._isValidTime( 'weekday2',  changedKeysArr, newSettingsObj ) ) ||
				( ! this._isValidTime( 'weekday3',  changedKeysArr, newSettingsObj ) ) ||
				( ! this._isValidTime( 'weekday4',  changedKeysArr, newSettingsObj ) ) ||
				( ! this._isValidTime( 'weekday5',  changedKeysArr, newSettingsObj ) ) ||
				( ! this._isValidTime( 'weekday6',  changedKeysArr, newSettingsObj ) ) ||
				( ! this._isValidTime( 'weekend1',  changedKeysArr, newSettingsObj ) ) ||
				( ! this._isValidTime( 'weekend2',  changedKeysArr, newSettingsObj ) ) )
		{
			callback( Homey.__('errors.invalid_schedule_time') );
			return
		}

		// Update Interval
		if( changedKeysArr.indexOf('CheckInterval') >= 0 ) {
			this.stop_check_interval()
			this.start_check_interval( newSettingsObj['CheckInterval'] )
		}

		// Device settings
		changed |= this._updateSetting( 'TempRangeExtSensor', changedKeysArr, newSettingsObj );
		changed |= this._updateSetting( 'SensorMode', changedKeysArr, newSettingsObj );     // string: needs Number(x)
		changed |= this._updateSetting( 'RoomTempAdjust', changedKeysArr, newSettingsObj );
		changed |= this._updateSetting( 'AutoMode', changedKeysArr, newSettingsObj );       // string
		changed |= this._updateSetting( 'LoopMode', changedKeysArr, newSettingsObj );       // string
		changed |= this._updateSetting( 'FloorTempDeadZone', changedKeysArr, newSettingsObj );
		changed |= this._updateSetting( 'SensorUpperLimit', changedKeysArr, newSettingsObj );
		changed |= this._updateSetting( 'SensorLowerLimit', changedKeysArr, newSettingsObj );
		changed |= this._updateSetting( 'AntiFreezeMode', changedKeysArr, newSettingsObj );  // string
		changed |= this._updateSchedule( 'weekday1', 'weekdaytemp1', 0, changedKeysArr, newSettingsObj )
		changed |= this._updateSchedule( 'weekday2', 'weekdaytemp2', 1, changedKeysArr, newSettingsObj )
		changed |= this._updateSchedule( 'weekday3', 'weekdaytemp3', 2, changedKeysArr, newSettingsObj )
		changed |= this._updateSchedule( 'weekday4', 'weekdaytemp4', 3, changedKeysArr, newSettingsObj )
		changed |= this._updateSchedule( 'weekday5', 'weekdaytemp5', 4, changedKeysArr, newSettingsObj )
		changed |= this._updateSchedule( 'weekday6', 'weekdaytemp6', 5, changedKeysArr, newSettingsObj )
		changed |= this._updateSchedule( 'weekend1', 'weekendtemp1', 6, changedKeysArr, newSettingsObj )
		changed |= this._updateSchedule( 'weekend2', 'weekendtemp2', 7, changedKeysArr, newSettingsObj )

		if( changed ) {
			/*await*/ this.set_advanced( Number(this.data['LoopMode']), Number(this.data['AutoMode']), 
									 Number(this.data['SensorMode']), this.data['TempRangeExtSensor'], 
									 this.data['FloorTempDeadZone'], this.data['SensorUpperLimit'], this.data['SensorLowerLimit'], 
									 this.data['RoomTempAdjust'], Number(this.data['AntiFreezeMode']), this.data['poweron']);

	//		await this.set_mode( Number(this.data['AutoMode']), Number(this.data['LoopMode']) /*, sensor*/ );

			/*await*/ this.set_schedule( this.data['schedule'] )
		}

		// Device clock
		if( changedKeysArr.indexOf("AdjustClock") >= 0 ) {
			let d = new Date()
			let day = d.getDay()
			if( day == 0 ) { day = 7 }  // sunday = 7, not 0
			await this.set_time(d.getHours(), d.getMinutes(), d.getSeconds(), day)
			d = undefined

			setTimeout( function(d) {
				this.setSettings( {AdjustClock:false})
			}.bind(this), 2000 );  // timeout in [msec]
		}

		if( callback ) {
			/* only do callback if this functions was called by Homey.
			 * if it was called by another class, that class will do the callback.
			 */
			callback( null, true );
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
	    	//Util.debugLog( "**> hysen.send_request: Errorcode "+response.error + " in response")
	    	throw( "Errorcode: " + response.error )
	    }
	}

	/**
	 * Get current room temperature in degrees celsius
	 */
	async get_temperature() {
		try {
			var payload = new Uint8Array([0x01,0x03,0x00,0x00,0x00,0x08])
			var response = await this.send_request(payload)

			//Util.debugLog("==> hysen.get_temperature: " + Util.asHex(response))

			this.data['RoomTemperature'] = response[ 5 ] / 2.0;
			this.data['TargetTemperature'] = response[ 6 ] / 2.0;
			this.data['ExternalTemperature'] = response[ 18 ] / 2.0;

			this._updateCapabilities();
		}
		catch( err ) { Util.debugLog("**> hysen.get_temperature - catch = " + err) }
	}


	/**
	 * Get full status (including timer schedule)
	 */
	async get_full_status() {
		try {
			var payload = new Uint8Array([0x01,0x03,0x00,0x00,0x00,0x16]);
			var response = await this.send_request(payload);

			//Util.debugLog("==> hysen.get_full_status - " + Util.asHex(response));

			this.data['ParentalMode'] = ( response[3] & 1 ) ? true : false;
			this.data['power'] =  response[4] & 1;
			this.data['active'] =  (response[4] >> 4) & 1;
			this.data['temp_manual'] =  (response[4] >> 6) & 1;
			this.data['RoomTemperature'] =  response[5]/2.0;
			this.data['TargetTemperture'] =  response[6]/2.0;
			this.data['AutoMode'] =  (response[7] & 15).toString();
			this.data['LoopMode'] =  ((response[7] >> 4) & 0x0F).toString();
			this.data['SensorMode'] = response[8].toString();
			this.data['TempRangeExtSensor'] = response[9];
			this.data['FloorTempDeadZone'] = response[10];
			this.data['SensorUpperLimit'] = response[11];
			this.data['SensorLowerLimit'] = response[12];
			this.data['RoomTempAdjust'] = (response[13] << 8) + response[14];
			if( this.data['RoomTempAdjust'] > 32767 ) {
		  		this.data['RoomTempAdjust'] = this.data['RoomTempAdjust'] - 65536;
		  	}
			this.data['RoomTempAdjust'] = this.data['RoomTempAdjust'] / 2.0
			this.data['AntiFreezeMode'] = response[15].toString();
			this.data['poweron'] = response[16];
			//this.data['unknown'] = response[17];
			this.data['ExternalTemperature'] = response[18]/2.0;
			//this.data['hour'] =  response[19];
			//this.data['min'] =  response[20];
			//this.data['sec'] =  response[21];
			//this.data['dayofweek'] =  response[22];
			
			let schedule = [];
			for( let i =0; i < 8; i++ ) { schedule[i] = {} }
			for( let i =0; i < 8; i++ ) {
				let h = response[2*i + 23]
				let m = response[2*i + 24]
				schedule[i]['time'] = ( h < 10 ? '0'+h : h.toString() ) + ":" + ( m < 10 ? '0'+m : m.toString() )
	  			schedule[i]['temp'] = response[i + 39]/2.0;
			}
			this.data['schedule'] = schedule;
						
			this._updateCapabilities(); 
			this._updateAllSettings();
			
		}
		catch( err ) { Util.debugLog("**> hysen.get_full_status - catch = " + err) }
	}


	/**
	 * Change controller mode
     * AutoMode 
     *              Manual mode will activate last used temperature.  In typical usage call set_target_temperature() to 
     *              activate manual control and set temperature.
     *                 0 for manual mode
     *                 1 for auto (scheduled/timed) mode
     * LoopMode     Scheduling mode for days
     *                 index in [ "12345,67", "123456,7", "1234567" ]
     *                 1 ("12345,67") means Saturday and Sunday follow the "weekend" schedule
     *                 2 ("123456,7") means Saturday follows weekday and Sunday follows "weekend" schedule
     *                 3 ("1234567") means every day (including Saturday and Sunday) follows the "weekday" schedule
     * The sensor command is currently experimental
     */
     async set_mode( AutoMode, LoopMode, sensor) {
    	 try {
    		 if( sensor === undefined ) { sensor = 0; }
    		 let mode_byte = ( LoopMode << 4) + AutoMode;

    		 var payload = new Uint8Array([0x01,0x06,0x00,0x02,mode_byte,sensor]);
    		 await this.send_request(payload);
    	 }
    	 catch( err ) { Util.debugLog("**> hysen.set_mode: catch = " + err) }
	}


	/**
	 * Advanced settings
     * LoopMode     Scheduling mode for days
     *                 index in [ "12345,67", "123456,7", "1234567" ]
     *                 1 ("12345,67") means Saturday and Sunday follow the "weekend" schedule
     *                 2 ("123456,7") means Saturday follows weekday and Sunday follows "weekend" schedule
     *                 3 ("1234567") means every day (including Saturday and Sunday) follows the "weekday" schedule
     * AutoMode 
     *              Manual mode will activate last used temperature.  In typical usage call set_target_temperature() to 
     *              activate manual control and set temperature.
     *                 0 for manual mode
     *                 1 for auto (scheduled/timed) mode
	 * SensorMode   Sensor mode (SEN)
	 *                 0 for internal sensor,
	 *                 1 for external sensor,
	 *                 2 for internal control temperature, external limit temperature.
	 *                 Factory default: 0.
	 * TempRangeExtSensor
	 *              Set temperature range for external sensor
	 *                 TempRangeExtSensor = 5..99.
	 *                 Factory default: 42C
	 * FloorTempDeadZone
	 *              Deadzone for floor temprature
	 *                 dif = 1..9.
	 *                 Factory default: 2C
	 * SensorUpperLimit
	 *              Upper temperature limit for internal sensor
	 *                 SensorUpperLimit = 5..99.
	 *                 Factory default: 35C
	 * SensorLowerLimit
	 *              Lower temperature limit for internal sensor
	 *                 SensorLowerLimit = 5..99.
	 *                 Factory default: 5C
	 * RoomTempAdjust
	 *              Actual temperature calibration
	 *                 adj = -0.5.
	 *                 Prescision 0.1C
	 * AntiFreezeMode
	 *              Anti-freezing function
	 *                 0 for anti-freezing function shut down,
	 *                 1 for anti-freezing function open.
	 *                 Factory default: 0
	 * poweron      Power on memory
	 *                 0 for power on memory off,
	 *                 1 for power on memory on.
	 *                 Factory default: 0
	 */
	async set_advanced( LoopMode, AutoMode, SensorMode, TempRangeExtSensor, FloorTempDeadZone, SensorUpperLimit, 
			      		SensorLowerLimit, RoomTempAdjust, AntiFreezeMode, poweron) {
		try {
			RoomTempAdjust = RoomTempAdjust *2
			if( RoomTempAdjust < 0 ) {
		  		RoomTempAdjust = 65536 + RoomTempAdjust;
		  	}
			let payload = new Uint8Array([0x01,0x10,0x00,0x02,0x00,0x05,0x0a,
    	                               (LoopMode<<4) + AutoMode, SensorMode, 
    	                               TempRangeExtSensor, FloorTempDeadZone, 
    	                               SensorUpperLimit, SensorLowerLimit,
    	                               ((RoomTempAdjust>>8) & 0xff), (RoomTempAdjust & 0xff),
    	                               AntiFreezeMode, poweron]);
			
			await this.send_request(payload);
		}
   	 	catch( err ) { Util.debugLog("**> hysen.set_advanced: catch = " + err) }
	}


	/**
	 * Set temperature for manual mode (also activates manual mode if currently in automatic)
	 */
	async set_target_temperature(temp) {
		try {
	   	 	let payload = new Uint8Array([0x01,0x06,0x00,0x01,0x00,temp * 2]);
			await this.send_request(payload);
		}
   	 	catch( err ) { Util.debugLog("**> hysen.set_target_temperature: catch = " + err) }
	}


	/**
	 * Set device on(1) or off(0), does not deactivate Wifi connectivity.
	 * ParentalMode disables control by buttons on thermostat.
	 */
 	async set_power( power, ParentalMode ) {
		try {
			let payload = new Uint8Array([0x01,0x06,0x00,0x00, ParentalMode ? 1:0, power]);
			await this.send_request(payload);
		}
   	 	catch( err ) { Util.debugLog("**> hysen.set_power: catch = " + err) }
	}

 	
	/**
	 * set time on device
	 * 
	 * hour    [0..23]
	 * minute  [0..59]
	 * second  [0..59]
	 * day     [1..7]   1 = Monday, 2 = Tuesday, ... , 7 = Sunday
	 */
	async set_time(hour, minute, second, day) {
		try {
			let payload = new Uint8Array([0x01,0x10,0x00,0x08,0x00,0x02,0x04, hour, minute, second, day ]);
			await this.send_request(payload);
		}
   	 	catch( err ) { Util.debugLog("**> hysen.set_time: catch = " + err) }
	}


	/**
	 * Set timer schedule
	 * Format is the same as you get from get_full_status.
	 * weekday is a list (ordered) of 6 dicts like:
	 * {'time': "17:30", 'temp': 22 }
	 * Each one specifies the thermostat temp that will become effective at 'time'
	 * weekend is similar but only has 2 (e.g. switch on in morning and off in afternoon)
	 *
	 * schedule = array[0..7]['time' | 'temp']
	 *                   where [x]['time] in format "00:00"
	 * weekday = schedule[0..5]
	 * weekend = schedule[6..7]
	*/
	async set_schedule(schedule) {
		try {
			//Util.debugLog("==> hysen.set_schedule")

			// Begin with some magic values ...
			let input_payload = new Uint8Array([0x01,0x10,0x00,0x0a,0x00,0x0c,0x18]);
			let payload = new Uint8Array( 24 )

			// times (format 'hh:mm'
			for( let i=0; i < 8; i++) {
				payload[i*2    ] = Number( schedule[i]['time'].substring( 0,2 ) );  // hour
				payload[i*2 +1 ] = Number( schedule[i]['time'].substring( 3,5 ) );  // minute
			}
			// temperatures
			for( let i=0; i < 8; i++) {
				payload[i +16 ] = schedule[i]['temp'] * 2;
			}

			await this.send_request( Util.concatTypedArrays(input_payload,payload) );
		}
   	 	catch( err ) { Util.debugLog("**> hysen.set_schedule: catch = " + err) }
	}

	
	async onCapabilityTargetTemperature( temp ) {
		this.data['TargetTemperature'] = temp
		await this.set_target_temperature( temp )
	}

	async onCapabilityParentalMode( mode ) {
		this.data['ParentalMode'] = mode
		await this.set_power( this.data['power'], mode )
		this._trigger_parentalmode()
	}

	
	async onInit() {
		try {
			super.onInit();
			this.data = [];
			this.registerCapabilityListener('target_temperature', this.onCapabilityTargetTemperature.bind(this));
			this.registerCapabilityListener('parental_mode', this.onCapabilityParentalMode.bind(this));

			setTimeout( async function() {
//					this.onCheckInterval();
					try {
					Util.debugLog("hysen - onInit delayed")
					await this.get_full_status()
					await this.get_temperature()
				}
				catch( error ) { Util.debugLog("**> HysenDevice.onInit: catch = " + error) }
			}.bind(this), 4000 );  // timeout in [msec]
		}
		catch( error ) { Util.debugLog("**> HysenDevice.onInit: catch = " + error) }
	}


	/**
	 * This method will be called when a device has been removed.
	 */
	onDeleted() {
		super.onDeleted();
		this.data = undefined;
	}

}

module.exports = HysenDevice;
