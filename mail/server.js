const SMTPServer = require("smtp-server").SMTPServer;
const parser = require("mailparser").simpleParser


async function mail(){
  console.log("prova");
  const server = new SMTPServer({
    onData(stream, session, callback) {
      parser(stream, {}, (err, parsed) => {
        if (err)
        console.log("Error:" , err)

        console.log(parsed)
        stream.on("end", callback)
      })

    },
    disabledCommands: ['AUTH']
  });

  server.listen(25, "192.168.1.197")
  console.log("fine mail");
}

module.exports = mail;
