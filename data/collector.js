
// Bisogna raccogliere i dati e gestirli nel modo giusto
// In questo file avviene la raccolta
// Descrivo la logica dietro la raccolta
var user = {
  id:null,
  username:null,
  password:null,
  email:null,
  Group:{
    groupName:null,
    groupID:null,
    groupRole:null
  },
  Settings:{
    blackTheme:null
  }

}

var device = {
  deviceName:null,
  deviceID:null,
  groupID:null,
  beacons:{
    name:null,
    timelast:null,
    time:[
      null,
      null
    ]
  },
  data:[
    {
      dataID:null,
      time:null,
      status:null,
      lon:null,
      lat:null,
      stat:null
    }
  ]
}
// I device hanno un nome (univoco) e sono associati a un ID group (univoco)
// Solamente i group a cui appartengono i device possono vedere le informazioni in questo modo
// Bisogna creare un ID group univoco e un ID device univoco

var group = {
  groupName:null,
  groupID:null,
  groupCreator:{
    userName:null,
    userID:null,
    time:null
  },
  members:[
    {
      memberName:null,
      memberID:null,
      memberRole:null
    }
  ],
  Devices:[
    {
      deviceName:null,
      deviceID:null,
      lastData:{
        time:null,
        status:null,
        long:null,
        lat:null,
        stat:null
      },
      connections:[
        {
          beacon:null,
          time:null
        }
      ],
    }
  ],
  beacons:{
    name:null,
    time:[
      null,
      null
    ]
  }
}

// L'oggetto group è molto articolato
// Quello che fa è aggregare i devices e permettere ai membri del gruppo di visualizzarli
// Ogni membro ha un ruolo
// Creator: Creatore e gestore del gruppo e dei devices -> sottogruppi: tutti
// Admin: Gestore del gruppo e dei devices -> sottogruppi: tutti tranne Creator
// Editor: Gestore dei devices -> sottogruppi: user
// User: Visualizzatore dei device -> sottogruppi: nessuno

// Creazione dei ruoli
var role = {
  Access:[CREATE,ADD,DELETE,MODIFY,USER,SETTING]
}

// La creazione dei ruoli deve essere implementata ad ogni azione di post/get degli utenti
// Va performata su app.get/post('',checkAuthenticated,async(req,res)=>{s})

var invite = {
  inviteLink:null,
  groupID:null,
  userID:null,
  userInvited:null,
  userRole:null,
  time:null,
  timeAccept:null
}

// Devo creare un database dove inserire gli inviti
// Bisogna aggiornare gli inviti in timeAccept perche una persona non puo entrare 2 volte dallo stesso invito
// Devo creare anche una classe di elementi sul server.js
// Bisogna creare la pagina ejs degli inviti
// Devo capire come funziona l'email
// Bisogna fare il collegamento tra i due database (gruppo e inviti)
// Creare un link alla domanda di invito
