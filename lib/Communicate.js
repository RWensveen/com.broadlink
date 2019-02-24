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
const Util = require('./../lib/util.js');
const dgram = require('dgram');
const crypto = require('crypto');


class Communicate  {


	/**
	* options = { count: this.count,			// integer
	*			mac:   this.mac,				// Uint8Array[6]
	*			ipAddress: this.ipAddress		// string: '123.123.123.123'
	*
	*			key: this.key   // might be null // Uint8Array[16]
	*			id:  this.id	// might be null // Uint8Array[4]
	*		}
	*
	*  Note: all options (except 'count') are strings
	*/
	configure( options ) {
		this.count = options.count;

		if( options.ipAddress ) {
			this.ipAddress = options.ipAddress;
		}
		else {
			this.ipAddress = '255.255.255.255';
		}

		if( options.id) {
			this.id	= options.id;
		}
		else {
			this.id = new Uint8Array([0,0,0,0]);
		}

		if( options.mac ) {
			this.mac	= options.mac;
		}
		else {
			this.mac = new Uint8Array([0,0,0,0,0,0]);
		}
		if(( options.key ) && ( options.key.length == 16)) {
			this.key = options.key;
		}
		else {
			this.key = new Uint8Array([0x09, 0x76, 0x28, 0x34, 0x3f, 0xe9, 0x9e, 0x23, 0x76, 0x5c, 0x15, 0x13, 0xac, 0xcf, 0x8b, 0x02])
		}
		this.iv  = new Uint8Array([0x56, 0x2e, 0x17, 0x99, 0x6d, 0x09, 0x3d, 0x28, 0xdd, 0xb3, 0xba, 0x69, 0x5a, 0x2e, 0x6f, 0x58])
		this.checkRepeatCount = 0;
	}


	/**
	* Update the IPaddress.
	*/
	setIPaddress( address ) {
		this.ipAddress = address
	}


	/**
	*
	*/
	destroy() {
		if( this.dgramSocket !== undefined ) {
			clearTimeout(this.tm);
			this.tm = undefined;
			this.dgramSocket.close();
			this.dgramSocket = undefined;
			this.callback = null;
		}
	}


	/**
	*
	* @return [Promise]
	*/
	async sendto(packet, ipaddress, port, timeout ) {

		if( this.dgramSocket === undefined ) {
			//Util.debugLog("==> Communicate.sendto - create socket");
			this.callback = { resolve: null, reject: null }
			this.dgramSocket = dgram.createSocket('udp4');

			this.dgramSocket.on('error', (err) => {
				Util.debugLog('**> dgramSocket error'+err);
				clearTimeout(this.tm);
				this.tm=undefined;
				this.callback.reject( Error(err.stack));
			});

			this.dgramSocket.on('message', (msg, rinfo) => {
				clearTimeout(this.tm);
				this.tm=undefined;
				let rsp = { data:    msg,   // msg is type Buffer
				            size:    rinfo.size,
				            address: rinfo.address,
				            port:    rinfo.port
				};
				//Util.debugLog('<== Communicate.sendto - got message with size='+rsp['size']);
				this.callback.resolve( rsp );
			});
		}

		return new Promise( function(resolve, reject ) {
			this.callback.reject = reject;
			this.callback.resolve = resolve;
			this.dgramSocket.send( packet, port, ipaddress );
			this.tm = setTimeout( function() {
				clearTimeout(this.tm);
				this.tm=undefined;
				Util.debugLog('**> dgramSocket timeout');
				if( this.dgramSocket !== undefined ) {
					this.dgramSocket.close();
					this.dgramSocket = undefined;
				}
				reject( Error(Homey.__('errors.sending timeout')));
			}.bind(this), timeout * 1000 );  // timeout in [msec]
		}.bind(this));
	}


	/**
	*
	* @return [Buffer] with response message
	*/
	async send_packet(command, version, payload) {
		//Util.debugLog('->send_packet: payload='+Util.asHex(payload));

		this.count = (this.count + 1) & 0xffff;
		let packet = new Uint8Array(0x38);
		packet[0x00] = 0x5a;
		packet[0x01] = 0xa5;
		packet[0x02] = 0xaa;
		packet[0x03] = 0x55;
		packet[0x04] = 0x5a;
		packet[0x05] = 0xa5;
		packet[0x06] = 0xaa;
		packet[0x07] = 0x55;
		packet[0x24] = version? 0x9d : 0x2a;
		packet[0x25] = 0x27;
		packet[0x26] = command;
		packet[0x28] = this.count & 0xff;
		packet[0x29] = this.count >> 8;
		packet[0x2a] = this.mac[0];
		packet[0x2b] = this.mac[1];
		packet[0x2c] = this.mac[2];
		packet[0x2d] = this.mac[3];
		packet[0x2e] = this.mac[4];
		packet[0x2f] = this.mac[5];
		packet[0x30] = this.id[0];
		packet[0x31] = this.id[1];
		packet[0x32] = this.id[2];
		packet[0x33] = this.id[3];

		// pad the payload for AES encryption, should be in in multiples of 16 bytes
		if( payload.length > 0 ) {
			var numpad = (Math.trunc( payload.length / 16) +1)*16 - payload.length;
			payload=Util.concatTypedArrays(payload,new Uint8Array(numpad));
		}

		// calculate the checksum over the payload
		let checksum = 0xbeaf;
		let i=0;
		for( i=0; i< payload.length; i++ ) {
			checksum = checksum + payload[i];
			checksum = checksum & 0xffff;
		}

		// add checksum of payload to header
		packet[0x34] = checksum & 0xff;
		packet[0x35] = checksum >> 8;

		// encrypt payload
		payload = this.encrypt(payload);

		// concatinate header and payload
		packet = Util.concatTypedArrays( packet, payload );

		// calculate checksum of entire packet, add to header
		checksum = 0xbeaf;
		for( i=0; i< packet.length; i++ ) {
			checksum += packet[i]
			checksum = checksum & 0xffff
		}
		packet[0x20] = checksum & 0xff;
		packet[0x21] = checksum >> 8;

		// send packet
		let response = await this.sendto( packet, this.ipAddress, 80, 10 )
		//Util.debugLog('->send_packet: resp='+Util.asHex(response.data))
		
		if( response ) {
			//Util.debugLog('got response:'+Util.asHex(response.data))
			response.error = response.data[0x22] | (response.data[0x23] << 8)
			//Util.debugLog(' error = '+response.error)
			if( response.error == 0 ) {
				let r = this.decrypt(response.data.slice(0x38))  // remove 0x38 bytes from start of array, then decrypt
				response.cmd = r.slice( 0,4 )                    // get first 4 bytes in array
				response.payload = r.slice(0x04)			     // remove first 4 bytes of array
								
				//Util.debugLog('<-send_packet: resp.payload='+Util.asHex(response.cmd)+":"+Util.asHex(response.payload))
			}
		}
		else {
			response.error = -1
		}
			
		return response;
	}


	/**
	* Encrypt data with AES, 128 bits, in CBC mode.
	* Use previously configured key and iv (Initial Vector).
	*
	* @return [Buffer]
	*/
	encrypt(payload) {

		var encipher = crypto.createCipheriv('aes-128-cbc', this.key, this.iv);
		let encryptdata = encipher.update(payload, 'binary', 'binary');
		let encode_encryptdata = new Buffer(encryptdata, 'binary');

		return encode_encryptdata;
	}


	/**
	* Decrypt data with AES, 128 bits, in CBC mode.
	* Use previously configured key and iv (Initial Vector).
	*
	* @return [Buffer]
	*/
	decrypt(payload) {

		var decipher = crypto.createDecipheriv('aes-128-cbc',this.key,this.iv)
		decipher.setAutoPadding(false);
		var decoded = [];

		for( var i=0; i<payload.length; i+=16) {
			decoded += decipher.update(payload.slice(i,i+16),'binary','binary')
		}
		decoded += decipher.final('binary')
		var result = new Uint8Array(new Buffer.from(decoded,'binary'))

		return result;
	}


	/**
	* Authenticate device.
	* - encrypt/decrypt keys are default ones.
	* - from response, the encrypt/decrypt keys for further communication can be retrieved.
	*
	* @return  key and id
	*/
	async auth() {
		var payload = new Uint8Array(0x50);
		payload[0x04] = 0x31;
		payload[0x05] = 0x31;
		payload[0x06] = 0x31;
		payload[0x07] = 0x31;
		payload[0x08] = 0x31;
		payload[0x09] = 0x31;
		payload[0x0a] = 0x31;
		payload[0x0b] = 0x31;
		payload[0x0c] = 0x31;
		payload[0x0d] = 0x31;
		payload[0x0e] = 0x31;
		payload[0x0f] = 0x31;
		payload[0x10] = 0x31;
		payload[0x11] = 0x31;
		payload[0x12] = 0x31;
		payload[0x1e] = 0x01;
		payload[0x2d] = 0x01;
		payload[0x30] = 'T'.charCodeAt();
		payload[0x31] = 'e'.charCodeAt();
		payload[0x32] = 's'.charCodeAt();
		payload[0x33] = 't'.charCodeAt();
		payload[0x34] = ' '.charCodeAt();
		payload[0x35] = ' '.charCodeAt();
		payload[0x36] = '1'.charCodeAt();

		let response = await this.send_packet(0x65, false, payload)
		if(( ! response ) || (! response.payload )){
			Util.debugLog('**> auth: decrypt payload error')
			throw  new Error(Homey.__('errors.decrypt_payload'))
		}

		var key = response.payload.slice(0,0x10);  // get at most 16 bytes
		if( key.length % 16 != 0 ) {
			Util.debugLog('**> auth: keylength error')
			throw new Error(Homey.__('errors.decrypt_keylength') + key.length)
		}
		var id = response.cmd;
		this.id = id;
		this.key = key;
		let authData = { id:  id,
						 key: key
		               }
		//Util.debugLog('<== auth: auth data :'+JSON.stringify(authData));

		return ( authData );
	}


	/**
	* Get day-of-week, where Monday=1 and Sunday=7
	*/
	getIsoWeekday( dateObj ) {
		let wd = dateObj.getDay()
		if( wd == 0 ) wd = 7;  // Sunday should be '7'
		return wd;
	}


	/**
	* Discover a Broadlink device.
	* Either an IP address of the device is given, or the broadcast address is used.
	* Note that for a broadcast address, multiple devices might be discovered.
	*
	*
	* input: timeout in [sec]
	*		local_ip_address  null or string
	*		device_ip_address null or string
	*
	*/
	async discover( timeout, local_ip_address, device_ip_address ) {

		if( local_ip_address == null ) {
			throw new Error(Homey.__('errors.discover_local_ip'))
		}

		// if not given, use broadcast address
		if( device_ip_address == null ) {
			device_ip_address = '255.255.255.255';
		}
		
		//Util.debugLog("\n****\n****  OVERRIDE IP ADDRESS IN DISCOVER\n****")
		//local_ip_address = "192.168.0.40"
			
			
		var port = 44488;  // any random port will do.

		// convert to array
		var address = local_ip_address.split('.');

		var packet = new Uint8Array(0x30);
		var d = new Date();

		// get timezone offset without DaylightSavingTime
		let jan = new Date(d.getFullYear(), 0, 1);		// Date of 1-jan of this year
		var timezone = ( jan.getTimezoneOffset() / -60);  // timezone in hours difference, without DST

		var year = d.getFullYear();

		if( timezone < 0 ) {
			packet[0x08] = 0xff + timezone - 1;
			packet[0x09] = 0xff;
			packet[0x0a] = 0xff;
			packet[0x0b] = 0xff;
		} else{
			packet[0x08] = timezone;
			packet[0x09] = 0;
			packet[0x0a] = 0;
			packet[0x0b] = 0;
		}
		packet[0x0c] = year & 0xff;
		packet[0x0d] = (year >> 8) & 0xff;
		packet[0x0e] = d.getMinutes();
		packet[0x0f] = d.getHours();
		packet[0x10] = Number(year%100);
		packet[0x11] = this.getIsoWeekday(d)
		packet[0x12] = d.getDate();
		packet[0x13] = d.getMonth() +1;
		packet[0x18] = Number(address[0]);
		packet[0x19] = Number(address[1]);
		packet[0x1a] = Number(address[2]);
		packet[0x1b] = Number(address[3]);
		packet[0x1c] = port & 0xff;
		packet[0x1d] = port >> 8;
		packet[0x26] = 6;

		// calculate checksum over header
		var checksum = 0xbeaf;
		let i=0;
		for( i=0; i < 0x30; i++ ) {
			checksum = checksum + packet[i];
		}
		checksum = checksum & 0xffff;

		// add checksum to header
		packet[0x20] = checksum & 0xff;
		packet[0x21] = (checksum >> 8 ) & 0xff;

		let response = await this.sendto( packet, device_ip_address, 80, timeout );
		let info = { ipAddress : response.address,
		             mac       : response.data.slice(0x3a,0x3a+6),
		             devtype   : response.data[0x34] | response.data[0x35] << 8
		           }

		return ( info );
	}


	/**
	* Set device in learning mode.
	* After this, user can press a button on an IR remote.
	* Then, use check_IR_data() to read the sampled-data.
	*/
	async enter_learning() {
		var payload = new Uint8Array(16);
		payload[0] = 3;
		await this.send_packet(0x6a, false, payload);
	}


    /**
     * 
     */
	async _check_data( payload ) {
		this.checkRepeatCount = 8
		
		return new Promise( function(resolve, reject ) {
			let tm = setInterval( function() {
				//Util.debugLog('_check_data - repeat='+this.checkRepeatCount)
				this.send_packet(0x6a, false, payload)
					.then ( 
						function( response ) {
							if( response.error == 0 ) {
								clearInterval(tm)
								tm = null
								//Util.debugLog('resp = ' + Util.asHex(response.payload))
								resolve( response.payload )
							}
							else {
								this.checkRepeatCount = this.checkRepeatCount -1;
								if( this.checkRepeatCount <= 0 ) {
									clearInterval(tm);
									tm=null;
									reject( 'tried long enough' );
								}
							}
						}.bind(this),
						rejection => {
							Util.debugLog('**> _check_data - reject: '+rejection)
							clearInterval(tm);
							tm=null;
							reject('aborted');
						})
					.catch( err => {
						Util.debugLog('**> _check_data - catch: '+err)
						clearInterval(tm);
						tm=null;
						reject( err );
					})
				}.bind(this), 2000 );  // timeout in [msec]
			}.bind(this))
	}

	
	/**
     *
	 */
	async check_IR_data() {
		var payload = new Uint8Array(16);
		payload[0] = 4;
		return await this._check_data( payload );
	}


	/**
	*
	*/
	async enterRFSweep() {
		var payload = new Uint8Array(16);
		payload[0] = 0x19;
		await this.send_packet(0x6a, true, payload)
	}


    /**
     * 
     */
	async checkRFData() {
		var payload = new Uint8Array(16)
		payload[0] = 0x1a
		var retryCount = 3
		do {
			var resp = await this._check_data( payload )
			retryCount = retryCount -1
		} while(( retryCount > 0 ) && (resp[0] != 1))
		if ( resp[0] != 1 ) {
			throw( 'no key detected')
		}
	}


    /**
     * 
     */
	async checkRFData2() {
		var payload = new Uint8Array(16);
		payload[0] = 0x1b;
		return await this._check_data( payload );
	}


    /**
     * 
     */
	async cancelRFSweep() {
		var payload = new Uint8Array(16);
		payload[0] = 0x1e;
		await this.send_packet(0x6a, false, payload)
	};


	/**
	* Send a command to the device. The command was previously retrieved
	* with check_IR_data()
	*/
	async send_IR_RF_data( data) {
		var payload = new Uint8Array(4)
		payload[0] = 0x02
		payload = Util.concatTypedArrays( payload, data );
		await this.send_packet(0x6a, false, payload)
	}


	/**
	*
	*/
	async read_status() {

		var payload = new Uint8Array(16);
		payload[0] = 0x01;
		let response = await this.send_packet(0x6a, false, payload);

		if( response.error == 0 ) {
			return response.payload;
		}
		else {
			throw Homey.__('errors.invalid_response');
		}
	}



	/**
	* Sets the night light state of the smart plug
	* @param {byte} state   [0,1,2,3]
	*/
	async setPowerState(state) {

		var payload = new Uint8Array(16);
		payload[0] = 0x02;
		payload[4] = state;
		await this.send_packet(0x6a, false, payload);
	}


	/**
	* SP2 and SP3S
	*/
	async sp2_get_energy() {
		var payload = new Uint8Array([8, 0, 254, 1, 5, 1, 0, 0, 0, 45]);
		let response = await this.send_packet(0x6a, false, payload);
		if( response.error == 0 ) {
			return response.payload
		}
		else {
			throw Homey.__('errors.invalid_response');
		}
	}



	/**
	* Returns the power state of the smart power strip in raw format.
	*/
	async mp1_check_power() {

		var payload = new Uint8Array(16)
		payload[0x00] = 0x0a
		payload[0x02] = 0xa5
		payload[0x03] = 0xa5
		payload[0x04] = 0x5a
		payload[0x05] = 0x5a
		payload[0x06] = 0xae
		payload[0x07] = 0xc0
		payload[0x08] = 0x01

		let response = await this.send_packet(0x6a, false, payload);
		if( response.error == 0 ) {
			return response.payload[ 0x0a ];
		}
		else {
			throw Homey.__('errors.invalid_response');
		}
	}


	/**
	* @param  sid  [integer or string]  1..4
	* @param  mode [boolean]  true = on, false = off
	*/
	async mp1_set_power_state( sid, mode ) {

		if( sid !== Number ) { sid = Number(sid) }
		let sid_mask = 0x01 << (sid-1);

		var payload = new Uint8Array(16)
		payload[0x00] = 0x0d
		payload[0x02] = 0xa5
		payload[0x03] = 0xa5
		payload[0x04] = 0x5a
		payload[0x05] = 0x5a
		payload[0x06] = 0xb2 + (mode ? (sid_mask<<1) : sid_mask)
		payload[0x07] = 0xc0
		payload[0x08] = 0x02
		payload[0x0a] = 0x03
		payload[0x0d] = sid_mask
		payload[0x0e] = mode ? sid_mask : 0;

		try {
			let resp = await this.send_packet(0x6a, false, payload)
			if( resp.error != 0 ) {
				throw Homey.__('errors.invalid_response');
			}
		}
		catch( err ) {
			Util.debugLog("**> Communicate.mp1_set_power_state: catch = "+err);
			throw( "mp1_set_power_state failed");
		}
	}


    /**
     * 
     */
	async sp1_set_power_state(mode) {

		var payload = new Uint8Array(4)
		payload[0] = ( mode ? 0x01 : 0x00 )
		payload[1] = 0x04;
		payload[2] = 0x04;
		payload[3] = 0x04;

		await this.send_packet(0x66, false, payload)
	}

}

module.exports = Communicate;
