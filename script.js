
// ---------------------------
// DOM & Constants
// ---------------------------
const SelectableSeats= document.querySelectorAll('.seat[data-status="available"]');
const bookButton=document.querySelector("#book");
const allSeats = document.querySelectorAll(".seat");
const movieSelect=document.querySelector("#movie");
const selectedSeats=document.querySelectorAll(".selected");

//display nodes
const ticketDisplay=document.querySelector("#ticketCount");
const priceDisplay=document.querySelector("#totalPrice");
const movieDisplay=document.querySelector("#movie-selected");

// ---------------------------
// Toast / UI helpers
// ---------------------------
function showToast(message, type = 'default') {
    const toastContainer = document.getElementById('toast-container');
    // 1. Create the new toast element
    const toast = document.createElement('div');
    toast.classList.add('toast',type);
    toast.textContent = message;

    toastContainer.appendChild(toast);

    // 3. Show the toast (trigger the CSS transition)
    // Use a small timeout to ensure the browser registers the element is present
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // 4. Set a timer to dismiss the toast
    const dismissTime = 3000; // 3 seconds
    setTimeout(() => {
        // Start the fade-out
        toast.classList.remove('show');

        // Wait for the CSS transition to finish (0.3s) before removing the element
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, dismissTime);
}

// ---------------------------
// Movie / selection getters
// ---------------------------
function getSelectedMovieName() {
  const select = document.getElementById("movie");
  const option = select.options[select.selectedIndex];
  return option ? option.textContent : null;
}

/**function getSelectedMovieName() {
 return movieSelect.selectedOptions[0].textContent;
 
} */
function aggregateSeats(){
const savedSeats=getSavedIdsForCurrentMovie();
const selectedUnsavedSeats=getSelectedSeatIds();
const totalSeatsIds=[...savedSeats, ...selectedUnsavedSeats];
return totalSeatsIds;
} 
function getTotalTickets(){
  const booked = getSavedIdsForCurrentMovie(); // array of already booked ids
  const selected=getSelectedSeatIds();
  let total;
  if(selected && booked){
        total=aggregateSeats();
  }else{
        total=selected;
  }
  return total;

}
console.log(getTotalTickets(),getTotalTickets().length);

function getSelectedSeats(){
    const selectedSeats=document.querySelectorAll(".selected");
     return selectedSeats;
}
function getTotalPrice(){
            //movie price
        const movieSelect=document.querySelector("#movie");
        const moviePrice=+movieSelect.value;
      const tickets=getTotalTickets().length;
        //total price
        const totalPrice= moviePrice* tickets;
        return totalPrice;
}

// ---------------------------
// Event wiring
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
    updateSelectedMovie();
  retrieveUserData();
});
movieSelect.addEventListener("change",e=>{
        displayAvailableSeatsForCurrentMovie();
        const movieName = getSelectedMovieName();
         updateSelectedMovie();
         retrieveUserData();
});

bookButton.addEventListener("click",e=>{
   // saveSelectedSeatsForCurrentMovie();//save user data first
    
    const totalTickets = getTotalTickets().length;
    const movieName = getSelectedMovieName(); 

    if (totalTickets > 0 && movieName !== "No Movie Booked") {
        resetSeats();
        showToast(`Booked ${totalTickets} tickets for ${movieName}!`, "success");
    } else {
        showToast("Please select a movie and at least one seat.", "error");
    }
});


allSeats.forEach(seat=>{
        seat.addEventListener("click",(e)=>{

                const clickedSeat=e.target;
                if (clickedSeat.dataset.status === "occupied") {
                     showToast("This seat is already booked.", "error");
                    return;
                }
    
                if (clickedSeat.dataset.status === "available") {
                    clickedSeat.dataset.status = "selected";
                    showToast(`Seat ${clickedSeat.id} selected!`, "success");
                } else {
                    clickedSeat.dataset.status = "available";
                    showToast(`Seat ${clickedSeat.id} unselected.`, "error");        
                }
            clickedSeat.classList.toggle("selected");
            updateSelectedMovie();
        });
});

// ---------------------------
// UI update / booking flow
// ---------------------------
function updateSelectedMovie(){
        //update price and ticket number and movie
        ticketDisplay.textContent=`${getTotalTickets().length} tickets `;
        priceDisplay.textContent=`$${getTotalPrice()}`;
        movieDisplay.textContent=`${getSelectedMovieName()}`;

}
function resetSeats(){
const selectedSeats=getSelectedSeats();

          saveSelectedAndBookedIdsForCurrentMovie();
  if(selectedSeats.length > 0){

            selectedSeats.forEach(selectedSeat => {
            // (permanently booked)
            selectedSeat.dataset.status = "occupied";
            selectedSeat.classList.add("occupied"); 
            selectedSeat.classList.remove("selected");
            });

        updateSelectedMovie();
        showToast(`Booked ${getTotalTickets().length} tickets for ${getSelectedMovieName()}!`, "success");
    }
}

// ---------------------------
// LocalStorage helpers
// ---------------------------
// return array of selected seat IDs (strings)
function getSelectedSeatIds() {
  return Array.from(getSelectedSeats()).map(s => s.id);
}

function movieStorageKey() {
   const movieValue=getSelectedMovieName();
  return `bookedSeats_${movieValue}`;
}
function saveSelectedAndBookedIdsForCurrentMovie() {
  const key = movieStorageKey();
  const data = getTotalTickets(); 
  localStorage.setItem(key, JSON.stringify(data));
}

function retrieveUserData(){
    const seatsIds=getSavedIdsForCurrentMovie();

   seatsIds.forEach(SeatId=>{
         allSeats.forEach(seat=>{
            if(seat.id==SeatId){
                seat.classList.add("occupied");
                seat.dataset.status="occupied";
            }
        });
   });  
}

function getSavedIdsForCurrentMovie() {   
  const key = movieStorageKey(); 
  const savedData = localStorage.getItem(key);

  // If nothing saved yet, return empty array
  if (!savedData) return [];
  try {
    return JSON.parse(savedData);
  } catch (error) {
    console.error("Error parsing saved seat data:", error);
    return [];
  }
}


////////
function getBookedSeatIdsFromDOM() {
  return Array.from(document.querySelectorAll(".seat.occupied")).map(s => s.id);
}

function  displayAvailableSeatsForCurrentMovie(){
  location.reload();
}
