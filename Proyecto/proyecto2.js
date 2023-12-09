/**
 * -----------------------------------------------------------------
 * Integrantes:
 * Salamanca Campos	Andrey	andsala@estudiantec.cr
 * Valverde Marin	Estefani Tatiana	2021554564@estudiantec.cr		
 * Valverde Villachica	Jhonner	jhonner@estudiantec.cr		
 * Xie Li	Dayana	dxie@estudiantec.cr	
 * 	
 * -----------------------------------------------------------------
 */

/**
 * -----------------------------------------------------------------
 * Variables globales
 * -----------------------------------------------------------------
 */

let Orientación; 
let inputElement;
let maxGeneraciones;
let individuosPorGeneracion;
let porcentajeSeleccion;
let porcentajeMutacion;
let porcentajeCruce;


const img = new Image();
let imgTarget;
let imgGen;
let allFitness = [];

const CantidadElitista = 1
const Grafica = CrearGrafico();
let Generaciones = [];
let GeneracionesTotales = 0;
let datosCargados = false;


/**
 * -----------------------------------------------------------------
 * Interfaz - Parametros
 * -----------------------------------------------------------------
 */

/**
 * Asociado al evento de envio de paramtros, en la funcion cargarDatos.
 * Que ejecurta el contenido a sido cargado correctamente. 
 */
document.addEventListener('DOMContentLoaded', function () {
    const Datos = document.getElementById('parametros');
    Datos.addEventListener('submit', cargarDatos);
});

/**
 * Funcion encargada de procesar los datos de parametro y realizar
 * operaciones relacionadas al algoritmo genetico.
 * @param {event} event evento de envio del formulario
 */

function cargarDatos(event){
    let TiempoInicial;
    let TiempoTotal = 0;
    event.preventDefault();

    Orientación = document.getElementById('canvasOutput');
    inputElement = document.getElementById('imagenObjetivo');
    maxGeneraciones = document.getElementById('maxGeneraciones').value;
    individuosPorGeneracion = document.getElementById('individuosPorGeneracion').value;
    porcentajeSeleccion = document.getElementById('porcentajeSeleccion').value;
    porcentajeMutacion = document.getElementById('porcentajeMutacion').value;
    porcentajeCruce = document.getElementById('porcentajeCruce').value;
    grosorLinea = document.getElementById('grosorLinea').value;
    
    if (porcentajesSuman100(porcentajeSeleccion, porcentajeMutacion, porcentajeCruce)) {
        if (!inputElement.files || inputElement.files.length === 0) {
            alert("Debes cargar una imagen primero.");
            return;
        }
        TiempoInicial = performance.now();
        datosCargados = true;

        const ImagenEnContexto = Orientación.getContext('2d');

        img.onload = function () {
            imgTarget = cv.imread(img);
            Orientación.width = 300;
            Orientación.height = 300;
            ImagenEnContexto.drawImage(img, 0, 0, 200, 200);

            let Poblacion = poblacionInicial();
            for(i=0; i<maxGeneraciones; i++){
                unirLineas(Poblacion, cv); // dibuja las lineas
                fitness(); // calcular fitness
                let Seleccionados = SeleccionDeFormaElitista(Poblacion, porcentajeSeleccion, CantidadElitista);
                Poblacion = Generacion(Seleccionados, porcentajeMutacion, porcentajeCruce);
                Generaciones.push(GeneracionesTotales);
                GeneracionesTotales++;

            }
            const TiempoFinal = performance.now();
            const TiempoGeneracional = TiempoFinal - TiempoInicial;
            TiempoTotal += TiempoGeneracional;
            GeneracionesTotales++;
            
            ActualizarEstadisticas(TiempoTotal, TiempoTotal / GeneracionesTotales);
        };
        img.src = URL.createObjectURL(inputElement.files[0]);
    } else {
        alert("Los porcentajes deben sumar 100");
    }
    
}

/**
 * Verifica si la suma de tres porcentajes es igual a 100
 * @param {number} porcentajeSeleccion 
 * @param {number} porcentajeMutacion 
 * @param {number} porcentajeCruce 
 * @returns boolean 
 */
function porcentajesSuman100(porcentajeSeleccion, porcentajeMutacion, porcentajeCruce) {
    let suma = parseInt(porcentajeSeleccion) + parseInt(porcentajeMutacion) + parseInt(porcentajeCruce);
    if (suma ==100){
        return true;
    } else {
        return false;
    }
}


/**
 * -----------------------------------------------------------------
 * Estadistica
 * -----------------------------------------------------------------
 */

/**
 * Funcion para crear y configurar un grafico de lineas 
 * @returns objeto del grafico configurado
 */

function CrearGrafico() {
    const ContextoGrafico = document.getElementById('graficoFitness').getContext('2d');

    const GraficoFitnessPromedio = {
        label: 'Fitness Promedio',
        data: [],
    };

    const GraficoFitnessMejor = {
        label: 'Mejor Fitness',
        data: [],
    };

    const Datos = [];
    const Grafica = new Chart(ContextoGrafico, {
        type: 'line',
        data: {
            labels: Datos,
            datasets: [GraficoFitnessPromedio, GraficoFitnessMejor],
        },
    });

    return Grafica;
}

/**
 * Funcion para actualizar las estadisticas y el grafico de datos con el tiempo y fitness
 * @param {number} TiempoTotal 
 * @param {number} TiempoPromedio 
 */

function ActualizarEstadisticas(TiempoTotal, TiempoPromedio) {

    const IDTiempoTotal = document.getElementById('tiempoTotal');
    const IDTiempoPromedio = document.getElementById('tiempoPromedio');

    IDTiempoTotal.textContent = `Tiempo Total: ${TiempoTotal.toFixed(1)} Milisegundos.`;
    IDTiempoPromedio.textContent = `Tiempo Promedio: ${TiempoPromedio.toFixed(1)} Milisegundos por Generación.`;
    //Grafica.data.labels.push(Generaciones);
    for (let i = 0; i < allFitness.length; i++) {
        Grafica.data.labels.push(i);
        Grafica.data.datasets[0].data.push([i, allFitness[i]]);
    }
    Grafica.update();
}

/**
 * -----------------------------------------------------------------
 * Fitness
 * -----------------------------------------------------------------
 */

/**
 * Funcion para generar una poblacion inicial de individuos con coordenadas aleatorias
 * @returns {Array} Arreglo de los puntos que representan a poblacion inicial 
 */

function poblacionInicial(){
    const firstGen = [];
    
    // se crean la cantidad de puntos por la cantidad de individuos indicados por el usuario
    for (let i = 0; i < individuosPorGeneracion; ++i) {
        // se crean los puntos usando como rango el tamaño de la imagen
        firstGen.push(new cv.Point(Math.floor(Math.random() * 200) + 1, Math.floor(Math.random() * 200) + 1));
    }   
    return firstGen;
}

/**
 * Funcion para unir las lineas entre los puntos de generaciones
 * @param {Array} firstGen 
 * @param {object} cv 
 */
function unirLineas(firstGen, cv){  
    let indiv = new cv.Mat(200, 200, cv.CV_8U, new cv.Scalar(255, 255, 255));
    for (let i = 0; i < firstGen.length -1 ; i++) {
        cv.line(indiv, firstGen[i], firstGen[i+1], [0, 0, 0, 255], parseInt(grosorLinea));
    }
    cv.imshow('canvasOutput2', indiv);
    imgGen = indiv;
    //imgTarget.delete();
}
/**
 * Función para calcular el fitness de la imagen generada en comparación con la 
 * imagen objetivo.
 */

function fitness(){

    let normaAct = cv.norm(imgGen);
    //console.log("Norma de la imagen actual:" + normaAct);

    let normaTarget = cv.norm(imgTarget);
    //console.log("Norma de la imagen objetivo:" + normaTarget);

    // distancia euclideana
    let distancia = Math.sqrt((normaTarget - normaAct)**2);
    //console.log("Distancia Euclideana:" + distancia);
    console.log("Gen " + GeneracionesTotales + ": " + distancia);
    allFitness.push(distancia);
}
/**
 * -----------------------------------------------------------------
 * Mutación
 * -----------------------------------------------------------------
 */

/**
 * Funcion para realizar la mutacion en un indivudio o poblacion, 
 * @param {Array} individuo 
 * @param {number} porcentajeMutacion 
 */
function mutacion(individuo, porcentajeMutacion){
    // idea inicial del codigo base 
    for (let i = 0; i < individuo.length; i++) {
        for (let j = 0; j < individuo[i].length; j++) {
            if (Math.random() < porcentajeMutacion / 100) {
                
                individuo[i][j] = generarCoordenadas(); 
            }
        }
    }
}

/**
 * Genera coordenadas aleatorias dentro de un rango definido
 * @returns {object} punto con coordenadas aleatorias
 */
function generarCoordenadas(){

    const xMin = 0; 
    const xMax = 500; 
    const yMin = 0; 
    const yMax = 500; 

    const nuevoX = Math.floor(Math.random() * (xMax - xMin + 1)) + xMin;
    const nuevoY = Math.floor(Math.random() * (yMax - yMin + 1)) + yMin;

    return new cv.Point(nuevoX, nuevoY);
}

/**
 * Devuelve un porcentaje espefico de un elemento de la lista
 * @param {Array} lista 
 * @param {number} x 
 * @returns porcentaje de elementos
 */
function obtenerPorcentaje(lista, x) {
    // devuelve el x% de elementos de la lista para luego hacer las llamadas a combinar, mutar y seleccionar
    let  longitud = lista.length;
    let  cantidad = Math.round(longitud * x / 100);
    return lista.slice(0, cantidad);
}

/**
 * Combina dos puntos intercambiando las coordenadas x o y de manera aleatoria
 * @param {object} punto1 
 * @param {object} punto2 
 * @returns {object} nuevo punto combinado
 */
function combinar(punto1, punto2){

    // combina ya sea el x o y de los puntos
    // num aleatorio para ver si copiar el valor x o y 
    let  random = Math.floor(Math.random() * 2);
    let nuevoPunto = new cv.Point();
    if(random == 0){
        nuevoPunto.x = punto1.x
        nuevoPunto.y = punto2.y
    }else{
        nuevoPunto.x = punto2.x
        nuevoPunto.y = punto1.y
    }
    return nuevoPunto;

}

/**
 * -----------------------------------------------------------------
 * Seleccion Elitisita - Generaciones
 * -----------------------------------------------------------------
 */

/**
 * Realiza la selección de individuos de forma elitista, de los mejores individuos.
 * @param {Array} Poblacion 
 * @param {number} porcentajeSeleccion 
 * @param {number} CantidadElitista 
 * @returns {Array} Nueva generacion de individuos seleccionados    
 */
function SeleccionDeFormaElitista(Poblacion, porcentajeSeleccion, CantidadElitista) {
    const TotalIndividuos = Math.round(Poblacion.length * (porcentajeSeleccion / 100));
    const LosEscogidos = [];

    const GenesElites = Poblacion.slice(0, CantidadElitista);
    SiguienteGeneracion = GenesElites.slice();

    for (let RecorrerIndividuos = CantidadElitista; RecorrerIndividuos < TotalIndividuos; RecorrerIndividuos++) {
        const Posicion = Math.floor(Math.random() * Poblacion.length);
        LosEscogidos.push(Poblacion[Posicion]);
        Poblacion.splice(Posicion, 1);
    }

    SiguienteGeneracion = SiguienteGeneracion.concat(LosEscogidos);

    return SiguienteGeneracion;
}

/**
 * Genera una nuevos individuos mediante mutacion y cruce
 * @param {Array} Seleccionados 
 * @param {number} porcentajeMutacion 
 * @param {number} porcentajeCruce 
 * @returns {Array} Nueva generacion de individuos
 */

function Generacion(Seleccionados, porcentajeMutacion, porcentajeCruce) {
    const SiguienteGeneracion = Seleccionados.slice();

    while (SiguienteGeneracion.length < individuosPorGeneracion) {
        if (Math.random() < porcentajeMutacion / 100) {
            const Posicion = Math.floor(Math.random() * SiguienteGeneracion.length);

            mutacion(SiguienteGeneracion[Posicion], porcentajeMutacion);

        } else {
            const Gen1 = Seleccionados[Math.floor(Math.random() * Seleccionados.length)];
            const Gen2 = Seleccionados[Math.floor(Math.random() * Seleccionados.length)];

            if (Math.random() < porcentajeCruce / 100) {
                SiguienteGeneracion.push(combinar(Gen1, Gen2));
            } else {
                SiguienteGeneracion.push(Gen1);
            }
        }
    }

    return SiguienteGeneracion;
}