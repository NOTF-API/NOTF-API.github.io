const playPauseButton=document.getElementById("playPauseButton");
const currentTime=document.getElementById("currentTime");
const totalTime=document.getElementById("totalTime");
const playerAudio=document.getElementById("playerAudio");
const lyric=document.getElementById("lyric");
const lyricToggleButton=document.getElementById("lyricToggleButton");
const FXToggleButton=document.getElementById("FXToggleButton");
const Spectrum=document.getElementById("spectrum");
const playModeButton=document.getElementById("playModeButton");
const lastButton=document.getElementById("lastButton");
const nextButton=document.getElementById("nextButton");
const progress=document.getElementById("progress");
const expandButton=document.getElementById("expandButton");
const closeButton=document.getElementById("closeButton");
const title=document.getElementById("title");
const description=document.getElementById("description");
const album=document.getElementById("album");
const disk=document.getElementById("disk");
const artist=document.getElementById("artist");
const background=document.getElementById("background");

/*https://www.w3school.com.cn/jsref/dom_obj_audio.asp*/
let player = {
    isPlaying: false,
    playMode:0,//0:单曲循环 1:列表循环 2：顺序播放 3:随机播放
    playList:[],
    playingIndex:0,
    description:"",
    artist:"",
    album:"",
    title:"",
    isFullscreen:false,
    openLyric:true,
    lyric: [],
    lyricNumber:0,
    lyricInterval:null,
    openSpectrum:true,
    themeColor:"",//"#88c967",
    progressPercent:0,
    progressInterval:null,
    haveSpectrum:false,
    volume:100,
    diskDegree:0,
    diskInterval:null,
    currentTime:null,
    totalTime:null,
    currentAudioSrc:null,
    timeInterval:null,
    init:function (){
        //初始化变量
        player.isPlaying=false;
        player.isFullscreen=false;
        player.openLyric=true;
        player.openSpectrum=true;
        player.playMode=1;
        player.lyric=null;
    },
    next:function (){
        player.change("next");
    },
    last:function (){
        player.change("last");
    },
    change:function (direction){//TODO
        player.pause();
        player.lyricNumber=0;
        player.diskDegree=0;
        if(player.playMode===0){
            //单曲循环
            playerAudio.currentTime=0;
            player.isPlaying=false;
            player.isPlaying=true;
        }else if(player.playMode===1){
            //列表循环
            if(direction==="next"){
                if(player.playingIndex+1>=player.playList.length){
                    player.playingIndex=0;
                }else{
                    player.playingIndex++;
                }
            }else if(direction==="last"){
                if(player.playingIndex===0){
                    player.playingIndex=player.playList.length-1;
                }else{
                    player.playingIndex--;
                }
            }
          let next=player.playList[player.playingIndex];
          player.load(
                  next.title,
                  next.description,
                  next.artist,
                  next.album,
                  next.musicSrc,
                  next.lyricSrc,
                  next.coverImageSrc,
                  next.themeColor,
                  next.backgroundSrc
              );
          player.isPlaying=true;
        }else {
            //随机播放
            let newIndex=Math.floor(Math.random()*(player.playList.length));
            if(newIndex===player.playingIndex){
                if(player.playingIndex===0){
                    newIndex=player.playList.length-1;
                }else{
                    newIndex--;
                }
            }
            player.playingIndex=newIndex;
            let next=player.playList[player.playingIndex];
            player.load(
                next.title,
                next.description,
                next.artist,
                next.album,
                next.musicSrc,
                next.lyricSrc,
                next.coverImageSrc,
                next.themeColor,
                next.backgroundSrc
            );
            player.isPlaying=true;
        }
    },
    load:function(title,description,artist,album,musicSrc,lyricSrc,coverImageSrc,themeColor,backgroundSrc){
        player.title=title;
        player.description=description;
        player.artist=artist;
        player.album=album;
        //装载音乐
        playerAudio.src=musicSrc;
        //读取歌词
        player.getLyric(lyricSrc);
        //更换封面
        disk.style.backgroundImage="url(\""+coverImageSrc+"\")";
        //更换主题色
        player.themeColor=themeColor;
        //更换背景
        if(backgroundSrc==null){
            background.style.display="none";
        }else{
            background.style.display="block";
            background.style.backgroundImage="url(\""+backgroundSrc+"\")";
        }
    },
    play:function () {
        //开启频谱
        if(!player.haveSpectrum){
            player.haveSpectrum=true;
            beginSpectrum();
        }
        //获取长度
        player.totalTime=parseSecondToTimeString(playerAudio.duration);
        totalTime.innerText=player.totalTime;
        //播放音频
        document.getElementById("playerAudio").play();
        //开始旋转唱碟
        this.diskInterval=setInterval(function () {
            disk.style.transform="rotate("+player.diskDegree+"deg)";
            player.diskDegree+=0.1;
            if(player.diskDegree>=360){
                player.diskDegree=0;
            }
        },1000/60);
        //播放时间动态显示
        player.timeInterval = setInterval(function () {
            player.currentTime=parseSecondToTimeString(playerAudio.currentTime);
            player.totalTime=parseSecondToTimeString(playerAudio.duration);
        },1000/60);
        //播放进度动态显示
        player.progressInterval=setInterval(function () {
            if(isNaN(playerAudio.duration)){

            }else{
                let percent=playerAudio.currentTime/playerAudio.duration*100;
                progress.setAttribute("style","background-image:"+"linear-gradient(90deg, #0075ff 0%,#0075ff "+(percent-0.1)+"%,black "+(percent)+"%,black 100%);");
            }
        },1000/60);
        //歌词动态播放
        if(player.lyric==null||player.lyric.length===0){
            lyric.innerText="";
        }else{
            player.lyricInterval=setInterval(function(){
                if(player.lyric.length>player.lyricNumber+1&&playerAudio.currentTime>=player.lyric[player.lyricNumber+1].t){
                    lyric.innerText=player.lyric[++player.lyricNumber].l;
                }
            },100);
        }
    },
    pause:function (){
        //暂停音频
        playerAudio.pause();
        //停止旋转唱碟
        clearInterval(player.diskInterval);
        //停止歌词
        clearInterval(player.lyricInterval);
        lyric.innerText="";
        //播放时间暂停
        clearInterval(player.timeInterval);
        //停止播放进度
        clearInterval(player.progressInterval);
    },
    getLyric:function(lyricSrc){
        console.log(lyricSrc);
        if(lyricSrc==null){
            player.lyric=null;
            console.log("返回了");
            return;
        }
        let req=new XMLHttpRequest();
        req.open("GET", lyricSrc,true);
        lyric.innerHTML="<div class=\"loading\"></div>";
        req.onreadystatechange=function(){
            if (req.readyState===4 && req.status===200)
            {
                let lyricText=req.responseText;
                console.log(lyricText);
                let regExp=/\[(\d{2}):(\d{2})\.(\d{2,3})](.*)/g;
                let lyric=[];
                while(1){
                    let result=regExp.exec(lyricText)
                    if (result) {
                        let time= parseInt(result[1])*60+parseInt(result[2])+parseInt(result[3])*0.01;
                        lyric.push({t:time,l:result[4]});
                    } else{
                        break;
                    }
                }
                player.lyric=lyric;
                console.log(player.lyric)
                //console.log(lyric);
            }
        };
        req.send(null);
    },
    fullscreen:function (){
        document.documentElement.requestFullscreen();
    },
    exitFullscreen:function(){
        document.exitFullscreen();
    },
    addList(list){
        player.playList=[];//清空当前列表
        for(let item of list){
            player.playList.push(item);
        }
        if(player.playList.length!==0){
            let next=player.playList[0];
            this.load(
                next.title,
                next.description,
                next.artist,
                next.album,
                next.musicSrc,
                next.lyricSrc,
                next.coverImageSrc,
                next.themeColor,
                next.backgroundSrc
            )
        }

    },
    changeProgress(time){
        playerAudio.currentTime=time;
        for(let i=0;i<player.lyric.length;i++){
            if(playerAudio.currentTime<player.lyric[i].t){
                player.lyricNumber=i-1;
                lyric.innerText=player.lyric[player.lyricNumber].l;
                return;
            }
        }
    },
    handleEnding(){
        player.isPlaying=false;
        player.lyricNumber=0;
        clearInterval(player.timeInterval);
        player.next();
    }
};

Object.defineProperty(player,"isPlaying",{
    get:function (){
        return this._isPlaying;
    },
    set:function (newValue){
        if(newValue===true){
            this._isPlaying=true;
            playPauseButton.innerHTML="<i class=\"fa fa-pause\" aria-hidden=\"true\">";
            player.play();
        }else if(newValue===false){
            this._isPlaying=false;
            playPauseButton.innerHTML="<i class=\"fa fa-play\" aria-hidden=\"true\">";
            player.pause();
        }
    }
});

Object.defineProperty(player,"currentTime",{
    get:function (){
        return this._currentTime;
    },
    set:function (newValue){
        this._currentTime=newValue;
        currentTime.innerHTML=newValue;
    }
});

Object.defineProperty(player,"totalTime",{
    get:function (){
        return this._totalTime;
    },
    set:function (newValue){
        if(playerAudio.ended){
            player.handleEnding();
        }
        this._totalTime=newValue;
        totalTime.innerHTML=newValue;
    }
});

Object.defineProperty(player,"title",{
    get:function (){
        return this._title;
    },
    set:function (newValue){
        this._title=newValue;
        title.innerText=newValue;
    }
});

Object.defineProperty(player,"description",{
    get:function (){
        return this._description;
    },
    set:function (newValue){
        this._description=newValue;
        description.innerText=newValue;
    }
});

Object.defineProperty(player,"artist",{
    get:function (){
        return this._artist;
    },
    set:function (newValue){
        this._artist=newValue;
        artist.innerText=newValue;
    }
});

Object.defineProperty(player,"album",{
    get:function (){
        return this._album;
    },
    set:function (newValue){
        this._album=newValue;
        album.innerText=newValue;
    }
});

Object.defineProperty(player,"currentAudioSrc",{
    get:function (){
        return this._currentAudioSrc;
    },
    set:function (newValue){
        if(newValue!=null&&!(newValue==="")){
            this._currentAudioSrc=newValue;
            playerAudio.src=this.currentAudioSrc;
        }
    }
});

Object.defineProperty(player,"volume",{
    get:function (){
        return this._volume;
    },
    set:function (newValue){
        if(newValue>=0&&newValue<=100){
            this._volume=newValue;
            playerAudio.volume=newValue*0.01;
        }
    }
});

Object.defineProperty(player,"playMode",{
    //0:单曲循环 1:列表循环 2:随机播放
    get:function (){
        return this._playMode;
    },
    set:function (newValue){
        if(newValue>=0&&newValue<=2){
            this._playMode=newValue;
            let icon="";
            if(newValue===0){
                icon="<i class=\"fa fa-repeat\" aria-hidden=\"true\"></i>";
            }else if(newValue===1){
                icon="<i class=\"fa fa-indent\" aria-hidden=\"true\"></i>";
            }else{
                icon="<i class=\"fa fa-random\" aria-hidden=\"true\"></i>";
            }
            playModeButton.innerHTML=icon;
        }
    }
});

Object.defineProperty(player,"openLyric",{
    get:function (){
        return this._openLyric;
    },
    set:function (newValue){
        if(newValue===true){
            this._openLyric=true;
            lyric.classList.add("active");
            lyricToggleButton.classList.add("active");
        }else if(newValue===false){
            this._openLyric=false;
            lyric.classList.remove("active");
            lyricToggleButton.classList.remove("active");
        }
    }
});

Object.defineProperty(player,"openSpectrum",{
    get:function (){
        return this._openSpectrum;
    },
    set:function (newValue){
        if(newValue===true){
            this._openSpectrum=true;
            FXToggleButton.classList.add("active");
            Spectrum.classList.add("active");
        }else if(newValue===false){
            this._openSpectrum=false;
            FXToggleButton.classList.remove("active");
            Spectrum.classList.remove("active");
        }
    }
});

Object.defineProperty(player,"isFullscreen",{
    get:function (){
        return this._isFullscreen;
    },
    set:function (newValue){
        if(newValue===true){
            this._isFullscreen=true;
            expandButton.innerHTML="<i class=\"fa fa-compress\" aria-hidden=\"true\"></i>";
            player.fullscreen();
        }else if(newValue===false&&player.isFullscreen===true){
            this._isFullscreen=false;
            expandButton.innerHTML="<i class=\"fa fa-expand\" aria-hidden=\"true\"></i>";
            player.exitFullscreen();
        }
    }
});

Object.defineProperty(player,"themeColor",{
    get:function (){
        return this._themeColor;
    },
    set:function (newValue){
        this._themeColor=newValue;
        lyric.style.textShadow=player.themeColor+" 1px 1px 4px";
    }
});

playPauseButton.onclick=function (){
    player.isPlaying=!player.isPlaying;
}

lyricToggleButton.onclick=function () {
    player.openLyric=!player.openLyric;
}

FXToggleButton.onclick=function (){
    player.openSpectrum=!player.openSpectrum;
}

expandButton.onclick=function(){
    player.isFullscreen=!player.isFullscreen;
}

closeButton.onclick=function (){
    window.opener=null;
    window.open('','_self');
    window.close();
}

progress.onclick=function(event){
    player.changeProgress(event.screenX/window.innerWidth*playerAudio.duration);
}

playModeButton.onclick=function (){
    //0:单曲循环 1:列表循环 2:随机播放
    if(player.playMode===2){
        player.playMode=0;
    }else{
        player.playMode+=1;
    }
}

nextButton.onclick=function(){
    player.next();
}

lastButton.onclick=function(){
    player.last();
}

window.onload=function(){
    player.init();
}

player.addList(demoPlayList)