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
    m_get1().then((result)=>{
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify({
            acknowledge:true,
            result:result
        }))
    })
    .catch((error)=>{
        res.send(JSON.stringify({
            acknowledge:false,
        }));
    })
})
app.get('/login',(req,res)=>{
    m_get2(req.query).then((result)=>{
        res.type('json');
        if (result){
            result.acknowledge=true;
            res.send(JSON.stringify(result));
        }
        else{
            res.send(JSON.stringify({acknowledge:false}));
        }
    }).catch((error)=>{
        res.statusCode=404;
        res.send(JSON.stringify({}));
    })
})
app.post('/register',(req,res)=>{
    m_post(req.body).then((result)=>{
        console.log(`Inserted object with id ${result.insertedId}`);
        res.send(`Inserted object with id ${result.insertedId}`);
    }).catch((error)=>{
        res.send(error);
    })
})
// app.delete('/articles',(req,res)=>{
//     m_delete("").then((result)=>{
//         res.send("deleted " + result.deletedCount + " item")
//     }).catch((error)=>{
//         res.send("something wrong")
//     })
// })
// app.put('/articles/:custom',(req,res)=>{
//     const query={name:req.params.custom};
//     m_put(query,req.body).then((result)=>{
//         res.send(`${result.matchedCount} document(s) matched the filter, modified ${result.modifiedCount} document(s)`);
//     }).catch((error)=>{
//         res.send(error);
//     })

// })
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
// app.delete('/articles/:custom',(req,res)=>{
//     m_delete(req.params.custom).then((result)=>{
//         res.send("deleted " + result.deletedCount + " item")
//     }).catch((error)=>{
//         res.send("something wrong")
//     })
// })
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
const m_delete=function(author_name){
    return new Promise((res,rej)=>{
        let query={};
        if (author_name.length>0){
            query.author=author_name;
        }
        mongoClient.connect().then((client)=>{
            let db=client.db(dbName);
            let collection=db.collection(collName);
            collection.deleteMany(query).then((result)=>{
                res(result);
            }).catch((error)=>{
                console.log(error);
                rej("something wrong");
            }).finally(()=>{
                client.close();
            })
        }).catch((error)=>{
            console.log(error);
            rej("something wrong");
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
const m_put=function (query,update){
    return new Promise((res,rej)=>{
        mongoClient.connect().then((client)=>{
            let db=client.db(dbName);
            let collection=db.collection(collName);
            collection.replaceOne(query,update).then((result)=>{
                console.log(`${result.matchedCount} document(s) matched the filter, modified ${result.modifiedCount} document(s)`);
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

