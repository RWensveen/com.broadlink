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


class SP1Device  extends BroadlinkDevice {
	
	

    /**
	 * Send a command to the device. The command was previously retrieved 
	 * with check_IR_data() 
	 */
	onCapabilityOnOff( mode ) {
		//Util.debugLog('==>SP1device.onCapabilityOnOff - ' + mode);

		var payload = new Uint8Array(4)
		payload[1] = 0x04;
		payload[2] = 0x04;
		payload[3] = 0x04;

		if( mode ) {
			payload[0] = 0x01;
		}
		else {
			payload[0] = 0x00;
		}
		return this._communicate.send_packet(0x66, payload)
			.then (response => {
				let device = this; // We're in a Device instance
                let tokens = {};
                let state = {};
        		this.trigger_toggle.trigger(device,tokens,state)
        		if( mode ) {
        			this.trigger_on.trigger(device,tokens,state)
        		}
        		else {
        			this.trigger_off.trigger(device,tokens,state)
        		}
				//Util.debugLog('==>SP1device.onCapabilityOnOff - response = ' + Util.asHex(response));

			}, rejection => {
				//Util.debugLog('==>SP1device.onCapabilityOnOff - rejection = ' + rejection);
			})
			.catch( err => {
				Util.debugLog('**>SP1device.onCapabilityOnOff - catch = ' + err);
				throw err;
			})
	}
	

	check_condition_on( args, state, callback ) { 
		//Util.debugLog('==>check_condition_on ');
		let onoff = args.device.getCapabilityValue('onoff')
		callback(null, onoff ) 
	}
	
	do_action_on(args,state) {
		//Util.debugLog('==>do_action_on');
		return this.setCapabilityValue('onoff', true);
	}

	do_action_off(args,state) {
		//Util.debugLog('==>do_action_off');
		return this.setCapabilityValue('onoff', false);
	}

	
	onInit() {
		super.onInit();
		this.registerCapabilityListener('onoff', this.onCapabilityOnOff.bind(this));
		
		this.trigger_toggle = new Homey.FlowCardTriggerDevice('sp1_onoff_change').register();
		this.trigger_on = new Homey.FlowCardTriggerDevice('sp1_onoff_on').register();
		this.trigger_off = new Homey.FlowCardTriggerDevice('sp1_onoff_off').register();
		
		this.condition_on = new Homey.FlowCardCondition('sp1_onoff');
		this.condition_on
			.register()
			.registerRunListener(this.check_condition_on.bind(this) )

		this.action_on = new Homey.FlowCardAction('sp1_onoff_on');
		this.action_on
			.register()
			.registerRunListener(this.do_action_on.bind(this))
			
		this.action_off = new Homey.FlowCardAction('sp1_onoff_off');
		this.action_off
			.register()
			.registerRunListener(this.do_action_off.bind(this))

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

module.exports = SP1Device;
