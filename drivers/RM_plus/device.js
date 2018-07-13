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

const RM3MiniDevice = require('./../RM3_mini/device');
const Util = require('./../../lib/util.js');


class RmPlusDevice extends RM3MiniDevice {
	
	
	onInit() {
		super.onInit();
		this.learn = false;
		
		this.registerCapabilityListener('learnRFcmd', this.onCapabilityLearnRF.bind(this));
	}
	

	/**
	 * This method will be called when the learn state needs to be changed.
	 * @param onoff
	 * @returns {Promise}
	 */
	onCapabilityLearnRF(onoff) {
	    Util.debugLog('==>RM3miniDevice.onCapabilityLearnIR');
	    if( this.learn ) { 
	    	return Promise.resolve() 
	    }
	    this.learn = true;
	    
	    var that = this
	    return this._communicate.enterRFSweep()
			.then( response => {
				Util.debugLog('   sweeping');
				that._communicate.checkRFData()
					.then( data => {
						Util.debugLog('  checked RF data ')
						that._communicate.cancelRFSweep();
						that._communicate.checkRFData2()
							.then( data => {
								Util.debugLog('  checked RF data 2')
								that.learn = false;
								if( data ) {
									let idx = that.dataStore.dataArray.length + 1;
									let cmdname = 'cmd' + idx;
									this.dataStore.addCommand( cmdname, data);
							
									this.storeCmdSetting( cmdname );
								}
							}, rej => { 
								Util.debugLog('  check RF data 2: reject')
							})
					}, rej => { 
						Util.debugLog('  check RF data : reject')
						that._communicate.cancelRFSweep();
					})
					.catch( err => {
						that.learn = false;
						Util.debugLog('**> RMPlusDevice.onCapabilityLearnIR, error checking data: '+err);
					})
			}, rej => { 
				Util.debugLog('  sweep : reject ')
				that._communicate.cancelRFSweep();
			})
			.catch( err => {
				Util.debugLog('**> error learning: '+err);
				that.learn = false;
			})
	}
	
}

module.exports = RmPlusDevice;
