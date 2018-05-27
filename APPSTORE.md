# Homey

Use [Homey](https://www.athom.com/) together with [Broadlink devices](http://www.ibroadlink.com/).


# Supported devices

[RM3 mini](http://www.ibroadlink.com/rmMini3/)
- The RM3 Mini is a wifi to IR (infrared) device. It can learn IR commands and transmit them.

Possibly RM2 devices also work, but have not been verified.


# RM3 Mini configuration

The RM3 Mini needs to be configured before it can be paired with Homey.
Configuration is done using the eControl app from Broadlink. See the Broadlink website for more
information on this: [www.ibroadlink.com](http://www.ibroadlink.com/).


# Usage

You can pair a RM3 Mini device the same way devices are added to Homey.
Once a device is paired, it can start learning commands.
This is done by pressing the 'learn' button in the mobile card of the paired device.
On the device, the LED will turn white, and you can press a button on a IR Remote control.
The command will be added to the device settings in Homey. In the settings menu, you can 
give the command a more logical name, or delete it.
Currently 20 commands are supported in the settings page. 

