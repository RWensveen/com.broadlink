/**
 * 
 * Driver for Broadlink RM3 Mini
 * 
 */


'use strict';

const BroadlinkDriver = require('./../BroadlinkDriver');
const Util = require('./../../lib/util.js' );




class BroadlinkRM3miniDriver extends BroadlinkDriver {

	
	onInit() {
		super.onInit({
			driverType: 'RM3 Mini'
		});
	}
	
}

module.exports = BroadlinkRM3miniDriver;
