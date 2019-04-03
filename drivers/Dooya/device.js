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



/*
 * see: https://pycrc.org/models.html
 * 
crc-16-modbus
=============
Width              16
Poly               0x8005
Reflect In         True
XOR In             0xffff
Reflect Out        True
XOR Out            0x0000
Short command      pycrc.py --model crc-16-modbus
Extended command   pycrc.py --width 16 --poly 0x8005 --reflect-in True --xor-in 0xffff --reflect-out True --xor-out 0x0000
Check              0x4b37
 */



'use strict';

//const Homey = require('homey');
const Util = require('./../../lib/util.js');
const BroadlinkDevice = require('./../BroadlinkDevice');


class DooyaDevice extends BroadlinkDevice {



	onInit() {
		Util.debugLog('==> DooyaDevice.onInit');

		super.onInit();
		this.registerCapabilityListener('button.open', this.onCapabilityOpen.bind(this));
		this.registerCapabilityListener('button.close', this.onCapabilityClose.bind(this));
		this.registerCapabilityListener('button.stop', this.onCapabilityStop.bind(this));
		this.registerCapabilityListener('windowcoverings_closed', this.onCapabilityWcClosed.bind(this));
	}


	/**
	 * @param  cmd   command to send  ['open', 'close', 'stop']
	 * @return  -
	 */
	async _sendCommand( cmd1, cmd2 ) {
		try {
			return await this._communicate.dooya_set_state( cmd1, cmd2 );
		}
		catch( err ) { Util.debugLog(`**> DooyaDevice._sendCommand ${cmd1},${cmd2}: error = ${err}`); }
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
		this.setCapabilityValue( 'windowcoverings_closed', true );
		this._sendCommand( 0x01, 0x00 );
	}

	async onCapabilityClose( state ) {
		this.setCapabilityValue( 'windowcoverings_closed', false );
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
