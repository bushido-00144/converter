function parseMetadata() {
    let tracks = metadata.discs[0].tracks
    let tableElement = document.getElementById("metadata_table_tbody")
    tracks.forEach(track => {
        trackTrElement = addTrack(track)
        tableElement.appendChild(trackTrElement)
    })
    document.getElementById("album-name").value = tracks[0].album
}

function addTrack(track) {
    let trElement = document.createElement("tr");
    let uniq_id = "_" + track.track.replace(/^(0)*/, "") // idをユニークにするため 複数枚ディスクある場合はディスク番号も

    let pathTdElement = document.createElement("td");
    let pathInputElement = createInputElement("path"+uniq_id, track.path)
    pathInputElement.readOnly = true
    pathTdElement.appendChild(pathInputElement)
    trElement.appendChild(pathTdElement)

    let trackTdElement = document.createElement("td");
    let trackInputElement = createInputElement("track"+uniq_id, track.track)
    trackTdElement.appendChild(trackInputElement)
    trElement.appendChild(trackTdElement)

    let titleTdElement = document.createElement("td");
    let titleInputElement = createInputElement("title"+uniq_id, track.title)
    titleTdElement.appendChild(titleInputElement)
    trElement.appendChild(titleTdElement)

    /*
    let discTdElement = document.createElement("td");
    let discInputElement = createInputElement("disc"+uniq_id, track.disc)
    discTdElement.appendChild(discInputElement)
    trElement.appendChild(discTdElement)
    */

    let artistTdElement = document.createElement("td");
    let artistInputElement = createInputElement("artist"+uniq_id, track.artist)
    artistTdElement.appendChild(artistInputElement)
    trElement.appendChild(artistTdElement)

    /*
    let albumArtistTdElement = document.createElement("td");
    let albumArtistInputElement = createInputElement("album_artist"+uniq_id, track.album_artist)
    albumArtistTdElement.appendChild(albumArtistInputElement)
    trElement.appendChild(albumArtistTdElement)

    let albumTdElement = document.createElement("td");
    let albumInputElement = createInputElement("album"+uniq_id, track.album)
    albumTdElement.appendChild(albumInputElement)
    trElement.appendChild(albumTdElement)

    let yearTdElement = document.createElement("td");
    let yearInputElement = createInputElement("year"+uniq_id, track.year)
    yearTdElement.appendChild(yearInputElement)
    trElement.appendChild(yearTdElement)

    let genreTdElement = document.createElement("td");
    let genreInputElement = createInputElement("genre"+uniq_id, track.genre)
    genreTdElement.appendChild(genreInputElement)
    trElement.appendChild(genreTdElement)
    */

    return trElement
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
    trElements = document.getElementById("metadata_table_tbody").children
    trackMetadatas = []
    for (let i = 0; i < trElements.length; i++) {
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
        //disc: document.getElementById("disc_"+num).value,
        disc: document.getElementById("disc-num").value,
        artist: document.getElementById("artist_"+num).value,
        /*
        album_artist: document.getElementById("album_artist_"+num).value,
        album: document.getElementById("album_"+num).value,
        year: document.getElementById("year_"+num).value,
        genre: document.getElementById("genre_"+num).value
        */
        album_artist: document.getElementById("album-artist").value,
        album: document.getElementById("album-name").value,
        year: document.getElementById("album-year").value,
        genre: document.getElementById("genre").value
    }
}

function setAllParam() {
    /*
    trElements = document.getElementById("metadata_table_tbody").children
    let albumArtist = document.getElementById("album-artist").value
    let year = document.getElementById("album-year").value
    let albumName = document.getElementById("album-name").value
    let discNum = document.getElementById("disc-num").value
    let genre = document.getElementById("genre").value
    for (let i = 0; i < trElements.length; i++) {
        let albumArtistId = "album_artist_" + String(i+1)
        let yearId = "year_" + String(i+1)
        let albumNameId = "album_" + String(i+1)
        let discNumId = "disc_" + String(i+1)
        let genreId = "genre_" + String(i+1)
        if document.getElementById(albumArtistId).value !== "" {
            document.getElementById(albumArtistId).value = albumArtist
        }
        if document.getElementById(yearId).value !== "" {
            document.getElementById(yearId).value = year
        }
        if document.getElementById(albumNameId).value !== "" {
            document.getElementById(albumNameId).value = albumName
        }
        if document.getElementById(discNumId).value !== "" {
            document.getElementById(discNumId).value = discNum
        }
        if document.getElementById(genreId).value !== "" {
            document.getElementById(genreId).value = genre
        }
    }
    */
}

function setArtistFromAlbumArtist() {
    trElements = document.getElementById("metadata_table_tbody").children
    let albumArtist = document.getElementById("album-artist").value

    for (let i = 0; i < trElements.length; i++) {
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
