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
const BroadlinkDriver = require('./../BroadlinkDriver');

class SP3SDriver extends BroadlinkDriver {

	check_condition_power_on( args, state, callback ) {
		args.device.check_condition_power_on(callback)
	}

	check_condition_nightlight_on( args, state, callback ) {
		args.device.check_condition_nightlight_on(callback)
	}

	do_action_power_on(args,state) {
		return args.device.do_action_power_on()
	}

	do_action_power_off(args,state) {
		return args.device.do_action_power_off()
	}

	do_action_nightlight_on(args,state) {
		return args.device.do_action_nightlight_on()
	}

	do_action_nightlight_off(args,state) {
		return args.device.do_action_nightlight_off()
	}

	onInit() {
		super.onInit({
			CompatibilityID: 0x9479	// SP3S
		});

	this.trigger_power_toggle = new Homey.FlowCardTriggerDevice('sp3s_onoff_power').register();
	this.trigger_power_on = new Homey.FlowCardTriggerDevice('sp3s_onoff_power_on').register();
	this.trigger_power_off = new Homey.FlowCardTriggerDevice('sp3s_onoff_power_off').register();

	this.trigger_nightlight_toggle = new Homey.FlowCardTriggerDevice('sp3s_onoff_nightlight').register();
	this.trigger_nightlight_on = new Homey.FlowCardTriggerDevice('sp3s_onoff_nightlight_on').register();
	this.trigger_nightlight_off = new Homey.FlowCardTriggerDevice('sp3s_onoff_nightlight_off').register();

	this.condition_power_on = new Homey.FlowCardCondition('sp3s_onoff_power_on');
	this.condition_power_on
		.register()
		.registerRunListener(this.check_condition_power_on.bind(this) )

	this.condition_nightlight_on = new Homey.FlowCardCondition('sp3s_onoff_nightlight_on');
	this.condition_nightlight_on
		.register()
		.registerRunListener(this.check_condition_nightlight_on.bind(this) )

	this.action_power_on = new Homey.FlowCardAction('sp3s_onoff_power_on');
	this.action_power_on
		.register()
		.registerRunListener(this.do_action_power_on.bind(this))

	this.action_power_off = new Homey.FlowCardAction('sp3s_onoff_power_off');
	this.action_power_off
		.register()
		.registerRunListener(this.do_action_power_off.bind(this))

	this.action_nightlight_on = new Homey.FlowCardAction('sp3s_onoff_nightlight_on');
	this.action_nightlight_on
		.register()
		.registerRunListener(this.do_action_nightlight_on.bind(this))

	this.action_nightlight_off = new Homey.FlowCardAction('sp3s_onoff_nightlight_off');
	this.action_nightlight_off
		.register()
		.registerRunListener(this.do_action_nightlight_off.bind(this))
	}

}

module.exports = SP3SDriver;
