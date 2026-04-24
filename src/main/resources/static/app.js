const sendBtn = document.getElementById("submit-btn")
const authScreen = document.getElementById("auth-screen")
const mainScreen=document.getElementById("main-screen")
sendBtn.addEventListener('click' ,(e) =>{
    e.preventDefault()
    authScreen.classList.toggle('hidden')
    mainScreen.classList.toggle('hidden')
})