/**
 * 
 * Driver for Broadlink RM3 Mini
 * 
 */

'use strict';

const Homey = require('homey');
const Util = require('./../../lib/util.js');
const Communicate = require('./../../lib/Communicate.js');
const BroadlinkDevice = require('./../BroadlinkDevice')


class RM3miniDevice extends BroadlinkDevice {
	
	
	
	onInit() {
		super.onInit();
		//Util.debugLog('==>RM3miniDevice.onInit');
	}
	

	/**
	 * This method is called when the user adds the device, called just after pairing.
	 */
	onAdded() {
		super.onAdded();
		//Util.debugLog('==>RM3miniDevice.onAdded');
	}

		
	/**
	 * This method will be called when a device has been removed.
	 */
	onDeleted() {
		super.onDeleted()
		//Util.debugLog('==>RM3miniDevice.onDeleted');
	}

	

}

module.exports = RM3miniDevice;
