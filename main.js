if('serviceWorker' in navigator) {
    window.addEventListener('load', async ()=>{
        try {
            // Primero desregistrar cualquier service worker anterior
            const registrations = await navigator.serviceWorker.getRegistrations();
            for(let registration of registrations) {
                await registration.unregister();
                console.log('Service Worker anterior desregistrado');
            }

            // Ahora registrar el nuevo service worker
            const reg = await navigator.serviceWorker.register('/PWA_FirstCache/sw.js');
            console.log('sw registrado', reg);
        } catch(e) {
            console.log('hubo un error en la instalación del sw', e);
        }
    })
}