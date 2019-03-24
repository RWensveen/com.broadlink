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
const Util = require('./../lib/util.js');
const DeviceInfo = require('./../lib/DeviceInfo.js');
const Communicate = require('./../lib/Communicate.js');


class BroadlinkDriver extends Homey.Driver {


	/**
	 * Method that will be called when a driver is initialized. It will register Flow Cards
	 * for the respective drivers.
	 * @param options {Object}
	 * @returns {Error}
	 */
	onInit(options) {
		// options
		if( options ) {
			this.CompatibilityID = options.CompatibilityID;
		}
		// list of devices discovered during pairing
		this.discoveredDevice = undefined
	}


	setCompatibilityID( id ) {
		this.CompatibilityID = id;
	}

	
	/**
	 *
	 *
	 */
	onPair(socket) {
		let commOptions = {
				ipAddress : null,
				mac       : null,
				id        : null,
				count     : Math.floor( Math.random() * 0xFFFF ),
				key       : null
		}
		this._communicate = new Communicate()
		this._communicate.configure( commOptions )

        socket.on('disconnect', function() {
        	try {
				this.discoveredDevice = undefined;
				this._communicate.destroy();
				this._communicate = undefined;
        	} catch( err ) { ; }
       	}.bind(this) );

		socket.on( 'start_discover', function(userdata, callback ) {
			this.discoveredDevice = undefined;

			Util.getHomeyIp()
				.then ( function( localAddress ) {
					// get local address without port number
					let i = localAddress.indexOf(':')
					if( i > 0 ) { localAddress = localAddress.slice(0,i); }

					this._communicate.discover( 5, localAddress, userdata.address )
			           	.then ( info => {
			           
			           		var devinfo = DeviceInfo.getDeviceInfo(info.devtype,this.CompatibilityID)
			           		var readableMac = Util.asHex(info.mac).replace(/,/g,':')

			           		this.discoveredDevice = { 
			           				device : {
			           					name: devinfo.name + ' ('+readableMac+')',
			           					data: { name     : devinfo.name,
			           							mac      : Util.arrToHex(info.mac),
			           							devtype  : info.devtype.toString()
			           					},
			           					settings: { ipAddress: info.ipAddress
			           					}
			           				},
			           				isCompatible: devinfo.isCompatible
			           		}
			           		socket.emit('discovered', this.discoveredDevice )
			           
			           	},  rejectReason => {
			           		socket.emit('discovered', null )
			           	})
			           	.catch( err => {
			           		Util.debugLog('**>onPair.catch: ' + err)
			           		socket.emit('discovered', null )
			           	})
				}.bind(this))
				.catch( function(err) {
					Util.debugLog('**>onPair.catch: ' + err)
					socket.emit('discovered',null)
				})
		}.bind(this))

		socket.on('properties_set', function( properties, callback ) {
			// only used for HYSEN device.
			if( ! properties[ 'externalSensor' ] ) {
				this.discoveredDevice.device['capabilities'] = [
					"measure_temperature",
					"target_temperature",
					"parental_mode"
					]
				this.discoveredDevice.device['capabilitiesOptions' ] = {
					"target_temperature": {
						"min": 5,
						"max": 30,
						"step": 0.5
					}
				}
			}
			else {
				this.discoveredDevice.device['capabilities'] = [
					"measure_temperature.room",
					"measure_temperature.outside",
					"measure_temperature",
					"target_temperature",
					"parental_mode"
					]
				this.discoveredDevice.device['capabilitiesOptions' ] = {
					"measure_temperature.room": { "title": { "en": "Room", "nl": "Binnen2" } },
					"measure_temperature.outside": { "title": { "en": "Outside", "nl": "Buiten2" } },
					"target_temperature": {
						"min": 5,
						"max": 30,
						"step": 0.5
					}
				}
			}
/*
			// no external sensor: remove from capabilities
			if( ! properties[ 'externalSensor' ] ) {
				let i = this.discoveredDevice.device['capabilities'].indexOf('measure_temperature.outside')
				if( i > -1) {
					this.discoveredDevice.device['capabilities'].splice( i,1 )
				}
				i = this.discoveredDevice.device['capabilitiesOptions'].indexOf('measure_temperature.outside')
				if( i > -1) {
					this.discoveredDevice.device['capabilitiesOptions'].splice( i,1 )
				}
			}
*/
			socket.emit('properties_done',null)
		}.bind(this));
		
		socket.on('list_devices', function(data, callback) {
			return callback(null,this.discoveredDevice.device);
		}.bind(this));
	}
}

module.exports = BroadlinkDriver;
