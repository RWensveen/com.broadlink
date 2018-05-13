'use strict';

const Homey = require('homey');
const Util = require('./../lib/util.js');
const DeviceInfo = require('./../lib/DeviceInfo.js');
const Communicate = require('./../lib/Communicate.js');


class BroadlinkDriver extends Homey.Driver {

	
	/**
	 * Method that will be called when a driver is initialized. It will register Flow Cards
	 * for the respective drivers. Options parameter should at least contain a driverType
	 * property.
	 * @param options {Object}
	 * @returns {Error}
	 */
	onInit(options) {
		Util.debugLog('==>BroadlinkDriver.onInit', options);

		// Store driverType
		this.driverType = options.driverType;
		
		// list of devices discovered during pairing 
		this.discoveredDevices = [];
		
		let commOptions = {
				ipAddress : '',
				mac       : '',
				id        : [0,0,0,0],
				count     : Math.floor( Math.random() * 0xFFFF ),
				key       : null
		}
		this._communicate = new Communicate()
		this._communicate.configure( commOptions )
	}


	/**
	 * 
	 * 
	 */
	onPair(socket) {
		Util.debugLog('==>BroadlinkDriver.onPair');
        var that = this

        socket.on('disconnect', function() {
			//Util.debugLog('BroadlinkDriver.onPair - disconnect');
			that.discoveredDevices = [];
		});
		
		socket.on( 'start_discover', function(userdata, callback ) {

			Util.getHomeyIp()
				.then ( localAddress => {
					let i = localAddress.indexOf(':')
					if( i > 0 ) { localAddress = localAddress.slice(0,i); }
			        
					that._communicate.discover( 5, localAddress, userdata.address ) 
			           	.then ( info => {
			           		
			           		var devinfo = DeviceInfo.getDeviceInfo(info.devtype)
			           		var readableMac = Util.asHex(info.mac).replace(/,/g,':')

			           		var device = {
			           				name: devinfo.name + ' ('+readableMac+')',
			           				data: { name     : devinfo.name,
			           						ipAddress: info.ipAddress,
			           						mac      : Util.arrToHex(info.mac),
			           						devtype  : info.devtype.toString()
			           				}
			           		}
			           		that.discoveredDevices.push( device )
			           		socket.emit('discovered', device )
			           	})
			           	.catch( err => {
			           		//Util.debugLog('BroadlinkDriver.onPair -> discover error: ' + err)
			           		socket.emit('discovered', null )
			           	})
				})
				.catch( function(err) {
					//Util.debugLog('no local address: ' + err)
					socket.emit('discovered',null)
				})
		})
		
        socket.on('list_devices', function(data, callback) {
			return callback(null,that.discoveredDevices);
		});
	}

}


module.exports = BroadlinkDriver;
