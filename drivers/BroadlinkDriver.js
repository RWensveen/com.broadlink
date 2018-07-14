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
		this.CompatibilityID = options.CompatibilityID;
		
		// list of devices discovered during pairing 
		this.discoveredDevices = [];
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

		var that = this
		
        socket.on('disconnect', function() {
        	try {
				that.discoveredDevices = [];
				that._communicate.destroy();
				that._communicate = undefined;
        	} catch( err ) { ; }
       	});
		
		socket.on( 'start_discover', function(userdata, callback ) {

			Util.getHomeyIp()
				.then ( localAddress => {
					// get local address without port number
					let i = localAddress.indexOf(':')
					if( i > 0 ) { localAddress = localAddress.slice(0,i); }
			        
					that._communicate.discover( 5, localAddress, userdata.address ) 
			           	.then ( info => {
			           		
			           		var devinfo = DeviceInfo.getDeviceInfo(info.devtype,that.CompatibilityID)
			           		var readableMac = Util.asHex(info.mac).replace(/,/g,':')

			           		var device = {
			           				name: devinfo.name + ' ('+readableMac+')',
			           				data: { name     : devinfo.name,
			           						mac      : Util.arrToHex(info.mac),
			           						devtype  : info.devtype.toString()
			           						},
			           				settings: { ipAddress: info.ipAddress
			           						},
			           				isCompatible: devinfo.isCompatible
			           		}
			           		that.discoveredDevices.push( device )
			           		
			           		Util.debugLog('->onPair.discovered = ' + JSON.stringify(device))
			           		socket.emit('discovered', device )
			           		
			           	},  rejectReason => {
			           		Util.debugLog('**>onPair.reject: ' + rejectReason)
			           		socket.emit('discovered', null )
			           	})
			           	.catch( err => {
			           		Util.debugLog('**>onPair.catch: ' + err)
			           		socket.emit('discovered', null )
			           	})
				})
				.catch( function(err) {
					Util.debugLog('**>onPair.catch: ' + err)
					socket.emit('discovered',null)
				})
		})
		
		socket.on('list_devices', function(data, callback) {
			return callback(null,that.discoveredDevices);
		});
	}

	
}


module.exports = BroadlinkDriver;
