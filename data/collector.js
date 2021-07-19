
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
      long:null,
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
      beacons:{
        name:null,
        timelast:null
      }
    }
  ]
}

// L'oggetto group è molto articolato
// Quello che fa è aggregare i devices e permettere ai membri del gruppo di visualizzarli
// Ogni membro ha un ruolo
// Creator: Creatore e gestore del gruppo e dei devices -> sottogruppi: tutti
// Admin: Gestore del gruppo e dei devices -> sottogruppi: tutti tranne Creator
// Editor: Gestore dei devices -> sottogruppi: user
// User: Visualizzatore dei device -> sottogruppi: nessuno

var role = {
  
}
