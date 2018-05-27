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

'use strict'

const Util = require('./util.js');


exports.getDeviceInfo = function( devtype ) {

	var info = { devtype: devtype,
			     name: ''
			   };

	if(( devtype >= 0x7530 ) && ( devtype <= 0x7918 )) {
		info.name = 'SPMini2 (OEM)'; 
	}
	else {
		switch( devtype )
		{
		case 0x0000: info.name = 'SP1';  break;
		case 0x2711: info.name = 'SP2';  break;
		case 0x2719:   
		case 0x7919: 
		case 0x271a: 
		case 0x791a: info.name = 'Honeywell SP2';  break;
		case 0x2720: info.name = 'SPMini';  break;
		case 0x753e: info.name = 'SP3';  break;
		case 0x7D00: info.name = 'OEM branded SP3';  break;
		case 0x947a:
		case 0x9479: info.name = 'SP3S';  break;
		case 0x2728: info.name = 'SPMini2';  break;
		case 0x2733:
		case 0x273e: info.name = 'OEM branded SPMini';  break;
		case 0x2736: info.name = 'SPMiniPlus';  break;
		case 0x2712: info.name = 'RM2';  break;
		case 0x2737: info.name = 'RM Mini';  break;
		case 0x273d: info.name = 'RM Pro Phicomm';  break;
		case 0x2783: info.name = 'RM2 Home Plus';  break;
		case 0x277c: info.name = 'RM2 Home Plus GDT';  break;
		case 0x272a: info.name = 'RM2 Pro Plus';  break;
		case 0x2787: info.name = 'RM2 Pro Plus2';  break;
		case 0x279d: info.name = 'RM2 Pro Plus3';  break;
		case 0x27a9: info.name = 'RM2 Pro Plus_300';  break;
		case 0x278b: info.name = 'RM2 Pro Plus BL';  break;
		case 0x2797: info.name = 'RM2 Pro Plus HYC';  break;
		case 0x27a1: info.name = 'RM2 Pro Plus R1';  break;
		case 0x27a6: info.name = 'RM2 Pro PP';  break;
		case 0x278f: info.name = 'RM Mini Shate';  break;
		case 0x2714: info.name = 'A1';  break;
		case 0x4EB5: info.name = 'MP1';  break;
		case 0x4EF7: info.name = 'Hontar MP1';  break;
		case 0x4EAD: info.name = 'Hysen controller';  break;
		case 0x2722: info.name = 'S1 (SmartOne Alarm Kit)';  break;
		case 0x4E4D: info.name = 'Dooya DT360E (DOOYA_CURTAIN_V2)';  break;

		default: info.name = 'unknown';
		}
	}
	//Util.debugLog( "==>getDeviceInfo: devtype = " + info.devtype + '  name='+info.name);
	return info;
}

