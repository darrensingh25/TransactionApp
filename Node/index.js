const con = require("./nodedatabase.js");
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
const PORT = 8090;

const cors = require("cors");
var corsOptions = {
  origin: "http://localhost:3000",
};
app.use(cors(corsOptions));

app.get("/get-transaction", (req, res) => {
  con.query("select *from transaction", (err, result) => {
    if (err) {
      res.status(400).json({
        status: 400,
        message: err,
      });
    } else {
      res.status(200).json({
        status: 200,
        message: "your all transctions",
        data: result,
      }); 
    }
  });
});

app.post("/add-transaction", (req, res) => {
  let transactionType = req.body.transactionType;
  let amount = parseInt(req.body.amount);
  let description = req.body.description;

  if (transactionType == "credit") {
    if(Number.isInteger(amount) && amount>=0) {
    let insertQuery = `insert into transaction (date,description,transactionType,credit,runningBalance) VALUES (CURDATE(),'${description}', '${transactionType}', '${amount}','${amount}')`;
    let getLastQuery = `select * from transaction order by id desc limit 1`;

    con.query(getLastQuery, (err, result) => {
      if (err) {
        res.status(400).json({
          status: 400,
          message: err,
        });
      } else {
        if (result.length >0) {
         let totalAmount = result[0].runningBalance + amount;
          sqlRes = `insert into transaction (date,description,transactionType,credit,runningBalance) VALUES (CURDATE(),'${description}', '${transactionType}', '${amount}','${totalAmount}')`;
          con.query(sqlRes, (err, result) => {
            if (err) {
              return res.status(400).json({
                status: 400,
                message: err,
              });
            } else {
              return res.status(201).json({
                status: 201,
                message: "credited amount updated",
                data: result,
              });
            }
          });
        } else {
          con.query(insertQuery, (err, result) => {
            if (err) {
              return res.status(400).json({
                status: 400,
                message: err,
              });
            } else {
              return res.status(200).json({
                status: 200,
                message: "credited",
                data: result,
              });
            }
          });
        }
      }
    });
  } else {
    return res.status(400).json({
      status: 400,
      message: "please enter right value",
    });
  }
  } else {
    if (transactionType == "debit") {
      if(Number.isInteger(amount) && amount>=0) {
      getLastQuery = `select *from transaction order by id desc limit 1`;
      con.query(getLastQuery, (err, result) => {
        if (err) {
          res.status(400).json({
            status: 400,
            message: err,
          });
        } else {
          if (result.length >0) {
            if (amount > result[0].runningBalance) {
              return res.status(400).json({
                message: "low balance can't be debited",
              });
            } else {
            let  totalAmount = result[0].runningBalance - amount;
              sqlRes = `insert into transaction (date,description,transactionType,debit,runningBalance) VALUES (CURDATE(),'${description}', '${transactionType}', '${amount}','${totalAmount}')`;
              con.query(sqlRes, (err, result) => {
                if (err) {
                  return res.status(400).json({
                    status: 400,
                    message: err,
                  });
                } else {
                  return res.status(200).json({
                    status: 200,
                    message: "debited amount updated",
                    data: result,
                  });
                }
              });
            }
          } else {
            res.status(400).json({
              status:400,
              message: "Please first credit",
            }) 
          }
        }
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: "please enter right value",
      });
    }
  }
  }
});

app.listen(PORT, () => {
  console.log(`Server Running ${PORT}`);
});
