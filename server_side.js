// dependencies
const express= require('express');
const MongoClient = require ('mongodb').MongoClient;
const bodyParser=require("body-parser");


// DB setup
const url="mongodb://localhost:27017";
const dbName="Secrets";
const mongoClient= new MongoClient(url);
const collName="UserInfo";

//app setup
const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// API
app.get('/secrets',(req,res)=>{
    res.set('Content-Type', 'application/json');
    m_get1().then((result)=>{
        res.send(JSON.stringify({
            acknowledge:true,
            result:[...result]
        }))
    })
    .catch((error)=>{
        res.send(JSON.stringify({
            acknowledge:false
        }));
    })
})
app.get('/login',(req,res)=>{
    res.set('Content-Type', 'application/json');
    m_get2(req.query).then((result)=>{
        if (result){
            res.send(JSON.stringify({
                acknowledge:true,
                result:{...result}
            }))
        }
        else{
            res.send(JSON.stringify({acknowledge:false}));
        }
    }).catch((error)=>{

        res.send(JSON.stringify({acknowledge:false}));
    })
})
app.post('/register',(req,res)=>{
    m_post(req.body).then((result)=>{
        console.log(`Inserted object with id ${result.insertedId}`);
        res.send(JSON.stringify({
            result:`Inserted object with id ${result.insertedId}`,
            acknowledge:true
        }));
    }).catch((error)=>{
        res.send(JSON.stringify({acknowledge:false}));
    })
})

app.patch('/submit/:custom',(req,res)=>{
    const filter={username:req.params.custom};
    const update={$push:{
        story:req.body.story
    }};
    m_patch(filter,update).then((result)=>{
        res.send(JSON.stringify({acknowledge:true}));
    }).catch((error)=>{
        res.send(JSON.stringify({acknowledge:false}));
    })
})

const m_get1=function(){
    return new Promise((res,rej)=>{
        let articles=[];
        mongoClient.connect().then((client)=>{
            let db=client.db(dbName);
            let collection=db.collection(collName);
            collection.find({}).forEach((doc)=>{
                if (typeof doc.story != "undefined"){
                    doc.story.forEach((element)=>{
                        articles.push(element);
                    })
                }
            }).then(()=>{
                res(articles);
            }).catch((error)=>{
                console.log(error);
                rej(error);
            }).finally(()=>{
                client.close();
            })
        }).catch((error)=>{
            console.log(error);
            rej(error);
        })
    })
}
const m_get2 = function(query){
    return new Promise((res,rej)=>{
        mongoClient.connect().then((client)=>{
            let db=client.db(dbName);
            let collection=db.collection(collName);
            collection.findOne(query).then((result)=>{
                res(result);
            }).catch((error)=>{
                console.log(error);
                rej(error);
            }).finally(()=>{
                client.close();
            })
        }).catch((error)=>{
            console.log(error);
            rej(error);
        })
    })
}

const m_post=function(data){
    return new Promise((res,rej)=>{
        mongoClient.connect().then((client)=>{
            let db=client.db(dbName);
            let collection=db.collection(collName);
            collection.insertOne(data).then((result)=>{
                res(result);
            }).catch((error)=>{
                console.log(error);
                rej(error);
            }).finally(()=>{
                client.close();
            })
        }).catch((error)=>{
            console.log(error);
            rej(error);
        })
    })
}

const m_patch=function(filter,update){
    return new Promise((res,rej)=>{
        mongoClient.connect().then((client)=>{
            let options={upsert:false};
            let db=client.db(dbName);
            let collection=db.collection(collName);
            collection.updateOne(filter,update,options).then((result)=>{
                console.log(`${result.matchedCount} document(s) matched the filter, update ${result.modifiedCount} document(s)`);
                res(result);
            }).catch((error)=>{
                console.log(error);
                rej(error);
            }).finally(()=>{
                client.close()
            })
        }).catch((error)=>{
            console.log(error);
            rej(error);
        })
    })
}
app.listen(5000,()=>{
    console.log("listening on port 5000!");
})

