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

const port=process.env.PORT||3000;
app.listen(port, funtion(){
  console.log(`listening to port ${port}`);
});


