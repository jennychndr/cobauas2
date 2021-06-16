const express= require('express');
const db= require('../database');

const router= express.Router();

//get transaksi
router.get('/history/:nomor_rekening', async (req, res) => {
    let no=req.params.nomor_rekening;
    let conn1= await db.getConn();
    let query1= await db.executeQuery(conn1, `
        SELECT *
        FROM user
        where nomor_rekening='${no}'
        
    `);

    conn1.release();
    if(!query1.length){
        return res.status(404).json({
            status: 404,
            error: "user tidak ditemukan"
        });
    }
    



    let conn= await db.getConn();
    let query= await db.executeQuery(conn, `
        SELECT jenis_transaksi,nominal
        FROM transaksi where nomor_rekening='${no}'
        
    `);

    conn.release();
    let data={
        nomor_rekening:query1[0].nomor_rekening,
        saldo:query1[0].saldo,
        transaksi:query
    }
    return res.status(200).json({
        status: 200,
        users: data
    });
});
//setor
router.post('/setor', async (req, res) => {
    let input=req.body;
    let no=input.nomor_rekening;
    let conn1= await db.getConn();
    let query1= await db.executeQuery(conn1, `
        SELECT *
        FROM user
        where nomor_rekening='${no}'
        
    `);

    conn1.release();
    if(!query1.length){
        return res.status(404).json({
            status: 404,
            error: "user tidak ditemukan"
        });
    }
    if(query1[0].pin_rekening!=input.pin_rekening){
        return res.status(400).json({
            status: 400,
            error: "pin rekening salah"
        });
    }
    if(query1[0].jenis_rekening.toLowerCase()=="reguler"){
        if(parseInt(input.saldo)+parseInt(query1[0].saldo)>500000000){
            return res.status(400).json({
                status: 400,
                error: "jumlah saldo tidak boleh lebih dari 500.000.000"
            });
        }
    }
    
    let total=parseInt(input.saldo)+parseInt(query1[0].saldo);
    let conn= await db.getConn();
    let query= await db.executeQuery(conn, `
        INSERT INTO transaksi
        VALUES (
            '${no}',
            'setor', 
            ${input.saldo} 
            
        )
    `);

    conn.release();
    let conn2= await db.getConn();
    let query2= await db.executeQuery(conn2, `
        update user
        set saldo=${total} where nomor_rekening='${input.nomor_rekening}'
    `);

    conn2.release();
    
    let data={
        nomor_rekening:query1[0].nomor_rekening,
        nama_user:query1[0].nomor_user,
        jenis_rekening:query1[0].jenis_rekening,
        saldo:total
    };
    return res.status(200).json({
        status: 200,
        users: data
    });
});
//tarik
router.post('/tarik', async (req, res) => {
    let input=req.body;
    let no=input.nomor_rekening;
    let conn1= await db.getConn();
    let query1= await db.executeQuery(conn1, `
        SELECT *
        FROM user
        where nomor_rekening='${no}'
        
    `);

    conn1.release();
    if(!query1.length){
        return res.status(404).json({
            status: 404,
            error: "user tidak ditemukan"
        });
    }
    if(query1[0].pin_rekening!=input.pin_rekening){
        return res.status(400).json({
            status: 400,
            error: "pin rekening salah"
        });
    }
    
    let total=parseInt(query1[0].saldo)-parseInt(input.saldo);
    let conn= await db.getConn();
    let query= await db.executeQuery(conn, `
        INSERT INTO transaksi
        VALUES (
            '${no}',
            'tarik', 
            ${input.saldo} 
            
        )
    `);

    conn.release();
    let conn2= await db.getConn();
    let query2= await db.executeQuery(conn2, `
        update user
        set saldo=${total} where nomor_rekening='${input.nomor_rekening}'
    `);

    conn2.release();
    
    let data={
        nomor_rekening:query1[0].nomor_rekening,
        saldo_tersisa:total,
        nominal_penarikan:input.saldo,
        
    };
    return res.status(200).json({
        status: 200,
        users: data
    });
});


router.post('/transfer', async (req, res) => {
    let input=req.body;
    let noasal=input.nomor_rekening_asal;
    let notujuan=input.nomor_rekening_tujuan;
    let conn1= await db.getConn();
    let query1= await db.executeQuery(conn1, `
        SELECT *
        FROM user
        where nomor_rekening='${noasal}'
        
    `);

    conn1.release();

    let conn11= await db.getConn();
    let query11= await db.executeQuery(conn11, `
        SELECT *
        FROM user
        where nomor_rekening='${notujuan}'
        
    `);

    conn11.release();
    if(!query1.length){
        return res.status(404).json({
            status: 404,
            error: "user tidak ditemukan"
        });
    }
    if(query1[0].pin_rekening!=input.pin_rekening){
        return res.status(400).json({
            status: 400,
            error: "pin rekening salah"
        });
    }
    if(!query11.length){
        return res.status(404).json({
            status: 404,
            error: "nomor rekening tujuan tidak ditemukan"
        });
    }
   
    
    if(query1[0].jenis_rekening.toLowerCase()=="reguler"){
        if(input.nominal>25000000){
            return res.status(400).json({
                status: 400,
                error: "user reguler maksimal transfer sebesar 25.000.000"
            });
        }
    }
    let conn= await db.getConn();
    let query= await db.executeQuery(conn, `
        INSERT INTO transaksi
        VALUES (
            '${noasal}',
            'Transfer keluar', 
            ${input.nominal} 
            
        )
    `);

    conn.release();

    let connn= await db.getConn();
    let queryy= await db.executeQuery(connn, `
        INSERT INTO transaksi
        VALUES (
            '${notujuan}',
            'Transfer masuk', 
            ${input.nominal} 
            
        )
    `);

    connn.release();
    let sisasado=query1[0].saldo-parseInt(input.nominal);
    let saldonow=query11[0].saldo+parseInt(input.nominal);
    let conn2= await db.getConn();
    let query2= await db.executeQuery(conn2, `
        update user
        set saldo=${sisasado} where nomor_rekening='${noasal}'
    `);

    conn2.release();
    

    let conn22= await db.getConn();
    let query22= await db.executeQuery(conn22, `
        update user
        set saldo=${saldonow} where nomor_rekening='${notujuan}'
    `);

    conn22.release();
    let data={
        nomor_rekening_asal:query1[0].nomor_rekening,
        nomor_rekening_tujuan:query11[0].nomor_rekening,
        saldo_tersisa:sisasado,
        nominal_penarikan:input.nominal,
        
    };
    return res.status(200).json({
        status: 200,
        users: data
    });
});



module.exports= router;
