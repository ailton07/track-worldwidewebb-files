#!/bin/bash
BASE_URL='https://alpha.webb.game/'


download_file () {
    # $1 is the URL to download
    CURRENT_URL="$1"
    DOWNLOADING_STR="Downloading ${CURRENT_URL}"
    echo $DOWNLOADING_STR
    HTTP_CODE=$(curl -O --write-out "%{http_code}\n" "${CURRENT_URL}" --silent)
    echo $HTTP_CODE
}

CURRENT_URL="${BASE_URL}latest.txt"
download_file $CURRENT_URL
echo

if ! [[ `git status --porcelain` ]]; then
  echo
  echo "No changes detected in latest.txt. Exiting..."
  exit 0
fi

# extract the BASE_BUILD
URL_WITH_BUILD_NUMBER=$(cat ./latest.txt)
URL_WITH_BUILD_NUMBER="${URL_WITH_BUILD_NUMBER//\/\/builds//builds}"
BASE_BUILD="${URL_WITH_BUILD_NUMBER//index.html/}"
BASE_ASSETS="${BASE_BUILD}html5game/"

BUILD=${BASE_BUILD:31} 
BUILD=${BUILD%?}


echo "BASE_URL=$BASE_URL"
echo "BASE_BUILD=$BASE_BUILD"
echo "BUILD=$BUILD"
echo "BASE_ASSETS=$BASE_ASSETS"
echo
echo

CURRENT_URL="${BASE_BUILD}index.html"
download_file $CURRENT_URL

CURRENT_URL="${BASE_ASSETS}NewTokyoOnline.js"
download_file $CURRENT_URL

CURRENT_URL="${BASE_ASSETS}zph_getInputValue.js"
download_file $CURRENT_URL

CURRENT_URL="${BASE_ASSETS}uph_screen_save_dialog.js"
download_file $CURRENT_URL

CURRENT_URL="${BASE_ASSETS}wph_djl.js"
download_file $CURRENT_URL

CURRENT_URL="${BASE_ASSETS}xph_gms2_socket.io.js"
download_file $CURRENT_URL

CURRENT_URL="${BASE_ASSETS}yph_socket.io.js"
download_file $CURRENT_URL

CURRENT_URL="${BASE_ASSETS}aqh_moralis.js"
download_file $CURRENT_URL

CURRENT_URL="${BASE_ASSETS}cqh_ethers-5.2.umd.min.js"
download_file $CURRENT_URL

CURRENT_URL="${BASE_ASSETS}dqh_browserControl.js"
download_file $CURRENT_URL

CURRENT_URL="${BASE_ASSETS}fqh_gmdevblogweblocalstorage.js"
download_file $CURRENT_URL

echo
echo
SAVE_RAW_FILES="cp *.js ./raw_files"
echo "Saving raw files: ${SAVE_RAW_FILES}"
${SAVE_RAW_FILES}


echo
echo
PRETTIER="npx prettier --write *.js"
echo "${PRETTIER}"
${PRETTIER}


MOVE_TO_PRETTY='mv *.js ./pretty && mv *.html ./pretty'
echo "Moving the pretiffied JSs: ${MOVE_TO_PRETTY}"
${MOVE_TO_PRETTY}


if ! [[ `git status --porcelain` ]]; then
  echo
  echo "No changes detected. Exiting..."
  exit 0
fi

MESSAGE="feat: new build $BUILD"
COMMIT="git add . && git commit -m $MESSAGE && git push"
echo ${COMMIT}
git add . 
git commit -m "$MESSAGE"
git push
