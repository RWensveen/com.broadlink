/**
 * 
 * Driver for Broadlink RM3 Mini
 * 
 */


'use strict';

const BroadlinkDriver = require('./../BroadlinkDriver');
const Util = require('./../../lib/util.js' );




class BroadlinkRM3miniDriver extends BroadlinkDriver {

	
	onInit() {
		super.onInit({
			driverType: 'RM3 Mini'
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



module.exports = BroadlinkRM3miniDriver;
