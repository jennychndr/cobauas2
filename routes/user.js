const express= require('express');
const db= require('../database');

const router= express.Router();

//GET USER
router.get('/', async (req, res) => {

    let conn= await db.getConn();
    let query= await db.executeQuery(conn, `
        SELECT *
        FROM user
        
    `);

    conn.release();
    
    return res.status(200).json({
        status: 200,
        users: query
    });
});
router.get('/:nomor_rekening', async (req, res) => {

    let no=req.params.nomor_rekening;
    let conn= await db.getConn();
    let query= await db.executeQuery(conn, `
        SELECT *
        FROM user
        where nomor_rekening='${no}'
        
    `);

    conn.release();
    if(!query.length){
        return res.status(404).json({
            status: 404,
            error: "user tidak ditemukan"
        });
    }
    return res.status(200).json({
        status: 200,
        users: query
    });
});

function calculate_age(birth_month,birth_day,birth_year)
{
    today_date = new Date();
    today_year = 2021;
    today_month = 3;
    today_day = 1;
    age = today_year - birth_year;

    if ( today_month < (birth_month - 1))
    {
        age--;
    }
    if (((birth_month - 1) == today_month) && (today_day < birth_day))
    {
        age--;
    }
    return age;
}

//ADD USER
router.post('/register', async (req, res) => {
    let input= req.body;
    let tipe="";
    
    if(input.jenis_rekening=="P"||input.jenis_rekening=="p"){
        tipe="Platinum";
    }else if(input.jenis_rekening=="R"||input.jenis_rekening=="r"){
        tipe="Reguler";
    }else{
        return res.status(400).json({
            status: 400,
            msg: "tipe rekening hanya P atau R"
        });
    }
    let umur=calculate_age(input.tanggal_lahir.substr(3,2),input.tanggal_lahir.substr(0,2),input.tanggal_lahir.substr(6,4));

    if(umur<17){
        return res.status(400).json({
            status: 400,
            msg: "umur minimal 17 tahun"
        });
    }
    let rek="";
    for (let i = 0; i <9; i++) {
        let angka=Math.floor(Math.random() * 9) + 1 ;
        rek+=angka;
        
    }
   
    let conn= await db.getConn();
    let query= await db.executeQuery(conn, `
        INSERT INTO user
        VALUES (
            '${rek}',
            '${input.nama_user}', 
            '${tipe}' ,
            '${input.pin_rekening}',
            0
            
        )
    `);

    conn.release();
    let data={
        //nomor_rekening:rek,
        nama_user:input.nama_user,
        tipe_rekening:tipe,
        pin_rekening:input.pin_rekening,
        saldo:0
    }
    if (query.affectedRows === 0) {
        return res.status(404).json({
            status: 404,
            msg: 'Bad Request'
        });
    } 

    return res.status(201).json({
        status: 201,
        user: data
    });
});

//UPDATE USER
router.put('/update-user/:id', async (req, res) => {
    let input= req.body;

    let conn= await db.getConn();
    let query= await db.executeQuery(conn, `
        SELECT *
        FROM users
        WHERE id = ${req.params.id}
    `)

    conn.release();

    if (!query.length) {
        return res.status(404).json({
            status: 404,
            message: 'User not found'
        });
    }

    conn= await db.getConn();
    query= await db.executeQuery(conn, `
        UPDATE users
        SET name = '${input.name}', age = ${input.age}
        WHERE id = ${req.params.id}
    `);

    conn.release();

    if (query.affectedRows === 0) {
        return res.status(500).json({
            status: 500, 
            message: 'Internal server error'
        });
    }

    return res.status(200).json({
        status: 200,
        message: 'Update success!'
    });
});

//DELETE USER
router.delete('/delete-user/:id', async (req, res) => {
    let conn= await db.getConn();
    let query= await db.executeQuery(conn, `
        SELECT *
        FROM users
        WHERE id = ${req.params.id}
    `)

    conn.release();

    if (!query.length) {
        return res.status(404).json({
            status: 404,
            message: 'User not found'
        });
    }

    conn= await db.getConn();
    query= await db.executeQuery(conn, `
        DELETE FROM users
        WHERE id = ${req.params.id}
    `)

    if (query.affectedRows === 0) {
        return res.status(500).json({
            status: 500,
            message: 'Internal server error'
        });
    }

    return res.status(200).json({
        status: 200,
        message: 'Delete success'
    });
});

module.exports= router;
