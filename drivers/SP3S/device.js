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


class SP3SDevice  extends BroadlinkDevice {
	

	/**
	 * Generate the triggers, but only if the given new mode is different from the current mode.
	 */
	generate_trigger(mode) {
		
		if( mode != this.getCapabilityValue('onoff') ) {
	    	let drv = this.getDriver();
			drv.trigger_toggle.trigger( this,{},{} )
			if(mode) {
				drv.trigger_on.trigger( this,{},{} )
			}
			else {
				drv.trigger_off.trigger( this,{},{} )
			}
		}
	}	
	
	
	/**
	 * Start the interval timer to read the energy and power state.
	 */
	start_state_check( interval ) {
		var that=this
		this.checkTimer = setInterval( function() {
			that.get_energy()
				.then ( energy => {
					that.setCapabilityValue('measure_power', energy);
					that.check_power()
					.then( onoff => {
						that.generate_trigger(onoff);
						that.setCapabilityValue('onoff',onoff)
					})
					}, error => {
				})
		},
		interval * 60000);  // [minutes] to [msec]
	}
	
	
	stop_state_check() {
		if( this.checkTimer ) {
			clearInterval( this.checkTimer);
			this.checkTimer=undefined;
		}
	}
	

	/**
	 * 
	 */
	get_energy() {
		return this._communicate.sp2_get_energy()
			.then( response => {
				let energy = response[3] * 256 + response[2] + (response[1]/100.0)
				//Util.debugLog('<==SP3SDevice.get_energy = ' + energy )
				return energy
			})
	}


    /**
     * Returns the power state of the smart plug.
     */
    check_power() {
    	return this._communicate.read_status()
    		.then( response => {
    			let state = (response[0] != 0);
    	    	return state;
    		})
	  }

    /**
     * 
     */
    set_power(state) {
    	let level = state ? 1 : 0;
    	return this._communicate.setPowerState(level)
    }
  

	/**
     * 
     */
	onCapabilityOnOff( mode ) {
		return this.set_power( mode )
        	.then( response => {
        		this.generate_trigger(mode)
        	}, rejection => { 
        	})
    }
	

	check_condition_on(callback) { 
	    this.check_power()
		.then( onoff => { callback( null, onoff );
		})
	}
	
	do_action_on() {
		this.onCapabilityOnOff(true)
		.then( r => { this.setCapabilityValue('onoff', true);
		})
	}

	do_action_off() {
		this.onCapabilityOnOff(false)
		.then( r => { this.setCapabilityValue('onoff', false);
		})
	}

	
	
	onInit() {
		super.onInit();
		this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this));

		this.getDriver()
			.ready( () => {
				this.start_state_check( this.getSetting('CheckInterval') )
			})
	}
	
	/**
	 * This method is called when the user adds the device, called just after pairing.
	 */
	onAdded() {
		super.onAdded();
	}

		
	/**
	 * This method will be called when a device has been removed.
	 */
	onDeleted() {
		super.onDeleted();
		this.stop_state_check();
	}


	/**
	 * Called when the device settings are changed by the user 
	 * (so NOT called on programmatically changing settings)
	 * 
	 *  @param changedKeysArr   contains an array of keys which have been changed
	 */
	onSettings( oldSettingsObj, newSettingsObj, changedKeysArr, callback ) {
		
		if( changedKeysArr.indexOf('CheckInterval') >= 0 ) {
			this.stop_state_check();
			this.start_state_check( newSettingsObj['CheckInterval'] );
		}
		callback( null, true );
	}

}

module.exports = SP3SDevice;

