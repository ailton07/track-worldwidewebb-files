# Track Worldwide Webb Files
A repository that tracks changes to Worldwide Webb files (JS, HTML, and txt).
The files tracked are:
- latest.txt
- index.html
- NewTokyoOnline.js
- zph_getInputValue.js
- uph_screen_save_dialog.js
- wph_djl.js
- xph_gms2_socket.io.js
- yph_socket.io.js
- aqh_moralis.js
- cqh_ethers-5.2.umd.min.js
- dqh_browserControl.js
- fqh_gmdevblogweblocalstorage.js

After downloading these files, we apply prettier.
You can find the files in a raw version in: `./raw_files` end the prettified files in `./pretty`.

## Running 

Before running:
```
npm install
```


To downloade the files and prettify, execute
```
./download-assets.sh
```


To manually prettify the files, execute
```
prettier --write "*.js"
```

## Contact me
If you want to contact me, ping @runkixt in [Worldwide Web3 Discord](https://discord.gg/E264HbzabD).
