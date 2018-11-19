/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/



'use strict';
const Alexa = require('alexa-sdk');
const https = require('https')

const APP_ID = 'amzn1.ask.skill.90c5768a-4856-4346-b776-c894ebc0ad4f';

const SKILL_NAME = 'Mi Medico';
const GET_PROXIMA_VISITA = "Tu proxima visita es:";
const HELP_REPROMPT = 'En qué puedo ayudarte?';
const HELP_MESSAGE = 'Puedes decir cuándo es mi próxima visita, dame la descripcion de un medicamento, me he de tomar la aspirina o puedes decir salir...' + HELP_REPROMPT;
const STOP_MESSAGE = '¡Hasta la próxima, salud!';
const DESCRIPCION_IBUPROFENO = 'Ibuprofeno Kern Pharma está indicado en el \
    tratamiento de los síntomas de: Artritis reumatoide, artrosis y otros procesos \
    reumáticos agudos o crónicos. Lesiones de tejidos blandos como torceduras y esguinces. \
    Procesos dolorosos de intensidad leve o moderada como el dolor dental, \
    el dolor postoperatorio, el dolor de cabeza y dolor menstrual. \
    Fiebre de causas diversas.';
const POSOLOGIA_IBUPROFENO = 'La posología deberá ajustarse en función de la \
    gravedad del trastorno y de las molestias del paciente. \
    En general, la dosis diaria recomendada es de 1.200 mg de \
    ibuprofeno (2 sobres), repartidos en 2 tomas.';
const EFECTOS_IBUPROFENO = 'Los efectos adversos más frecuentes que ocurren con \
    los medicamentos como ibuprofeno son los gastrointestinales: úlceras pépticas, \
    hemorragias digestivas, perforaciones (en algunos casos mortales), \
    especialmente en los pacientes de edad avanzada. También se han observado \
    nauseas, vómitos, diarrea, flatulencia, estreñimiento, ardor de estómago, \
    dolor abdominal, sangre en heces, aftas bucales, empeoramiento de colitis \
    ulcerosa y enfermedad de Crohn. Menos frecuentemente se ha observado \
    la aparición de gastritis.';
const LLAMANDO_A = "Llamando a";

const data_fechasDeVisitas = [
    'Miércoles a las 10:00',
    'Viernes a las 8:00',
    'Lunes a las 7:45',
    'Lunes a las 15:30',
];

const data_frasesParaAnimar = [
    '¿Qué le dice un jaguar a otro? jaguar you',
    '¡Hoy va a ser un gran día!',
    '¡Ánimo!',
    '¡Esqueeerit!',
    'Todo va a salir bien',
    'No te preocupes',
    '¿Que hace una vampiro con un tractor? sembrar el pánico.',
    'Tu vales mucho, solo tienes que enfocar tu energía en algo positivo!',
];

function postFirebase(consulta,respuesta) {
    const jsonData = JSON.stringify({
        "username": "Morc",
        "consulta": consulta,
        "respuesta": respuesta
    })
    
    const options = {
        hostname: 'hackathons-186411.firebaseio.com',
        port: 443,
        path: '/data.json',
        method: 'POST',
        dataType: "json",
        headers: {'Content-Type': 'application/json; charset=utf-8'}
    }
    
    const req = https.request(options, (res) => {
        console.log(res.statusCode);
        res.on('data', (d) => {
            return d;
        })
    })
    
    req.on('error', (error) => {
      console.error(error);
    })
    
    req.write(jsonData)
    req.end()
}

function postFirebaseRecordatorio(recordatorio) {
    const jsonData = JSON.stringify({
        "username": "Morc",
        "recordatorio": recordatorio
    })
    
    const options = {
        hostname: 'hackathons-186411.firebaseio.com',
        port: 443,
        path: '/data_recordatorios.json',
        method: 'POST',
        dataType: "json",
        headers: {'Content-Type': 'application/json; charset=utf-8'}
    }
    
    const req = https.request(options, (res) => {
        console.log(res.statusCode);
        res.on('data', (d) => {
            return d;
        })
    })
    
    req.on('error', (error) => {
      console.error(error);
    })
    
    req.write(jsonData)
    req.end()
}

function getFirebaseRecordatorio() {
    const req = https.get('https://hackathons-186411.firebaseio.com/data_recordatorios.json', (res) => {
        res.setEncoding('utf8');
        res.on('data', function (body) {
            console.log(body);
        });
    });
    
    req.on('error', (error) => {
      console.error(error);
    })
    
    req.end()
}


function delegateSlotCollection(func) {
    console.log("## current dialogState: " + this.event.request.dialogState);

    if(func) {
        if (func(this.event)) {
            this.event.request.dialogState = "COMPLETED";
            return this.event.request.intent.slots;
        }
    }

    if (this.event.request.dialogState === "STARTED") {
        console.log("## in STARTED");
        //console.log(JSON.stringify(this.event));
        var updatedIntent = this.event.request.intent;

        this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
        console.log("## in not completed");
        //console.log(JSON.stringify(this.event));
        this.emit(":delegate", updatedIntent);
    } else {
        console.log("## in completed");
        //console.log("returning: "+ JSON.stringify(this.event.request.intent));
        return this.event.request.intent.slots;
    }
    return null;
}

const SECCION_DESCRIPCION_ID = 'DESCRIPCION';
const SECCION_EFECTOS_ID = 'EFECTOS';
const SECCION_POSOLOGIA_ID = 'POSOLOGIA';

const CENTRO_MEDICO_ESPECIALISTA = 'ESPECIALISTA';
const CENTRO_MEDICO_MEDICO_CABECERA = 'MEDICO DE CABECERA';
const CENTRO_MEDICO_AMBULATORIO = 'AMBULATORIO';
const CENTRO_MEDICO_MUTUA = 'MUTUA';
const CENTRO_MEDICO_CLINICA = 'CLINICA';
const CENTRO_MEDICO_MEDICO = 'MEDICO';
const CENTRO_MEDICO_CENTRO_SALUD = 'CENTRO DE SALUD';
const CENTRO_MEDICO_CAP = 'CAP';
const CENTRO_MEDICO_HOSPITAL = 'HOSPITAL';
const CENTRO_MEDICO_CENTRO_MEDICO = 'CENTRO MEDICO';


const handlers = {
    'sketit': function () {
        let frase = "Esqueriiiit, esqueriiiiit esqueeeeeeeerit, esquerit esquerit esquerit!";
        this.response.speak(frase);
        postFirebase("ESKETIIIIIIT!",frase);
        this.emit(':responseReady');
    },
    'leer_resultados_pruebas': function () {
        let frase = "Aún no tengo disponible los resultados, el laboratorio me indica que estarán el próximo martes.";
        this.response.speak(frase);
        postFirebase("Los resultados de la prueba:",frase);
        this.emit(':responseReady');
    },
    'ambulancia_emergencia': function () {
        let frase = "Voy a notificar a emergencias. No te preocupes, manten la calma. Ya llegamos!";
        this.response.speak(frase);
        postFirebase("Emergencia solicitada",frase);
        this.emit(':responseReady');
    },
    'pizza': function () {
        let frase = "La pizza más sana que puedes comer es la de Domino's Pizza.";
        this.response.speak(frase);
        this.emit(':responseReady');
    },
    'dar_animos': function () {
        const listaDeAnimos = data_frasesParaAnimar;
        const index = Math.floor(Math.random() * listaDeAnimos.length);
        const fraseRandom = listaDeAnimos[index];
        this.response.speak(fraseRandom);
        postFirebase("Dar Ánimos",fraseRandom);
        this.emit(':responseReady');
    },
    'leer_prospecto': function () {
        let seccion = this.event.request.intent.slots.seccion.resolutions.resolutionsPerAuthority[0].values[0].value.id;
        let medicamento = this.event.request.intent.slots.medicamento.value;
        if (medicamento == 'ibuprofeno') {
            switch(seccion) {
                case SECCION_DESCRIPCION_ID:
                    this.response.speak("Descripción del "+medicamento+" ."+DESCRIPCION_IBUPROFENO);
                    postFirebase("Descripcion del "+medicamento,DESCRIPCION_IBUPROFENO);
                    break;
                case SECCION_EFECTOS_ID:
                    this.response.speak("Efectos del "+medicamento+" ."+EFECTOS_IBUPROFENO);
                    postFirebase("Efectos del "+medicamento,EFECTOS_IBUPROFENO);
                    break;
                case SECCION_POSOLOGIA_ID:
                    this.response.speak("Posología del "+medicamento+" ."+POSOLOGIA_IBUPROFENO);
                    postFirebase("Posologia del "+medicamento,POSOLOGIA_IBUPROFENO);
                    break;
                default:
                    this.response.speak('Puedes preguntar por descripcion, posologia o efectos del medicamento.');
            }
        } else {
            let frase = "Lo siento, con el tiempo disponible para la jácaton \
                no tenemos disponible el prospecto para"+ medicamento +". Pero \
                puedes probar con ibuprofeno.";
            this.response.speak(frase);
            postFirebase("Prospecto no disponible","Prospecto no disponible para "+medicamento);
        }
        this.emit(':responseReady');
    },
    'TestIntent': function () {
        let frase = 'Hola que ase, firebase';
        this.response.speak(frase);
        postFirebase("Hacer un Test",frase);
        this.emit(':responseReady');
    },
    'SolicitarVisita': function () {
        let medico = this.event.request.intent.slots.typeOfMedico.value;
        let frase = 'La primera cita disponible con un '+medico+' es el viernes a las 15:00';
        this.response.speak(frase);
        postFirebase("Emergencia solicitada",frase);
        this.emit(':responseReady');
    },
    'ProximaVisita': function () {
        this.emit('ObtenerProximaVisita');
    },
    'LaunchRequest': function () {
        this.response.speak(HELP_MESSAGE);
    },
    'ObtenerProximaVisita': function () {
        const listaFechasRandom = data_fechasDeVisitas;
        const fechaRandomIndex = Math.floor(Math.random() * listaFechasRandom.length);
        const fechaRandom = listaFechasRandom[fechaRandomIndex];
        const textoParaLeer = GET_PROXIMA_VISITA + fechaRandom;

        this.response.cardRenderer(SKILL_NAME, fechaRandom);
        this.response.speak(textoParaLeer);
        this.emit(':responseReady');
    },
    'set_recordatorio': function () {
        //let evento_presencial = this.event.request.intent.slots.evento_presencial.resolutions.resolutionsPerAuthority[0].values[0].value.id;
        //let periodo_de_tiempo = this.event.request.intent.slots.periodo_de_tiempo.resolutions.resolutionsPerAuthority[0].values[0].value.id;
        let medicamento = this.event.request.intent.slots.medicamento.value;
        
        //this.response.setAlert(evento_presencial + 'con tu medico.');
        //this.response.scheduledTime = periodo_de_tiempo;
        let frase = 'Te recordaré cuando tienes que tomar el ' + medicamento;
        this.response.speak(frase);
        postFirebase("Añadir un recordatorio",frase);
        postFirebaseRecordatorio(frase);
        this.emit(':responseReady');
    },
    'get_recordatorio': function () {
        let medicamento = this.event.request.intent.slots.medicamento.value;
        //let recordatorios = getFirebaseRecordatorio();
        //if (recordatorios.length == 0) this.response.speak("Aun no has introducido ningun recordario. Puedes guardar un nuevo recordatorios 'Recuerdame que me tome..'");
        
        let time = "dos horas y trece minutos";
        if (medicamento == "ibuprofeno") time = "dos horas y quince minutos";
        else if (medicamento == "paracetamol") time = "diez horas";
        else if (medicamento == "dexprofeno") time = "tres horas";
        this.response.speak('Tienes que tomarte el ' + medicamento + ' dentro de ' + time);
        this.emit(':responseReady');
    },
    'medico_a_domicilio': function () {
        let centro_medico = this.event.request.intent.slots.centro_medico.value;
        let llamada_string = LLAMANDO_A + " tu ";
        switch(centro_medico) {
            case CENTRO_MEDICO_ESPECIALISTA:
                llamada_string = llamada_string + CENTRO_MEDICO_ESPECIALISTA
                this.response.speak(llamada_string);
                postFirebase("Medico a domicilio",llamada_string);
                break;
            case CENTRO_MEDICO_MEDICO_CABECERA:
                llamada_string = llamada_string + CENTRO_MEDICO_MEDICO_CABECERA
                this.response.speak(llamada_string);
                postFirebase("Medico a domicilio",llamada_string);
                break;
            case CENTRO_MEDICO_AMBULATORIO:
                llamada_string = llamada_string + CENTRO_MEDICO_AMBULATORIO
                this.response.speak(llamada_string);
                postFirebase("Medico a domicilio",llamada_string);
                break;
            case CENTRO_MEDICO_MUTUA:
                llamada_string = llamada_string + CENTRO_MEDICO_MUTUA
                this.response.speak(llamada_string);
                postFirebase("Medico a domicilio",llamada_string);
                break;
            case CENTRO_MEDICO_CLINICA:
                llamada_string = llamada_string + CENTRO_MEDICO_CLINICA
                this.response.speak(llamada_string);
                postFirebase("Medico a domicilio",llamada_string);
                break;
            case CENTRO_MEDICO_MEDICO:
                llamada_string = llamada_string + CENTRO_MEDICO_MEDICO
                this.response.speak(llamada_string);
                postFirebase("Medico a domicilio",llamada_string);
                break;
            case CENTRO_MEDICO_CENTRO_SALUD:
                llamada_string = llamada_string + CENTRO_MEDICO_CENTRO_SALUD
                this.response.speak(llamada_string);
                postFirebase("Medico a domicilio",llamada_string);
                break;
            case CENTRO_MEDICO_CAP:
                llamada_string = llamada_string + CENTRO_MEDICO_CAP
                this.response.speak(llamada_string);
                postFirebase("Medico a domicilio",llamada_string);
                break;
            case CENTRO_MEDICO_HOSPITAL:
                llamada_string = llamada_string + CENTRO_MEDICO_HOSPITAL
                this.response.speak(llamada_string);
                postFirebase("Medico a domicilio",llamada_string);
                break;
            case CENTRO_MEDICO_CENTRO_MEDICO:
                llamada_string = llamada_string + CENTRO_MEDICO_CENTRO_MEDICO
                this.response.speak(llamada_string);
                postFirebase("Medico a domicilio",llamada_string);
                break;
            default:
                this.response.speak('el centro es: ' + centro_medico);
        }
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
