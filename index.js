const express= require('express');
const mysql= require('mysql');


const app= express();
const routes= {
    user: require('./routes/user'),
    transaksi: require('./routes/transaksi')
};

app.use(express.urlencoded({ extended: true }));

app.get("/",function(req,res){
    return res.json("halo")
})
app.use('/api/users', routes.user); //route untuk pakai mysql raw
 //route untuk pakai mysql + promise
 app.use('/api/transaksi', routes.transaksi); 

const port=process.ev.PORT||3000;
app.listen(3000, () => console.log('Running on port 3000'));


