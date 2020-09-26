function submitFile() {
    let ele = document.getElementById("submit-btn")
    ele.classList.add("is-loading")
    document.forms[0].submit()
}
