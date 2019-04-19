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

//const Homey = require('homey');
const Util = require('./../../lib/util.js');
const BroadlinkDevice = require('./../../lib/BroadlinkDevice');


class DooyaDevice extends BroadlinkDevice {

	onInit() {
		Util.debugLog('==> DooyaDevice.onInit');

		super.onInit();
		this.registerCapabilityListener('button.open', this.onCapabilityOpen.bind(this));
		this.registerCapabilityListener('button.close', this.onCapabilityClose.bind(this));
		this.registerCapabilityListener('button.stop', this.onCapabilityStop.bind(this));
		
		if( this.getCapabilities().indexOf('windowcoverings_closed') > -1 ) {
			this.registerCapabilityListener('windowcoverings_closed', this.onCapabilityWcClosed.bind(this))
		}
		else {
			this.windowcoverings_closed = false;
		}
	}

	_set_state( closedState ) {
		if( this.getCapabilities().indexOf('windowcoverings_closed') > -1 ) {
			this.setCapabilityValue( 'windowcoverings_closed', closedState )
		}
		else {
			let drv = this.getDriver();
			if( closedState ) {
				drv.trigger_closed.trigger(this,{},{})
			}
			else {
				drv.trigger_open.trigger(this,{},{})
			}
			this.windowcoverings_closed = closedState
		}
	}
	
	/**
	 * @return TRUE if 'closed', FALSE if 'open'  
	 */
	_get_state() {
		if( this.getCapabilities().indexOf('windowcoverings_closed') > -1 ) {
			return this.getCapabilityValue( 'windowcoverings_closed' )
		}
		else {
			return this.windowcoverings_closed
		}
	}

	
	check_condition_closed() {
		return Promise.resolve( this._get_state() )
	}

	do_action_close() {
		this._set_state( true )
		this._sendCommand( 0x02, 0x00 );
		return Promise.resolve(true)
	}

	do_action_open() {
		this._set_state( false )
		this._sendCommand( 0x01, 0x00 );
		return Promise.resolve(true)
	}

	do_action_toggle() {
		if( this._get_state() ) {
			return this.do_action_open()
		}
		else {
			return this.do_action_close()
		}
	}


	/**
	 * @param  cmd   command to send  ['open', 'close', 'stop', 'get_percentage' ]
	 * @return  if cmd==get_percentage: the opened percentage
	 *          otherwise: nothing
	 */
	 async _sendCommand( cmd1, cmd2 ) {
		try {
			let res = await this._communicate.dooya_set_state( cmd1, cmd2 );
			return res
		}
		catch( err ) { Util.debugLog("**> DooyaDevice._sendCommand " + cmd1 + "."+ cmd2 + ": error = "+ err); }
	}

	async onCapabilityWcClosed( state ) {
		if( state ){
			this._sendCommand( 0x01, 0x00 );
		}
		else {
			this._sendCommand( 0x02, 0x00 );
		}
	}

	async onCapabilityOpen( state ) {
		this._set_state( false )
		this._sendCommand( 0x01, 0x00 );
	}

	async onCapabilityClose( state ) {
		this._set_state( true )
		this._sendCommand( 0x02, 0x00 );
	}

	async onCapabilityStop( state ) {
		this._sendCommand( 0x03, 0x00 );
	}
	
	async get_percentage(self) {
		return await this._sendCommand(0x06, 0x5d)
	}
	
}

module.exports = DooyaDevice;
