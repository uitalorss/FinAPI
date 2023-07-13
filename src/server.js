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

function getBalance(history){
  return history.reduce((total, element) => {
    if(element.type === 'deposit'){
      return total + element.amount
    }else{
      return total - element.amount
    }
  }, 0)
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
  const { customer } = req;
  return res.json(customer.history)
})

app.get("/history/date", verifyAccountCPF, (req, res) => {
  const {date} = req.query;
  const {customer} = req;
  const dateFormat = new Date(date + " 00:00");

  const historyByDate = customer.history.filter((item) => item.created_at.toDateString() === new Date(dateFormat).toDateString());
  return res.json(historyByDate);
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

app.get("/account", verifyAccountCPF, (req, res) => {
  const {customer} = req;
  const saldo = getBalance(customer.history)
  res.status(201).json(customer)
})

app.post("/withdraw", verifyAccountCPF, (req, res) => {
  const {description, amount} = req.body;
  const {customer} = req;

  const bankBalance = getBalance(customer.history);
  if(amount > bankBalance){
    return res.status(400).json({message: "Não é possível sacar um valor maior que o saldo atual"});
  }
  const withdraw = {
    description,
    amount,
    created_at: new Date(),
    type: "withdraw"
  };
  customer.history.push(withdraw);
  return res.status(201).json({message: "Saque efetuado com sucesso."});
})

app.put("/account", verifyAccountCPF, (req, res) => {
  const {name} = req.body;
  const {customer} = req;
  customer.nome = name;
  return res.status(201).json({message: "Nome alterado com sucesso"});
})