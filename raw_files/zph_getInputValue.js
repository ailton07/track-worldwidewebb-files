

function getMoralisUserToken(appId) {
	try {
		return JSON.parse(window.localStorage.getItem(`Parse/${appId}/currentUser`)).sessionToken;
	} catch (error) {
		console.log(error)
		return "";
	}
}

const connectWallet = (appId) => {
  Moralis.authenticate().then((user) => {
    getEnsName(user.get('ethAddress'))
     	.then( (ensName) => {
        if(ensName) {
          gml_Script_gmcallback_returnAddress("","",user.get('ethAddress'), ensName)
				} else {
					gml_Script_gmcallback_returnAddress("","",user.get('ethAddress'),"")
				}
				let token = getMoralisUserToken(appId);
				console.log("token", token)
				gml_Script_gmcallback_getSessionToken("", "", token);
     	}).catch(error => console.log(error))
  }).catch(error => {
      if(error.code === 4001) {
          console.log('user rejected authentication')
      } else {
          console.log(error)
      }
  })
}

const listWhitelist = () => {
	Moralis.Cloud.run("listWhitelist").then((result) => {
		console.log(result)
		
		function getList(whitelisted) {
			return result.filter(r => r.whitelisted == whitelisted).map(wl => wl.ens ? wl.ens : wl.ethAddress.substring(0,20)+"...")
		}
		
		let whitelist = getList(true)
		let raffle = getList(false)
		
		console.log("whitelist", whitelist)
		console.log("raffle", raffle)
		gml_Script_gmcallback_returnWhitelist("","",JSON.stringify(whitelist),"")
		gml_Script_gmcallback_returnRaffleList("","",JSON.stringify(raffle),"")
	}).catch(error => {
		console.log(error)
		gml_Script_gmcallback_returnWhitelist("","",-1,"")
	})
}

const getWhitelistWinners = () => {
	Moralis.Cloud.run("getWhitelistWinners").then((result) => {
		console.log(result)
		
		function getList() {
			return result.map(wl => wl.ens ? wl.ens : wl.ethAddress.substring(0,20)+"...")
		}
		
		let whitelist = getList(true)
		console.log("whitelist", whitelist)
		gml_Script_gmcallback_returnWhitelist("","",JSON.stringify(whitelist),"")
	}).catch(error => {
		console.log(error)
		gml_Script_gmcallback_returnWhitelist("","",-1,"")
	})
}

const getWhitelistResult = async(eventId) => {
	try {
		const params = {
			whitelistEventId: eventId
		};
		const response = await Moralis.Cloud.run("getWhitelistResult", params);
		console.log(response);
		gml_Script_gmcallback_returnWhitelistResult("", "", eventId, response.slice(0, 8));
	} catch (error) {
		console.error(error);
	}
}

const getUserAavegotchis = async(address) => {
	const user = Moralis.User.current();
	if (user) {
		//let address = user.get('ethAddress')
		let r = await Moralis.Cloud.run("userGotchis",{"userAddress":address})
		for(let i=0;i<min(100,r.length);i++) {
			let GotchiID = r[i][0]
			getAavegotchiInventory(GotchiID)
		}
	}
}

function removeGotchiBG(svg) {
	
	function removeElementsByClass(className){
    const elements = doc.getElementsByClassName(className);
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
	}
	
	let doc = (new DOMParser()).parseFromString(svg, "image/svg+xml");
	removeElementsByClass("gotchi-bg")
	removeElementsByClass("wearable-bg")
	let data = (new XMLSerializer()).serializeToString(doc);
	return data
}

const getAavegotchi = async(id, player) => {
		let gotchiSVG = await Moralis.Cloud.run("getGotchiSVG",{"tokenId":id})
		if (gotchiSVG == "") {
			return
		}
		let callback = player ? gml_Script_gmcallback_returnGotchiSprite : gml_Script_gmcallback_returnGotchiSpriteUser
		
		let down = await convertSVG(removeGotchiBG(gotchiSVG[0]))
		let left = await convertSVG(removeGotchiBG(gotchiSVG[1]))
		let right = await convertSVG(removeGotchiBG(gotchiSVG[2]))
		let up = await convertSVG(removeGotchiBG(gotchiSVG[3]))
		
		data = {
			id: id,
			down: down,
			left: left,
			right: right,
			up: up
		}

		callback("","",JSON.stringify(data))
}

const getAavegotchiInventory = async(id) => {
		let spr
		try {
			let gotchiSVG = await Moralis.Cloud.run("getGotchiSVG",{"tokenId":id})
			spr = await convertSVG(removeGotchiBG(gotchiSVG[0]))
		} catch(error) {
			console.log(error)
			return
		}
		
		data = {
			id: id,
			spr: spr
		}
		
		gml_Script_gmcallback_returnGotchiInventory("","",JSON.stringify(data))
}

const getUserSmolBrains = async() => {
	const user = Moralis.User.current();
	if (user) {
		let address = user.get('ethAddress')
		let data = await Moralis.Cloud.run("userSmolBrains",{"userAddress":address})
		//console.log(data)
		gml_Script_gmcallback_returnSmolBrains("","",JSON.stringify(data))
	}
}

const getUserCryptoPhunks = async() => {
	const user = Moralis.User.current();
	if (user) {
		//let address = user.get('ethAddress')
		let address = "0x4e68bf412a8720a04fdd9daae38188e50ba60e29"
		let data = await Moralis.Cloud.run("userCryptoPhunks",{"userAddress":address})
		//console.log(data)
		gml_Script_gmcallback_returnCryptoPhunks("","",JSON.stringify(data))
	}
}

const sendCenMessage = async(msg, name) => {
	const user = Moralis.User.current();
	let _user = name
	let data = await Moralis.Cloud.run("sendCenMessage",{"username":_user, "message":msg})
}

const convertSVG = async(data) => {
	let canvas = document.createElement('canvas');
	let ctx = canvas.getContext('2d');
	let DOMURL = window.URL || window.webkitURL || window;
	let img = new Image();
	let svgBlob = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
	let url = DOMURL.createObjectURL(svgBlob);

	img.src = url;
	await img.decode()
	ctx.drawImage(img, 0, 0);
	DOMURL.revokeObjectURL(url);
	let imgURI = canvas.toDataURL('image/png')
	return imgURI
}

const lolyouhackedtheconsolebro = () => {
	Moralis.authenticate().then((user) => {
		console.log(user)
    Moralis.Cloud.run("joinWhitelist").then((result) => {
			console.log(result)
		}).catch(error => {
			console.log(error)
		})
	})
}

const forcedWLJ = () => {
	Moralis.authenticate().then((user) => {
		console.log(user)
    Moralis.Cloud.run("joinWhitelistForced").then((result) => {
			gml_Script_gmcallback_checkWhitelisted("","",true)
		}).catch(error => {
			console.log(error)
		})
	})
}

const getEnsName = async (address) => {
  try {
   const provider = new ethers.providers.Web3Provider(window.ethereum)
   const ensName = await provider.lookupAddress(address);
   if(ensName) {
     return ensName
   }
   return ""
  } catch (error) {
    return ""
  }
 }

const initMoralis = (serverUrl, appId) => {
	Moralis.start({ serverUrl, appId });  
	const user = Moralis.User.current();
	if (user) {
		getEnsName(user.get('ethAddress'))
			.then( (ensName) => {
				if(ensName) {
					gml_Script_gmcallback_returnAddress("","",user.get('ethAddress'), ensName)
				} else {
					gml_Script_gmcallback_returnAddress("","",user.get('ethAddress'),"")
				}
				let token = getMoralisUserToken(appId);
				gml_Script_gmcallback_getSessionToken("", "", token);
			})
			.catch(error => console.log(error))
	}
}

const getWhitelistStatus = () => {

	function getStatus(user) {
		Moralis.Cloud.run("checkWhitelist").then((result) => {
			console.log(result)
			gml_Script_gmcallback_checkWhitelisted("","",result)
		}).catch(error => {
			console.log(error)
		})
	}
	
	const user = Moralis.User.current();
	
	if (user) {
		getStatus(user)
	} else {
		Moralis.authenticate().then((_user) => {
			getStatus(_user)
		}).catch(error => {
			console.log(error)
		})
	}
}

const getWhitelistStatus2 = () => {

	function getStatus(user) {
		Moralis.Cloud.run("checkWhitelist2").then((result) => {
			console.log(result)
			gml_Script_gmcallback_checkWhitelisted2("","",result)
		}).catch(error => {
			console.log(error)
		})
	}
	
	const user = Moralis.User.current();
	
	if (user) {
		getStatus(user)
	} else {
		Moralis.authenticate().then((_user) => {
			getStatus(_user)
		}).catch(error => {
			console.log(error)
		})
	}
}

const littlesChristmasPartyAttendance = () => {
	function littlesAttend(user) {
		Moralis.Cloud.run("littlesChristmasPartyAttendee").then((result) => {
			console.log("attended")
		}).catch(error => {
			console.log(error)
		})
	}
	
	const user = Moralis.User.current();
	
	if (user) {
		littlesAttend(user)
	} else {
		Moralis.authenticate().then((_user) => {
			littlesAttend(user)
		}).catch(error => {
			console.log(error)
		})
	}
}


const getHighscore = () => {

	function getScore(user) {
		Moralis.Cloud.run("getUserGameHighscore", {gameId:"hgjz4gYeZzoyKrx9B83dzCiS"}).then((result) => {
			console.log("my score",result)
			gml_Script_gmcallback_getMyScore("","",result)
		}).catch(error => {
			console.log(error)
		})
	}
	
	const user = Moralis.User.current();
	
	if (user) {
		getScore(user)
	} else {
		Moralis.authenticate().then((_user) => {
			getScore(_user)
		}).catch(error => {
			console.log(error)
		})
	}
}

const getTopHighscores = () => {
	function getTopScores(user) {
		Moralis.Cloud.run("getGameHighscores", {gameId:"hgjz4gYeZzoyKrx9B83dzCiS"}).then((result) => {
			console.log(result)
			gml_Script_gmcallback_getHighscores("","",JSON.stringify(result))
		}).catch(error => {
			console.log(error)
		})
	}
	
	const user = Moralis.User.current();
	
	if (user) {
		getTopScores(user)
	} else {
		Moralis.authenticate().then((_user) => {
			getTopScores(_user)
		}).catch(error => {
			console.log(error)
		})
	}
}


const submitHighscore = (score) => {

	function submitScore(user, score) {
		Moralis.Cloud.run("submitGameHighscore", {score: score, gameId: "hgjz4gYeZzoyKrx9B83dzCiS"}).then((result) => {
			console.log(result)
		}).catch(error => {
			console.log(error)
		})
	}
	
	const user = Moralis.User.current();
	
	if (user) {
		submitScore(user, score)
	} else {
		Moralis.authenticate().then((_user) => {
			submitScore(_user, score)
		}).catch(error => {
			console.log(error)
		})
	}
}


const checkMetaLogin = (serverUrl, appId) => {
  Moralis.start({ serverUrl, appId });  
	const user = Moralis.User.current();
	if (user) {
		const userAddress = user.get("ethAddress");
		const username = user.attributes.username;
		console.log(user.attributes)
		gml_Script_gmcallback_returnUser("","",user.attributes.username)
		let token = getMoralisUserToken(appId);
		gml_Script_gmcallback_getSessionToken("", "", token);
	}
}

const getETHAddress = () => {
  return window.ethereum.selectedAddress
}

const getETHBalance = async (address) => {
  const balanceInWei = await web3.eth.getBalance(address)
  return web3.utils.fromWei(balanceInWei, "ether")
}

const getGasPrice = async () => {
  const gasInWei = await web3.eth.getGasPrice()
  return web3.utils.fromWei(gasInWei, "ether")
}

function usernameValue() {
  return document.getElementById("userNameBox").value.toLowerCase()
}

document.getElementById("enterBtn").addEventListener("click", function () {
  var d = document.getElementById("userNameBox")
  if (d.value !== null) {
    gml_Script_gmcallback_input_capture()
  }
})

function hide_ig_box() {
  var e = document.getElementById("userNameEntry")
  var d = document.getElementById("userNameBox")
  e.style.display = "none"
}

function show_ig_box() {
  var e = document.getElementById("userNameEntry")
  var d = document.getElementById("userNameBox")
  e.style.display = "inline"
}

function playVid(id, controls) {
  var source = document.getElementById("source")
  var vid = document.getElementById("youtubevideo")
  vid.src = id
  vid.load()
  var vidbox = document.getElementById("youtubevideobox")
  vid.style.display = "block"
  if (controls == 1) {
    vidbox.style.zIndex = "1000"
    vid.controls = "true"
  } else {
    vidbox.style.zIndex = "1000"
    vid.controls = "false"
  }

  vidbox.style.visibility = "block"
  vidbox.style.display = "block"

  vid.play()

  //vid.muted = !vid.muted;
}

function unmute() {
  var vid = document.getElementById("youtubevideo")
  vid.muted = !vid.muted
}

function stopVid() {
  var vid = document.getElementById("youtubevideo")
  var vidbox = document.getElementById("youtubevideobox")
  vid.style.display = "none"
  vidbox.style.zIndex = "-1000"
  vidbox.style.visibility = "none"
  vidbox.style.display = "none"
  vid.pause()
  //vid.muted = "false";
  vid.controls = "false"
}
