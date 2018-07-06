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
const BroadlinkDevice = require('./../BroadlinkDevice');


class SP2Device extends BroadlinkDevice {


	generate_trigger_nightlight(mode) {
		if( mode != this.getCapabilityValue('onoff.nightlight') ) {
			let drv = this.getDriver();
			drv.trigger_nightlight_toggle.trigger(this,{},{})
			if(mode) {
				drv.trigger_nightlight_on.trigger(this,{},{})
			}
			else {
				drv.trigger_nightlight_off.trigger(this,{},{})
			}
		}
	}
	
	generate_trigger_power(mode) {
		if( mode != this.getCapabilityValue('onoff.power') ) {
			let drv = this.getDriver();
			drv.trigger_power_toggle.trigger(this,{},{})
			if(mode) {
				drv.trigger_power_on.trigger(this,{},{})
			}
			else {
				drv.trigger_power_off.trigger(this,{},{})
			}
		}
	}
	
	
	start_state_check( interval ) {
		
		var that = this
		this.checkTimer = setInterval( function() {
			that.get_energy()
				.then ( energy => {
					that.setCapabilityValue('measure_power', energy);
					this._communicate.read_status()
					.then( response => {    			
						
						let state = (( response[0] == 2 ) || ( response[0] == 3 ))
						that.generate_trigger_nightlight(state);
						that.setCapabilityValue('onoff.nightlight',state);
						
						state = (( response[0] == 1 ) || (response[0] == 3 ));
						that.generate_trigger_power(state);
						that.setCapabilityValue('onoff.power',state);
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
				return energy
			})
	}

	
	/**
	 * Returns the night light state of the smart plug.
	 */
	check_nightlight() {
		return this._communicate.read_status()
			.then( response => {    			
				let state = (( response[0] == 2 ) || ( response[0] == 3 ));
				return state;
			}, rejection => { 
		});
	}
			

	/**
	 * 
	 */
	set_nightlight(state) {
		return this.check_power()
			.then( onoff => {
		    	let level = 0
				if(onoff) {
					level = state ? 3 : 1;
				}
				else {
					level = state ? 2 : 0;
				}
				return this._communicate.setPowerState(level)
	    	}, rejection => {
			})
	}

	  
	/**
	 * Returns the power state of the smart plug.
	 */
	check_power() {
		return this._communicate.read_status()
			.then( response => {
				let state = (( response[0] == 1 ) || (response[0] == 3 ));
			    return state;
			})
	  }
	  

	/**
	 * Sets the power state of the smart plug.
	 */
	set_power(state) {
		var that = this
		return this.check_nightlight()
			.then( onoff => {
		    	let level = 0;
				if(onoff) {
					level = state ? 3 : 2;
				}
				else {
					level = state ? 1 : 0;
				}
		    	return that._communicate.setPowerState(level);
			})
	}
	
	/**
	 * 
	 */
	onCapabilityPowerOnOff( mode ) {
		var that = this;
	    return this.set_power( mode )
	    	.then( response => {
	    		that.generate_trigger_power(mode);
	    	}, rejection => {
	    	})
	}


	/**
	 * 
	 */
	onCapabilityNightLightOnOff( mode ) {
		var that = this;
	    return this.set_nightlight( mode )
	    	.then( response => {
	    		that.generate_trigger_nightlight(mode);
	    	}, rejection => {
	    	})
	}
	
	
	check_condition_power_on(callback) { 
		this.check_power()
			.then( onoff => { callback(null, onoff );
			}, rejection => { callback(null, false );
			})
	}
	
	
	check_condition_nightlight_on(callback) { 
		this.check_nightlight()
			.then( onoff => { callback(null, onoff );
			}, rejection => { callback(null, false );
			})
	}

	
	do_action_power_on() {
		this.onCapabilityPowerOnOff(true)
		.then( r => { this.setCapabilityValue('onoff.power', true);
		})
	}
	do_action_power_off() {
		this.onCapabilityPowerOnOff(false)
		.then( r => { this.setCapabilityValue('onoff.power', false);
		})	
	}
	do_action_nightlight_on() {
		this.onCapabilityNightLightOnOff(true)
		.then( r => { this.setCapabilityValue('onoff.nightlight', true)
		})
	}
	do_action_nightlight_off() {
		this.onCapabilityNightLightOnOff(false)
		.then( r => { this.setCapabilityValue('onoff.nightlight', false)
		})
	}

	
	onInit() {
		super.onInit();
		this.registerCapabilityListener('onoff.power', this.onCapabilityPowerOnOff.bind(this));
		this.registerCapabilityListener('onoff.nightlight', this.onCapabilityNightLightOnOff.bind(this));

		this.getDriver()
			.ready( () => {
				this.start_state_check( this.getSetting('CheckInterval') )
			})
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
	 *  @param changedKeysArr   contains an array of keys that have been changed
	 */
	onSettings( oldSettingsObj, newSettingsObj, changedKeysArr, callback ) {
		
		if( changedKeysArr.indexOf('CheckInterval') >= 0 ) {
			this.stop_state_check()
			this.start_state_check( newSettingsObj['CheckInterval'] )
		}
		callback( null, true );
	}

}

module.exports = SP2Device;
