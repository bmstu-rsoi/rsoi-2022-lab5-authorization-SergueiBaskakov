'use strict';
const utf8 = require('utf8');
const express = require('express');
const { Pool, Client } = require('pg');
const axios = require('axios');
const jwt_decode = require('jwt-decode');
const jwt = require('jsonwebtoken');
// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
// App
const app = express();

const { auth } = require('express-openid-connect');

const { requiresAuth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://k8s-default-ingressl-9814e89188-1928607621.us-west-2.elb.amazonaws.com',
  clientID: 'g2rbN7TMJsV0fQPSFUay7uZ3sz6as71w',
  issuerBaseURL: 'https://dev-8ntxzeiwzktxlcmw.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// req.isAuthenticated is provided from the auth router

var client = new Client({
  user: 'postgres',//'program',
  host: '127.0.0.1',//'postgres',
  //database: 'reservations',
  password: 'postgres',//'test',
  port: 5432,
});

var waitTime = 1000

client.connect();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.listen(PORT, HOST);

console.log(`Running on http://${HOST}:${PORT}`);

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

app.get('/', (req, res) => {
  //sleep(3000)
  setTimeout((() => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out')
  }), waitTime)
  //res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
  //res.send('// Gateway Service //');
});

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

app.get('/check8070', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  axios.get(`http://${HOST}:8070/`, {})
  .then((response) => {
    // handle success
    res.statusCode = response.status
    response.status == 200 ? res.send(response.data) : res.end();
  })
  .catch((error) => {
    // handle error
    res.statusCode = 400
    res.end(JSON.stringify({ message: error.message}));
  })
});

app.get('/manage/health', (req, res) => {
  res.statusCode = 200
  res.send(JSON.stringify());
});

/*
app.get('/callback', (req, res) => {
  res.statusCode = 200
  res.send("Success login");
});

app.get('/logout', (req, res) => {
  res.statusCode = 200
  res.send("Logout");
});
*/

function parseJwt (token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

app.get('/api/v1/hotels', (req, res) => {
  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization.split(' ')[1],
        decoded;
    try {
        //decoded = jwt.verify(authorization);
        console.log(authorization)
        decoded = parseJwt(authorization)
        console.log(decoded)

        res.setHeader('Content-Type', 'application/json')
        axios.get(`http://${HOST}:8070/api/v1/hotels`, {
          params: {
            page: req.query.page,
            size: req.query.size
          }
        })
        .then((response) => {
          // handle success
          setTimeout((() => {
            res.statusCode = response.status
            response.status == 200 ? res.send(response.data) : res.end();res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out')
          }), waitTime)
          
        })
        .catch((error) => {
          // handle error
          setTimeout((() => {
            res.statusCode = 400
            res.end(JSON.stringify({ message: error.message}));
          }), waitTime)
          
        })
        //decoded = jwt_decode(authorization);
    } catch (e) {
      console.log(e)
      setTimeout((() => {
        res.status(401).send('unauthorized');
      }), waitTime)
    }
    //var userId = decoded.id;    
}
else {
  setTimeout((() => {
    res.status(401).send('unauthorized');
  }), waitTime)
}
  
});

app.get('/api/v1/loyalty', (req, res) => {
  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization.split(' ')[1],
        decoded;
    try {
        //decoded = jwt.verify(authorization);
        console.log(authorization)
        decoded = parseJwt(authorization)
        console.log(decoded)

        res.setHeader('Content-Type', 'application/json')
        axios.get(`https://dev-8ntxzeiwzktxlcmw.us.auth0.com/userinfo`, {
          headers: {
            'Authorization': req.headers.authorization,
          }
        })
        .then((response) => {
          console.log(response)
          console.log(response.data.name)
          axios.get(`http://${HOST}:8050/api/v1/loyalty`, {
            params: {
              username: response.data.name,
            }
          })
          .then((response) => {
            // handle success
            setTimeout((() => {
              res.statusCode = response.status
              response.status == 200 ? res.send(response.data) : res.end();
            }), waitTime)
            
          })
          .catch((error) => {
            // handle error
            setTimeout((() => {
              res.statusCode = 400
              res.end(JSON.stringify({ message: error.message}));
            }), waitTime)
            
          })
        })
        .catch((error) => {
          setTimeout((() => {
            res.statusCode = 401
            res.end(JSON.stringify({ message: error.message}));
          }), waitTime)
          
        })
        
        //decoded = jwt_decode(authorization);
    } catch (e) {
      console.log(e)
      setTimeout((() => {
        res.status(401).send('unauthorized');
      }), waitTime)
    }
    //var userId = decoded.id;    
  }
  else {
    setTimeout((() => {
      res.status(401).send('unauthorized');
    }), waitTime)
  }
  
});

app.get('/api/v1/reservations/:reservationUid', (req, res) => {
  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization.split(' ')[1],
        decoded;
    try {
        //decoded = jwt.verify(authorization);
        console.log(authorization)
        decoded = parseJwt(authorization)
        console.log(decoded)

        res.setHeader('Content-Type', 'application/json')
        axios.get(`https://dev-8ntxzeiwzktxlcmw.us.auth0.com/userinfo`, {
          headers: {
            'Authorization': req.headers.authorization,
          }
        })
        .then((response) => {
          res.setHeader('Content-Type', 'application/json')
          axios.get(`http://${HOST}:8070/api/v1/reservations/${req.params.reservationUid}`, {
            params: {
              username: response.data.name,
            }
          })
          .then((reservationResponse) => {
            // handle success
              axios.get(`http://${HOST}:8060/api/v1/payment`, {
              params: {
                paymentUid: reservationResponse.data.payment,
              }
              })
              .then((paymentResponse) => {
                // handle success
                var payment = paymentResponse.data[0]
                var reservation = reservationResponse.data
                delete payment.paymentuid
                reservation.payment = payment
                reservation.startDate = reservation.startDate.split("T")[0]
                reservation.endDate = reservation.endDate.split("T")[0]
                setTimeout((() => {
                  res.statusCode = 200
                  res.send(JSON.stringify(reservation))
                }), waitTime)
                
              })
              .catch((error) => {
                // handle error
                setTimeout((() => {
                  res.statusCode = 400
                  res.end(JSON.stringify({ message: error.message}));
                }), waitTime)
                
              })
          })
          .catch((error) => {
            // handle error
            setTimeout((() => {
              res.statusCode = 400
              res.end(JSON.stringify({ message: error.message}));
            }), waitTime)
            
          })
        })
        .catch((error) => {
          setTimeout((() => {
            res.statusCode = 401
            res.end(JSON.stringify({ message: error.message}));
          }), waitTime)
          
        })
        
        //decoded = jwt_decode(authorization);
    } catch (e) {
      console.log(e)
      setTimeout((() => {
        res.status(401).send('unauthorized');
      }), waitTime)
    }
    //var userId = decoded.id;    
}
else {
  setTimeout((() => {
    res.status(401).send('unauthorized');
  }), waitTime)
}
});

app.get('/api/v1/reservations', (req, res) => {
  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization.split(' ')[1],
        decoded;
    try {
        //decoded = jwt.verify(authorization);
        console.log(authorization)
        decoded = parseJwt(authorization)
        console.log(decoded)

        res.setHeader('Content-Type', 'application/json')
        axios.get(`https://dev-8ntxzeiwzktxlcmw.us.auth0.com/userinfo`, {
          headers: {
            'Authorization': req.headers.authorization,
          }
        })
        .then((response) => {
          res.setHeader('Content-Type', 'application/json')
          axios.get(`http://${HOST}:8070/api/v1/reservations`, {
            params: {
              username: response.data.name,
            }
          })
          .then((reservationResponse) => {
            // handle success
            console.log("reservationResponse.data.map", reservationResponse.data.map((val) => {
              return val.payment
            }).join(','))
                axios.get(`http://${HOST}:8060/api/v1/payments`, {
                params: {
                  paymentUids: reservationResponse.data.map((val) => {
                    return val.payment
                  }).join(','),
                }
                })
                .then((paymentResponse) => {
                  // handle success
                  var payments = paymentResponse.data
                  var reservations = reservationResponse.data
                  reservations = reservations.map((val) => {
                    var payment = payments.find(p => {
                      return p.paymentuid == val.payment
                    })
                    delete payment.paymentuid
                    val.payment = payment
                    val.startDate = val.startDate.split("T")[0]
                    val.endDate = val.endDate.split("T")[0]
                    return val
                  })
                  setTimeout((() => {
                    res.statusCode = 200
                    res.send(JSON.stringify(reservations))
                  }), waitTime)
                  
                })
                .catch((error) => {
                  // handle error
                  setTimeout((() => {
                    res.statusCode = 400
                    res.end(JSON.stringify({ message: error.message}));
                  }), waitTime)
                  
                })
          })
          .catch((error) => {
            // handle error
            setTimeout((() => {
              res.statusCode = 400
              res.end(JSON.stringify({ message: error.message}));
            }), waitTime)
            
          })
        })
        .catch((error) => {
          setTimeout((() => {
            res.statusCode = 402
            res.end(JSON.stringify({ message: error.message}));
          }), waitTime)
          
        })
        
        //decoded = jwt_decode(authorization);
    } catch (e) {
      console.log(e)
      setTimeout((() => {
        res.status(401).send('unauthorized');
      }), waitTime)
    }
    //var userId = decoded.id;    
  }
  else {
    setTimeout((() => {
      res.status(401).send('unauthorized');
    }), waitTime)
  }
});

app.get('/api/v1/me', (req, res) => {
  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization.split(' ')[1],
        decoded;
    try {
        //decoded = jwt.verify(authorization);
        console.log(authorization)
        decoded = parseJwt(authorization)
        console.log(decoded)

        res.setHeader('Content-Type', 'application/json')
        axios.get(`https://dev-8ntxzeiwzktxlcmw.us.auth0.com/userinfo`, {
          headers: {
            'Authorization': req.headers.authorization,
          }
        })
        .then((response) => {
          res.setHeader('Content-Type', 'application/json')
          let loyaltyRequest = axios.get(`http://${HOST}:8050/api/v1/loyalty`, {
            params: {
              username: response.data.name,
            }
          })
          let reservationRequest = axios.get(`http://${HOST}:8080/api/v1/reservations`, {
            headers: {
              'Authorization': req.headers.authorization,
            }
          })

          axios.all([loyaltyRequest, reservationRequest]).then(axios.spread((...responses) => {
            const loyalty = responses[0]
            const reservations = responses[1]
            console.log(responses)
            setTimeout((() => {
              res.send(JSON.stringify({ "loyalty": loyalty.data, "reservations": reservations.data}));
            }), waitTime)
            
            // use/access the results 
          })).catch(errors => {
            // react on errors.
            console.log(errors)
            setTimeout((() => {
              res.statusCode = 400
              res.end(JSON.stringify(errors))
            }), waitTime)
            
          })
        })
        .catch((error) => {
          setTimeout((() => {
            res.statusCode = 401
            res.end(JSON.stringify({ message: error.message}));
          }), waitTime)
          
        })
        
        //decoded = jwt_decode(authorization);
    } catch (e) {
      console.log(e)
      setTimeout((() => {
        res.status(401).send('unauthorized');
      }), waitTime)
    }
    //var userId = decoded.id;    
  }
  else {
    setTimeout((() => {
      res.status(401).send('unauthorized');
    }), waitTime)
  }
});

app.post('/api/v1/reservations', (req, res) => {
  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization.split(' ')[1],
        decoded;
    try {
        //decoded = jwt.verify(authorization);
        console.log(authorization)
        decoded = parseJwt(authorization)
        console.log(decoded)

        res.setHeader('Content-Type', 'application/json')
        axios.get(`https://dev-8ntxzeiwzktxlcmw.us.auth0.com/userinfo`, {
          headers: {
            'Authorization': req.headers.authorization,
          }
        })
        .then((response) => {
          console.log("log1: ", response.data.name)
          res.setHeader('Content-Type', 'application/json')
          let date_1 = new Date(req.body.startDate);
          let date_2 = new Date(req.body.endDate);
          let difference = date_2.getTime() - date_1.getTime();
          let days = Math.ceil(difference / (1000 * 3600 * 24))
          let hotelRequest = axios.get(`http://${HOST}:8070/api/v1/hotels/${req.body.hotelUid}`, {
            params: {
              username: response.data.name,
            }
          })
          let avaibilityRequest = axios.get(`http://${HOST}:8070/api/v1/avaibility`, {
            params: {
              username: response.data.name,
              hotelUid: req.body.hotelUid,
              endDate: req.body.endDate,
              startDate: req.body.startDate
            }
          })

          let loyaltyRequest = axios.get(`http://${HOST}:8050/api/v1/loyalty`, {
            params: {
              username: response.data.name,
            }
          })

          axios.all([hotelRequest, avaibilityRequest, loyaltyRequest]).then(axios.spread((...responses) => {
            const hotel = responses[0]
            const avaibility = responses[1]
            const loyalty = responses[2]
            console.log("avaibility", avaibility.data.available)
            if (avaibility.data.available) {
              console.log("payValues", hotel.data, days)
              pay(req, res, hotel.data, days, loyalty.data, response.data.name)
              //res.send(JSON.stringify({ "hotel": hotel.data, "avaibility": avaibility.data}));
            }
            else {
              setTimeout((() => {
                res.statusCode = 201
                res.end();
              }), waitTime)
              
            }
            // use/access the results 
          })).catch(errors => {
            // react on errors.
            console.log("log2: ", errors)
            setTimeout((() => {
              res.statusCode = 400
              res.end(JSON.stringify({
                "message": errors.message,
                "errors": errors
              }))
            }), waitTime)
            
          })
        })
        .catch((error) => {
          setTimeout((() => {
            res.statusCode = 401
            res.end(JSON.stringify({ message: error.message}));
          }), waitTime)
          
        })
        
        //decoded = jwt_decode(authorization);
    } catch (e) {
      console.log(e)
      setTimeout((() => {
        res.status(401).send('unauthorized');
      }), waitTime)
    }
    //var userId = decoded.id;    
  }
  else {
    setTimeout((() => {
      res.status(401).send('unauthorized');
    }), waitTime)
  }
});

///////
app.delete('/api/v1/reservations/:reservationUid', (req, res) => {
  if (req.headers && req.headers.authorization) {
    var authorization = req.headers.authorization.split(' ')[1],
        decoded;
    try {
        //decoded = jwt.verify(authorization);
        console.log(authorization)
        decoded = parseJwt(authorization)
        console.log(decoded)

        res.setHeader('Content-Type', 'application/json')
        axios.get(`https://dev-8ntxzeiwzktxlcmw.us.auth0.com/userinfo`, {
          headers: {
            'Authorization': req.headers.authorization,
          }
        })
        .then((response) => {
          axios.delete(`http://${HOST}:8070/api/v1/reservations/${req.params.reservationUid}`, {
            params: {
              username: response.data.name
            }
          })
          .then((reservationResponse) => {
            console.log("reservationResponse", reservationResponse)
            setTimeout((() => {
              res.statusCode = 204
              res.send()
            }), waitTime)
            
          })
          .catch((error) => {
            // handle error
            setTimeout((() => {
              res.statusCode = 404
              res.end(JSON.stringify({ message: error.message}));
            }), waitTime)
            
          })
        })
        .catch((error) => {
          setTimeout((() => {
            res.statusCode = 401
            res.end(JSON.stringify({ message: error.message}));
          }), waitTime)
          
        })
        
        //decoded = jwt_decode(authorization);
    } catch (e) {
      console.log(e)
      setTimeout((() => {
        res.status(401).send('unauthorized');
      }), waitTime)
    }
    //var userId = decoded.id;    
  }
  else {
    setTimeout((() => {
      res.status(401).send('unauthorized');
    }), waitTime)
  }

});

function pay(req, res, hotel, days, loyalty, username) {
  axios.post(`http://${HOST}:8060/api/v1/pay`, null, {
        params: {
          price: ((hotel.price * days) - ((hotel.price * days) * loyalty.discount / 100))
        }
      })
      .then((payResponse) => {
        // handle success
        if (payResponse.status == 200) {
          console.log("payResponse", payResponse)
          reservation(req, res, payResponse.data.payment_uid, hotel, payResponse.data, loyalty, username)
        }
        else {
          console.log("payResponse", 201)
          setTimeout((() => {
            res.statusCode = 201
            res.end();
          }), waitTime)
          
        }
      })
      .catch((error) => {
        // handle error
        setTimeout((() => {
          res.statusCode = 400
          res.end(JSON.stringify({
            "message": error.message,
            "errors": error
          }))
        }), waitTime)
        
      })
}

function reservation(req, res, paymentUid, hotel, payData, loyalty, username) {
  console.log("log-reservation: ", username)
    axios.post(`http://${HOST}:8070/api/v1/reservations`, null, {
      params: {
        username: username,
        paymentUid: paymentUid,
        hotelId: hotel.id,
        status: payData.status,
        startDate: req.body.startDate,
        endDate: req.body.endDate
      }
    })
    .then((reservationResponse) => {
      // handle success
      console.log("log-reservation2: ", username)

          axios.post(`http://${HOST}:8050/api/v1/loyalty`, null, {
            params: {
              username: username
            }
          })
          .then((loyaltyResponse) => {
            // handle success
            console.log("reservationResponse", reservationResponse)
            res.statusCode = reservationResponse.status
            if (reservationResponse.status == 200) {
              delete payData.payment_uid
              var data = reservationResponse.data
              data["hotelUid"] = hotel.hotelUid
              data["startDate"] = data.startDate.split("T")[0]
              data["endDate"] = data.endDate.split("T")[0]
              data["payment"] = payData
              data["discount"] = loyalty.discount
              setTimeout((() => {
                res.send(data)
              }), waitTime)
            }
            else {
              setTimeout((() => {
                res.end();
              }), waitTime)
            }
          })
          .catch((error) => {
            // handle error
            console.log(error)
            setTimeout((() => {
              res.statusCode = 400
              res.end(JSON.stringify({
                "message": error.message,
                "errors": error
              }))
            }), waitTime)
            
          })
    })
    .catch((error) => {
      // handle error
      console.log(error)
      setTimeout((() => {
        res.statusCode = 400
        res.end(JSON.stringify({
          "message": error.message,
          "errors": error
        }))
      }), waitTime)
      
    })
}
