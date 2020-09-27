function parseMetadata() {
    metadata.discs.forEach(disc => {
        let tracks = disc.tracks.sort((a, b) => {
            if (a.path < b.path) {
                return -1
            }
        })
        let tableElement = document.getElementById("metadata-div")
        tracks.forEach(track => {
            trackTrElement = addTrack(track)
            tableElement.appendChild(trackTrElement)
        })
        document.getElementById("album-name").value = tracks[0].album
    })
}

function addTrack(track) {
    let wholeElement = document.createElement("div");
    let uniq_id = "_" + track.disc.replace(/^(0)*/, "") + "_" + track.track.replace(/^(0)*/, "") // idをユニークにするため
    wholeElement.id = uniq_id
    wholeElement.classList.add("columns")

    let trackDivElement = document.createElement("div");
    trackDivElement.classList.add("column")
    trackDivElement.classList.add("is-1")
    let trackInputElement = createInputElement("track"+uniq_id, track.track)
    trackDivElement.appendChild(trackInputElement)
    wholeElement.appendChild(trackDivElement)

    let titleDivElement = document.createElement("div");
    titleDivElement.classList.add("column")
    titleDivElement.classList.add("is-4")
    let titleInputElement = createInputElement("title"+uniq_id, track.title)
    titleDivElement.appendChild(titleInputElement)
    wholeElement.appendChild(titleDivElement)

    let artistDivElement = document.createElement("div");
    artistDivElement.classList.add("column")
    artistDivElement.classList.add("is-5")
    let artistInputElement = createInputElement("artist"+uniq_id, track.artist)
    artistDivElement.appendChild(artistInputElement)
    wholeElement.appendChild(artistDivElement)

    let pathDivElement = document.createElement("div");
    pathDivElement.classList.add("column")
    pathDivElement.classList.add("is-2")
    let pathInputElement = createInputElement("path"+uniq_id, track.path)
    pathInputElement.readOnly = true
    pathDivElement.appendChild(pathInputElement)
    wholeElement.appendChild(pathDivElement)

    return wholeElement
}

function createInputElement(id, value) {
    let inputElement = document.createElement("input")
    inputElement.setAttribute("type", "text")
    inputElement.setAttribute("id", id)
    inputElement.classList.add("input")
    inputElement.value = !value? "" : value
    return inputElement
}

function sendMetadataJSON() {
    let req = new XMLHttpRequest()
    req.onload = function (e) {
        if (req.readyState === 4) {
            if (req.status === 200) {
                res = JSON.parse(req.responseText)
                if (res.code === 200) {
                    href = "/" + res.message
                    zipFileName = res.message.split("/")[res.message.split("/").length-1]
                    message = "<a href=\"" + href + "\">" + zipFileName + "</a>"
                    openModal("Success", message, false)
                } else {
                    openModal("Failed", res.message, true)
                }
            } else {
                console.error(req.statusText);
            }
        }
    }
    req.open("POST", "/convert", true)
    req.send(JSON.stringify(generateMetadataJSON()))
    document.getElementById("progress-modal").classList.add("is-active")
}

function generateMetadataJSON() {
    discMetadatas = []
    for(let discNum = 1; discNum <= metadata.discs.length; discNum++) {
        let trackMetadatas = []
        let totalTrackNum = metadata.discs[discNum-1].tracks.length
        for (let trackNum = 1; trackNum <= totalTrackNum; trackNum++) {
            trackMetadatas.push(generateTrackMetadata(String(discNum), String(trackNum)))
        }
        discMetadatas.push({tracks: trackMetadatas})
    }
    metadataJson = {
        discs: discMetadatas
    }
    return metadataJson
}

function generateTrackMetadata(discNum, trackNum) {
    return {
        path: document.getElementById("path_"+discNum+"_"+trackNum).value,
        track: document.getElementById("track_"+discNum+"_"+trackNum).value,
        title: document.getElementById("title_"+discNum+"_"+trackNum).value,
        disc: discNum,
        artist: document.getElementById("artist_"+discNum+"_"+trackNum).value,
        album_artist: document.getElementById("album-artist").value,
        album: document.getElementById("album-name").value,
        date: document.getElementById("album-year").value,
        genre: document.getElementById("genre").value
    }
}

function setArtistFromAlbumArtist() {
    let albumArtist = document.getElementById("album-artist").value

    for (let discNum = 1; discNum <= metadata.discs.length; discNum++) {
        let totalTrackNum = metadata.discs[discNum-1].tracks.length
        for (let trackNum = 1; trackNum <= totalTrackNum; trackNum++) {
            let artistId = "artist_" + String(discNum) + "_" + String(trackNum)
            if (document.getElementById(artistId).value === "") {
                document.getElementById(artistId).value = albumArtist
            }
        }
    }
}

function openModal(title, message, isError) {
    document.getElementById("modal-title").innerHTML = title
    document.getElementById("modal-msg").innerHTML = message
    if (!isError) {
        document.getElementById("modal-article").classList.remove("is-primary")
        document.getElementById("modal-article").classList.remove("is-danger")
        document.getElementById("modal-article").classList.add("is-primary")
    } else {
        document.getElementById("modal-article").classList.remove("is-primary")
        document.getElementById("modal-article").classList.remove("is-danger")
        document.getElementById("modal-article").classList.add("is-danger")
    }
    document.getElementById("progress-modal").classList.remove("is-active")
    let modalEle = document.getElementById("msg-modal")
    modalEle.classList.add("is-active")
}

function closeModal() {
    let modalEle = document.getElementById("msg-modal")
    modalEle.classList.remove("is-active")
}

window.onload = parseMetadata
