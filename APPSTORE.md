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


See compatibility list further on.

# Device configuration

The devices need to be configured before they can be paired with Homey.
Configuration is done using the eControl app from Broadlink. See the Broadlink website for more
information on this: [www.ibroadlink.com](http://www.ibroadlink.com/).

# Pairing

You can pair a Broadlink device the same way other devices are added to Homey.
You will need the IP address of your device in order to pair it. This can usually be retrieved from
your WiFi router.
If your device is not directly listed as Broadlink device in the initial pairing window, check the
compatiblity list below.

# Usage

Once a RM3-Mini,RM-Pro or RM-ProPlus is paired, it can start learning commands.
This is done by pressing the 'learn' button (for IR or RF) in the mobile card of the paired device.
On the device, a LED will turn on indicating it is in learning mode, and you can press a button on
a IR/RF Remote control.
The command will be added to the device settings in Homey. In the device settings menu, you can
give the command a more logical name, or delete it.
Currently 20 to 30 commands are supported in the settings page of each device.
It is not possible at this moment to change the order of the commands in the settings page.

# Compatibility

A large number of devices are compatible with eachother.
Also, broadlink devices are sold as OEM products, with a different name.
The following table lists which devices are compatible.

<table border=1>
<tr><th> Supported Device  </th><th> Compatible Device               </th></tr>
<tr><td> SP1               </td><td> SP1                             </td></tr>

<tr><td> SP2               </td><td> SP2                             <br>
                                     SP3                             <br>
                                     SP Mini                         <br>
                                     SP Mini 2                       <br>
                                     SP Mini Plus                    <br>
                                     Honeywell SP2                   <br>
                                     SP Mini [OEM]                   <br>
                                     SP3 [OEM]                       </td></tr>

<tr><td> SP3 Plus          </td><td> SP3 Plus                        </td></tr>

<tr><td> RM2               </td><td> RM2                             <br>
                                     RM Mini                         <br>
                                     RM3 Mini                        <br>
                                     RM Pro Phicomm                  <br>
                                     RM2 Home Plus                   <br>
                                     RM2 Home Plus GDT               <br>
                                     RM Mini Shate                   <br>
                                     RM2 Pro HYC                     </td></tr>

<tr><td>RM Plus            </td><td> RM Plus                         <br>
                                     RM2 Pro Plus                    <br>
                                     RM2 Pro Plus2                   <br>
                                     RM2 Pro Plus BL                 <br>
                                     RM3 Pro Plus                    <br>
                                     RM2 Pro Plus 300                <br>
                                     RM2 Pro Plus R1                 <br>
                                     RM2 Pro PP                      </td></tr>

<tr><td>A1                 </td><td> A1                              </td></tr>

<tr><td>MP1                </td><td> MP1                             <br>
                                     Hontar MP1                      </td></tr>

<tr><td>HYSEN              </td><td> Hysen                           </td></tr>

<tr><td>S1C                </td><td> S1C (SmartOne Alarm Kit)        </td></tr>

<tr><td>DOOYA              </td><td> Dooya DT360E (DOOYA curtain v2) </td></tr>
</table>

