import './style.css'

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"


document.querySelector('#app').innerHTML = `
  <div class="container">
    <h1>We are the Champions</h1> 
    <textarea id="textarea-el" class="text-area item" placeholder="Write your endorsement here" name="message"></textarea>
    <div class="input-fields-wrapper">
      <input id="to-input" type="text" name="to" placeholder="To"/> 
      <input id="from-input" type="text" name="from" placeholder="From" />
    </div>
    <button id="publish-btn" class="publish-btn item">Publish</button>
    <h2>- Endorsements - </h2>
    <ul id="endorsement-list">
    </ul>
  </div>
`

const appSettings = {
  databaseURL: "https://endorsements-4ae9c-default-rtdb.europe-west1.firebasedatabase.app/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const endoresementsInDB = ref(database, "endorsementList")

const textareaEl = document.getElementById("textarea-el")
const publishBtn = document.getElementById("publish-btn")
const endorsementListEl = document.getElementById("endorsement-list")
const fromInputEl = document.getElementById("from-input")
const toInputEl = document.getElementById("to-input")

let messageEndorsement = null;

publishBtn.addEventListener("click", function() {
  
  let endorsementEl = textareaEl.value
 
  messageEndorsement = createMessageEndorsementObject(fromInputEl.value, toInputEl.value, endorsementEl, 0)

  console.log(messageEndorsement)
  push(endoresementsInDB, messageEndorsement)

  clearTextarea()

})



onValue(endoresementsInDB, function(snapshot) {
  if (snapshot.exists()) {
    let endoresementsArray = Object.entries(snapshot.val())
   
    clearEndorsementListEl()

    for (let i = 0; i < endoresementsArray.length; i++) {
      let currentItem = endoresementsArray[i]
      
      appendToEndorsementEl(currentItem)
    }
  } else {
    endorsementListEl.innerHTML = "No endorsements yet...why not write one!"
  }
})

function createMessageEndorsementObject(from, to, message, initialValue) {
  return {
    from: from,
    to: to,
    message: message,
    likes: initialValue
  }
}

// this gets updated in real time 


// this appends a new li element to html 
function appendToEndorsementEl (currentItem) {
  let itemID = currentItem[0]
  let itemValue = currentItem[1]

  const inputFrom = capitalizeFirstLetter(itemValue.from)
  const inputTo = capitalizeFirstLetter(itemValue.to)
  const message = capitalizeFirstLetter(itemValue.message)

  let newListEl = document.createElement("li")
  let newParagraphElTo = document.createElement("p")
  let newParagraphElMessage = document.createElement("p")
  let divWrapper = document.createElement("div")
  divWrapper.className = "from-paragraph-div-wrapper"
  let newParagraphElFrom = document.createElement("p")
  newParagraphElFrom.className = "from-paragraph"
  let like = document.createElement("p")
  like.className = "like-el"
  like.textContent = "❤️"
  let spanEl = document.createElement("span")
  spanEl.textContent = itemValue.likes
  like.appendChild(spanEl)

 
  newListEl.appendChild(newParagraphElTo)
  newListEl.appendChild(newParagraphElMessage)
  newListEl.appendChild(divWrapper)
  divWrapper.appendChild(newParagraphElFrom)
  divWrapper.appendChild(like)
  endorsementListEl.append(newListEl)


  let formattedTo = `To ${inputTo}`
  let formattedMessage = `${message}`
  let formattedFrom = `From ${inputFrom}`

  newParagraphElTo.textContent += formattedTo
  newParagraphElMessage.textContent += formattedMessage
  newParagraphElFrom.textContent += formattedFrom

  like.addEventListener('click', () => {
    let counter = 0
    counter++

    // Update the displayed like count
    spanEl.textContent = counter;

    // update db with likes value 
    let exactLocationOfItemInDB = ref(database, `endorsementList/${itemID}`)
    update(exactLocationOfItemInDB, {likes: counter})
    

  }, {once: true});

  

}

function capitalizeFirstLetter(inputString) {
  if (inputString && inputString.length > 0) {
    return inputString.charAt(0).toUpperCase() + inputString.slice(1);
  } else {
    // Return an empty string if the input is empty
    return '';
  }
}

function clearTextarea() {
  textareaEl.value = ""
  fromInputEl.value = ""
  toInputEl.value = ""
}

function clearEndorsementListEl() {
  endorsementListEl.innerHTML = ""
}
