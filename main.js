if('serviceWorker' in navigator) {
    window.addEventListener('load',()=>{
        navigator.serviceWorker.register('/PWA_FirstCache/sw.js')
        .then(reg =>{
            console.log('sw registrado', reg);
        })
        .catch(e =>{
            console.log('hubo un error en la instalación del sw', e);
        })
    })
}