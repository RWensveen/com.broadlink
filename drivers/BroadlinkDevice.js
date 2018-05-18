'use strict';

const Homey = require('homey');
const Util = require('./../lib/util.js');
const Communicate = require('./../lib/Communicate.js');
const DataStore = require('./../lib/DataStore.js')


class BroadlinkDevice extends Homey.Device {

	
	/**
	 * This method is called when the device is loaded, and properties such as name, 
	 * capabilities and state are available.
	 * However, the device may or may not have been added yet.
	 */
	onInit() {
		//Util.debugLog('==>BroadlinkDevice.onInit');

		let deviceSettings = this.getSettings();
		let deviceData     = this.getData();
		
		let options = {
				ipAddress : deviceSettings.ipAddress,
				mac       : Util.hexToArr(deviceData.mac),
				count     : Math.floor(Math.random() * 0xFFFF),
				id        : Util.hexToArr(deviceSettings.id),
				key       : Util.hexToArr(deviceSettings.key)
		}

		this._communicate = new Communicate()
		this._communicate.configure( options )
		
		this.dataStore = new DataStore( deviceData.mac )
		this.dataStore.readCommands();
	}
	

	/**
	 * This method is called when the user adds the device, called just after pairing.
	 * 
	 * Which means, the device has been discovered (it has an ipAddress, MAC). Now we
	 * can authenticate it to get is 'key' and 'id'
	 */
	onAdded() {
		//Util.debugLog('==>BroadlinkDevice.onAdded');
		
		let deviceData = this.getData();
		let options = {
				ipAddress : this.getSettings().ipAddress,
				mac       : Util.hexToArr(deviceData.mac),
				count     : Math.floor(Math.random() * 0xFFFF),
				id        : null,
				key       : null
		}
		this._communicate.configure( options )

		this._communicate.auth()
			.then( (authenticationData ) => {
				let newSettings = { key: Util.arrToHex(authenticationData.key),
									id : Util.arrToHex(authenticationData.id)
								  };

				this.setSettings( newSettings )
					.then( dummy => {
						//Util.debugLog( 'settings saved' )
					})
					.catch( err => {
						Util.debugLog(' settings error  * settings not saved *'); 
					})
			})
			.catch( err => {
				Util.debugLog( 'authentication error: ' + err); 
			})

	}

		
	/**
	 * This method will be called when a device has been removed.
	 */
	onDeleted() {
		//Util.debugLog('==>BroadlinkDevice.onDeleted');

		this._communicate = null;
		this.dataStore.deleteAllCommands();
	}
	
	
	
	
	
	
}

module.exports = BroadlinkDevice;
