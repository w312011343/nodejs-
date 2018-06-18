(function(){
    var $userName = $('.userName'),
        $message = $('.message'),
        $userCont= $('.userCont'),
        $loginBtn = $('.loginBtn'),
        $exitBtn = $('.exitBtn'),
        $chatBtn = $('.chatBtn')
        socket = null;
    function addMsg(msg){
        var $msgItem = $(`<div class="msgItem">${msg}</div>`);
        return $msgItem;
    }
    function createClient(data){
        if(data && data.length){
            $userCont.empty();
            for(var i = 0;i<data.length;i++){
                var $item = addMsg(data[i]);
                $item.appendTo($userCont);
            }
        }
    }
    // 登录
    socket = io.connect();
    $(document).off('click.loginBtn').on('click.loginBtn','.loginBtn',function(e){
        e.stopPropagation();
        e.preventDefault();
        var $target = $(e.currentTarget);
        if($target.hasClass('disabled')){
            alert('账户已登录');
            return;
        }
        var val = $userName.val().trim();
        if(!val){
            alert('请输入用户名');
            return;
        }
        $exitBtn.removeClass('disabled');
        $chatBtn.removeClass('disabled');
        socket = io.connect();
        socket.on('connect',function(){
            var $it = addMsg('与服务器的连接已建立');
            $it.appendTo($message);
            socket.emit('login',val);
        })
       
    });
    socket.on('login',function(name){
        var $item = addMsg('欢迎用户'+name+'进入聊天室');
        $loginBtn.addClass('disabled');
        $item.appendTo($message);
    });
    socket.on('sendClient',function(data){
        createClient(data);
    });
    socket.on('dupliicate',function(data){
        alert(data+'名字相同，请重新输入');
    });


    // 退出
    $(document).off('click.exitBtn').on('click.exitBtn','.exitBtn',function(e){
        socket = io.connect();
        var val = $userName.val().trim();
        socket.emit('loginout',val);
    });
    socket.on('loginout',function(name){
        var $item = addMsg(name+'离开');
        $item.appendTo($message);
        $loginBtn.removeClass('disabled');
        $exitBtn.addClass('disabled');
        $chatBtn.addClass('disabled');
    });
    socket.on('sendClient',function(data){
        createClient(data);
    });
    // 聊天
    $(document).off('click.chatBtn').on('click.chatBtn','.chatBtn',function(e){
        var $target = $(e.currentTarget);
        var $charInput = $target.siblings('.charInput');
        var val = $charInput.val();
        var userName = $userName.val();
        if(!userName){
            alert('请输入用户名');
            return;
        }
        socket = io.connect();
        socket.emit('chat',userName+" speak："+val);
        $charInput.val("").text("");
    });
    
    socket.on('chat',function(data){
        var $it = addMsg(data);
        $it.appendTo($message);
    });
    socket.on('disconnect',function(){
        var $item = addMsg('与聊天室的连接已断开');
        $item.appendTo($message);
        $loginBtn.removeClass('disabled');
        $exitBtn.addClass('disabled');
        $chatBtn.addClass('disabled');
    });
    socket.on('error',function(err){
        var $item = addMsg('与聊天室的连接发生错误');
        $item.appendTo($message);
        socket.disconnect();
        socket.removeAllListeners('connect');
        io.sockets = {};
    });
})();