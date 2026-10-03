/*
En este proyecto he usado el API fetch(), para leer de forma asíncrona los sonetos de la carpeta
"sonetos". Al abrir index.html desde el explorador de archivos, los navegadores modernos bloquean las peticiones fetch()
por las políticas de seguriudad CORS. La única forma de que no suceda esto es no usar fetch y poner 
los sonetos directamente en este mismo archivo, pero no se si eso se permite.

Igualmente, para visualizarlo, me he instalado la extensión Live Server, en visual studio code. 
De esta forma, al hacer click derecho en el index.html en vsCode, nos permite abrirlo con esa herramienta y
si se muestra todo de forma correcta.
*/

const Modelo = {
    sonetosDisponibles: [
        { id: 'sonetos/eraseUnHombre.md', nombre: 'A una nariz' },
        { id: 'sonetos/escritoEstaEnMiALma.md', nombre: 'Escrito está en mi alma' },
        { id: 'sonetos/mientrasPorCompetir.md', nombre: 'Mientras por competir' },
        { id: 'sonetos/mireLosMuros.md', nombre: 'Miré los muros' },
        { id: 'sonetos/unSonetoMeManda.md', nombre: 'Definición de soneto' }
    ],

    async parsearDesdeRuta(ruta) {
        // Aquí obtenemos el texto
        const respuesta = await fetch(ruta);
        const texto = await respuesta.text();

        let titulo = "Sin título";
        let autor = "Anónimo";

        // Limpiamos las líneas de el soneto para poder trabajar con ellas comodamente
        const lineas = texto.split('\n').map(l => l.trim());

        // Extraemos datos como el título y el autor
        lineas.forEach(linea => {
            const lineaMin = linea.toLowerCase();
            if (lineaMin.startsWith('titulo:') || lineaMin.startsWith('título:')) {
                titulo = linea.substring(linea.indexOf(':') + 1).replaceAll('"', '').trim();
            } else if (lineaMin.startsWith('autor:')) {
                autor = linea.substring(linea.indexOf(':') + 1).replaceAll('"', '').trim();
            }
        });

        // Extrae solo los versos
        const versos = lineas.filter(l => {
            const lMin = l.toLowerCase();
            return l.length > 0 && 
                   !lMin.startsWith('titulo:') && 
                   !lMin.startsWith('autor:') && 
                   lMin !== 'soneto';
        });
        
        // Organizamos los versos en cuartetos y tercetos
        const estrofas = [
            versos.slice(0, 4),
            versos.slice(4, 8),
            versos.slice(8, 11),
            versos.slice(11, 14)
        ];

        //Devolvemos los datos
        return { titulo, autor, estrofas };
    }
};

const Vista = {
    select: document.getElementById('soneto-select'),
    visor: document.querySelector('article'),

    // Configuramos el selector
    poblarSelector(lista) {
        this.select = document.getElementById('soneto-select');
        this.select.innerHTML = '<option value="" disabled selected>Escoge un soneto...</option>';
        
        lista.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.nombre;
            this.select.appendChild(opt);
        });
    },

    mostrarSoneto(soneto) {
        this.visor = document.querySelector('article');
        if (!soneto || !this.visor) return;

        // Aqui agrupamos los versos de cada estrofa en un bloque, y ponemos un margen inferior para que se vea visualmente la separación entre estrofas
        let htmlEstrofas = '';
        soneto.estrofas.forEach(estrofa => {
            if (estrofa.length > 0) {
                htmlEstrofas += `<div style="margin-bottom: 2rem;">`;
                estrofa.forEach(verso => {
                    htmlEstrofas += `<p style="margin: 0.2rem 0; font-size: 1.1rem;">${verso}</p>`;
                });
                htmlEstrofas += `</div>`;
            }
        });

        // Sustituye el article del HTML por todo el texto que sera visible al seleccionar un soneto
        this.visor.innerHTML = `
            <h1 style="font-family: serif; font-size: 2rem; margin-bottom: 0.3rem;">${soneto.titulo}</h1>
            <p style="font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.9;">${soneto.autor}</p>
            <div>${htmlEstrofas}</div>
        `;
    },

    // Detecta los cambios el el select (desplegable para elegir el soneto)
    alCambiar(manejador) {
        this.select.addEventListener('change', e => manejador(e.target.value));
    }
};

const Controlador = {
    iniciar() {
        Vista.poblarSelector(Modelo.sonetosDisponibles);
        Vista.alCambiar(async (ruta) => {
            const soneto = await Modelo.parsearDesdeRuta(ruta);
            Vista.mostrarSoneto(soneto);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => Controlador.iniciar());