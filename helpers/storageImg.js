const multer = require("multer");

const aws = require("aws-sdk");
const multerS3 = require("multer-s3");

const s3 = new aws.S3({
    /* ... */
    secretAccessKey: 'F02fCvjwfEzzUDPPcL/5m3m65CZY9akV2mXcJTXm',
    accessKeyId: 'AKIA32PIP3TP6A6DLQJR',
    region: 'us-east-1'
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        bucket: 'ehs-poster-thumbnails',
        metadata: function(req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function(req, file, cb) {
            cb(null, `${file.fieldname}-${Date.now()}.jpg`);
        }
    })
});

// const storage = multer.diskStorage({
//     destination: "assets/uploads/",
//     filename: function(req, file, cb) {
//         cb(null, `${file.fieldname}-${Date.now()}.jpg`);
//     },
// });

// const upload = multer({ storage: storage });

module.exports = upload;