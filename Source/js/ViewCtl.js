var sound;var wavesurfer,Dwavesurfer,ee;
var Viewer = new Vue({
    el:"#Viewer",
    data:{
        Offset:       128       , //偏移量
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
            FilePath:      ""        , //檔案位置
            ImageData:     []        , //輸入影像陣列資料
            AudioData:     ""        , //輸出音訊陣列資料
            HeaderNode:    ""        , //標頭節點資料
            IsLoadFile:    false     , //是否已載入檔案
            IsOutFile:     false     , //是否已進行解密
            DecodeLevel:   "LEVEL0"  , //解密類型
            FileTypeTest:  true      , //測試是否為BMP檔
            HaveChannel2:  false     , //是否有第二個頻道
            PointSum:      0         , //總長度
            SampleSum:     44100     , //取樣頻率
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
        },

        GetDecodePath:function GetDecodePath(event) {
            this.Decoder.FilePath = event.target.files[0].path;
        },

        LoadFile:function LoadFile() {
            if(this.NowType == "編碼器"){
                if(this.Encoder.IsLoadFile){
                    wavesurfer.destroy()
                }
                
                if(this.Decoder.IsLoadFile){
                    Dwavesurfer.destroy();
                }

                this.Decoder.IsLoadFile = false ;
                this.Decoder.IsOutFile  = false ;
                this.Encoder.IsLoadFile = false ;
                this.Encoder.IsOutFile = false ;
                    
                //FS.read & Load
                if (this.Encoder.FilePath != "") {
                    wavesurfer = WaveSurfer.create({
                        container: '#waveform',
                        waveColor: 'violet',
                        progressColor: 'purple'
                    });
                    wavesurfer.load(this.Encoder.FilePath);
                    Viewer.Encoder.IsLoadFile = true;
                } else {
                    Viewer.ErrorMessageBox("輸入檔案不能為空");
                }
                
            }else if(this.NowType == "解碼器"){
                if(this.Decoder.IsLoadFile){
                    Dwavesurfer.destroy();
                }
                
                if(this.Encoder.IsLoadFile){
                    wavesurfer.destroy()
                }

                this.Encoder.IsLoadFile = false ;
                this.Encoder.IsOutFile  = false ;
                this.Decoder.IsLoadFile = false ;
                this.Decoder.IsOutFile = false ;

                fs.open(this.Decoder.FilePath, 'r', function(err, fd) {
                    if(err){
                        FileTest = false;
                        this.ErrorMessageBox("系統無法存取檔案");
                        this.Decoder.IsLoadFile = false  ;
                        return;
                    }

                    let buffer = Buffer.alloc(144, 'ascii');
                    let bytesRead = 0;

                    fs.fstat(fd, function(err, stats) {
                        if(err){
                            FileTest = false;
                            Viewer.ErrorMessageBox("檔案開啟錯誤");
                            this.Decoder.IsLoadFile = false  ;
                            return;
                        }
                        
                
                        if(fs.readSync(fd, buffer, bytesRead, 144, bytesRead) < 144) {
                            FileTestt = false;
                            Viewer.ErrorMessageBox("WAV音檔長度過短");
                            this.Decoder.IsLoadFile = false  ;
                            return;
                        }

                        if(Buffer.from(buffer.slice(53, 64)).toString() == Buffer.from([52, 99, 99, 102, 100, 100, 101, 54, 53, 50, 49]).toString() && Buffer.from(buffer.slice(85, 96)).toString() == Buffer.from([57, 52, 57, 52, 53, 53, 55, 51, 55, 100, 52]).toString()){
                            Viewer.Decoder.DecodeLevel = "LEVEL0";
                        }else if(Buffer.from(buffer.slice(53, 64)).toString() == Buffer.from([57, 101, 100, 99, 53, 101, 99, 56, 98, 49, 52]).toString()&& Buffer.from(buffer.slice(85, 96)).toString() == Buffer.from([100, 53, 48, 101, 55, 50, 53, 98, 49, 97, 52]).toString()){
                            Viewer.Decoder.DecodeLevel = "LEVEL1";
                        }else if(Buffer.from(buffer.slice(53, 64)).toString() == Buffer.from([49, 57, 48, 55, 49, 52, 54, 50, 49, 53, 102]).toString()&& Buffer.from(buffer.slice(85, 96)).toString() == Buffer.from([100, 56, 49, 54, 52, 102, 54, 98, 55, 57, 56]).toString()){
                            Viewer.Decoder.DecodeLevel = "LEVEL2";
                        }else if(Buffer.from(buffer.slice(53, 64)).toString() == Buffer.from([51, 101, 51, 48, 99, 56, 54, 51, 57, 50, 97]).toString()&& Buffer.from(buffer.slice(85, 96)).toString() == Buffer.from([98, 48, 100, 52, 100, 97, 49, 99, 56, 99, 48]).toString()){
                            Viewer.Decoder.DecodeLevel = "LEVEL3";
                        }else  if(Buffer.from(buffer.slice(53, 64)).toString() == Buffer.from([52, 99, 48, 55, 101, 98, 50, 53, 99, 56, 51]).toString()&& Buffer.from(buffer.slice(85, 96)).toString() == Buffer.from([52, 98, 100, 57, 50, 52, 49, 97, 51, 99, 57]).toString()){
                            Viewer.Decoder.DecodeLevel = "LEVEL4";
                        }else if(Buffer.from(buffer.slice(53, 64)).toString() == Buffer.from([57, 99, 98, 57, 54, 98, 54, 97, 56, 51, 57]).toString() && Buffer.from(buffer.slice(85, 96)).toString() == Buffer.from([57, 57, 51, 57, 100, 97, 57, 99, 55, 98, 98]).toString()){
                            Viewer.Decoder.DecodeLevel = "LEVEL5";
                        }else{
                            Viewer.Decoder.DecodeLevel = "LEVEL0";
                            Viewer.ErrorMessageBox("解密選項選擇錯誤");
                            Viewer.Decoder.IsLoadFile = false  ;
                            return;
                        }
                        

                        //Test Channel Sum
                        if(buffer[64]==2){
                            Viewer.Decoder.HaveChannel2 = true;
                        }else if(buffer[64]==1){
                            Viewer.Decoder.HaveChannel2 = false;
                        }else{
                            Viewer.ErrorMessageBox("Channel資訊錯誤");
                            this.Decoder.IsLoadFile = false  ;
                            return;
                        }

                        //Test this.Decoder.SampleSum
                        let sampleRateSumStr = "";
                        for(let i=65;i<75;i++){
                            sampleRateSumStr+=""+buffer[i];
                        }

                        Viewer.Decoder.SampleSum = parseInt(sampleRateSumStr);
                        if(isNaN(Viewer.Decoder.SampleSum)){
                            Viewer.ErrorMessageBox("檔案錯誤");
                            this.Decoder.IsLoadFile = false  ;
                            return;
                        }

                        //Test this.Decoder.PointSum
                        let PointSumStr = "";
                        for(let i=75;i<85;i++){
                            PointSumStr+=""+buffer[i];
                        }

                        Viewer.Decoder.PointSum = parseInt(PointSumStr);
                        if(isNaN(Viewer.Decoder.PointSum)){
                            Viewer.ErrorMessageBox("檔案錯誤");
                            this.Decoder.IsLoadFile = false  ;
                            return;
                        }

                        let ChannelHex = "\x01";
                        
                        SubCutHex =(Viewer.Decoder.PointSum / 2).toString(16)
                        if(SubCutHex.length%2 > 0 && SubCutHex.length <9){
                            SubCutHex = "0" + SubCutHex
                        }

                        for (let i = 0,n=0; n < SubCutHex.length; i++,n+=2) {
                            let TmpStr =SubCutHex[i+1]+SubCutHex[i];
                            SubCutHex[i] = String.fromCharCode(parseInt(SubCutHex.charAt(SubCutHex.length-2-n)+SubCutHex.charAt(SubCutHex.length-1-n), 16));
                        }
                        
                        if(Viewer.Decoder.HaveChannel2)
                            ChannelHex = "\x02";
            
                        fs.writeFileSync(__dirname + '/.file/.tmp.wav',"\x52\x49\x46\x46\x0C\x06\x00\x00\x57\x41\x56\x45\x66\x6D\x74\x20\x10\x00\x00\x00\x01\x00"+ChannelHex+"\x00\xF8\x2A\x00\x00\xF0\x55\x00\x00\x02\x00\x10\x00\x64\x61\x74\x61"+SubCutHex,{encoding: 'ascii',flag:'w'});
            
                        let WriterXoStr = "";
                        for(let i=0;i<Viewer.Decoder.PointSum/32;i++){
                            WriterXoStr+="\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00";
                            
                            if(Viewer.Decoder.HaveChannel2){
                                WriterXoStr+="\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
                            }
                        }
                        fs.writeFileSync(__dirname + '/.file/.tmp.wav',WriterXoStr,{encoding: 'ascii',flag:'a+'}); 

            

                        Viewer.DecoderPlay();
                    });
                });
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

            if(!wavesurfer.isReady){
                this.ErrorMessageBox("不支援此輸入格式檔案");
                this.Encoder.IsLoadFile = false ;
                this.Encoder.IsOutFile = false;
                wavesurfer.destroy();
                return;
            }

            this.Offset = parseInt(this.Offset)
            if(this.Offset>255||this.Offset<0){
                this.ErrorMessageBox("Offset值域需0~255之間");
                return;
            }

            //Write
            //圖片寬度 Need odd will Cut add 0
            if(this.Encoder.EncodeLevel == "LEVEL5")
                ImageSize = "" + (Math.ceil(Math.sqrt(wavesurfer.backend.buffer.length*wavesurfer.backend.buffer.numberOfChannels+128+21))).toString(16);
            else
                ImageSize = "" + (Math.ceil(Math.sqrt((wavesurfer.backend.buffer.length*wavesurfer.backend.buffer.numberOfChannels+128+21)/4))).toString(16);

            if(ImageSize.length%2 > 0 && ImageSize.length < 9){
                ImageSize = "0" + ImageSize
            }
            
            //???
            for (let i = 0,n=0; n < ImageSize.length; i++,n+=2) {
                let TmpStr =ImageSize[i+1]+ImageSize[i];
                FileWeight[i] = String.fromCharCode(parseInt(ImageSize.charAt(ImageSize.length-2-n)+ImageSize.charAt(ImageSize.length-1-n), 16));
            }

            this.Encoder.HeaderNode = "\x42\x4D"+FileSize[0]+FileSize[1]+FileSize[2]+FileSize[3]+"\x00\x00\x00\x00\x36\x00\x00\x00\x28\x00\x00\x00"+FileWeight[0]+FileWeight[1]+FileWeight[2]+FileWeight[3]+FileWeight[0]+FileWeight[1]+FileWeight[2]+FileWeight[3]+"\x01\x00\x20\x00\x00\x00\x00\x00\xE1\x00\x00\xC4\x0E\x00\x00\xC4\x0E\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
            
            fs.writeFile(__dirname + '/.file/.tmp.bmp',this.Encoder.HeaderNode,{encoding: 'ascii',flag:'w'}, (error) => {
                if (error){
                    Viewer.ErrorMessageBox("錯誤！無法建立暫存檔");
                    Viewer.Encoder.IsOutFile = false;
                    return;
                }
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

            this.Encoder.AudioData = Key + numberOfChannelHex + sampleRateHex + samplelengthHex.toString(16) + Key2;

            //寫入子Header
            fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});

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

                    this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor(255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)));
                }
            }else if (this.Encoder.EncodeLevel == "LEVEL1"){
                //線性位移加密
                for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                    if(j>1000000){
                        fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                        this.Encoder.AudioData="";
                        j=0;
                    }

                    this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor(this.Offset+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)));
                }
            }else if (this.Encoder.EncodeLevel == "LEVEL2"){
                //交錯級數加密
                for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                    if(j>1000000){
                        fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                        this.Encoder.AudioData="";
                        j=0;
                    }

                    let OutLineTest = parseInt(Math.floor((Math.pow(-1,i%2)*(1/(i+1)))+ this.Offset+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2));
                    if(OutLineTest<0){
                        this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor((Math.pow(-1,i%2)*(1/(i+1)))+this.Offset+255+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)));
                    }else if(OutLineTest>255){
                        this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor((Math.pow(-1,i%2)*(1/(i+1)))+this.Offset-255+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)));
                    }else{
                        this.Encoder.AudioData+=String.fromCharCode(OutLineTest);
                    }
                }
            }else if (this.Encoder.EncodeLevel == "LEVEL3"){
                //弦波加密sin
                for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                    if(j>1000000){
                        fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                        this.Encoder.AudioData="";
                        j=0;
                    }

                    let OutLineTest = parseInt(Math.floor(Math.sin(i)+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2))
                    if(OutLineTest<0){
                        this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor(Math.sin(i)+255+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)));
                    }else if(OutLineTest>255){
                        this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor(Math.sin(i)-255+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)));
                    }else{
                        this.Encoder.AudioData+=String.fromCharCode(OutLineTest);
                    }
                }
            }else if (this.Encoder.EncodeLevel == "LEVEL4"){
                //弦波加密cos
                for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                    if(j>1000000){
                        fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                        this.Encoder.AudioData="";
                        j=0;
                    }

                    let OutLineTest = parseInt(Math.floor(Math.cos(i)+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2))
                    if(OutLineTest<0){
                        this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor(Math.cos(i)+255+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)));
                    }else if(OutLineTest>255){
                        this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor(Math.cos(i)-255+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)));
                    }else{
                        this.Encoder.AudioData+=String.fromCharCode(OutLineTest);
                    }
                }
            }else if (this.Encoder.EncodeLevel == "LEVEL5"){
                //亂數加密
                for(let i=0,j=0;i<wavesurfer.backend.buffer.length*4;i++,j++){
                    if(j>1000000){
                        fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                        this.Encoder.AudioData="";
                        j=0;
                    }

                    if(i%4 == 0){
                        this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor(255*(wavesurfer.backend.buffer.getChannelData(0)[i/4]+1)/2)));
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

                    this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor(255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)));
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

                        this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor(Math.sin(i)+255*(wavesurfer.backend.buffer.getChannelData(1)[i]+1)/2)));
                    }
                }else if (this.Encoder.EncodeLevel == "LEVEL1"){
                    //線性位移加密
                    for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                        if(j>1000000){
                            fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                            this.Encoder.AudioData="";
                            j=0;
                        }

                        this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor(this.Offset+255*(wavesurfer.backend.buffer.getChannelData(1)[i]+1)/2)));
                    }
                }else if (this.Encoder.EncodeLevel == "LEVEL2"){
                    //交錯級數加密
                    for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                        if(j>1000000){
                            fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                            this.Encoder.AudioData="";
                            j=0;
                        }
                        let OutLineTest = parseInt(Math.floor((Math.pow(-1,i%2)*(1/(i+1)))+this.Offset+255*(wavesurfer.backend.buffer.getChannelData(1)[i]+1)/2));
                        if(OutLineTest<0){
                            this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor((Math.pow(-1,i%2)*(1/(i+1)))+this.Offset+255+255*(wavesurfer.backend.buffer.getChannelData(1)[i]+1)/2)));
                        }else if(OutLineTest>255){
                            this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor((Math.pow(-1,i%2)*(1/(i+1)))+this.Offset-255+255*(wavesurfer.backend.buffer.getChannelData(1)[i]+1)/2)));
                        }else{
                            this.Encoder.AudioData+=String.fromCharCode(OutLineTest);
                        }
                    }
                                    
                }else if (this.Encoder.EncodeLevel == "LEVEL3"){
                    //弦波加密sin
                    for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                        if(j>1000000){
                            fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                            this.Encoder.AudioData="";
                            j=0;
                        }

                        let OutLineTest = parseInt(Math.floor(Math.sin(i)+255*(wavesurfer.backend.buffer.getChannelData(1)[i]+1)/2))
                        if(OutLineTest<0){
                            this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor(Math.sin(i)+255+255*(wavesurfer.backend.buffer.getChannelData(1)[i]+1)/2)));
                        }else if(OutLineTest>255){
                            this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor(Math.sin(i)-255+255*(wavesurfer.backend.buffer.getChannelData(1)[i]+1)/2)));
                        }else{
                            this.Encoder.AudioData+=String.fromCharCode(OutLineTest);
                        }
                    }
                }else if (this.Encoder.EncodeLevel == "LEVEL4"){
                    //弦波加密cos
                    for(let i=0,j=0;i<wavesurfer.backend.buffer.length;i++,j++){
                        if(j>1000000){
                            fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                            this.Encoder.AudioData="";
                            j=0;
                        }

                        let OutLineTest = parseInt(Math.floor(Math.cos(i)+255*(wavesurfer.backend.buffer.getChannelData(1)[i]+1)/2))
                        if(OutLineTest<0){
                            this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor(Math.cos(i)+255+255*(wavesurfer.backend.buffer.getChannelData(1)[i]+1)/2)));
                        }else if(OutLineTest>255){
                            this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor(Math.cos(i)-255+255*(wavesurfer.backend.buffer.getChannelData(1)[i]+1)/2)));
                        }else{
                            this.Encoder.AudioData+=String.fromCharCode(OutLineTest);
                        }
                    }
                }else if (this.Encoder.EncodeLevel == "LEVEL5"){
                    //亂數加密
                    for(let i=0,j=0;i<wavesurfer.backend.buffer.length*4;i++,j++){
                        if(j>1000000){
                            fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
                            this.Encoder.AudioData="";
                            j=0;
                        }
    
                        if(i%4 == 0){
                            this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor(255*(wavesurfer.backend.buffer.getChannelData(1)[i/4]+1)/2)));
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
                        this.Encoder.AudioData+=String.fromCharCode(parseInt(Math.floor(255*(wavesurfer.backend.buffer.getChannelData(1)[i]+1)/2)));
                    }
                }
    
                fs.writeFileSync(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{encoding: 'ascii',flag:'a+'});
            }

            this.Encoder.HeaderNode = "";
            this.Encoder.AudioData = "";

            this.Encoder.ImageData = './.file/.tmp.bmp';
        },

        StartDecode: function StartDecode() {

            this.Offset = parseInt(this.Offset)
            if(this.Offset>255||this.Offset<0){
                this.ErrorMessageBox("Offset值域需0~255之間");
                return;
            }
            
            this.Encoder.IsLoadFile = false ;
            this.Encoder.IsOutFile  = false ;
            this.Decoder.IsOutFile  = true  ;

            if(Viewer.Decoder.DecodeLevel == "LEVEL5"){
                this.Decoder.PointSum*=4;
            }

            let FirstDo,SubCounter,DownCut=0;
            if(this.Decoder.PointSum-(this.Decoder.PointSum%1000000)==0){
                //<1000000
                FirstDo=1;
                SubCounter = Viewer.Decoder.PointSum%1000000;
            }else{
                //>1000000
                FirstDo=this.Decoder.PointSum-(this.Decoder.PointSum%1000000)+1;
                SubCounter = 1000000;
            }
        
            for(let i =0,v=0; i < FirstDo; i+=1000000){
                fs.open(this.Decoder.FilePath, 'r', function(err, fd) {
                    if(err){
                        FileTest = false;
                        this.ErrorMessageBox("系統無法存取檔案");
                        return;
                    }
    
                    let buffer = Buffer.alloc(1000000, 'ascii');
    
                    fs.fstat(fd, function(err, stats) {
                        if(err){
                            FileTest = false;
                            Viewer.ErrorMessageBox("檔案開啟錯誤");
                            return;
                        }
                    });

                    fs.readSync(fd, buffer, 0, SubCounter, 150+i);

                    for(let j=0;j<SubCounter;j++){
                        if(Viewer.Decoder.DecodeLevel == "LEVEL0"){
                            Dwavesurfer.backend.buffer.getChannelData(0)[i+j] = (2*buffer[j]/255)-1;
                        }else if(Viewer.Decoder.DecodeLevel == "LEVEL1"){
                            let TmpGet = buffer[j]-Viewer.Offset
                            if(TmpGet<0){
                                TmpGet = buffer[j]+255-Viewer.Offset;
                            }
                            Dwavesurfer.backend.buffer.getChannelData(0)[i+j] = (2*TmpGet/255)-1;            
                        }else if(Viewer.Decoder.DecodeLevel == "LEVEL2"){
                            let TmpGet = buffer[j]-(Math.pow(-1,i%2)*(1/(i+1)))-Viewer.Offset;
                            if(TmpGet<0){
                                TmpGet = buffer[j]+255-(Math.pow(-1,i%2)*(1/(i+1)))-Viewer.Offset;
                            }else if(TmpGet>255){
                                TmpGet = buffer[j]-255-(Math.pow(-1,i%2)*(1/(i+1)))-Viewer.Offset;
                            }
                            Dwavesurfer.backend.buffer.getChannelData(0)[i+j] = (2*TmpGet/255)-1;
                        }else if(Viewer.Decoder.DecodeLevel == "LEVEL3"){
                            let TmpGet = buffer[j]-(Math.sin(i+j));
                            if(TmpGet<0){
                                TmpGet = buffer[j]+255-(Math.sin(i+j));
                            }else if(TmpGet>255){
                                TmpGet = buffer[j]-255-(Math.sin(i+j));
                            }
                            Dwavesurfer.backend.buffer.getChannelData(0)[i+j] = (2*TmpGet/255)-1;
                        }else if(Viewer.Decoder.DecodeLevel == "LEVEL4"){
                            let TmpGet = buffer[j]-(Math.cos(i+j));
                            if(TmpGet<0){
                                TmpGet = buffer[j]+255-(Math.cos(i+j));
                            }else if(TmpGet>255){
                                TmpGet = buffer[j]-255-(Math.cos(i+j));
                            }
                            Dwavesurfer.backend.buffer.getChannelData(0)[i+j] = (2*TmpGet/255)-1;
                        }else if(Viewer.Decoder.DecodeLevel == "LEVEL5"){
                            if((i+j+1)%4 == 0){
                                Dwavesurfer.backend.buffer.getChannelData(0)[(i+j+1)/4] = (2*buffer[j]/255)-1;
                            }
                        }else{
                            this.ErrorMessageBox("解碼設定處理錯誤");
                            return;
                        }
                    }

                    Dwavesurfer.drawBuffer();
                });
                    
              
            }

            DownCut=0;
            if(this.Decoder.HaveChannel2){
                try{
                    Dwavesurfer.backend.buffer.getChannelData(1);
                }catch (error) {
                    Dwavesurfer.destroy();
                    this.Decoder.IsLoadFile = false ;
                    this.Decoder.IsOutFile  = false  ;
                    this.ErrorMessageBox("解密錯誤 請等到音訊載入完成 再按下解密");
                    return;
                }
            }

            for(let i =0,v=0; i < FirstDo && this.Decoder.HaveChannel2; i+=1000000){
                fs.open(this.Decoder.FilePath, 'r', function(err, fd) {
                    if(err){
                        FileTest = false;
                        this.ErrorMessageBox("系統無法存取檔案");
                        return;
                    }
    
                    let buffer = Buffer.alloc(1000000, 'ascii');
    
                    fs.fstat(fd, function(err, stats) {
                        if(err){
                            FileTest = false;
                            Viewer.ErrorMessageBox("檔案開啟錯誤");
                            return;
                        }
                    });
                    
                    fs.readSync(fd, buffer, 0, SubCounter, 150+i+Viewer.Decoder.PointSum);

                    for(let j=0;j<SubCounter;j++){
                        if(Viewer.Decoder.DecodeLevel == "LEVEL0"){
                            Dwavesurfer.backend.buffer.getChannelData(1)[i+j] = (2*buffer[j]/255)-1;
                        }else if(Viewer.Decoder.DecodeLevel == "LEVEL1"){
                            let TmpGet = buffer[j]-Viewer.Offset
                            if(TmpGet<0){
                                TmpGet = buffer[j]+255-Viewer.Offset;
                            }
                            Dwavesurfer.backend.buffer.getChannelData(1)[i+j] = (2*TmpGet/255)-1;            
                        }else if(Viewer.Decoder.DecodeLevel == "LEVEL2"){
                            let TmpGet = buffer[j]-(Math.pow(-1,i%2)*(1/(i+1)))-Viewer.Offset;
                            if(TmpGet<0){
                                TmpGet = buffer[j]+255-(Math.pow(-1,i%2)*(1/(i+1)))-Viewer.Offset;
                            }else if(TmpGet>255){
                                TmpGet = buffer[j]-255-(Math.pow(-1,i%2)*(1/(i+1)))-Viewer.Offset;
                            }
                            Dwavesurfer.backend.buffer.getChannelData(1)[i+j] = (2*TmpGet/255)-1;
                        }else if(Viewer.Decoder.DecodeLevel == "LEVEL3"){
                            let TmpGet = buffer[j]-(Math.sin(i+j));
                            if(TmpGet<0){
                                TmpGet = buffer[j]+255-(Math.sin(i+j));
                            }else if(TmpGet>255){
                                TmpGet = buffer[j]-255-(Math.sin(i+j));
                            }
                            Dwavesurfer.backend.buffer.getChannelData(1)[i+j] = (2*TmpGet/255)-1;
                        }else if(Viewer.Decoder.DecodeLevel == "LEVEL4"){
                            let TmpGet = buffer[j]-(Math.cos(i+j));
                            if(TmpGet<0){
                                TmpGet = buffer[j]+255-(Math.cos(i+j));
                            }else if(TmpGet>255){
                                TmpGet = buffer[j]-255-(Math.cos(i+j));
                            }
                            Dwavesurfer.backend.buffer.getChannelData(1)[i+j] = (2*TmpGet/255)-1;
                        }else if(Viewer.Decoder.DecodeLevel == "LEVEL5"){
                            if((i+j+1)%4 == 0){
                                Dwavesurfer.backend.buffer.getChannelData(1)[(i+j+1)/4] = (2*buffer[j]/255)-1;
                            }
                        }else{
                            this.ErrorMessageBox("解碼設定處理錯誤");
                            return;
                        }
                        
                    }

                    Dwavesurfer.drawBuffer();
                });
            }

        },
        DecoderPlay:function DecoderPlay() {
            //FS.read & Load
            Dwavesurfer = WaveSurfer.create({
                container: '#Dwaveform',
                waveColor: 'violet',
                progressColor: 'purple'
            });
            Dwavesurfer.load(__dirname + '/.file/.tmp.wav');  
            Dwavesurfer.loaded = true;
            Dwavesurfer.isReady =true;
        },
        DownloadImg:function DownloadImg() {
            if(this.Encoder.IsOutFile){
                let NowDate = new Date()
                fs.copyFile(__dirname + '/.file/.tmp.bmp', __dirname + '/OutFile/Out'+NowDate.getFullYear() + '-' + (NowDate.getMonth()+1) + '-' + NowDate.getDate() + '-' + NowDate.getHours() + '-' + NowDate.getMinutes() + '-' + NowDate.getSeconds()+'.bmp', (err) => {
                    if (err){
                        this.ErrorMessageBox("下載錯誤");
                        return;
                    }
                    this.ErrorMessageBox("已匯出至OutFile資料夾中")
                });
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