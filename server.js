var http = require('http');
var so = require('socket.io');
var express = require('express');
var path = require('path');
var app = express();

// 显示成static
app.use('/static',express.static(path.join(__dirname, 'static')));
app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});
var server = http.createServer(app);
server.listen(1337);
var io = so.listen(server);
var names = [];
io.sockets.on('connection',function(socket){
    // 登录
    console.log('连接成功');
    io.sockets.emit('sendClient',names);
    socket.on('login',function(name){
        for(var i =0;i<names.length;i++){
            if(names[i] === name){
                socket.emit('dupliicate',name);
                console.log('名字重复');
                return;
            }
        }
        names.push(name);
        io.sockets.emit('login',name);
        io.sockets.emit('sendClient',names);
    });
    socket.on('error',function(err){
        console.log(err);
    });
    // 聊天
    socket.on('chat',function(data){
        io.sockets.emit('chat',data);
    });
    // 退出
    socket.on('loginout',function(name){
        for(var i =0;i<names.length;i++){
            if(names[i] === name){
                names.splice(i,1);
                break;
            }   
        }
        socket.broadcast.emit('loginout',name);
        io.sockets.emit('sendClient',names);
    });
    socket.on('disconnect',function(){
        console.log('断开连接');
    });
    socket.on('error',function(){
        console.log('发生错误');
        socket.disconnect();
        socket.removeAllListeners('connection');
        io.sockets = {};
    });
});
