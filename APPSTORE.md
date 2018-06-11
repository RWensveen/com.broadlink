# Homey

Use [Homey](https://www.athom.com/) together with [Broadlink devices](http://www.ibroadlink.com/).


# Supported devices

* [A1](http://www.ibroadlink.com/a1/) - Environment Sensor
* [RM3 mini](http://www.ibroadlink.com/rmMini3/)
  The RM3 Mini is a wifi to IR (infrared) device. It can learn IR commands and transmit them.

* SP1  - power socket switch
* SP2  - power socket switch with nightlight and meter
* [RM Pro](http://www.ibroadlink.com/rmPro)  - IR 
* [RM Pro Plus](http://www.ibroadlink.com/rmPro+)   - IR + RF


# Device configuration

The devices need to be configured before they can be paired with Homey.
Configuration is done using the eControl app from Broadlink. See the Broadlink website for more
information on this: [www.ibroadlink.com](http://www.ibroadlink.com/).

# Pairing

You can pair a Broadlink device the same way other devices are added to Homey.
You will need the IP address of your device in order to pair it. This can usually be retrieved from
your WiFi router.

# Usage

Once a RM3-Mini,RM-Pro or RM-ProPlus is paired, it can start learning commands.
This is done by pressing the 'learn' button (for IR or RF) in the mobile card of the paired device.
On the device, the LED will turn white, and you can press a button on a IR/RF Remote control.
The command will be added to the device settings in Homey. In the settings menu, you can 
give the command a more logical name, or delete it.
Currently 20 to 30 commands are supported in the settings page of each device. 

