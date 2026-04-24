import { setAccount, getAccount } from "./state.js";
import { renderApp } from "./ui.js";
import { createAccount } from "./api.js";

const submitBtn = document.getElementById("submit-btn");
submitBtn.addEventListener('click',async ()=>{
    const username = document.getElementById('name').value;
    const type = document.getElementById('accaunt').value;
    const accaunt = await createAccount(username,type);
    setAccount(accaunt);
    renderApp();
})

