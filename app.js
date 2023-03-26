import express from "express";
import fs from "fs";
import fetch from "node-fetch";

const app = express();
app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({extended: true}))

let webHooks = getFileContent();

const docsPage = fs.readFileSync("./static/docs.html", "utf-8");
const types = ["payment", "payment_received", "payment_proccessing", "payment_complete"]

function checkIfFileExists() {
  return fs.existsSync("./webhooks.json");
}

function getFileContent() {
  let exists = checkIfFileExists();
  if (exists) {
    let fileContent = fs.readFileSync("./webhooks.json");
    let webhooksArr = JSON.parse(fileContent);
    return webhooksArr;
  }
  clearInterval(interval);
  return [];
}

function appendWebhook(object) {
  const { type,endpoint } = object;

  if(!types.includes(type)) {
    throw Error(`Webhook Type was not found - Type: '${type}'`);
  }

  if(webHooks.some(e => e.endpoint === endpoint)){
    throw Error(`Webhook Endpoint is already registered - Endpoint ${endpoint}`)
  }

  const isCreated = checkIfFileExists();

  if (!isCreated) {
    webHooks.push(object);
    const jsonString = JSON.stringify(webHooks);
    fs.writeFileSync("./webhooks.json", jsonString);
    return;
  }
  const filecontent = fs.readFileSync("./webhooks.json", "utf-8");
  webHooks = JSON.parse(filecontent);
  webHooks.push(object);
  const jsonString = JSON.stringify(webHooks);
  fs.writeFileSync("./webhooks.json", jsonString);
}

function removeWebhook(endpoint) {
  let filteredArr = webHooks.filter((e) => e.endpoint !== endpoint);
  let jsonString = JSON.stringify(filteredArr);
  fs.writeFileSync("./webhooks.json", jsonString);
}


app.get('/docs', (req, res) => {
    res.send(docsPage)
})
app.post("/register", (req, res) => {
  try {
    const data = req.body;
    appendWebhook(data);
    res.status(202).send({ message: "Webhook is created" });
  } catch (e) {
    res.status(500).send({ error: e.toString() });
  }
});

app.post("/unregister", (req, res) => {
  try {
    const object = req.body;
    removeWebhook(object.endpoint);
    res.status(202).send({ message: "Webhook is unregistered" });
  } catch (e) {
    res.status(500).send({ error: e.toString() });
  }
});

app.get("/triggerPayment", (req, res) => {
  triggerPayment();
  res.status(202).send({ message: "Accepted" });
});

app.get("/triggerPush", (req, res) => {
  triggerPush();
  res.status(202).send({ message: "Accepted" });
});



const interval = setInterval(() => {
    triggerPayment()
    triggerPaymentProcessing();
    triggerPaymentComplete();
    triggerPaymentReceived();
}, 5000);

function triggerPaymentReceived() {
    webHooks.forEach((e) => {
        if (e.type === "payment_received") {
            fetch(e.endpoint, {
              method: "POST",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify({ data : e , msg: "triggered Payment" }),
            });
          }
    })
}

function triggerPaymentProcessing() {
    webHooks.forEach((e) => {
        if (e.type === "payment_processing") {
            fetch(e.endpoint, {
              method: "POST",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify({ data : e ,msg: "triggered Payment" }),
            });
          }
    })
}

function triggerPaymentComplete() {
    webHooks.forEach((e) => {
        if (e.type === "payment_complete") {
            fetch(e.endpoint, {
              method: "POST",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify({ data : e ,msg: "triggered Payment" }),
            });
          }
    })
}

function triggerPayment() {
  webHooks.forEach((e) => {
    if (e.type === "payment") {
      fetch(e.endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ data : e ,msg: "triggered Payment" }),
      });
    }
  });
}

function triggerPush() {
  webHooks.forEach((e) => {
    if (e.type === "push") {
      fetch(e.endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({data : e, msg : "triggered Push"}),
      });
    }
  });
}

const server = app.listen(80, () => {
  console.log("Server is running on", server.address().port);
});
