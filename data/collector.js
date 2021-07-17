

function collector(data){
  // Bisogna raccogliere i dati e gestirli nel modo giusto
  // In questo file avviene la raccolta
  // Descrivo la logica dietro la raccolta
  var user = {
    id:null,
    username:null,
    password:null,
    email:null,
    Settings:{
      blackTheme:null
    }
    Devices:[
      {
        name:null,
        location:null,
        status:null,
        lastID:null,
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

  var device_data = {
    deviceName:null,
    userID:null,
    beacon:{
      name:null,
      timelast:null,
      time:[
        null,
        null
      ]
    },
    data:[
      {
        id:null,
        time:null,
        status:null,
        long:null,
        lat:null,
        stat:null
      }
    ]
  }
  
}
