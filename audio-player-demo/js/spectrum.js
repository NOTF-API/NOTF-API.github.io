/*参考文档https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Audio_API*/
function beginSpectrum(){
    let canvas=document.getElementById("spectrum");
    let ctx=canvas.getContext("2d");
    let oCtx = new AudioContext();
    let audioSrc = oCtx.createMediaElementSource(document.getElementById("playerAudio"));
    let analyser = oCtx.createAnalyser();
    audioSrc.connect(analyser);
    analyser.connect(oCtx.destination);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let oW = canvas.width;
    let oH = canvas.height;
    // 音频图的条数
    let count = 40;
    let voiceHeight = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(voiceHeight);
    // 自定义获取数组里边数据的频步
    let step = Math.round(voiceHeight.length / count);
    //TODO下版本把频谱图拆到左右两边
    function draw() {
        analyser.getByteFrequencyData(voiceHeight);
        ctx.clearRect(0, 0, oW, oH);
        for (let i = 0; i < count; i++) {
            let audioHeight = voiceHeight[step * i];
            ctx.fillStyle = player.themeColor;
            ctx.fillRect(oW / 2 + 300 + (i * 20), oH, 14, -audioHeight * 2);
            ctx.fillRect(oW / 2 - 300 - (i * 20), oH, 14, -audioHeight * 2);
        }
        window.requestAnimationFrame(draw);
        /*参考资料https://blog.csdn.net/wangmx1993328/article/details/84106703*/
    }
    draw();
}