var sound;var wavesurfer,Dwavesurfer,ee;var aaaa;
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
                        { text: '弦波解密',    value: 'LEVEL3' }
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
            ee.backend.buffer = wavesurfer.backend.buffer;
            /*
            var arr =[];for(let i=0;i<wavesurfer.backend.buffer.length;i++){arr.push(1);}
            wavesurfer.backend.buffer.getChannelData(0).set(arr);
            */
            ee.drawBuffer();
            ee.loaded = true;
            ee.isReady =true;
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
            let Key        = [] ,
                Key2       = [] ;
            
            let ImageSize ;

            let FileSize   = ['\x00','\x00','\x00','\x00'],
                FileWeight  = ['\x00','\x00','\x00','\x00'];

            this.Decoder.IsLoadFile = false ;
            this.Decoder.IsOutFile  = false ;
            this.Encoder.IsOutFile  = true  ;
            
            //Get WaveSurfer Audio Header
            let FileHeader;
            //this.Encoder.HeaderNode.push(wavesurfer.backend.buffer.length);
            //this.Encoder.HeaderNode.push(wavesurfer.backend.buffer.duration);
            //this.Encoder.HeaderNode.push(wavesurfer.backend.buffer.numberOfChannels);
            //this.Encoder.HeaderNode.push(wavesurfer.backend.buffer.sampleRate);

            //Write

            //圖片寬度 Need odd will Cut add 0
            if(this.Encoder.EncodeLevel == "LEVEL5")
                ImageSize = "" + (Math.ceil(Math.sqrt(wavesurfer.backend.buffer.length*wavesurfer.backend.buffer.numberOfChannels))).toString(16);
            else
                ImageSize = "" + (Math.ceil(Math.sqrt(wavesurfer.backend.buffer.length*wavesurfer.backend.buffer.numberOfChannels/4))).toString(16);

            if(ImageSize.length%2 > 0 && ImageSize.length <9){
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
                }
            }
            
            console.log(ImageSize)    
            //???
            for (let i = 0,n=0; n < ImageSize.length; i++,n+=2) {
                //FileWeight[i] = String.fromCharCode(parseInt(ImageSize[n-1]+ImageSize[n-2], 16));
                let TmpStr =ImageSize[i+1]+ImageSize[i];
                console.log(TmpStr);
                console.log(parseInt(ImageSize[i+1]+ImageSize[i], 16));
                FileWeight[i] = String.fromCharCode(parseInt(ImageSize.charAt(i+1)+ImageSize.charAt(i), 16));
            }
            aaaa =FileWeight;
            console.log(FileWeight);
            this.Encoder.HeaderNode = "\x42\x4D"+FileSize[0]+FileSize[1]+FileSize[2]+FileSize[3]+"\x00\x00\x00\x00\x36\x00\x00\x00\x28\x00\x00\x00"+FileWeight[0]+FileWeight[1]+FileWeight[2]+FileWeight[3]+FileWeight[0]+FileWeight[1]+FileWeight[2]+FileWeight[3]+"\x01\x00\x20\x00\x00\x00\x00\x00\xE1\x00\x00\xC4\x0E\x00\x00\xC4\x0E\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00"
            
            fs.writeFile(__dirname + '/.file/.tmp.bmp',this.Encoder.HeaderNode,{encoding: 'ascii',flag:'w'}, (error) => {
                if (error) throw error;
            });
            /*
            var WriteFile = fs.createWriteStream(fileName, {
                encoding: 'ascii',
              });
              WriteFile.write(this.Encoder.HeaderNode);
              WriteFile.end();
*/
            //正規->[0~1]->[0~255]
            //push->AudioArray
            /*
            for(let i=0;i<wavesurfer.backend.buffer.length;i++){
                this.Encoder.AudioData+=(Math.ceil(255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)).toString(16);
            }
            */

            if(this.Encoder.EncodeLevel == "LEVEL0"){
                //無加密
                key = sha256.array("0.41877603947095854");
                for(let i=0;i<wavesurfer.backend.buffer.length;i++){
                    this.Encoder.AudioData+=(Math.ceil(255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)).toString(16);
                }
            }else if (this.Encoder.EncodeLevel == "LEVEL1"){
                //線性位移加密
                key = sha256.array("0.36310229221374724");
                for(let i=0;i<wavesurfer.backend.buffer.length;i++){
                    this.Encoder.AudioData+=(Math.ceil(47+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)).toString(16);
                }
            }else if (this.Encoder.EncodeLevel == "LEVEL2"){
                //交錯級數加密
                key = sha256.array("0.2494377482367558");
                for(let i=0;i<wavesurfer.backend.buffer.length;i++){
                    this.Encoder.AudioData+=(Math.ceil(Math.pow(-1,i%2)*0.48354512*i+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)).toString(16);
                }
            }else if (this.Encoder.EncodeLevel == "LEVEL3"){
                //弦波加密sin
                key = sha256.array("0.8556336438849041");
                for(let i=0;i<wavesurfer.backend.buffer.length;i++){
                    this.Encoder.AudioData+=(Math.ceil(Math.sin(i)+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)).toString(16);
                }
            }else if (this.Encoder.EncodeLevel == "LEVEL4"){
                //弦波加密cos
                key = sha256.array("0.12240691495231171");
                for(let i=0;i<wavesurfer.backend.buffer.length;i++){
                    this.Encoder.AudioData+=(Math.ceil(Math.cos(i)+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)).toString(16);
                }
            }else if (this.Encoder.EncodeLevel == "LEVEL5"){
                //亂數加密
                key = sha256.array("0.3035754752099231");
                for(let i=0;i<wavesurfer.backend.buffer.length;i++){
                    if(i%4 == 0)
                        this.Encoder.AudioData+=(Math.ceil(255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)).toString(16);
                    else
                        this.Encoder.AudioData+=(Math.floor(Math.random()*255)).toString(16);
                }
            }else{
                //無加密
                key = sha256("0.41877603947095854");
                for(let i=0;i<wavesurfer.backend.buffer.length;i++){
                    this.Encoder.AudioData+=(Math.ceil(255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)).toString(16);
                }
            }


            Key2 = sha256(key);
            /// Key + Header + Key2
            //Write Channl0 Data
            fs.writeFile(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{flag:'a+'}, (error) => {
                if (error) throw error;
            });

            //Clear Tmp Data
            this.Encoder.AudioData = "";

            if(wavesurfer.backend.buffer.numberOfChannels >1){
                if(this.Encoder.EncodeLevel == "LEVEL0"){
                    //無加密
                    key = sha256.array("0.41877603947095854");
                    for(let i=0;i<wavesurfer.backend.buffer.length;i++){
                        this.Encoder.AudioData+=(Math.ceil(255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)).toString(16);
                    }
                }else if (this.Encoder.EncodeLevel == "LEVEL1"){
                    //線性位移加密
                    key = sha256.array("0.36310229221374724");
                    for(let i=0;i<wavesurfer.backend.buffer.length;i++){
                        this.Encoder.AudioData+=((Math.ceil(128+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2))%255).toString(16);
                    }
                }else if (this.Encoder.EncodeLevel == "LEVEL2"){
                    //交錯級數加密
                    key = sha256.array("0.2494377482367558");
                    for(let i=0;i<wavesurfer.backend.buffer.length;i++){
                        this.Encoder.AudioData+=(Math.ceil(Math.pow(-1,i%2)*0.48354512*i+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)).toString(16);
                    }
                    console.log("IsWork")
                                    
                }else if (this.Encoder.EncodeLevel == "LEVEL3"){
                    //弦波加密sin
                    key = sha256.array("0.8556336438849041");
                    for(let i=0;i<wavesurfer.backend.buffer.length;i++){
                        this.Encoder.AudioData+=(Math.ceil(Math.sin(i)+255*(wavesurfer.backend.buffer.getChannelData(0)[i]+1)/2)).toString(16);
                    }
                }else if (this.Encoder.EncodeLevel == "LEVEL4"){
                    //弦波加密cos
                    for(let j=0;j<wavesurfer.backend.buffer.length;j++){
                        this.Encoder.AudioData+=(Math.ceil(Math.cos(i)+255*(wavesurfer.backend.buffer.getChannelData(1)[j]+1)/2)).toString(16);
                    }
                }else if (this.Encoder.EncodeLevel == "LEVEL5"){
                    //亂數加密
                    for(let j=0;j<wavesurfer.backend.buffer.length;j++){
                        if(j%4 == 0)
                            this.Encoder.AudioData+=(Math.ceil(255*(wavesurfer.backend.buffer.getChannelData(1)[j]+1)/2)).toString(16);
                        else
                            this.Encoder.AudioData+=(Math.floor(Math.random()*255)).toString(16);
                    }
                }else{
                    //無加密
                    for(let j=0;j<wavesurfer.backend.buffer.length;j++){
                        this.Encoder.AudioData+=(Math.ceil(255*(wavesurfer.backend.buffer.getChannelData(1)[j]+1)/2)).toString(16);
                    }
                    console.log("UWork")
                }
    
    
                fs.writeFile(__dirname + '/.file/.tmp.bmp',this.Encoder.AudioData,{flag:'a+'}, (error) => {
                    if (error) throw error;
                });
            }
       
            //push hash(key),  channelSum , 2hash(key),  imgs
            //Psuh ImgArray -> Out File

            this.Encoder.HeaderNode = "";
            this.Encoder.AudioData = "";

            this.Encoder.ImageData = './.file/.tmp.bmp';
        },

        StartDecode: function StartDecode() {
            let Key        = [] ,
                Key2       = [] ;
            
            let Channel1 = [],
                Channel2 = [];

            this.Encoder.IsLoadFile = false ;
            this.Encoder.IsOutFile  = false ;
            this.Decoder.IsOutFile  = true  ;
            
            if(this.Decoder.DecodeLevel == "LEVEL0" && key == [93, 223, 154, 134, 6, 49, 56, 207, 131, 76, 119, 180, 144, 247, 179, 87, 41, 252, 68, 241, 115, 173, 52, 8, 24, 110, 84, 204, 253, 222, 101, 33]){
                //無解密
                //Check Header...
                    //if channel<2 , let channel2 = []
                //Push Channel1
                //Push Channel2
                for(let i=0;i<Dwavesurfer.backend.buffer.length;i++){
                    Dwavesurfer.backend.buffer.getChannelData(0)[i] = Channel1[i]/255;
                }

                //當Channel2存在
                if(!isNaN(Channel2[j])){
                    for(let j=0;j<Dwavesurfer.backend.buffer.length;j++){
                        Dwavesurfer.backend.buffer.getChannelData(0)[j] = Channel2[j]/255;
                    }
                }
            }else if (this.Decoder.DecodeLevel == "LEVEL1" && key == [176, 203, 190, 183, 244, 187, 199, 247, 64, 214, 10, 145, 161, 169, 13, 145, 145, 78, 212, 179, 27, 38, 59, 210, 151, 104, 57, 237, 197, 236, 139, 20]){
                //線性位移解密
                //Check Header...
                    //if channel<2 , let channel2 = []
                //Push Channel1
                //Push Channel2
                for(let i=0;i<Dwavesurfer.backend.buffer.length;i++){
                    if(Channel1[i]<47){
                        Channel1+=255;
                    }
                    Dwavesurfer.backend.buffer.getChannelData(0)[i] = (Channel1[i]-47)/255;
                }

                //當Channel2存在
                if(!isNaN(Channel2[j])){
                    for(let j=0;j<Dwavesurfer.backend.buffer.length;j++){
                        if(Channel2[j]<47){
                            Channel2+=255;
                        }
                        Dwavesurfer.backend.buffer.getChannelData(0)[j] = (Channel2[j]-47)/255;
                    }
                }
            }else if (this.Decoder.DecodeLevel == "LEVEL2" && key == [75, 95, 252, 42, 46, 81, 254, 191, 114, 229, 11, 175, 215, 6, 185, 98, 4, 250, 190, 162, 10, 87, 133, 89, 187, 214, 33, 144, 113, 70, 33, 95]){
                //交錯級數解密
                //Check Header...
                    //if channel<2 , let channel2 = []
                //Push Channel1
                //Push Channel2
                for(let i=0;i<Dwavesurfer.backend.buffer.length;i++){
                    let DeCodeKey = Math.pow(-1,i%2)*0.48354512*i;
                    if(Channel1[i]<DeCodeKey){
                        Channel1+=255;
                    }
                    Dwavesurfer.backend.buffer.getChannelData(0)[i] = (Channel1[i]-DeCodeKey)/255;
                }

                //當Channel2存在
                if(!isNaN(Channel2[0])){
                    for(let j=0;j<Dwavesurfer.backend.buffer.length;j++){
                        let DeCodeKey = Math.pow(-1,j%2)*0.48354512*j;
                        if(Channel2[j]<DeCodeKey){
                            Channel2+=255;
                        }
                        Dwavesurfer.backend.buffer.getChannelData(0)[j] = (Channel2[i]-DeCodeKey)/255;
                    }
                }
            }else if (this.Decoder.DecodeLevel == "LEVEL3" && key == [106, 88, 127, 160, 6, 50, 43, 132, 152, 97, 111, 76, 120, 248, 98, 138, 136, 172, 106, 122, 191, 80, 24, 109, 112, 84, 67, 227, 12, 134, 57, 42]){
                //弦波解密sin
                //Check Header...
                    //if channel<2 , let channel2 = []
                //Push Channel1
                //Push Channel2
                for(let i=0;i<Dwavesurfer.backend.buffer.length;i++){
                    let DeCodeKey = Math.sin(i);
                    if(Channel1[i]<DeCodeKey){
                        Channel1+=255;
                    }
                    Dwavesurfer.backend.buffer.getChannelData(0)[i] = (Channel1[i]-DeCodeKey)/255;
                }

                //當Channel2存在
                if(!isNaN(Channel2[0])){
                    for(let j=0;j<Dwavesurfer.backend.buffer.length;j++){
                        let DeCodeKey = Math.sin(j);
                        if(Channel2[j]<DeCodeKey){
                            Channel2+=255;
                        }
                        Dwavesurfer.backend.buffer.getChannelData(0)[j] = (Channel2[i]-DeCodeKey)/255;
                    }
                }
            }else if (this.Decoder.DecodeLevel == "LEVEL4" && key == [38, 202, 20, 136, 255, 96, 38, 107, 248, 251, 222, 172, 219, 72, 39, 156, 241, 172, 8, 192, 41, 71, 203, 119, 160, 202, 196, 192, 126, 178, 92, 131]){
                //弦波解密cos
                //Check Header...
                    //if channel<2 , let channel2 = []
                //Push Channel1
                //Push Channel2
                for(let i=0;i<Dwavesurfer.backend.buffer.length;i++){
                    let DeCodeKey = Math.cos(i);
                    if(Channel1[i]<DeCodeKey){
                        Channel1+=255;
                    }
                    Dwavesurfer.backend.buffer.getChannelData(0)[i] = (Channel1[i]-DeCodeKey)/255;
                }

                //當Channel2存在
                if(!isNaN(Channel2[0])){
                    for(let j=0;j<Dwavesurfer.backend.buffer.length;j++){
                        let DeCodeKey = Math.cos(j);
                        if(Channel2[j]<DeCodeKey){
                            Channel2+=255;
                        }
                        Dwavesurfer.backend.buffer.getChannelData(0)[j] = (Channel2[i]-DeCodeKey)/255;
                    }
                }
            }else{
                //無解密
                Viewer.ErrorMessageBox("檔案解密錯誤");
            }
                
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