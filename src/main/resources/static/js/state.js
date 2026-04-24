let currentAccount = null;
export function getAccount(){
    
    return currentAccount;

}
export function setAccount(accountData){
    currentAccount=accountData

}
 export function clearAccount(){
    currentAccount=null;
}