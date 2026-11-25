require('dotenv').config();

const express = require('express');
const ejs = require('ejs');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { applicationDefault, initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const publicDirectory = __dirname;
const port = Number(process.env.PORT) || 3000;

app.use('/images', express.static(path.join(publicDirectory, 'images')));
app.set('views', publicDirectory);
app.engine('html', ejs.renderFile);

app.get('/', (req, res) => {
    res.render('index.html');
});

app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(publicDirectory, 'styles.css'));
});

app.get('/app.js', (req, res) => {
    res.sendFile(path.join(publicDirectory, 'app.js'));
});

function connectDB() {
    if (!process.env.FIREBASE_PROJECT_ID) {
        throw new Error('Defina FIREBASE_PROJECT_ID no arquivo .env.');
    }

    initializeApp({
        credential: applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID
    });

    return getFirestore();
}

const db = connectDB();
const postsCollection = db.collection('posts');

function serializePost(document) {
    const post = document.data();

    return {
        id: document.id,
        title: post.title,
        text: post.text,
        createdAt: post.createdAt.toDate().toISOString()
    };
}

io.on('connection', (socket) => {
    postsCollection.orderBy('createdAt', 'desc').get()
        .then((snapshot) => {
            socket.emit('previousMessage', snapshot.docs.map(serializePost));
        })
        .catch((error) => {
            console.error('Erro ao buscar posts no Firestore:', error);
            socket.emit('serverError', 'Não foi possível carregar os posts.');
        });

    socket.on('sendMessage', async (data) => {
        const title = typeof data?.title === 'string' ? data.title.trim() : '';
        const text = typeof data?.text === 'string' ? data.text.trim() : '';

        if (!title || !text || title.length > 120 || text.length > 2000) {
            socket.emit('serverError', 'Informe um título e um texto válidos.');
            return;
        }

        try {
            const createdAt = Timestamp.now();
            const document = await postsCollection.add({ title, text, createdAt });
            const post = {
                id: document.id,
                title,
                text,
                createdAt: createdAt.toDate().toISOString()
            };

            io.emit('receivedMessage', post);
            socket.emit('postSaved');
        } catch (error) {
            console.error('Erro ao salvar post no Firestore:', error);
            socket.emit('serverError', 'Não foi possível publicar o post.');
        }
    });
});

async function startServer() {
    try {
        await postsCollection.limit(1).get();
        server.listen(port, () => {
            console.log(`Rede social rodando em http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Não foi possível conectar ao Firestore:', error);
        process.exitCode = 1;
    }
}

startServer();
