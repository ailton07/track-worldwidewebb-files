var playingAudio = null;
var playingAudioIsPlaying = false;

function audioPlay(src) {
  if (playingAudio) {
    if (playingAudio.src == src) {
      if (playingAudio.paused) {
        playingAudio.play();
      }
      return;
    }
    playingAudio.src = src;
  } else {
    playingAudio = new Audio(src);
  }

  playingAudio.crossOrigin = "anonymous";
  playingAudio.loop = true;

  playingAudio.addEventListener("waiting", () => {
    playingAudioIsPlaying = false;
  });

  playingAudio.addEventListener("playing", () => {
    playingAudioIsPlaying = true;
  });

  playingAudio.play().catch((err) => {
    console.error("Audio playback error", err);
    playingAudio = null;
  });
}

function audioPause() {
  if (playingAudio) playingAudio.pause();
}

function audioIsPlaying() {
  if (playingAudio && !playingAudio.paused && playingAudioIsPlaying) return 1;
  return 0;
}

function audioGetVolume() {
  if (playingAudio) return playingAudio.volume;
  return 0;
}

function audioSetVolume(volume) {
  if (playingAudio) playingAudio.volume = volume;
}

function checkNewGameRelease() {
  let timestamp = Math.floor(Date.now() / 1000);
  fetch(`/latest.txt?l=${timestamp}`)
    .then(function (response) {
      return response.text().then(function (url) {
        let loc = window.location;
        if (!loc.href.startsWith(url)) {
          console.log("Got new version", url);
          gml_Script_gmcallback_askToGotoNewGameRelease("", "", 0);
        }
      });
    })
    .catch(function (error) {
      console.error(error);
    });
}

function gotoNewGameRelease() {
  let timestamp = Math.floor(Date.now() / 1000);
  fetch(`/latest.txt?l=${timestamp}`, { cache: "no-store" })
    .then(function (response) {
      return response.text().then(function (url) {
        console.log("Going to new version", url);
        window.location.assign(url);
      });
    })
    .catch(function (error) {
      console.error(error);
    });
}
