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


class SP2Device extends BroadlinkDevice {


	
	start_state_check( interval ) {
		
		var that = this
		this.checkTimer = setInterval( function() {
			that.get_energy()
				.then ( energy => {
					that.setCapabilityValue('measure_power', energy);
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
		//Util.debugLog('==>SP2Device.get_energy' );
		
		return this._communicate.sp2_get_energy()
			.then( response => {
				let energy = response[3] * 256 + response[2] + (response[1]/100.0)
				//Util.debugLog('<==SP2Device.get_energy = ' + energy )
				return energy
			})
	}

	
	/**
     * Returns the night light state of the smart plug.
     */
    check_nightlight() {
    	//Util.debugLog('==>SP2device.check_nightlight');
    	return this._communicate.read_status()
    		.then( response => {    			
    			let state = (( response[0] == 2 ) || ( response[0] == 3 ))
    			//Util.debugLog('<==SP2device.check_nightlight = ' + state);
    			return state;
    		}, rejection => { 
    			//Util.debugLog('<==SP2device.check_nightlight.reject' + rejection)
    	});
    }
    		

    /**
     * 
     */
    set_nightlight(state) {
    	//Util.debugLog('==>SP2device.set_nightlight - ' + state);
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
    		})
    }

	  
    /**
     * Returns the power state of the smart plug.
     */
    check_power() {
    	//Util.debugLog('==>SP2device.check_power')
    	return this._communicate.read_status()
    		.then( response => {
    			let state = (( response[0] == 1 ) || (response[0] == 3 ));
    	    	//Util.debugLog('<==SP2device.check_power = ' + state);
    		    return state;
    		})
	  }
	  

    /**
     * Sets the power state of the smart plug.
     */
    set_power(state) {
    	//Util.debugLog('==>SP2device.set_power - ' + state);
    	var that = this
    	return this.check_nightlight()
    		.then( onoff => {
    	    	let level = 0
    			if(onoff) {
    				level = state ? 3 : 2;
    			}
    			else {
    				level = state ? 1 : 0;
    			}
    	    	//Util.debugLog('==>SP2device.set_power - level = ' + level);
    	    	return that._communicate.setPowerState(level)
    		})
    }


    /**
     * 
     */
	onCapabilityPowerOnOff( mode ) {
        return this.set_power( mode )
        	.then( response => {
        		//Util.debugLog('==>onCapabilityPowerOnOff - '+mode)
        		let device = this;
                let tokens = {};
                let state = {};
        		this.trigger_power_toggle.trigger(device,tokens,state)
        		if(mode) {
        			this.trigger_power_on.trigger(device,tokens,state)
        		}
        		else {
        			this.trigger_power_off.trigger(device,tokens,state)
        		}
        	})
    }


    /**
     * 
     */
	onCapabilityNightLightOnOff( mode ) {
        return this.set_nightlight( mode )
        	.then( response => {
        		//Util.debugLog('==>onCapabilityNightLightOnOff - '+mode)
        		let device = this; // We're in a Device instance
                let tokens = {};
                let state = {};
        		this.trigger_nightlight_toggle.trigger(device,tokens,state)
        		if(mode) {
        			this.trigger_nightlight_on.trigger(device,tokens,state)
        		}
        		else {
        			this.trigger_nightlight_off.trigger(device,tokens,state)
        		}
        	})
    }
    
	
	check_condition_power_on( args, state, callback ) { 
		//Util.debugLog('==>check_condition_power_on ');

		args.device.check_power()
			.then( onoff => {
				//Util.debugLog('<==check_condition_power_on - onoff = ' + onoff);
				callback(null, onoff ) 
			})
	}
    
	
	check_condition_nightlight_on( args, state, callback ) { 
		//Util.debugLog('==>check_condition_nightlight_on ');

		args.device.check_nightlight()
			.then( onoff => {
				//Util.debugLog('<==check_condition_nightlight_on - onoff = ' + onoff);
				callback(null, onoff ) 
			})
	}

	
	do_action_power_on(args,state) {
		//Util.debugLog('==>do_action_power_on');
		return this.set_power(true)
			.then( (r) => {
				this.setCapabilityValue('onoff.power', true)
			})	

	}
	do_action_power_off(args,state) {
		//Util.debugLog('==>do_action_power_off');
		return this.set_power(false)
			.then( (r) => {
				this.setCapabilityValue('onoff.power', false)
			})	
	}
	do_action_nightlight_on(args,state) {
		//Util.debugLog('==>do_action_nightlight_on');
		return this.set_nightlight(true)
			.then( (r) => {
				this.setCapabilityValue('onoff.nightlight', true)
			})
	}
	do_action_nightlight_off(args,state) {
		//Util.debugLog('==>do_action_nightlight_off');
		return this.set_nightlight(false)
			.then( (r) => {
				this.setCapabilityValue('onoff.nightlight', false)
			})
	}

	
	onInit() {
		super.onInit();
		this.registerCapabilityListener('onoff.power', this.onCapabilityPowerOnOff.bind(this));
		this.registerCapabilityListener('onoff.nightlight', this.onCapabilityNightLightOnOff.bind(this));
		
		this.trigger_power_toggle = new Homey.FlowCardTriggerDevice('sp2_onoff_power').register();
		this.trigger_power_on = new Homey.FlowCardTriggerDevice('sp2_onoff_power_on').register();
		this.trigger_power_off = new Homey.FlowCardTriggerDevice('sp2_onoff_power_off').register();

		this.trigger_nightlight_toggle = new Homey.FlowCardTriggerDevice('sp2_onoff_nightlight').register();
		this.trigger_nightlight_on = new Homey.FlowCardTriggerDevice('sp2_onoff_nightlight_on').register();
		this.trigger_nightlight_off = new Homey.FlowCardTriggerDevice('sp2_onoff_nightlight_off').register();

		this.condition_power_on = new Homey.FlowCardCondition('sp2_onoff_power_on');
		this.condition_power_on
			.register()
			.registerRunListener(this.check_condition_power_on.bind(this) )
			
		this.condition_nightlight_on = new Homey.FlowCardCondition('sp2_onoff_nightlight_on');
		this.condition_nightlight_on
			.register()
			.registerRunListener(this.check_condition_nightlight_on.bind(this) )

		this.action_power_on = new Homey.FlowCardAction('sp2_onoff_power_on');
		this.action_power_on
			.register()
			.registerRunListener(this.do_action_power_on.bind(this))
			
		this.action_power_off = new Homey.FlowCardAction('sp2_onoff_power_off');
		this.action_power_off
			.register()
			.registerRunListener(this.do_action_power_off.bind(this))

		this.action_nightlight_on = new Homey.FlowCardAction('sp2_onoff_nightlight_on');
		this.action_nightlight_on
			.register()
			.registerRunListener(this.do_action_nightlight_on.bind(this))
		
		this.action_nightlight_off = new Homey.FlowCardAction('sp2_onoff_nightlight_off');
		this.action_nightlight_off
			.register()
			.registerRunListener(this.do_action_nightlight_off.bind(this))

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
		//Util.debugLog('==>RM3miniDevice.onAdded');
	}

		
	/**
	 * This method will be called when a device has been removed.
	 */
	onDeleted() {
		super.onDeleted()
		//Util.debugLog('==>RM3miniDevice.onDeleted');
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
