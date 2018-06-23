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

'use strict';

const Homey = require('homey');
const Util = require('./../../lib/util.js');
const Communicate = require('./../../lib/Communicate.js');
const BroadlinkDevice = require('./../BroadlinkDevice');
const CRC16 = require('crc/lib/crc16_modbus');


class HysenDevice  extends BroadlinkDevice {
	
	
	/**
	 * Get current room temperature in degrees celsius
	 */
	get_temperature() {

		var payload = new Uint8Array([0x01,0x03,0x00,0x00,0x00,0x08])
		return this.send_request(payload)
			.then (response => {
				let room_temperature = response[ 5 ] / 2.0;
				let outside_temperature = response[ 18 ] / 2.0;
				this.setCapabilityValue('measure_temperature.room', room_temperature );
				this.setCapabilityValue('measure_temperature.outside', outside_temperature );

				//Util.debugLog('==>Hysendevice.get_temperature - room=' + room_temperature + '  outside='+outside_temperature);

			}, rejection => {
				//Util.debugLog('==>HysenDevice.get_temperature - rejection = ' + rejection);
			})
			.catch( err => {
				//Util.debugLog('==>HysenDevice.get_temperature - catch = ' + err);
				throw err;
			})
	}


	/**
	 * Get full status (including timer schedule)
	 */
	get_full_status() {
		
		var payload = new Uint8Array([0x01,0x03,0x00,0x00,0x00,0x16])
		return this.send_request(payload)
			.then (response => {
				//Util.debugLog('==>Hysendevice.get_full_status - ' + Util.asHex(response));

				data = [];
				data['remote_lock'] =  payload[3] & 1;
				data['power'] =  payload[4] & 1;
				data['active'] =  (payload[4] >> 4) & 1;
				data['temp_manual'] =  (payload[4] >> 6) & 1;
				data['room_temp'] =  (payload[5] & 255)/2.0;
				data['thermostat_temp'] =  (payload[6] & 255)/2.0;
				data['auto_mode'] =  payload[7] & 15;
				data['loop_mode'] =  (payload[7] >> 4) & 15;
				data['sensor'] = payload[8];
				data['osv'] = payload[9];
				data['dif'] = payload[10];
				data['svh'] = payload[11];
				data['svl'] = payload[12];
				data['room_temp_adj'] = ((payload[13] << 8) + payload[14])/2.0;
				if( data['room_temp_adj'] > 32767 ) {
		  			data['room_temp_adj'] = 32767 - data['room_temp_adj'];
		  		}
				data['fre'] = payload[15];
				data['poweron'] = payload[16];
				data['unknown'] = payload[17];
				data['external_temp'] = (payload[18] & 255)/2.0;
				data['hour'] =  payload[19];
				data['min'] =  payload[20];
				data['sec'] =  payload[21];
				data['dayofweek'] =  payload[22];
	
				weekday = [];
				for( let i =0; i < 6; i++ ) {
	  				weekday.append({'start_hour':payload[2*i + 23], 'start_minute':payload[2*i + 24],'temp':payload[i + 39]/2.0});
				}
				data['weekday'] = weekday;
				weekend = [];
				for( let i =6; i < 8; i++ ) {
					weekend.append({'start_hour':payload[2*i + 23], 'start_minute':payload[2*i + 24],'temp':payload[i + 39]/2.0});
				}
				data['weekend'] = weekend;
				
				return data;

			}, rejection => {
				//Util.debugLog('==>HysenDevice.get_full_status - rejection = ' + rejection);
			})
			.catch( err => {
				//Util.debugLog('==>HysenDevice.get_full_status - catch = ' + err);
				throw err;
			})
	}

		
	/**
	 * Change controller mode
     * auto_mode = 1 for auto (scheduled/timed) mode, 0 for manual mode.
     * Manual mode will activate last used temperature.  In typical usage call set_temp to activate manual control and set temp.
     * loop_mode refers to index in [ "12345,67", "123456,7", "1234567" ]
     * E.g. loop_mode = 0 ("12345,67") means Saturday and Sunday follow the "weekend" schedule
     * loop_mode = 2 ("1234567") means every day (including Saturday and Sunday) follows the "weekday" schedule
     * The sensor command is currently experimental
     */
     set_mode( auto_mode, loop_mode, sensor) {
		
		if( sensor === undefined ) { sensor = 0; }
  		let mode_byte = ( (loop_mode + 1) << 4) + auto_mode
		// Util.debugLog('Mode byte: ' + mode_byte)
	
		var payload = new Uint8Array([0x01,0x06,0x00,0x02,mode_byte,sensor])
		return this.send_request(payload);
	}
	
	
	/**
	 * Advanced settings
	 * sensor_mode   Sensor mode (SEN)
	 *                 0 for internal sensor, 
	 *                 1 for external sensor, 
	 *                 2 for internal control temperature, external limit temperature. 
	 *                 Factory default: 0.
	 * osv           Set temperature range for external sensor 
	 *                 osv = 5..99. 
	 *                 Factory default: 42C
	 * dif           Deadzone for floor temprature
	 *                 dif = 1..9. 
	 *                 Factory default: 2C
	 * svh           Upper temperature limit for internal sensor 
	 *                 svh = 5..99. 
	 *                 Factory default: 35C
	 * svl           Lower temperature limit for internal sensor 
	 *                 svl = 5..99.  
	 *                 Factory default: 5C
	 * adj           Actual temperature calibration 
	 *                 adj = -0.5.  
	 *                 Prescision 0.1C
	 * fre           Anti-freezing function 
	 *                 0 for anti-freezing function shut down,  
	 *                 1 for anti-freezing function open.  
	 *                 Factory default: 0
	 * poweron       Power on memory 
	 *                 0 for power on memory off,  
	 *                 1 for power on memory on.
	 *                 Factory default: 0
	 */
	set_advanced( loop_mode, sensor_mode, osv, dif, svh, svl, adj, fre, poweron) {
    	let input_payload = new Uint8Array([0x01,0x10,0x00,0x02,0x00,0x05,0x0a, 
    	                               loop_mode, sensor_mode, osv, dif, svh, svl, 
    	                               ((adj*2)>>8 & 0xff), ((adj*2) & 0xff), 
    	                               fre, poweron])

		return this.send_request(payload);
	}
	
	
	/**
	 * For backwards compatibility only.  Prefer calling set_mode directly.  
	 * Note this function invokes loop_mode=0 and sensor=0.
	 */
	switch_to_auto() {
		this.set_mode(1, 0);
	}
  
  
	/**
	 * For backwards compatibility only.  Prefer calling set_mode directly.  
	 * Note this function invokes loop_mode=0 and sensor=0.
	 */
	switch_to_manual() {
    	this.set_mode(0, 0);
    }
	
	/**
	 * Set temperature for manual mode (also activates manual mode if currently in automatic)
	 */
	set_temp(temp) {
    	let payload = new Uint8Array([0x01,0x06,0x00,0x01,0x00,int(temp * 2)]);
		return this.send_request(payload);
	}
	
  
	/**
	 * Set device on(1) or off(0), does not deactivate Wifi connectivity.  
	 * Remote lock disables control by buttons on thermostat.
	 */
 	set_power( power, remote_lock ) {
    	let payload = new Uint8Array([0x01,0x06,0x00,0x00,remote_lock,power]);
		return this.send_request(payload);
	}

	/**
	 * set time on device
	 * n.b. day=1 is Monday, ..., day=7 is Sunday
	 */
	set_time(hour, minute, second, day) {
    	let payload = new Uint8Array([0x01,0x10,0x00,0x08,0x00,0x02,0x04, hour, minute, second, day ]);
		return this.send_request(payload);
	}

	
	/**
	 * Set timer schedule
	 * Format is the same as you get from get_full_status.
	 * weekday is a list (ordered) of 6 dicts like:
	 * {'start_hour':17, 'start_minute':30, 'temp': 22 }
	 * Each one specifies the thermostat temp that will become effective at start_hour:start_minute
	 * weekend is similar but only has 2 (e.g. switch on in morning and off in afternoon)
	 */
	set_schedule(weekday,weekend) {
    
    	// Begin with some magic values ...
    	let input_payload = new Uint8Array([0x01,0x10,0x00,0x0a,0x00,0x0c,0x18])

		// Now simply append times/temps
		// weekday times
		for( let i=0; i < 6; i++) {
			input_payload.append( weekday[i]['start_hour'] )
			input_payload.append( weekday[i]['start_minute'] )
		}
		// weekend times
		for( let i=0; i < 2; i++) {
			input_payload.append( weekend[i]['start_hour'] )
			input_payload.append( weekend[i]['start_minute'] )
		}
		// weekday temperatures
		for( let i=0; i < 6; i++) {
			input_payload.append( weekday[i]['temp'] * 2 )
		}
		// weekend temperatures
		for( let i=0; i < 2; i++) {
			input_payload.append( weekend[i]['temp'] * 2 )
		}
		
		self.send_request(input_payload)
	}

    
	onInit() {
		super.onInit();
	}
	
	/**
	 * This method is called when the user adds the device, called just after pairing.
	 */
	onAdded() {
		super.onAdded();
		//Util.debugLog('==>HysenDevice.onAdded');
	}

		
	/**
	 * This method will be called when a device has been removed.
	 */
	onDeleted() {
		super.onDeleted()
		//Util.debugLog('==>HysenDevice.onDeleted');
	}

}

module.exports = SysenDevice;




/*
class hysen(device):
  def __init__ (self, host, mac, devtype):
    device.__init__(self, host, mac, devtype)
    self.type = "Hysen heating controller"

  # Send a request
  # input_payload should be a bytearray, usually 6 bytes, e.g. bytearray([0x01,0x06,0x00,0x02,0x10,0x00]) 
  # Returns decrypted payload
  # New behaviour: raises a ValueError if the device response indicates an error or CRC check fails
  # The function prepends length (2 bytes) and appends CRC
  def send_request(self,input_payload):
    
    from PyCRC.CRC16 import CRC16
    crc = CRC16(modbus_flag=True).calculate(bytes(input_payload))

    # first byte is length, +2 for CRC16
    request_payload = bytearray([len(input_payload) + 2,0x00])
    request_payload.extend(input_payload)
    
    # append CRC
    request_payload.append(crc & 0xFF)
    request_payload.append((crc >> 8) & 0xFF)

    # send to device
    response = self.send_packet(0x6a, request_payload)

    # check for error
    err = response[0x22] | (response[0x23] << 8)
    if err: 
      raise ValueError('broadlink_response_error',err)
    
    response_payload = bytearray(self.decrypt(bytes(response[0x38:])))

    # experimental check on CRC in response (first 2 bytes are len, and trailing bytes are crc)
    response_payload_len = response_payload[0]
    if response_payload_len + 2 > len(response_payload):
      raise ValueError('hysen_response_error','first byte of response is not length')
    crc = CRC16(modbus_flag=True).calculate(bytes(response_payload[2:response_payload_len]))
    if (response_payload[response_payload_len] == crc & 0xFF) and (response_payload[response_payload_len+1] == (crc >> 8) & 0xFF):
      return response_payload[2:response_payload_len]
    else: 
      raise ValueError('hysen_response_error','CRC check on response failed')
      
*/