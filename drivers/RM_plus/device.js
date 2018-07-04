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


class RmPlusDevice extends RM3MiniDevice {
	
	
	onInit() {
		super.onInit();
		
		this.registerCapabilityListener('learnRFCmd', this.onCapabilityLearnRF.bind(this));
	}
	

	/**
	 * This method will be called when the learn state needs to be changed.
	 * @param onoff
	 * @returns {Promise}
	 */
	onCapabilityLearnRF(onoff) {
	    //Util.debugLog('==>RM3miniDevice.onCapabilityLearnIR');
	    if( this.learn ) { 
	    	return Promise.resolve() 
	    }
	    this.learn = true;
	    
	    var that = this
	    return this._communicate.enterRFSweep()
			.then( response => {
				//Util.debugLog('entered learning');
				that._communicate.checkRFData()
					.then( data => {
						that._communicate.checkRFData2()
							.then( data => {
								that.learn = false;
								if( data ) {
									that._communicate.cancelRFSweep();
									let idx = that.dataStore.dataArray.length + 1;
									let cmdname = 'cmd' + idx;
									this.dataStore.addCommand( cmdname, data);
							
									this.storeCmdSetting( cmdname )
								}
							})
					})
					.catch( err => {
						that.learn = false;
						Util.debugLog('**> RMPlusDevice.onCapabilityLearnIR, error checking data: '+err);
					})
			})
			.catch( err => {
				Util.debugLog('**> error learning: '+err);
				that.learn = false;
			})
	}
	
}

module.exports = RmPlusDevice;
