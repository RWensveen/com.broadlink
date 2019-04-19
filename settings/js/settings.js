

function saveDebugSettings (Homey) {
	
  var compatmode  = document.getElementById('compatmode').checked;
  var debuglog    = document.getElementById('debuglog').checked;
  var errorreport = false;
  try {
     errorreport = document.getElementById('errorreport').checked;
  }
  catch( err ){;}
  
  var currentSettings = {
			  'compat'      : compatmode,
			  'logging'     : debuglog,
			  'errorreport' : errorreport
   }
   Homey.set('DebugSettings', currentSettings );
}


function onHomeyReady( Homey ) {

   var compatmodeElement  = document.getElementById('compatmode');
   var debuglogElement    = document.getElementById('debuglog');
   var errorreportElement = document.getElementById('errorreport');

   compatmodeElement.addEventListener( 'change', function( e ) { saveDebugSettings(Homey); })
   debuglogElement.addEventListener(   'change', function( e ) { saveDebugSettings(Homey); })
  
   if( errorreportElement ) {
	   errorreportElement.addEventListener('change', function( e ) { saveDebugSettings(Homey); })
   }
   
   Homey.get('DebugSettings', function (error, currentSettings) {
      if (error) {
         Homey.ready();
         Homey.alert(error,"error",null);
      }
      compatmodeElement.checked  = currentSettings.compat;
      debuglogElement.checked    = currentSettings.logging;
      
      if( errorreportElement ) { errorreportElement.checked = currentSettings.errorreport; }

      Homey.ready();
   });
   
   Homey.ready();
}
