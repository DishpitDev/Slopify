var tag = document.createElement("script");
tag.src = "//www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName("script")[ 0 ];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player,
    container = document.querySelector('.player'),
    progress_bar = document.querySelector('.progress-bar input'),
    sound_button = document.querySelector('.sound-button'),
    sound_bar = document.querySelector('.sound-bar input'),
    noise = document.querySelector('.noise'),
    progress_timer,
    progressDrag = false,
    soundDrag = false,
    isClicking = false,
    click_timer;

function onYouTubePlayerAPIReady() {
    player = new YT.Player("video", {
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    var playButton = document.querySelector('.player .buttons .play');
    playButton.addEventListener("click", function () {
        player.playVideo();
    });
    var pauseButton = document.querySelector('.player .buttons .pause');
    pauseButton.addEventListener("click", function () {
        player.pauseVideo();
    });
    var stopButton = document.querySelector('.player .buttons .stop');
    stopButton.addEventListener("click", function () {
        player.stopVideo();
    });

    player.setVolume(100);
    sound_bar.value = 100;
    progress_bar.addEventListener('mousedown', function (e) {
        progressDrag = true;
    });
    progress_bar.addEventListener('mousedown', function (e) {
        progressDrag = true;
    });
    document.addEventListener('mouseup', function (e) {
        if (progressDrag) {
            setProgress(e);
            progressDrag = false;
        }
        if (soundDrag) {
            soundDrag = false;
            setVolume(e);
        }
    });
    document.addEventListener('mousemove', function (e) {
        if (progressDrag) {
            setProgress(e);
        }
        if (soundDrag) {
            setVolume(e);
        }
    });
    progress_bar.addEventListener('click', updateProgress);

    sound_button.addEventListener('click', toggleMute);

    sound_bar.addEventListener('mousedown', function (e) {
        soundDrag = true;
    });
    sound_bar.addEventListener('click', setVolume);

    launch_progress_timer();
}

function statusWatch(playerStatus) {
    if (playerStatus == -1) {
        container.dataset.status = 'unstarted';
    } else if (playerStatus == 0) {
        player.stopVideo();
        container.dataset.status = 'unstarted';
    } else if (playerStatus == 1) {
        container.dataset.status = 'playing';
    } else if (playerStatus == 2) {
        container.dataset.status = 'paused';
    } else if (playerStatus == 3) {
        container.dataset.status = 'buffering';
    } else if (playerStatus == 5) {
        container.dataset.status = 'cued';
    }
}
function onPlayerStateChange(event) {
    statusWatch(event.data);
}

function launch_progress_timer() {
    clearInterval(progress_timer);
    progress_timer = setInterval(updateProgress, 500);
}
function updateProgress() {
    var notZero = player.getDuration();
    var percentage = 0;
    if (notZero != 0) {
        percentage = Math.floor((100 / player.getDuration()) * player.getCurrentTime());
    }
    progress_bar.value = percentage;
}

function setProgress(e) {
    var offsetLeft = progress_bar.getBoundingClientRect().left;
    var position = e.pageX - offsetLeft;
    var percentage = 100 * position / progress_bar.clientWidth;

    if (percentage > 100) {
        percentage = 100;
    }
    if (percentage < 0) {
        percentage = 0;
    }

    var newTime = player.getDuration() * percentage / 100;
    player.seekTo(newTime);
}

function launch_click_timer() {
    isClicking = true;
    clearTimeout(click_timer);
    click_timer = setTimeout(function () {
        isClicking = false;
    }, 50);
}

function toggleMute(e) {
    launch_click_timer();
    if (player.isMuted()) {
        player.unMute();
        sound_button.classList.remove("mute");
        updateVolume_controls(player.getVolume());
    } else {
        player.mute();
        sound_button.classList.add("mute");
        updateVolume_controls(0);
    }
}

function setVolume(e) {
    var offsetLeft = sound_bar.getBoundingClientRect().left;
    var position = e.pageX - offsetLeft;
    var volume = position / sound_bar.clientWidth * 100;

    if (volume < 10) {
        volume = 0;
    }
    if (player.isMuted()) {
        player.unMute();
        sound_button.classList.remove("mute");
    }

    player.setVolume(volume);
    updateVolume_controls(volume);
}

function updateVolume_controls(volume) {
    if (volume == 0) {
        sound_button.classList.add("mute");
    } else {
        sound_button.classList.remove("mute");
    }
    sound_bar.value = volume;
}