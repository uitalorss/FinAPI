import express from "express";
import {v4 as uuidv4} from "uuid"

const app = express();

app.listen(3333);
app.use(express.json());

const customers = [];

app.post("/account", (req, res) => {
  const {cpf, nome} = req.body;
  const isCustomersExists = customers.some((customer) => customer.cpf === cpf)
  if(isCustomersExists){
    return res.status(400).json({error: "Cliente já existe em nosso cadastro!"})
  }
  customers.push({
    id: uuidv4(),
    cpf,
    nome,
    history: []
  })
  return res.status(201).send();
})

app.get("/history", (req, res) => {
  const {cpf} = req.headers;
  const customer = customers.find((customer) => customer.cpf === cpf);
  if(!customer){
    return res.status(400).send("Cliente não encontrado.")
  }
  return res.json(customer.history)
}) 