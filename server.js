
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors'); // Import the cors middleware

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'https://ace-clan.vercel.app/',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({
  origin: 'https://ace-clan.vercel.app/', 
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE'],
  credentials: true,            
}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://ace-clan.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

mongoose.set('strictQuery', true);


mongoose.connect(`mongodb+srv://${process.env.PASSWORD}:${process.env.PASSWORD}@ace-clan.9jkhums.mongodb.net/?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, () => {
  console.log("Database connected");
});;


const Message = mongoose.model('Message', {
  text: String,
});

io.on('connection', async (socket) => {
  try {
    console.log('new user connected');

    const messages = await Message.find({});
    socket.emit('load messages', messages);


    socket.on('send message', (data) => {
      const {text} = data;
  
      const message = new Message({text});
      message.save().then(() => {
        io.emit('receive message', text);
      });
    });
  
    socket.on('disconnect', () => {
      console.log('one user disconnected');
    });

  } catch (error) {
    console.error('Error in connection event:', error);
  }
});

server.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
