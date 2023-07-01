const {S3Client, PutObjectCommand, GetObjectCommand} =  require('@aws-sdk/client-s3');
require('dotenv').config();

const fs = require('fs');
const AWS_PUBLIC_KEY = process.env.AWS_PUBLIC_KEY;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION;


const s3Client = new S3Client({region: AWS_BUCKET_REGION
    ,credentials: {
        accessKeyId: AWS_PUBLIC_KEY,
        secretAccessKey: AWS_SECRET_KEY
    
    }
})

async function uploadFile(file){

    const stream = fs.createReadStream(file.path);
    const uploadParams = {
        Bucket: AWS_BUCKET_NAME,
        Key: file.filename,
        Body: stream
    }

    const command = new PutObjectCommand(uploadParams);

    return await s3Client.send(command)
}

async function readFile(fileName){
    const command = new GetObjectCommand({
        Bucket: AWS_BUCKET_NAME, 
        Key: fileName
    })
    const result = await s3Client.send(command)
    result.Body.pipe(fs.createWriteStream('./src/uploads/habitaciones/habitacion-1688103217060-moderno.jpg'))
}   

module.exports = {
    uploadFile,
    readFile
}
