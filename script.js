const userTab=document.querySelector('[data-userWeather]');
const searchTab=document.querySelector('[data-searchWeather]');
const userContainer=document.querySelector(".weather-container");

const grantAccessContainer=document.querySelector(".grant-location-container");
const searchForm=document.querySelector('[data-searchForm]');
const loadingScreen=document.querySelector(".loading-container");
const userInfoContainer =document.querySelector(".user-info-container");
const errorContainer = document.querySelector(".error-container");
const errorMsg = document.querySelector(".error-msg");

// intitally varaible needed??

let oldTab=userTab;
const API_KEY="d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");

getfromSessionStorage();

function switchtab(newTab){
    if(newTab!=oldTab){
        oldTab.classList.remove("current-tab");
        oldTab=newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            // search wala container is invisible then make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            // pehle search wala tab per tha ab weather wala tab ki visible karna hai
            searchForm.classList.remove("active");
            userInfoContainer.classList.add("active");
            // ab weather  tab me aaya hoon to weather bhi display bhi karna padega, so let's 
            //check local satorage for the coordinates , if we have saved them there
            getfromSessionStorage();

        }
    }
}

userTab.addEventListener("click",()=>{
    switchtab(userTab);
});

searchTab.addEventListener("click",()=>{
    switchtab(searchTab);
});

// check if coordinates are present in the session storage
function getfromSessionStorage(){

    const localCoordinates=sessionStorage.getItem("userCoordinates");
    if(!localCoordinates){
        // local coordinates nahi mile to
        grantAccessContainer.classList.add("active");
        userInfoContainer.classList.remove("active");
        errorContainer.classList.remove("active");

    }else{
        const coordinates=JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}

async function fetchUserWeatherInfo(coordinates){
    const   {lat,lon}=coordinates;
    // make grant container invisible
    grantAccessContainer.classList.remove("active");
    errorContainer.classList.remove("active");
    //male loader visible

    loadingScreen.classList.add("active");
    //API Call

    try{
        const response=await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data=await response.json();
        console.log(data);
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
        
    }
    catch(err){
        loadingScreen.classList.remove("active");

    }
}

function renderWeatherInfo(weatherInfo){
    // firstly we have to fetch the elememts

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch values from weatherINfo object and put it UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp}°C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText =`${weatherInfo?.clouds?.all}%`;

}

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }else{
        //show an alert for no geolocartion found
    }
}

function showPosition(position){
    const userCoordinates={
        lat:position.coords.latitude,
        lon:position.coords.longitude,
    }

    sessionStorage.setItem("userCoordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton=document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click",getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === "")
        return;
    else 
        fetchSearchWeatherInfo(cityName);
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );

        if(!response.ok){
            throw new Error("City not found");
        }

        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        // show error image
       
        errorMsg.innerText = err.message;
        errorContainer.classList.add("active");
    }
}

