var sound;var wavesurfer,Dwavesurfer,ee;
var Viewer = new Vue({
    el:"#Viewer",
    data:{
        NowType:      "編碼器"   , //標題切換綁定
        ErrorEvent:   false     , //錯誤訊息顯示
        ErrorMessage: ""        , //錯誤訊息內容
        Page1:        "active"  , //分頁是否使用
        Page2:        ""        , //分頁是否使用
        Encoder:{
            FilePath:     ""        , //檔案位置
            AudioData:    ""        , //輸入音訊陣列資料
            HeaderNode:   ""        , //標頭節點資料
            IsLoadFile:   false     , //是否已載入檔案
            IsOutFile:    false     , //是否已進行加密
            EncodeLevel:  "LEVEL0"  , //加密類型
            Options:[
                        { text: '無加密',      value: 'LEVEL0' },
                        { text: '線性位移加密', value: 'LEVEL1' },
                        { text: '交錯級數加密', value: 'LEVEL2' },
                        { text: 'sin(x)加密',  value: 'LEVEL3' },
                        { text: 'cos(x)加密',  value: 'LEVEL4' },
                        { text: '亂數加密',     value: 'LEVEL5' }
            ]
        },
        Decoder:{
            FilePath:     ""        , //檔案位置
            ImageData:    []        , //輸入影像陣列資料
            AudioData:    ""        , //輸出音訊陣列資料
            HeaderNode:   ""        , //標頭節點資料
            IsLoadFile:   false     , //是否已載入檔案
            IsOutFile:    false     , //是否已進行解密
            DecodeLevel:  "LEVEL0"  , //解密類型
            Options:[
                        { text: '無解密',      value: 'LEVEL0' },
                        { text: '線性位移解密', value: 'LEVEL1' },
                        { text: '交錯級數解密', value: 'LEVEL2' },
                        { text: 'sin(x)解密',  value: 'LEVEL3' },
                        { text: 'cos(x)解密',  value: 'LEVEL4' },
                        { text: '亂數解密',     value: 'LEVEL5' }
            ]
        },
        
    },
    methods :{
        CheckError:function CheckError() {
            this.ErrorMessage = ""   ;
            this.ErrorEvent   = false;
        },

        SetPage1:function SetPage1() {
            this.NowType = "編碼器";
            this.Page1 = "active";
            this.Page2 = "";
        },

        SetPage2:function SetPage2() {
            this.NowType = "解碼器";
            this.Page2 = "active";
            this.Page1 = "";            
        },

        GetEncodePath:function GetEncodePath(event) {
            this.Encoder.FilePath = event.target.files[0].path;
            console.log(event.target.files)
        },

        GetDecodePath:function GetDecodePath(event) {
            this.Decoder.FilePath = event.target.files[0].path;
        },
        Copy:function Copy() {
            //wavesurfer.play()
            /*
            var tmmp =  wavesurfer.backend.buffer.getChannelData(0);
            wavesurfer.backend.buffer.getChannelData(1).set(wavesurfer.backend.buffer.getChannelData(0));
            wavesurfer.backend.buffer.getChannelData(0).set(tmmp);
            */
           
            //var FFF = wavesurfer.backend.getPeaks(4400);
            //var FFF = wavesurfer.backend.getPeaks(10);
            ee = WaveSurfer.create({
                container: '#waveform',
                waveColor: 'violet',
                progressColor: 'purple'
            });
            //ee.backend.peaks  = wavesurfer.backend.getPeaks(Math.floor(wavesurfer.backend.buffer.duration*2));
            //ee.backend.buffer = wavesurfer.backend.buffer;
            
            //ee.backend.buffer.numberOfChannels =1;
            /*
            var arr =[];for(let i=0;i<wavesurfer.backend.buffer.length;i++){arr.push(1);}
            wavesurfer.backend.buffer.getChannelData(0).set(arr);
            */
            ee.loaded = true;
            ee.isReady =true;
            /*
            ee.on('ready', function () {
                ee.backend.buffer.duration =10;
            });
            */
            ee.drawBuffer();
        },

        LoadFile:function LoadFile() {
            if(this.NowType == "編碼器"){
                this.Decoder.IsLoadFile = false ;
                this.Decoder.IsOutFile  = false ;

                if(this.Encoder.IsLoadFile){
                    wavesurfer.destroy()
                }
                    

                //FS.read & Load
                if (this.Encoder.FilePath != "") {
                    wavesurfer = WaveSurfer.create({
                        container: '#waveform',
                        waveColor: 'violet',
                        progressColor: 'purple'
                    });
                    wavesurfer.load(this.Encoder.FilePath);
                    Viewer.Encoder.IsLoadFile = true ;
                    
                } else {
                    Viewer.ErrorMessageBox("輸入檔案不能為空");
                }
                
            }else if(this.NowType == "解碼器"){
                if(this.Encoder.IsLoadFile){
                    wavesurfer.destroy();
                }
                
                this.Encoder.IsLoadFile = false ;
                this.Encoder.IsOutFile  = false ;
                //FS.read
                //正規->[0~255]
                //Get Info x,y
                //push->AudioArray
                this.Decoder.IsLoadFile = true  ;
                
            }
        },

        StartEncode: function StartEncode() {
            let Key ,
                Key2;
            
            let ImageSize ;

            let FileSize   = ['\x00','\x00','\x00','\x00'],
                FileWeight  = ['\x00','\x00','\x00','\x00'];

            this.Decoder.IsLoadFile = false ;
            this.Decoder.IsOutFile  = false ;
            this.Encoder.IsOutFile  = true  ;
            
            //Get WaveSurfer Audio Header
            let FileHeader;

            //Write
            //圖片寬度 Need odd will Cut add 0
            if(this.Encoder.EncodeLevel == "LEVEL5")
                ImageSize = "" + (Math.ceil(Math.sqrt(wavesurfer.backend.buffer.length*wavesurfer.backend.buffer.numberOfChannels+128+21))).toString(16);
            else
                ImageSize = "" + (Math.ceil(Math.sqrt((wavesurfer.backend.buffer.length*wavesurfer.backend.buffer.numberOfChannels+128+21)/4))).toString(16);

            if(ImageSize.length%2 > 0 && ImageSize.length <9){
                /*
                let TmpSize = "" + ImageSize;
                ImageSize = "";
                for(let i=0;i<=TmpSize.length;i++){
                    if(i==TmpSize.length-1){
                        ImageSize +=  "0"
                    }else if(i==TmpSize.length){
                        ImageSize += TmpSize[TmpSize.length-1]
                    }else{
                        ImageSize += TmpSize[i];
                    }
                }*/
                ImageSize = "0" + ImageSize
            }
            
            //???
            for (let i = 0,n=0; n < ImageSize.length; i++,n+=2) {
                //FileWeight[i] = String.fromCharCode(parseInt(ImageSize[n-1]+ImageSize[n-2], 16));
                let TmpStr =ImageSize[i+1]+ImageSize[i];
                FileWeight[i] = String.fromCharCode(parseInt(ImageSize.charAt(ImageSize.length-2-n)+ImageSize.charAt(ImageSize.length-1-n), 16));
            }

            this.Encoder.HeaderNode = "\x42\x4D"+FileSize[0]+FileSize[1]+FileSize[2]+FileSize[3]+"\x00\x00\x00\x00\x36\x00\x00\x00\x28\x00\x00\x00"+FileWeight[0]+FileWeight[1]+FileWeight[2]+FileWeight[3]+FileWeight[0]+FileWeight[1]+FileWeight[2]+FileWeight[3]+"\x01\x00\x20\x00\x00\x00\x00\x00\xE1\x00\x00\xC4\x0E\x00\x00\xC4\x0E\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
            
            fs.writeFile(__dirname + '/.file/.tmp.bmp',this.Encoder.HeaderNode,{encoding: 'ascii',flag:'w'}, (error) => {
                if (error) throw error;
            });

            let numberOfChannelHex = String.fromCharCode(parseInt(wavesurfer.backend.buffer.numberOfChannels, 16));
            
            let sampleRateHex = "";
            //String.fromCharCode(parseInt(wavesurfer.backend.buffer.sampleRate, 16));
            let TmpSampleRateStr = wavesurfer.backend.buffer.sampleRate.toString();
            for(let i=0;i<10;i++){
                if(i<10-TmpSampleRateStr.length){
                    sampleRateHex += '\x00';
                }else{
                    sampleRateHex += String.fromCharCode(parseInt(TmpSampleRateStr[i-10+TmpSampleRateStr.length], 16));
                }
            }

            let samplelengthHex = "";
            //String.fromCharCode(parseInt(wavesurfer.backend.buffer.length, 16));
            let TmpSampleLengthStr = wavesurfer.backend.buffer.length.toString();
            for(let i=0;i<10;i++){
                if(i<10-TmpSampleLengthStr.length){
                    samplelengthHex += '\x00';
                }else{
                    samplelengthHex += String.fromCharCode(parseInt(TmpSampleLengthStr[i-10+TmpSampleLengthStr.length], 16));
                }
            }

            //Get Key
            if(this.Encoder.EncodeLevel == "LEVEL0"){
                //無加密
                Key =  sha256.hex("0.41877603947095854");
                Key2 = sha256.hex(Key);
            }else if (this.Encoder.EncodeLevel == "LEVEL1"){
                Key = sha256.hex("0.36310229221374724");
                Key2 = sha256.hex(Key);
            }else if (this.Encoder.EncodeLevel == "LEVEL2"){
                //交錯級數加密
                Key = sha256.hex("0.2494377482367558");
                Key2 = sha256.hex(Key);
            }else if (this.Encoder.EncodeLevel == "LEVEL3"){
                //弦波加密sin
                Key = sha256.hex("0.8556336438849041");
                Key2 = sha256.hex(Key);
            }else if (this.Encoder.EncodeLevel == "LEVEL4"){
                //弦波加密cos
                Key = sha256.hex("0.12240691495231171");
                Key2 = sha256.hex(Key);
            }else if (this.Encoder.EncodeLevel == "LEVEL5"){
                //亂數加密
                Key = sha256.hex("0.3035754752099231");
                Key2 = sha256.hex(Key);
            }else{
                //無加密
                Key = sha256.hex("0.41877603947095854");
                Key2 = sha256.hex(Key);
            }

            let KeyHex  = "",
                KeyHex2 = "";
/*
            for(let i=0;i<Key.length;i++){
                KeyHex  += String.fromCharCode(parseInt(Key[i] ,16));
                KeyHex2 += String.fromCharCode(parseInt(Key2[i],16));
            }
*/
            this.Encoder.AudioData = Key + numberOfChannelHex + sampleRateHex + samplelengthHex.toString(16) + Key2;

            //寫入子Header
            fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
            //console.log("KeyHex:"+KeyHex)

            //Clear Tmp Data
            this.Encoder.AudioData = "";

            //加密函式
            if(this.Encoder.EncodeLevel == "LEVEL0"){
                //無加密
                for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                    if(j>1000000){
                        fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                        this.Encoder.AudioData="";
                        j=0;
                    }

                    this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.ceil(255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)));
                }
            }else if (this.Encoder.EncodeLevel == "LEVEL1"){
                //線性位移加密
                for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                    if(j>1000000){
                        fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                        this.Encoder.AudioData="";
                        j=0;
                    }

                    this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.ceil(47+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)));
                }
            }else if (this.Encoder.EncodeLevel == "LEVEL2"){
                //交錯級數加密
                for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                    if(j>1000000){
                        fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                        this.Encoder.AudioData="";
                        j=0;
                    }

                    this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.ceil(Math.pow(-1,i%2)*0.48354512*i+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)));
                }
            }else if (this.Encoder.EncodeLevel == "LEVEL3"){
                //弦波加密sin
                for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                    if(j>1000000){
                        fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                        this.Encoder.AudioData="";
                        j=0;
                    }

                    this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.ceil(Math.sin(i)+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)));
                }
            }else if (this.Encoder.EncodeLevel == "LEVEL4"){
                //弦波加密cos
                for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                    if(j>1000000){
                        fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                        this.Encoder.AudioData="";
                        j=0;
                    }

                    this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.ceil(Math.cos(i)+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)));
                }
            }else if (this.Encoder.EncodeLevel == "LEVEL5"){
                //亂數加密
                console.log(wavesurfer.backend.buffer.length*4);
                for(let i=0,j=0;i<wavesurfer.backend.buffer.length*4;i++,j++){
                    if(j>1000000){
                        fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                        console.log("[0]:"+this.Encoder.AudioData.length);
                        this.Encoder.AudioData="";
                        j=0;
                    }

                    
                    if(i%4 == 0){
                        this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.ceil(255*(wavesurfer.backend.buffer.getChannelData(0)[i/4]+1)/2)));
                    }
                    else{
                        this.Encoder.AudioData+=String.fromCharCode(Math.floor(Math.random()*255));
                    }
                    /*
                    if(i%4 == 0){
                        this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.ceil(255*(wavesurfer.backend.buffer.getChannelData(0)[i/4]+1)/2)));
                    }else{
                        this.Encoder.AudioData+=String.fromCharCode(String.fromCharCode(Math.floor(Math.random()*255)));
                    }*/
                }
            }else{
                //無加密
                for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                    if(j>1000000){
                        fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});                        
                        this.Encoder.AudioData="";
                        j=0;
                    }

                    this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.ceil(255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)));
                }
            }

            //Write Last Channl0 Data
            fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});

            //Clear Tmp Data
            this.Encoder.AudioData = "";

            if(wavesurfer.backend.buffer.numberOfChannels > 1){
                if(this.Encoder.EncodeLevel == "LEVEL0"){
                    //無加密
                    for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                        if(j>1000000){
                            fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                            this.Encoder.AudioData="";
                            j=0;
                        }

                        this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.ceil(Math.sin(i)+255*(wavesurfer.backend.buffer.getChannelData(1)[i]+1)/2)));
                    }
                }else if (this.Encoder.EncodeLevel == "LEVEL1"){
                    //線性位移加密
                    for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                        if(j>1000000){
                            fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                            this.Encoder.AudioData="";
                            j=0;
                        }

                        this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.ceil(47+255*(wavesurfer.backend.buffer.getChannelData(1)[i]+1)/2)));
                    }
                }else if (this.Encoder.EncodeLevel == "LEVEL2"){
                    //交錯級數加密
                    for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                        if(j>1000000){
                            fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                            this.Encoder.AudioData="";
                            j=0;
                        }

                        this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.ceil(Math.pow(-1,i%2)*0.48354512*i+255*(wavesurfer.backend.buffer.getChannelData(1)[i]+1)/2)));
                    }
                                    
                }else if (this.Encoder.EncodeLevel == "LEVEL3"){
                    //弦波加密sin
                    for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                        if(j>1000000){
                            fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                            this.Encoder.AudioData="";
                            j=0;
                        }

                        this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.ceil(Math.sin(i)+255*(wavesurfer.backend.buffer.getChannelData(1)[i]+1)/2)));
                    }
                }else if (this.Encoder.EncodeLevel == "LEVEL4"){
                    //弦波加密cos
                    for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                        if(j>1000000){
                            fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                            this.Encoder.AudioData="";
                            j=0;
                        }
                        this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.ceil(Math.cos(i)+255*(wavesurfer.backend.buffer.getChannelData(1)[i]+1)/2)));
                    }
                }else if (this.Encoder.EncodeLevel == "LEVEL5"){
                    //亂數加密
                    for(let i=0,j=0;i<wavesurfer.backend.buffer.length*4;i++,j++){
                        if(j>1000000){
                            fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                            console.log("[1]:"+this.Encoder.AudioData.length+","+i);
                            this.Encoder.AudioData="";
                            j=0;
                        }
    
                        if(i%4 == 0){
                            this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.ceil(255*(wavesurfer.backend.buffer.getChannelData(1)[i/4]+1)/2)));
                        }
                        else{
                            this.Encoder.AudioData+=String.fromCharCode(Math.floor(Math.random()*255));
                        }
                            
                    }
                }else{
                    //無加密
                    for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                        if(j>1000000){
                            fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                            this.Encoder.AudioData="";
                            j=0;
                        } 
                        this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.ceil(255*(wavesurfer.backend.buffer.getChannelData(1)[i]+1)/2)));
                    }
                }
    
                fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
            }
       
            //push hash(Key),  channelSum , 2hash(Key),  imgs
            //Psuh ImgArray -> Out File

            this.Encoder.HeaderNode = "";
            this.Encoder.AudioData = "";

            this.Encoder.ImageData = './.file/.tmp.bmp';
        },

        StartDecode: function StartDecode() {
            let Key        = "" ,
                Key2       = "" ,
                Channel1 = [],
                Channel2 = [];

            let FileTypeTest  = true,
                HaveChannel2  = false,
                PointSum      = 0,
                sampleRateSum = 44100;

            this.Encoder.IsLoadFile = false ;
            this.Encoder.IsOutFile  = false ;
            this.Decoder.IsOutFile  = true  ;
            
            //Make A Buffer
            //Get Key(32) + 1 + 10 +10 + Key2(32)
            /*fs.readFile(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'}, (error) => {
                if (error) throw error;
                this.Encoder.AudioData="";
            });*/
            //Write WaveFile Header
            fs.open(this.Decoder.FilePath, 'r', function(err, fd) {
                if(err){FileTypeTest = false;}
                fs.fstat(fd, function(err, stats) {
                    if(err){FileTypeTest = false;}
                        let bufferSize = stats.size;
                        var buffer = Buffer.alloc(144, 'ascii');
                        let bytesRead = 0;
              
                    if(fs.readSync(fd, buffer, bytesRead, 144, bytesRead) < 144) {
                        FileTypeTest = false;
                    }
                    ee=buffer;
                    console.log(buffer.slice(0, 145));
                    console.log(buffer.slice(85, 96));

                    if(Buffer.from(buffer.slice(53, 64)).toString() == Buffer.from([52, 99, 99, 102, 100, 100, 101, 54, 53, 50, 49]).toString() && Buffer.from(buffer.slice(85, 96)).toString() == Buffer.from([57, 52, 57, 52, 53, 53, 55, 51, 55, 100, 52]).toString() ){
                        console.log("LEVEL0");
                    }else if(Buffer.from(buffer.slice(53, 64)).toString() == Buffer.from([57, 101, 100, 99, 53, 101, 99, 56, 98, 49, 52]).toString()&& Buffer.from(buffer.slice(85, 96)).toString() == Buffer.from([100, 53, 48, 101, 55, 50, 53, 98, 49, 97, 52]).toString()){
                        console.log("LEVEL1");
                    }else if(Buffer.from(buffer.slice(53, 64)).toString() == Buffer.from([49, 57, 48, 55, 49, 52, 54, 50, 49, 53, 102]).toString()&& Buffer.from(buffer.slice(85, 96)).toString() == Buffer.from([100, 56, 49, 54, 52, 102, 54, 98, 55, 57, 56]).toString()){
                        console.log("LEVEL2");
                    }else if(Buffer.from(buffer.slice(53, 64)).toString() == Buffer.from([51, 101, 51, 48, 99, 56, 54, 51, 57, 50, 97]).toString()&& Buffer.from(buffer.slice(85, 96)).toString() == Buffer.from([98, 48, 100, 52, 100, 97, 49, 99, 56, 99, 48]).toString()){
                        console.log("LEVEL3");
                    }else  if(Buffer.from(buffer.slice(53, 64)).toString() == Buffer.from([52, 99, 48, 55, 101, 98, 50, 53, 99, 56, 51]).toString()&& Buffer.from(buffer.slice(85, 96)).toString() == Buffer.from([52, 98, 100, 57, 50, 52, 49, 97, 51, 99, 57]).toString()){
                        console.log("LEVEL4");
                    }else if(Buffer.from(buffer.slice(53, 64)).toString() == Buffer.from([57, 99, 98, 57, 54, 98, 54, 97, 56, 51, 57]).toString() && Buffer.from(buffer.slice(85, 96)).toString() == Buffer.from([57, 57, 51, 57, 100, 97, 57, 99, 55, 98, 98]).toString()){
                        console.log("LEVEL5");
                    }else{

                    }

                    //Test Channel Sum
                    if(buffer[64]==2){
                        HaveChannel2 = true;
                    }else if(buffer[64]==1){
                        HaveChannel2 = false;
                    }else{
                        //error MSG
                    }

                    //Test PointSum
                    let PointSumStr = "";
                    for(let i=65;i<73;i++){
                        PointSumStr+=""+buffer[i];
                    }

                    PointSum = parseInt(PointSumStr);
                    if(isNaN(PointSumStr)){
                         //error MSG
                    }

                    let sampleRateSumStr = "";
                    for(let i=73;i<85;i++){
                        sampleRateSumStr+=""+buffer[i];
                    }

                    sampleRateSum = parseInt(sampleRateSumStr);
                    if(isNaN(sampleRateSumStr)){
                         //error MSG
                    }


                    //console.log(buffer.slice(53, 64));
                    //console.log(buffer)
                    /*
                    if(buffer.slice(53, 64)==sha256.hex("0.3035754752099231")){
                        console.log("True")
                        console.log(buffer)
                    }else{
                        console.log(buffer.slice(0,2))
                    }
                        console.log(buffer.toString())
                */
                    //buffer.slice(18,22) BMP大小
                    //console.log(buffer.slice(95,159))
                    /*
                    for(let i=96;i<159;i++){
                        Key += GetHextoInt(buffer[i].toString(16));
                    }

                    if(Key==sha256.hex("0.3035754752099231")){
                        console.log("True2")
                    }else{
                        console.log(Key)
                    }

                    */

                   console.log(+PointSum+","+sampleRateSum)
                   let ChannelHex = "\x01",
                   SubCutHex  = "\xE8\x05\x00\x00";
   
                    if(HaveChannel2)
                        ChannelHex = "\x02";
        
                    fs.writeFileSync(__dirname + '/.file/.tmp.wav',"\x52\x49\x46\x46\x0C\x06\x00\x00\x57\x41\x56\x45\x66\x6D\x74\x20\x10\x00\x00\x00\x01\x00"+ChannelHex+"\x00\xF8\x2A\x00\x00\xF0\x55\x00\x00\x02\x00\x10\x00\x64\x61\x74\x61"+SubCutHex),{encoding: 'ascii',flag:'w'};
        
                    
                    for(let i=0;i<PointSum;i++){
                        fs.writeFileSync(__dirname + '/.file/.tmp.wav',"\x00\x00\x00\x00",{encoding: 'ascii',flag:'a+'}); 
                    }
        
                                    
                    if(HaveChannel2){
                        for(let i=0;i<PointSum;i++){
                            fs.writeFileSync(__dirname + '/.file/.tmp.wav',"\x00\x00\x00\x00",{encoding: 'ascii',flag:'a+'}); 
                        }
                    }
                });
            });
            
            
            //[53]內文
            
              
            
           

            
                
        },
        DecoderPlay:function DecoderPlay() {
            if(Dwavesurfer.backend.buffer.length>0){
                Dwavesurfer = WaveSurfer.create({
                    container: '#waveform',
                    waveColor: 'violet',
                    progressColor: 'purple'
                });
                Dwavesurfer.drawBuffer();
                Dwavesurfer.loaded = true;
                Dwavesurfer.isReady =true;
            }else{
                this.ErrorMessageBox("無法解析音訊資料");
            }
        },
        DownloadImg:function DownloadImg() {
            if(this.Encoder.IsOutFile){
                let NowDate = new Date()
                fs.copyFile(__dirname + '/.file/.tmp.bmp', __dirname + '/OutFile/Out'+NowDate.getFullYear() + '-' + (NowDate.getMonth()+1) + '-' + NowDate.getDate() + '-' + NowDate.getHours() + '-' + NowDate.getMinutes() + '-' + NowDate.getSeconds()+'.bmp', (err) => {
                    if (err){
                        this.ErrorMessageBox("下載錯誤");
                    }
                    this.ErrorMessageBox("已匯出至OutFile資料夾中")
                });
            }else{
                this.ErrorMessageBox("下載錯誤");
            }
        },
        DownloadAudio:function DownloadAudio() {
            if(this.Decoder.IsOutFile){
                //TODO
            }else{
                this.ErrorMessageBox("下載錯誤");
            }
        },
        ErrorMessageBox:function ErrorMessageBox(ErrorInfo) {
            this.ErrorMessage = ErrorInfo ;
            this.ErrorEvent   = true      ;
        }
    },
    destroyed:{
        //Delete tmp.File    
    },
})

function GetHextoInt(HexStr){
    let ReStr = 0;
    for(let i=0,n=0; i<HexStr.length; i++,n+=2)
        ReStr+= Math.floor(HexStr[i]/10)*Math.pow(16,n+1)+(HexStr[i]%16)*Math.pow(16,n)

    return ReStr;
}