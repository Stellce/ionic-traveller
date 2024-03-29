/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
/* eslint-env es6 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });



const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const Busboy = require('busboy');
const os = require('os');
const path = require('path');
const fs = require('fs');
const {v4: uuid} = require('uuid');
const fbAdmin = require('firebase-admin');

const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: 'ionic-traveller-b21c3'
});

fbAdmin.initializeApp({credential: fbAdmin.credential.cert(require('./ionic-traveller.json'))});

exports.storeImage = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(500).json({ message: 'Not allowed.' });
    }

    if(
      !req.headers.authorization ||
      !req.headers.authorization.startsWith('Bearer ')
    ) {
      return res.status(401).json({error: 'Unauthorized!'});
    }

    let idToken;
    idToken = req.headers.authorization.split('Bearer ')[1];

    const busboy = new Busboy({ headers: req.headers });
    let uploadData;
    let oldImagePath;

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const filePath = path.join(os.tmpdir(), filename);
      uploadData = { filePath: filePath, type: mimetype, name: filename };
      file.pipe(fs.createWriteStream(filePath));
    });

    busboy.on('field', (fieldname, value) => {
      oldImagePath = decodeURIComponent(value);
    });

    busboy.on('finish', () => {
      const id = uuid();
      let imagePath = 'images/' + id + '-' + uploadData.name;
      if (oldImagePath) {
        imagePath = oldImagePath;
      }

      return fbAdmin.auth()
        .verifyIdToken(idToken)
        .then(decodedToken => {
          console.log(uploadData.type);
          return storage
            .bucket('ionic-traveller-b21c3.appspot.com')
            .upload(uploadData.filePath, {
              uploadType: 'media',
              destination: imagePath,
              metadata: {
                metadata: {
                  contentType: uploadData.type,
                  firebaseStorageDownloadTokens: id
                }
              }
            })
        })
        .then(() => {
          return res.status(201).json({
            imageUrl:
              'https://firebasestorage.googleapis.com/v0/b/' +
              storage.bucket('ionic-traveller-b21c3.appspot.com').name +
              '/o/' +
              encodeURIComponent(imagePath) +
              '?alt=media&token=' +
              id,
            imagePath: imagePath
          });
        })
        .catch(error => {
          console.log(error);
          return res.status(401).json({ error: 'Unauthorized!' });
        });
    });
    return busboy.end(req.rawBody);
  });
});
