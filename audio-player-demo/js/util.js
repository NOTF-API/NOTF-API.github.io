function parseSecondToTimeString(second){
    if(isNaN(second)){
        return "00:00.00";
    }
    let secondInt=parseInt(second);
    let s=parseInt(secondInt%60);
    let m=parseInt(secondInt/60);
    let ms=parseInt((second-secondInt)*100);
    let timeString="";
    if(m<10){
        timeString+="0";
    }
    timeString+=m;
    timeString+=":"
    if(s<10){
        timeString+="0";
    }
    timeString+=s;
    timeString+=".";
    if(ms<10){
        timeString+="0";
    }else if(ms<100){
        //timeString+="0";
    }
    timeString+=ms;
    return timeString;
}