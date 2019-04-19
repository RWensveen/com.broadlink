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

'use strict';

const Homey = require('homey');
const Util = require('./../../lib/util.js');
const Communicate = require('./../../lib/Communicate.js');


class BroadlinkDevice extends Homey.Device {


	/**
	 * This method is called when the device is loaded, and properties such as name,
	 * capabilities and state are available.
	 * However, the device may or may not have been added yet.
	 */
	onInit( dev ) {

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

		this.getDriver()
			.ready( () => {
				// if the driver has a CheckInterval, set it. otherwise ignore it.
				let ci = this.getSetting('CheckInterval');
				if( ci ) {
					this.start_check_interval( ci )
				}
			})
	}

	
	/**
	 * 
	 */
	authenticateDevice() {
		this._communicate.auth()
			.then( (authenticationData ) => {
				let newSettings = { key: Util.arrToHex(authenticationData.key),
									id : Util.arrToHex(authenticationData.id)
							  	   };

				this.setSettings( newSettings )
					.then( dummy => {
						this.setSettings( {Authenticate:false})
					})
					.catch( err => {
						Util.debugLog('**> settings error, settings not saved *');
					})
			})
			.catch( err => {
				Util.debugLog( '**> authentication error: ' + err);
			})
	}
	

	/**
	 * This method is called when the user adds the device, called just after pairing.
	 *
	 * Which means, the device has been discovered (it has an ipAddress, MAC). Now we
	 * can authenticate it to get is 'key' and 'id'
	 */
	onAdded() {

		let deviceData = this.getData();
		let options = {
				ipAddress : this.getSettings().ipAddress,
				mac       : Util.hexToArr(deviceData.mac),
				count     : Math.floor(Math.random() * 0xFFFF),
				id        : null,
				key       : null
		}
		this._communicate.configure( options )

		this.authenticateDevice();
	}

	/**
	 * This method will be called when a device has been removed.
	 */
	onDeleted() {
		this.stop_check_interval();

		this._communicate.destroy();
		this._communicate = null;
	}


	/**
	 * Called when the device settings are changed by the user
	 * (so NOT called on programmatically changing settings)
	 *
	 *  @param changedKeysArr   contains an array of keys that have been changed
	 */
	onSettings( oldSettingsObj, newSettingsObj, changedKeysArr, callback ) {
		
		if( changedKeysArr.indexOf('ipAddress') >= 0 ) {
			this._communicate.setIPaddress( newSettingsObj['ipAddress'] )
		}
		if( changedKeysArr.indexOf('CheckInterval') >= 0 ) {
			this.stop_check_interval()
			this.start_check_interval( newSettingsObj['CheckInterval'] )
		}
		if( changedKeysArr.indexOf('Authenticate') >= 0 ) {
			this.authenticateDevice();
		}
		if( callback ) {
			/* only do callback if this functions was called by Homey.
			 * if it was called by another class, that class will do the callback.
			 */
			callback( null, true );
		}
	}


	/**
	 * Start a timer to periodically access the device. the parent class must implement onCheckInterval()
	 */
	start_check_interval( interval ) {
		
		this.checkTimer = setInterval( function() {
												this.onCheckInterval();
											}.bind(this),
										interval * 60000);  // [minutes] to [msec]
	}


	/**
	 * Stop the periodic timer
	 */
	stop_check_interval() {
		if( this.checkTimer ) {
			clearInterval( this.checkTimer )
			this.checkTimer = null
		}
	}

}

module.exports = BroadlinkDevice;
