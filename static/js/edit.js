function parseMetadata() {
    let tracks = metadata.discs[0].tracks
    let tableElement = document.getElementById("metadata-div")
    tracks.forEach(track => {
        trackTrElement = addTrack(track)
        tableElement.appendChild(trackTrElement)
    })
    document.getElementById("album-name").value = tracks[0].album
}

function addTrack(track) {
    let wholeElement = document.createElement("div");
    let uniq_id = "_" + track.track.replace(/^(0)*/, "") // idをユニークにするため 複数枚ディスクある場合はディスク番号も
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
    divElements = document.getElementById("metadata-div").children
    trackMetadatas = []
    for (let i = 0; i < divElements.length; i++) {
        trackMetadatas.push(generateTrackMetadata(String(i+1)))
    }
    metadataJson = {
        discs: [{
            tracks: trackMetadatas
        }]
    }
    return metadataJson
}

function generateTrackMetadata(num) {
    return {
        path: document.getElementById("path_"+num).value,
        track: document.getElementById("track_"+num).value,
        title: document.getElementById("title_"+num).value,
        disc: document.getElementById("disc-num").value,
        artist: document.getElementById("artist_"+num).value,
        album_artist: document.getElementById("album-artist").value,
        album: document.getElementById("album-name").value,
        year: document.getElementById("album-year").value,
        genre: document.getElementById("genre").value
    }
}

function setArtistFromAlbumArtist() {
    divElements = document.getElementById("metadata-div").children
    let albumArtist = document.getElementById("album-artist").value

    for (let i = 0; i < divElements.length; i++) {
        let artistId = "artist_" + String(i+1)
        if (document.getElementById(artistId).value === "") {
            document.getElementById(artistId).value = albumArtist
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
