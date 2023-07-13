import express, { request, response } from "express";
import {v4 as uuidv4} from "uuid"

const app = express();

app.listen(3333);
app.use(express.json());

const customers = [];

function verifyAccountCPF(req, res, next){
  const {cpf} = req.headers;
  const customer = customers.find((customer) => customer.cpf === cpf);
  if(!customer){
    return res.status(400).json({error: "Cliente não encontrado."})
  }
  req.customer = customer;
  return next();
}

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

app.get("/history", verifyAccountCPF, (req, res) => {
  const { customer } = req
  return res.json(customer.history)
})

app.post("/deposit", verifyAccountCPF, (req, res) => {
  const {description, amount} = req.body;
  const {customer} = req;

  const deposit = {
    description,
    amount,
    created_at: new Date(),
    type: 'deposit'
  };
  customer.history.push(deposit);
  return res.status(201).send();
})