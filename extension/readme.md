Hay una extensión en el repo. Para instalarla en Chrome:                                                                                                                        

  1. Abre Chrome y ve a chrome://extensions/
  2. Activa "Modo de desarrollador" (toggle arriba a la derecha)
  3. Haz clic en "Cargar descomprimida"
  4. Selecciona la carpeta /mnt/Zeus/Workspace/me/sources/My-Admin/extension/

  La extensión aparecerá en la lista y en la barra de herramientas.


El flujo completo requiere tres piezas, no solo la extensión:                                                                                                                               
                                                                                                                                                                                              
  App → chrome.runtime.sendMessage                                                                                                                                                            
          ↓                                                                                                                                                                                   
        Extension (background.js)                                                                                                                                                             
          ↓ Native Messaging                                                                                                                                                                  
        Native Host (Go binary)                                                                                                                                                               
          ↓                                                                                                                                                                                   
        Ejecuta el binario en el OS                                                                                                                                                           
                                                                                                                                                                                              
  Para que funcione necesitas:                                                                                                                                                                
                                                                                                                                                                                              
  1. Extensión instalada (lo que preguntaste antes — chrome://extensions → cargar extension/)                                                                                                 
  2. Native Host instalado — la extensión se comunica con un proceso local vía Native Messaging:                                                                                              
  cd /mnt/Zeus/Workspace/me/sources/My-Admin/extension/native-host                                                                                                                            
  ./install.sh                                                                                                                                                                                
  2. Eso registra el host com.myadmin.localrunner en el sistema.                                                                                                                              
  3. Recargar la página después de instalar la extensión para que el content.js dispare el evento localrunner:ready y la app detecte el extId.                                                
                                                                                                                                                                                              
  Si la extensión ya está instalada pero el banner sigue apareciendo, lo más probable es que falte el paso del native host.




