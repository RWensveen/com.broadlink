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

const BroadlinkDriver = require('./../../lib/BroadlinkDriver');
const Homey = require('homey');
const Util = require('./../../lib/util.js');


class BroadlinkRM3miniDriver extends BroadlinkDriver {


	check_condition_specific_cmd( args, state ) {
		return args.device.check_condition_specific_cmd_sent( args, state )
	}

	do_exec_cmd( args, state ) {
		return args.device.executeCommand( args );
	}


	onInit() {
		super.onInit();
		this.setCompatibilityID( 0x2737 )   // RM MINI

		this.rm3mini_action_send_cmd = new Homey.FlowCardAction('send_command');
		this.rm3mini_action_send_cmd
			.register()
			.registerRunListener( this.do_exec_cmd.bind(this) )
			.getArgument('variable')
			.registerAutocompleteListener(( query, args ) => { return args.device.onAutoComplete(); });

		// Register a function to fill the trigger-flowcard 'RC_specific_sent' (see app.json)
		this.rm3mini_specific_cmd_trigger = new Homey.FlowCardTriggerDevice('RC_specific_sent');
		this.rm3mini_specific_cmd_trigger
			.register()
			.registerRunListener( this.check_condition_specific_cmd.bind(this) )
			.getArgument('variable')
			.registerAutocompleteListener(( query, args ) => { return args.device.onAutoComplete(); })

		this.rm3mini_any_cmd_trigger = new Homey.FlowCardTriggerDevice('RC_sent_any').register()
	}

}

module.exports = BroadlinkRM3miniDriver;
