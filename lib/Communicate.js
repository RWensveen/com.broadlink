'use strict';

const Homey = require('homey');
const Util = require('./../lib/util.js');
const dgram = require('dgram');
const crypto = require('crypto');


class Communicate  {


	/**
	 * options = { count: this.count,               // integer
	           	   mac:   this.mac,                 // Uint8Array[6]
	    		   ipAddress: this.ipAddress        // string: '123.123.123.123'
	    		   
	    		   key: this.key   // might be null // Uint8Array[16]
	    		   id:  this.id    // might be null // Uint8Array[4]
	             }
	             
	    Note: all opetions (except 'count') are strings
	 */
	configure( options ) {
		//Util.debugLog('==> Communicate.configure ' + options);

		this.count = options.count;
		
		if( options.ipAddress ) {
			this.ipAddress = options.ipAddress;
		}
		else {
			this.ipAddress = '255.255.255.255';
		}
		
		if( options.id) {
			this.id    = options.id;	
		}
		else {
			this.id = new Uint8Array([0,0,0,0]);
		}

		if( options.mac ) {
			this.mac       = options.mac;
		}
		else {
			this.mac = new Uint8Array([0,0,0,0,0,0]);
		}
		if(( options.key ) && ( options.key.length == 16)) {
			this.key = options.key;
		}
		else {
			//Util.debugLog('  using default key');
			this.key = new Uint8Array([0x09, 0x76, 0x28, 0x34, 0x3f, 0xe9, 0x9e, 0x23, 0x76, 0x5c, 0x15, 0x13, 0xac, 0xcf, 0x8b, 0x02])
		}
		this.iv  = new Uint8Array([0x56, 0x2e, 0x17, 0x99, 0x6d, 0x09, 0x3d, 0x28, 0xdd, 0xb3, 0xba, 0x69, 0x5a, 0x2e, 0x6f, 0x58])
		
		//Util.debugLog('  ipaddr = ' + this.ipAddress );
		//Util.debugLog('  mac    = ' + Util.asHex(this.mac) );
		//Util.debugLog('  id     = ' + Util.asHex(this.id) );
		//Util.debugLog('  count  = ' + this.count );
		//Util.debugLog('  key    = ' + Util.asHex(this.key) );
		}
	

	/**
	 * 
	 * return: [Promise]
	 */
	 sendto(packet, ipaddress, port, timeout ) {
		
		//Util.debugLog( '==> sendto');

		return new Promise( function(resolve, reject ) {
			var s = dgram.createSocket('udp4');
			s.on('error', (err) => {
				//Util.debugLog('got error')
				s.close();
				clearTimeout(tm);
				reject( Error(err.stack));
			});
			s.on('message', (msg, rinfo) => {
				s.close();
				clearTimeout(tm);
				let rsp = { data:    msg,   // msg is type Buffer
						    size:    rinfo.size,
				            address: rinfo.address,
				            port:    rinfo.port
						  };
				resolve( rsp );
			});	

			s.send( packet, port, ipaddress );
			let tm = setTimeout( function() {
							//Util.debugLog('timeouterror')
							s.close(); 
							reject( Error(Homey.__('errors.sending_timeout'))); 
						},
						timeout * 1000 );  // timeout in [msec]
		});
	}


	 
	/**
	 * 
	 * return: [Promise]
	 *         from Promise, return [Buffer] with response
	 */
	 send_packet(command, payload) {

		//Util.debugLog('==>send_packet:  mac = ' + Util.asHex(this.mac ));
		//Util.debugLog('                 key = ' + Util.asHex(this.key ));
		//Util.debugLog('                 id =  ' + Util.asHex(this.id ));

		let i=0;
		
	    this.count = (this.count + 1) & 0xffff;
	    var packet = new Uint8Array(0x38);
	    packet[0x00] = 0x5a;
	    packet[0x01] = 0xa5;
	    packet[0x02] = 0xaa;
	    packet[0x03] = 0x55;
	    packet[0x04] = 0x5a;
	    packet[0x05] = 0xa5;
	    packet[0x06] = 0xaa;
	    packet[0x07] = 0x55;
	    packet[0x24] = 0x2a;
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

	    // pad the payload for AES encryption, should bin in multiples of 16 bytes
	    if( payload.length > 0 ) {
	    	var numpad = (Math.trunc( payload.length / 16) +1)*16 - payload.length;
	    	payload=Util.concatTypedArrays(payload,new Uint8Array(numpad));
	    }
	    
	    // calculate the checksum over the payload
	    let checksum = 0xbeaf;
	    for( i=0; i< payload.length; i++ ) {
	    	checksum = checksum + payload[i];
	    	checksum = checksum & 0xffff;
	    }

	    // encrypt payload
	    payload = this.encrypt(payload);

	    // add checksum of payload to header
	    packet[0x34] = checksum & 0xff;
	    packet[0x35] = checksum >> 8;

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
	    return this.sendto( packet, this.ipAddress, 80, 5 )
			.then( function( response ) {
					return response.data;
				})
			.catch( function( err ) {
					throw err;
				});
	}


	/**
	 * Encrypt data with AES, 128 bits, in CBC mode.
	 * Use previously configured key and iv (Initial Vector).
	 * 
	 * return: [Buffer]
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
	 * return: [Buffer]
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
	 * return: [Promise]  
	 *         from Promise, return key and id
	 */
	auth() {
		//Util.debugLog('==>Communicate.auth');
		
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

	    var that = this;
	    return this.send_packet(0x65, payload)
	    	.then( function( response ) {
	    				
	    				var payload = that.decrypt(response.slice(0x38))
	    				if( !payload ) {
	    					throw  new Error(Homey.__('errors.decrypt_payload'))
	    				}

	    				var key = payload.slice(0x04,0x14);
	    				if( key.length % 16 != 0 ) {
	    					throw  new Error(Homey.__('errors.decrypt_keylength') + key.length)
	    				}
	    				var id = payload.slice(0x00,0x04);
	    				that.id = id;
	    				that.key = key;
	    				let authData = { id:  id,
	    								 key: key 
	    				}
	    				//Util.debugLog('==> auth:  mac = ' + Util.asHex(that.mac ));
	    				//Util.debugLog('           key = ' + Util.asHex(that.key ));
	    				//Util.debugLog('           id  = ' + Util.asHex(that.id ));

	    				return ( authData );
	    	})
	    	.catch( err => {
	    			//Util.debugLog('==>auth - err = ' + err )
	    			throw err;
	    	})
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
	 *        local_ip_address  null or string
	 *        device_ip_address null or string
	 * 
	 */
	discover( timeout, local_ip_address, device_ip_address ) {
		
		//Util.debugLog("==> discover ("+timeout+','+local_ip_address+','+device_ip_address+')');
		
		if( local_ip_address == null ) {
			throw new Error(Homey.__('errors.discover_local_ip'))
		}		

		// if not given, use broadcast address
		if( device_ip_address == null ) {
			device_ip_address = '255.255.255.255';
		}
		var port = 44488;  // any random port will do.
		
		// convert to array
		var address = local_ip_address.split('.');
		
		var packet = new Uint8Array(0x30);
		var d = new Date();
		
		// get timezone offset without DaylightSavingTime
		let jan = new Date(d.getFullYear(), 0, 1);        // Date of 1-jan of this year
		var timezone = ( jan.getTimezoneOffset() / -60);  // timezone in hours difference, without DST
		//var timezone = (d.getTimezoneOffset() / -60);   // timezone in hours difference, incl DST
		
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

	    return this.sendto( packet, device_ip_address, 80, timeout )
			.then( function( response ) {
				    
					let info = { ipAddress : response.address,
								 mac       : response.data.slice(0x3a,0x3a+6),
								 devtype   : response.data[0x34] | response.data[0x35] << 8
						   };
					
					//Util.debugLog(' discover: ' + JSON.stringify( info ));
					return ( info );
				})
			.catch( function( err ) {
					//Util.debugLog( ' discover err = ' + err );
					throw err;
				});
	}

	

	/**
	 * Set device in learning mode.
	 * After this, user can press a button on an IR remote.
	 * The, use check_data() to read the sampled-data.
	 * 
     * return: [Promise]
	 * 
	 */
    enter_learning() {
    	//Util.debugLog("==> enter_learning");
    	
    	var payload = new Uint8Array(16);
    	payload[0] = 3;
    	
        return this.send_packet(0x6a, payload)
        	.then ( response => {
        		return response;
        	})
        	.catch( err => {
        		throw err;
        	})
        }
    
    
    
    /**
     * Read sampled IR data (i.e. the IR data from a remote on which the user pressed a button).
     * 
     * return: [Promise]
     * Note: this functions tries 8 time to read a command. Between each try, it waits 2 seconds.
     */
    check_data() {
    	//Util.debugLog("==> check_data");
    	
    	var that = this
		return new Promise( function(resolve, reject ) {
			let repeatCount = 8
			let tm = setInterval( function() {
				
		    	var payload = new Uint8Array(16);
		    	payload[0] = 4;
				that.send_packet(0x6a, payload)
					.then ( response => {
						if( response ) {
							//Util.debugLog("   got response")
						
							let err = response[0x22] | (response[0x23] << 8)
							if( err == 0 ) {
								clearInterval(tm)
							
								let payload = that.decrypt(response.slice(0x38))  // remove 0x38 bytes from start of array
								let p = payload.slice(0x04)                       // remove first 4 bytes of array
								//Util.debugLog(Util.asHex(p))
								
								resolve( p )
							}
							else {
								//Util.debugLog("   no response yet" )
							
								repeatCount = repeatCount -1;
								if( repeatCount <= 0 ) {
									clearInterval(tm);
									//Util.debugLog( "no data available") );
									resolve( null )
								}
							}
						}
					})
					.catch( err => {
						reject( err );
					})
			},
			2000 );  // timeout in [msec]
		})
    }    


    /**
     * Send a command to the device. The command was previously retrieved 
     * with check_data() 
     */
    send_data( data) {
    	//Util.debugLog("==> send_data");
    	
        var payload = new Uint8Array([0x02, 0x00, 0x00, 0x00])
        payload = Util.concatTypedArrays( payload, data );
        
        return this.send_packet(0x6a, payload)
        	.then (response => {
        		return response;
        	})
			.catch( err => {
				throw err;
			})
    }

    
}

module.exports = Communicate;
