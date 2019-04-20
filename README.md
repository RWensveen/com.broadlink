# Homey

Use [Homey](https://www.athom.com/) together with [Broadlink devices](http://www.ibroadlink.com/).


# Supported devices

* [A1](http://www.ibroadlink.com/a1/) - Environment Sensor
* [RM3 mini](http://www.ibroadlink.com/rmMini3/)
  The RM3 Mini is a wifi to IR (infrared) device. It can learn IR commands and transmit them.
* [RM Pro](http://www.ibroadlink.com/rmPro)  - IR
* [RM Pro Plus](http://www.ibroadlink.com/rmPro+)   - IR + RF
* SP1  - power socket switch
* SP2  - power socket switch with nightlight and meter
* SP3S - power socket switch with meter
* MP1 - 4 way power socket switch
* Hysen - thermostat. this is an oem device, also available with other brandnames, 
           such as [Beok](http://www.beok-controls.com/product.asp)
* Dooya - [motorized curtain](http://en.dooya.com/products_3.html)

# To be supported devices


Others might follow...


# Debug and Error log

In the application settings, there are 2 flags to enable logging: Debug and Sentry.
- Debug logging dumps messages via the console log. This only works if the app is 
  started in debug mode from a PC (using 'athom app run')
- Sentry.IO is an error tracking system, which will create an error report for every
  message send to it. Use this only if you want to report an issue, and can reproduce
  it.

# Reference

This app is based on the hard work of other people.

See:
- https://github.com/mjg59/python-broadlink
- https://github.com/davorf/BlackBeanControl
- https://github.com/frankjoke/ioBroker.broadlink2
- https://github.com/lprhodes/homebridge-broadlink-rm/tree/master/helpers
- http://peter.windridge.org.uk/playing-with-cheap-iot-devices  (hysen thermostat)

Protocol:
- https://blog.ipsumdomus.com/broadlink-smart-home-devices-complete-protocol-hack-bc0b4b397af1

# NodeJS modules

requires the following NodeJS modules
- dgram
- crc

# app.json

app.json is split in serveral files (driver.compose.json et all).
In order to create a full app.json, open a commandline (i.e. terminal):

	> cd com.broadlink
	> athom app validate
 

# To Do

still some things to do:
- add supported devices (see com.broadlink/lib/DeviceInfo for list)


# Version

* 2.0.4<br>
Full working version of Hysen thermostat. Tested with a BEOK 'tol313' thermostat.
Add Dooya motorized curtains.
Correct display of icons for A1
* 2.0.3<br>
Add user manual (in APPSTORE.md) explaining how to use RF learning.<br>
Correct sensor display of A1 device<br>
Correct SP1 device, so the app will not crash :-)<br>
Add Hysen thermostat (implementation done, testing not done -> it might completely fail)<br>
Move capability icons to /assets directory (i.s.o. /drivers/xxx/assets)<br>
Correct app settings page to show current settings.
<br><br>
* 2.0.2<br>
Learning and transmitting RF (433MHz) works. Homey speech is used to inform the user on what to do.
<br><br>
* 2.0.1<br>
Updated to Homey V2.0 to prevent app crashes
Use async/await wherever possible (easier to read compared to Promise)
<br><br>
* 1.3.5<br>
All seems ok, but RF not working
