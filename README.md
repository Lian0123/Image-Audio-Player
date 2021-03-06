# Image-Audio-Player
### 一個讓音訊檔能轉成加密的BMP影像，並且同時能解密BMP檔而播放加解密播放器
音訊轉圖片加解密工具


## 安裝
```
npm install
```

## 直接執行 
```
npm run start
```

## 直接執行(如果已有electron9的electron程式)
```
npm run start9
```

## 系統介紹

本系統為將音訊檔案透過簡單的加密方式，由音訊轉成BMP影像檔案。在此可以透過此BMP檔與此系統來還原成原始音訊並播放。

在此，內建了子Header讓解密程式能自動解密，也因為如此，實際上也只是讓不懂看二進位檔格式的人無法了解此BMP影像的意義，若真的要投入實際應用中實際上，子header設定應給加解密雙方進行協調，不宜出現在此的子header中。

而在解密BMP影像時，會依據BMP Header與子header來建立偽造的wav檔音訊，在此我們能借用偽造的wav檔音訊。是使用兩個hash來做為識別項，若該識別項錯誤，影像則無法解密。

## 使用的函式庫與框架
* 界面設計：TocasUI
* 桌面程式：electron.js
* 播放器：wavesurfer.js
* JS框架： Vue.js

## 常見問題
* 在Windows上的圖片預覽工具或小畫家不支援BMP格式而無法檢視產生的BMP圖片？

     請改嘗試用Chrome/firfox檢視 BMP圖片 或是使用krita、gimp、xviewer來檢視。

* 無法輸出檔案問題？

   請先檢查.file與OutFile兩個資料是否已建立於目錄底下，若是在UNIX與UNIX-Like系統中，請確保所在的資料夾與檔案的權限設置。

* 無法解密輸入的BMP檔？

  請檢查你是否是輸入本系統出的由音檔轉成的BMP檔，若是使用其他非本程式的BMP檔，在解密時的Key比較會出現錯誤，而解密失敗。
  
* 為什麼輸入的音檔無法正確播放與加密？

  本系統使用wavesurfer.js，一切輸入檔案類型皆同wavesurfer.js支援。如mid檔就不支援。

* 支援解密後的音檔輸出嗎？

  暫時支援，大多數音訊輸出都是採用錄製方式，由於做起來有點麻煩，所以不支援。
  
